import { gql } from '@apollo/client';

export const QUERY_PRODUCTS = gql`
  query getProducts($category: ID) {
    products(category: $category) {
      _id
      name
      description
      price
      quantity
      image
      category {
        _id
      }
    }
  }
`;

export const QUERY_ALLPRODUCTS = gql`
  query getAllProducts {
    allproducts {
      _id
      name
      description
      price
      quantity
      image
      category {
        _id
      }
    }
  }
`;

export const QUERY_KITCHENQUEUE = gql`
   query getKitchen($today: String){
    kitchentoday(today: $today ) {
      _id
      date
      queue {
        orderId
        orderName
        priority
        commitTime
        pizzas
        status
      }
    }
  }
`;

export const QUERY_GET_COMMTIME = gql`
   query getQTime($order:[String], $today: String){
    getQT(order: $order,today: $today ) {
     commiTime
    }
  }
`;

export const QUERY_CHECKOUT = gql`
  query getCheckout($products: [ID]!) {
    checkout(products: $products) {
      session
    }
  }
`;

export const QUERY_ALL_PRODUCTS = gql`
  {
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
`;

export const QUERY_CATEGORIES = gql`
  {
    categories {
      _id
      name
    }
  }
`;

export const QUERY_USER = gql`
  {
    user {
      firstName
      lastName
      orders {
        _id
        purchaseDate
        products {
          _id
          name
          description
          price
          quantity
          image
        }
      }
    }
  }
`;
