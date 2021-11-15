const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Category {
    _id: ID
    name: String
  }

  type Product {
    _id: ID
    name: String
    description: String
    image: String
    quantity: Int
    price: Float
    category: Category
  }

  type Job {
    orderId: ID
    orderName: String
    status: String
    priority: String
    pizzas: String
    commitTime: String
  }

  type Kitchen {
    _id: ID
    date: String
    queue: [Job]
  }

  type Order {
    _id: ID
    purchaseDate: String
    products: [Product]
  }

  type User {
    _id: ID
    firstName: String
    lastName: String
    email: String
    orders: [Order]
  }

  type Checkout {
    session: ID
  }

  type Auth {
    token: ID
    user: User
  }

  input Kitchenorder{
    orderId: String
    products:[ID]!
  }

  type Query {
    categories: [Category]
    products(category: ID, name: String): [Product]
    product(_id: ID!): Product
    allproducts: [Product]
    user: User
    order(_id: ID!): Order
    checkout(products: [ID]!): Checkout
    kitchens(_id: ID): Kitchen
    kitchentoday(today: String): Kitchen
  }

  type Mutation {
    addKitchen: Kitchen
    addUser(firstName: String!, lastName: String!, email: String!, password: String!): Auth
    addOrder(products: [ID]!): Order
    updateUser(firstName: String, lastName: String, email: String, password: String): User
    updateProduct(_id: ID!, quantity: Int!): Product
    login(email: String!, password: String!): Auth
    updateKitchen(orderid: ID,orderName: String,  pizzas: String, today: String, requestTime: String): Kitchen
    # addOrderFromKitchen(products: [ID]!): Order
    # updateOrderDirectKitchen(orderid: ID,orderName: String,  pizzas: String, today: String): Kitchen
  }
`;

module.exports = typeDefs;
