
import React, { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useLazyQuery, useMutation } from '@apollo/client';
import { QUERY_CHECKOUT, QUERY_PRODUCTS,QUERY_USER } from '../../utils/queries';
import { idbPromise } from '../../utils/helpers';
import { useQuery } from '@apollo/client';
import CartItem from '../CartItem';
import Auth from '../../utils/auth';
import { useStoreContext } from '../../utils/GlobalState';
import { TOGGLE_CART, ADD_MULTIPLE_TO_CART } from '../../utils/actions';
import './style.css';
import {ADD_ORDER } from '../../utils/mutations';
import { ADD_ORDER_KITCHEN } from '../../utils/mutations';
 
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const Cart = () => {
  const [state, dispatch] = useStoreContext();
  const [getCheckout, { data }] = useLazyQuery(QUERY_CHECKOUT);
  const [addOrder] = useMutation(ADD_ORDER);
  const [updateKitchen]= useMutation(ADD_ORDER_KITCHEN);
  let {loading, data:prods} = useQuery(QUERY_PRODUCTS); 
 
 let {  data:username} = useQuery(QUERY_USER);
//  console.log("users", username.user);
  useEffect( () => {
    async function setOrder(){
    const productIds = [];

    state.cart.forEach((item) => {
      for (let i = 0; i < item.purchaseQuantity; i++) {
        productIds.push(item._id);
      }
    });
    if (data) {      
     await stripePromise.then((res) => {
        res.redirectToCheckout({ sessionId: data.checkout.session });
      });
    }}
    setOrder()
  }, [data]);

  useEffect(() => {
    async function getCart() {
      const cart = await idbPromise('cart', 'get');
      dispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] });
    }

    if (!state.cart.length) {
      getCart();
    }
  }, [state.cart.length, dispatch]);

   function toggleCart() {
    dispatch({ type: TOGGLE_CART });
  }

  function calculateTotal() {
    let sum = 0;
    state.cart.forEach((item) => {
      sum += item.price * item.purchaseQuantity;
    });
    return sum.toFixed(2);
  }

 async function submitCheckout() {
    const productIds = [];

    state.cart.forEach((item) => {
      for (let i = 0; i < item.purchaseQuantity; i++) {
        productIds.push(item._id);
      }
    });

    getCheckout({
      variables: { products: productIds },
    });

    // add Order, prior to stripe event and connect
    // to Kitchen
    console.log('hello')

    const  {data} = await addOrder(
      { variables: { products: productIds } });
    
    let pizzas = "";
    for (let x=0; x < data.addOrder.products.length; x++) { 
    if(data.addOrder.products[x]._id==="61738d66bad24764ccfd820e") pizzas+="Vegi,";
    else if(data.addOrder.products[x].id ==="61738d66bad24764ccfd820f") pizzas+="Meatlovers,";
    else{pizzas+="Combo,"}
    }
    console.log("total cost", calculateTotal())
    // let ordername =
    console.log("addorderpizzas",pizzas)
    let ndate = new Date().toLocaleDateString().slice(0,10)
    let rndnb = Math.floor(Math.random() * 100) + 1
    rndnb = rndnb.toString();
    let ordrName =username.user.firstName.substring(0,2)+username.user.lastName.substring(0,3)+ndate+"-"+rndnb;
    
    console.log("ordrName", ordrName, "ndate", ndate)

    const upkitch = await updateKitchen(
      { variables: {
        orderid: data.addOrder._id,
        orderName: ordrName,
        pizzas,
        today: ndate,
        sales: calculateTotal()  }
       })
   
       console.log("upkitch",upkitch)

  }

  if (!state.cartOpen) {
    return (
      <div className="cart-closed" onClick={toggleCart}>
        <span role="img" aria-label="trash">
          🛒
        </span>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="close" onClick={toggleCart}>
        [close]
      </div>
      <h2>Shopping Cart</h2>
      {state.cart.length ? (
        <div>
          {state.cart.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}

          <div className="flex-row space-between">
            <strong>Total: ${calculateTotal()}</strong>

            {Auth.loggedIn() ? (
              <button onClick={submitCheckout}>Checkout</button>
            ) : (
              <span>(log in to check out)</span>
            )}
          </div>
        </div>
      ) : (
        <h3>
          <span role="img" aria-label="shocked">
            😱
          </span>
          You haven't added anything to your cart yet!
        </h3>
      )}
    </div>
  );
};

export default Cart;
