import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
      }
    }
  }
`;

export const ADD_ORDER_KITCHEN = gql`
  mutation updateKitchen($orderid: ID, $orderName: String, $pizzas: String, $today: String,$requestTime: String, $sales:String) {
    updateKitchen(orderid: $orderid, orderName: $orderName, pizzas: $pizzas, today: $today, requestTime: $requestTime, sales: $sales) {
      _id
      date
      queue {
        orderName
        orderId
        priority
        status
        pizzas 
        commitTime
      }
    }
  }
`;

export const ADD_ORDER = gql`
  mutation addOrder($products: [ID]!) {
    addOrder(products: $products) {
      purchaseDate
      _id
      products {
        _id
        name
        description
        price
        quantity
        category {
          name
        }
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
  ) {
    addUser(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
    ) {
      token
      user {
        _id
      }
    }
  }
`;
