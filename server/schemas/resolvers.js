// const { statuschangeJobs, calculatequeuetime} = require('./helpers.js').default;
const { AuthenticationError } = require('apollo-server-express');
const { User, Product, Category, Order, Kitchen } = require('../models');
const { signToken } = require('../utils/auth');
const capacity=20;  // Oven capacity for pizzas
const avgcooktime = 15; // average pizza cooktime
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

function calculatequeuetime(pizzas, requestTime, capacity, avgcooktime, pizzacount) {
  let nnow = Date.now();
  //requestTime is string of format 19:23 
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
    
  today = mm + '/' + dd + '/' + yyyy;
  let ftime = today +" " + requestTime + ":00" ;
  let d = new Date(ftime)
  requestTime = d.getTime()  //Now in milliseconds since 1970
  pizzacount=pizzacount+pizzas.length
  // let requestTime= nnow;
  let qtime = avgcooktime;
  if (requestTime - nnow > (1 + pizzacount / capacity) * avgcooktime) {
    return [qtime, requestTime]
  }
  // Calculate queue time
  else {
    if (pizzacount < capacity) {
      qtime = avgcooktime;
    }
    else {
      qtime = Math.ceil(avgcooktime * (pizzacount - capacity) / capacity) + 15;
    }
    console.log(`your pizza will ready in ${qtime} minutes`)
    console.log('qtime', qtime)
    // Calculate commitTime
    let newtime = new Date(nnow + qtime * 60000);

    let mins = newtime.getMinutes()<10 ? "0"+ newtime.getMinutes().toString() : newtime.getMinutes().toString();
    let hrs = newtime.getHours()<10 ? "0"+ newtime.getHours().toString() : newtime.getHours().toString();
    let commtime = hrs + ':' + mins;

    // let commtime = newtime.getHours().toString() + ':' + newtime.getMinutes().toString();
    
    console.log("commtime", commtime)

    return [qtime, commtime]
  }
}
// statuschangeJobs updates the job status in queue and returns active count of pizzas
// if auto parameter is true then updates based on commitTime else uses
// manual kitchen status and returns pizzacount.
function statuschangeJobs(queue, capacity, nnow, auto=0) {
  let nqueue = [...queue]
  nqueue.sort((a, b) => (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0));
  let pizzacount = 0;  //active orders (not completed) of pizzas
  console.log("nqueue", nqueue, "nnow", nnow, "auto",auto);
  //Update each job status of queue prior to entering order by commitTime
  let prty = 0;
  if (auto) {
    for (let x = 0; x < nqueue.length; x++) {
      if (parseInt(nqueue[x].commitTime) < nnow) {
        nqueue[x].status = 'complete';
        nqueue[x].priority = 999;
      }
      else if (pizzacount < capacity) {
        nqueue[x].priority = ++prty;
        nqueue[x].status = 'inoven';
        pizzacount += nqueue[x].pizzas.match(/,/g).length;
      }
      else {
        nqueue[x].status = 'active';
        pizzacount += nqueue[x].pizzas.match(/,/g).length;
        nqueue[x].priority = ++prty;
      }
    }
  }
  else { // Use existing queue status from kitchen
    for (let x = 0; x < nqueue.length; x++) { 
    if (nqueue[x].status = 'active' || 'inoven') { pizzacount++}
  }
}
  nqueue.sort((a, b) => (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0));
  return [nqueue, pizzacount]
}
 
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
    getQT: async (parent, {order,today}) =>{
      // order = ["pizzas","requestTime"]
      const nowkitchen = await Kitchen.findOne({ date : today})
      let tqueue=nowkitchen.queue;
      let nnow = Date.now()
      let auto=0;
      const [nqueue,pizzacount] = statuschangeJobs(tqueue,capacity,nnow,auto);
      console.log("yess",nqueue, pizzacount)
      let pizzas=order[0];
      let requestTime=order[1];
      const [qtime,commtime]=calculatequeuetime(pizzas, requestTime, capacity, avgcooktime,pizzacount)
      console.log("qtime", qtime, "commTime",commtime)
      let commiTime = [qtime,commtime]
      return commiTime
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

    allproducts: async (parent, args) => {
      return await Product.find({});
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

    updateKitchen: async (parent, {orderid, orderName, pizzas, today, requestTime, sales }, context) =>{
      // Get latest kitchen state
      
      const nowkitchen = await Kitchen.findOne({ date : today})
      let tqueue=nowkitchen.queue;
      console.log('resolver tqueue', tqueue)

     
      let nnow = Date.now()
      let auto=0;
      const [nqueue,pizzacount] = statuschangeJobs(tqueue,capacity,nnow,auto);
      console.log("yess",nqueue, pizzacount)
      const [qtime,commtime]=calculatequeuetime(pizzas, requestTime, capacity, avgcooktime,pizzacount)
      console.log("qtime", qtime)
  
      let newpriority = pizzacount+1;

      const newjob = {
        orderId: orderid,
        orderName: orderName,
        priority: newpriority.toString(),  // convert to string 
        status: "active",
        pizzas,
        commitTime: commtime,
        sales
      };
      nqueue.push(newjob);

      console.log('newjob newjob', newjob)
      // Replace kitchen queue with new order added

      const kitch = await Kitchen.replaceOne(
        {_id: nowkitchen._id},
        {
          _id: nowkitchen._id,
          date: new Date().toLocaleDateString().slice(0,10),
          queue : nqueue
        }
        );

      console.log('newkitch',kitch)
       return kitch
   
    },

    addOrder: async (parent, { products }, context) => {
      //console.log(context);
      
      if (context.user) {
        const order = new Order({ products });
        console.log('order has been added',order)
        const upUser = await User.findByIdAndUpdate(
          context.user._id, { $push: { orders: order } });
        // console.log("add order",upUser)
        return order;
      }
      throw new AuthenticationError('Not logged in');
    },

    // addOrderFromKitchen: async (parent, { products }, context) => {
    //   //Ordering from Kitchen
    //   console.log('order has been added')
    //   if (context.user._id="618d97086b360a1a34c2480f") {
    //     const order = new Order({ products })
    //     const upUser = await User.findByIdAndUpdate(
    //       "618d97086b360a1a34c2480f", { $push: { orders: order } });
    //     console.log("add order",upUser)
    //     return order;
    //   }

    //   throw new AuthenticationError('Not logged in');
    // },

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
