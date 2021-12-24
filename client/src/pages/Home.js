import React from "react";
import ProductList from "../components/ProductList";
import CategoryMenu from "../components/CategoryMenu";
import Cart from "../components/Cart";
import KitchenOps from "./KitchenOps";
const styles ={
  btn:{
    background: 'green',
    color: 'white',
    width: '10%',
    display: 'block',
    borderRadius:'50%',

  }
}



const Home = () => {
  return (
    <div className="container">
      <button style={styles.btn}>Kitchen Today</button>
      <CategoryMenu />
      <ProductList />
      <Cart />
    </div>
  );
};

export default Home;
