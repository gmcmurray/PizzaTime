const { AuthenticationError } = require('apollo-server-express');
const { User, Product, Category, Order, Kitchen } = require('../models');
const { signToken } = require('../utils/auth');
 
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

const resolvers = {
  Query: {
    kitchentoday: async (parent,{today} ) =>{
      const nowkitchen = await Kitchen.findOne({ date : today })
      return nowkitchen 
    },

    kitchens: async (parent, {_id}) =>{
      const kitch = await Kitchen.findById(_id);
      return kitch 
    },

    categories: async () => {
      return await Category.find();
    },
    products: async (parent, { category, name }) => {
      const params = {};

      if (category) {
        params.category = category;
      }

      if (name) {
        params.name = {
          $regex: name
        };
      }

      return await Product.find(params).populate('category');
    },
    product: async (parent, { _id }) => {
      return await Product.findById(_id).populate('category');
    },
    user: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id).populate({
          path: 'orders.products',
          populate: 'category'
        });

        user.orders.sort((a, b) => b.purchaseDate - a.purchaseDate);

        return user;
      }

      throw new AuthenticationError('Not logged in');
    },
    order: async (parent, { _id }, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id).populate({
          path: 'orders.products',
          populate: 'category'
        });

        return user.orders.id(_id);
      }

      throw new AuthenticationError('Not logged in');
    },
    checkout: async (parent, args, context) => {
      const url = new URL(context.headers.referer).origin;
      const order = new Order({ products: args.products });
      const line_items = [];
      
      const { products } = await order.populate('products').execPopulate();
      
      // console.log("order", order)
      // console.log("products", products)

      for (let i = 0; i < products.length; i++) {
        const product = await stripe.products.create({
          name: products[i].name,
          description: products[i].description,
          images: [`${url}/images/${products[i].image}`]
        });

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: products[i].price * 100,
          currency: 'usd',
        });

        line_items.push({
          price: price.id,
          quantity: 1
        });
      }
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url}/`
      });

      return { session: session.id };
    }
  },
  Mutation: {
    // one kitchen per day, check to see if kitchen exists , if not create, else return existing kitchen
    addKitchen: async (parent,args) =>{
      const nowkitchen = await Kitchen.findOne({ date : new Date().toLocaleDateString() })
      if(nowkitchen === null){
      const newkitchendata = {
        date: new Date().toLocaleDateString().slice(0,10),
        queue: []
      }
      const newKitchen = await Kitchen.create(newkitchendata);
       return newKitchen}
       else { return nowkitchen}
    },

    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    updateKitchen: async (parent, {orderid, pizzas, today }, context) =>{
      const nowkitchen = await Kitchen.findOne({ date : today})
      let tqueue=nowkitchen.queue;

      const capacity=20;
      const avgcooktime = 15; 
      
      let nqueue = [...tqueue]
      let nnow = Date.now()
      // sort queue
      nqueue.sort((a,b) => (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0));
      // mark jobs complete that have passed theri commitTime -assume complete
      let count =0;
      let pizzacount =0;

      console.log("nqueue",nqueue, "nnow",nnow)

      for (let x = 0; x < nqueue.length; x++) {
        if (parseInt(nqueue[x].commitTime) < nnow) {

          nqueue[x].status = 'complete'
        }
        else if (pizzacount < capacity) {
          nqueue[x].status = 'inoven'
          pizzacount+=(nqueue[x].pizzas[0].match(/,/g).length+1)
             }
        else { nqueue[x].status = 'active'
        pizzacount+=(nqueue[x].pizzas[0].match(/,/g).length+1)
 
                }
      }
        let qtime = 15; 
        console.log("pizzacount",pizzacount)
       
        if (pizzacount < capacity) {
            qtime = avgcooktime;
        }
        else {
            qtime = Math.ceil(avgcooktime * (pizzacount - capacity) / capacity) + 15;
        }
        console.log(`your pizza will ready in ${qtime} minutes`)
        
        console.log('qtime', qtime)
      
      let newtime = Date.now() + qtime*60000;
      let commtime =newtime.toString();
      console.log("commtime",newtime)

      const newjob = {
        orderId: orderid,
        priority: Date.now().toString(),  // convert to string 
        status: "active",
        pizzas,
        commitTime: commtime
      };
       nqueue.push(newjob);
 
      const kitch = await Kitchen.replaceOne(
        {_id: nowkitchen._id},
        {
          _id: nowkitchen._id,
          date: new Date().toLocaleDateString(),
          queue : nqueue
        }
        );

      console.log('newkitch',kitch)
       return kitch
   
    },

    addOrder: async (parent, { products }, context) => {
      //console.log(context);
      console.log('order has been added')
      if (context.user) {
        const order = new Order({ products });
        console.log("add order",order)
        const upUser = await User.findByIdAndUpdate(context.user._id, { $push: { orders: order } });
       
        return order;
      }

      throw new AuthenticationError('Not logged in');
    },

    updateUser: async (parent, args, context) => {
      if (context.user) {
        return await User.findByIdAndUpdate(context.user._id, args, { new: true });
      }

      throw new AuthenticationError('Not logged in');
    },
    updateProduct: async (parent, { _id, quantity }) => {
      const decrement = Math.abs(quantity) * -1;

      return await Product.findByIdAndUpdate(_id, { $inc: { quantity: decrement } }, { new: true });
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    }
  }
};

module.exports = resolvers;
