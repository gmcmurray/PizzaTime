const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const { User, Kitchen } = require('./models');

const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');


const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve up static assets
app.use('/images', express.static(path.join(__dirname, '../client/images')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
// setTimeout( ..., 50*60000)  create new kitchen between 12am and 1am, order one of each
// for slices


setInterval(async function(){
  let date= new Date();
  let hh = date.getHours();
  if(hh<1){
    console.log("create new Kitchen")
  // create dummy order for start queue
  // use kitchenuser for order
  const startorder = await User.updateOne()

  let startqueue =  { pizzas: [
      '61738d66bad24764ccfd820e,61738d66bad24764ccfd820e,61738d66bad24764ccfd8210,61738d66bad24764ccfd8210'
    ],
    _id: "1",
    orderId: "6174466ea25e014d94abec31",
    priority: '1635010158653',
    status: 'active',
    commitTime: '1635385927041'
  }
    const kitch = await Kitchen.create(
    {
      date: new Date().toLocaleDateString().slice(0,10),
      queue : [startqueue]
    }
 
    )}
  },3000000);