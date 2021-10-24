const db = require('./connection');
const { User, Product, Category, Kitchen, Order } = require('../models');

db.once('open', async () => {
  await Category.deleteMany();

  const categories = await Category.insertMany([
    { name: 'Vegetarian' },
    { name: 'MeatLovers' },
    { name: 'Combo' }
  ]);

  console.log('categories seeded');

  await Product.deleteMany();

  const products = await Product.insertMany([
    
    
    {
      name: 'Vegetarian',
      category: categories[0]._id,
      description:
        'Donec volutpat erat erat, sit amet gravida justo sodales in. Phasellus tempus euismod urna. Proin ultrices nisi ut ipsum congue, vitae porttitor libero suscipit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam lacinia a nisi non congue.',
      image: 'Vegetarian.jpg',
      price: 20.99,
      quantity: 20,
      size:"large"
    },
    {
      name: 'MeatLovers',
      category: categories[1]._id,
      description:
        'Praesent placerat, odio vel euismod venenatis, lectus arcu laoreet felis, et fringilla sapien turpis vestibulum nisl.',
      image: 'meatlover.jpg',
      price: 22.99,
      quantity: 50,
      size:"large"
    },
    {
      name: 'Combo',
      category: categories[2]._id,
      description:
        'Vivamus ut turpis in purus pretium mollis. Donec turpis odio, semper vel interdum ut, vulputate at ex. Duis dignissim nisi vel tortor imperdiet finibus. Aenean aliquam sagittis rutrum.',
      image: 'Combo.jpg',
      price: 22.99,
      quantity: 100,
      size:"large"
    }
    
  ]);

  console.log('products seeded');

  await User.deleteMany();

  await User.create({
    firstName: 'Pamela',
    lastName: 'Washington',
    email: 'pamela@testmail.com',
    password: 'password12345',
    orders: [
      {
        products: [products[0]._id, products[0]._id, products[1]._id]
      },
      {
        products: [products[0]._id, products[1]._id, products[1]._id]
      },
    ]
  });

  await User.create({
    firstName: 'Elijah',
    lastName: 'Holt',
    email: 'eholt@testmail.com',
    password: 'password12345',
    orders:[
      {
        products: [products[0]._id, products[0]._id, products[0]._id]
      }
    ]
  });

  console.log('users seeded');

//   await Kitchen.deleteMany();

  await Kitchen.create({
    "date":"2021-09-29 04:44:21.328Z",
    "queue": [
        { 
            "lastupdated": "2021-09-29 04:44:21.328Z",
            "orderId": "616f59279c4a2925c4e75d59",
            "priority": 1634243786651,
            "status": "active",
            "quantity":1,
            "commitTime": 1634417375460
        },
        {
            "lastupdated": "2021-09-29 04:44:21.328Z",
            "orderId": "616f59279c4a2925c4e75d5a",
            "priority": 1634243786478,
            "status": "active",
            "quantity":2,
            "commitTime": 1634417125460
        },
        {
            "lastupdated": "2021-09-29 04:44:21.328Z",
            "orderId": "616f59279c4a2925c4e75d5d",
            "priority": 1634243786111,
            "status": "inoven",
            "quantity":2,
            "commitTime": 1634417025460
        }
      ]});
//         {
//             "lastupdated": "2021-09-29 04:44:21.328Z",
//             "orderId": "616907aae00c978118f0ca7b",
//             "priority": 1634243786154,
//             "status": "complete",
//             "quantity":1,
//             "commitTime": 1634416925460
//         }
//     ]
// })
// await Order.deleteMany();
// await Order.create(
 
//   {
//     products: [products[0]._id, products[0]._id, products[1]._id]
//   });
//   await Order.create(
//   {
//     products: [products[0]._id, products[1]._id, products[1]._id]
//   });

//   {
//     products: [products[0]._id, products[0]._id, products[0]._id]
//   }
// ]})
console.log('kitchen seeded')
  process.exit();
});
