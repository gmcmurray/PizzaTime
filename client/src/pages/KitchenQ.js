import React, { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery,useMutation } from '@apollo/client';
import { QUERY_KITCHENQUEUE , QUERY_GET_COMMTIME } from '../utils/queries';
import mockdata from '../utils/mockdata.json';
import Clock from '../components/Clock';
import Chart from '../components/Chart';
import Table from '../components/QactiveTable'
import calculatequeuetime from '../utils/QtimeCalc';
import {ADD_ORDER } from '../utils/mutations';
import { ADD_ORDER_KITCHEN } from '../utils/mutations';
import  '../utils/table.css'
import Dropddown from '../components/DropDown';
import 'bootstrap/dist/css/bootstrap.min.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

let capacity=20;
let avgcooktime=15;

const styles = {
  btnOrder: {
    background: 'green',
    color: 'white',
    width: '100%',
    display: 'block'
  },
  btnSch: {
    background: 'yellow',
    color: 'black',
    width: '45%',
    display: 'block',
    align:'left'
  },
  btnCancel: {
    background: 'red',
    color: 'black',
    width: '100%',
    display: 'block',
  },
  sortBtn: {
    background: '#b3b3ff',
    color: 'yellow',
    width: '30%',
    display: 'block'
  },
  kitchenhead: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  tablecont:{
    // margin: '0 2px 0 0',
    border: ' 2px solid black'
  }
};


function KitchenQ() {
  let labels = [];
  let nnow = Date.now();

  const [sortedField, setSortedField] = React.useState(null);
  const [chartdata,setChartdata] = useState({
    labels:[],
    datasets: [
      {
        label: 'Dataset 1',
        data: labels.map(() => 100),
        backgroundColor: 'rgb(255, 99, 132)',
      },
      {
        label: 'Dataset 2',
        data: labels.map(() => 20),
        backgroundColor: 'rgb(75, 192, 192)',
      },
      {
        label: 'Dataset 3',
        data: labels.map(() => -10),
        backgroundColor: 'rgb(53, 162, 235)',
      },
    ],
  });

  const [addOrder] = useMutation(ADD_ORDER);
  const [updateKitchen] = useMutation(ADD_ORDER_KITCHEN);
  // State Variable to collect form information
  const [addFormData, setAddFormData] = useState({
    orderName: "",
    phoneNumber: "",
    timeWanted: "",
    MeatLovers: 0,
    Vegetarian: 0,
    Combo: 0,
    requestTime: ""
  });
// Provides commitTime hook
  const [commitTimeData, setCommitTimeData] = useState("");
  const [pizzaOrder, setPizzaOrder] = useState([]);
  // State Variable to Hide Schedule Button
  const [show, setShow] = React.useState(true)

  const handleAddFormChange = (event) => {
    event.preventDefault();
    const fieldName = event.target.getAttribute('name');
    const fieldValue = event.target.value;
    const newFormData = { ...addFormData };
    newFormData[fieldName] = fieldValue;
    setAddFormData(newFormData);
  }

//Get today's now data from kitchen
  let { loading, data: quedata } = useQuery(QUERY_KITCHENQUEUE,
    { variables: { today: new Date().toLocaleDateString().slice(0, 10) } });
  const bqueue = quedata?.kitchentoday.queue || [];
  let ddata = [];
  let ddatac = [];
  if (bqueue) {
    // console.log("quedata", quedata)
    console.log('bque',bqueue)
    for (let x = 0; x < bqueue.length; x++) {
      if(bqueue[x].status === 'complete')
      ddatac[x] = {
        priority: bqueue[x].priority,
        orderId: bqueue[x].orderId,
        orderName: bqueue[x].orderName,
        pizzas: bqueue[x].pizzas,
        commitTime: bqueue[x].commitTime+'C',
        status: bqueue[x].status,
        sales: bqueue[x].sales
      }
      else if(bqueue[x].status === 'active' || 'oven'){
        ddata[x] = {
          priority: bqueue[x].priority,
          orderId: bqueue[x].orderId,
          orderName: bqueue[x].orderName,
          pizzas: bqueue[x].pizzas,
          commitTime: bqueue[x].commitTime,
          status: bqueue[x].status,
          sales: bqueue[x].sales
        }
      }
    }
  }

  else {
    ddata = mockdata;
  }

  console.log('ddata', ddata)
  // set data to populate table
  const data = React.useMemo(() => ddata)
  const data1 = React.useMemo(() => ddatac)

  async function schedulePizza(event) {
    // Go and schedule pizza 
    // Return commit time and either add order or cancel
    event.preventDefault();
    setShow(false)  // Hide buttons, reveal buttons
    let neworder = { ...addFormData };
    console.log("neworder", neworder.Combo)
    const pizzacount=parseInt(neworder.Vegetarian)+parseInt(neworder.Combo)+
    parseInt(neworder.MeatLovers);
    let pizaorder = [];
    const menuitems = {
      "MeatLovers": "61738d66bad24764ccfd820f",
      "Vegetarian": "61738d66bad24764ccfd820e",
      "Combo": "61738d66bad24764ccfd8210"
    };
    // creates pizza order array based on id's for order input
    let pmenu = Object.keys(menuitems);
    for (const item of pmenu) {
      if (neworder[item]) {
        for (let y = 0; y < parseInt(neworder[item]); y++) {
          pizaorder.push(menuitems[item])
        }
      }
    }
    // place order using hook
    setPizzaOrder(pizaorder)
    console.log("pizaorder",pizaorder)
    let requestTime=Date.now();
  
    const [qt, cmtime] = calculatequeuetime(pizaorder, requestTime, capacity, avgcooktime, pizzacount, nnow)
    setCommitTimeData(cmtime)
    console.log("Schedule that pizza!",qt,cmtime)
  }

  async function orderPizza(event) {
    event.preventDefault();
    const  {data} = await addOrder(
    { variables: { products: pizzaOrder } });
    console.log("new order from kitchen", data);

    const upkitch = await updateKitchen(
      { variables: {
        orderid: data.addOrder._id,
        orderName: addFormData.orderName,
        pizzas: "Veg"+addFormData.Vegetarian+","+"MeatL"+addFormData.MeatLovers+","+"Combo"+addFormData.Combo,
        today: new Date().toLocaleDateString().slice(0,10),
        requestTime: addFormData.requestTime }
       })
    console.log("upkitch",upkitch)

    setTimeout(function () {
      setShow(true)  // switch button to schedule again
    }, 1500);
    console.log("Order that pizza!")
  }

  function cancelPizza(event) {
    event.preventDefault();
    setTimeout(function () {
      setShow(true)
    }, 1500);

    // Cancel Order
    // Clear form , wait 3 seconds and show Schedule button 

    console.log("Cancel that pizza!")
  }
  //Define columns for table

  const columns = React.useMemo(() => [
    {
      Header: 'Sch Time',
      accessor: 'commitTime'
    },
    {
      Header: 'Order Name',
      accessor: 'orderName'
    },
    {
      Header: 'Items Ordered',
      accessor: 'pizzas'
    },
    // {
    //   Header: 'Sales',
    //   accessor: 'sales'
    // },
    {
      Header: 'Stat ',
      accessor:'status'
    }
  ]);

  const columnsc = React.useMemo(() => [
    {
      Header: 'Completed',
      accessor: 'finished'
    },
    {
      Header: 'Sch Time',
      accessor: 'commitTime'
    },
   
    {
      Header: 'Order Name',
      accessor: 'orderName'
    },
    {
      Header: 'Items Ordered',
      accessor: 'pizzas'
    }
    
  ])

  // create items to populate dropdown pizza selection menu with hardcoded id for ordering purposes and text value

  // const items = [{
  //   id: "61738d66bad24764ccfd820f",
  //   value: "MeatLovers"
  // },
  // {
  //   id: "61738d66bad24764ccfd820e",
  //   value: "Vegetarian"
  // },
  // {
  //   id: "61738d66bad24764ccfd8210",
  //   value: "Combo"
  // }]
  // var options = { hour12: false };
  // var date = new Date();
  return (
    <>
      <div className="container my-1">
        <Link to="/"> ← Back to Pizza Menus</Link>
        <br />
        <div style={styles.kitchenhead}>
          <h3>
            Kitchen Queue
          </h3>
          {/* {nnnow} */}
          {new Date().toLocaleString('en-US')}
          <Clock />
        </div>
        <h4> Phone Order: </h4>
        <div style={styles.kitchenhead}>
          <div style={{ width: '50%', margin: '4px', display: 'flex', border: ' 2px solid red' }}>
            <form style={{ margin: '4px', justifyContent: 'space-evenly', display: 'flex-wrap' }}  >
              <input type="text" name="orderName" required="required"
                placeholder="OrderName ..." onChange={handleAddFormChange} />

              <input type="text" name="phoneNumber" required="required"
                placeholder="PhoneNumber ..." onChange={handleAddFormChange} />

              <input type="text" name="requestTime" required="required"
                placeholder="Time Wanted ..." onChange={handleAddFormChange} />

              <input type="text" name="MeatLovers" required="required"
                placeholder="MeatLovers ..." onChange={handleAddFormChange} />

              <input type="text" name="Vegetarian" required="required"
                placeholder="Vegetarian ..." onChange={handleAddFormChange} />

              <input type="text" name="Combo" required="required"
                placeholder="Combo ..." onChange={handleAddFormChange} />
              <div style={styles.kitchenhead}>
                {/* <Dropddown title="Select Pizzas" items={items}  /> */}
                {show ?
                  <button className="btnSch" type="submit" style={styles.btnSch} onClick={schedulePizza} > <span>Sched</span> </button>
                  : <div >
                    <button className="btnOrder" type="submit" style={styles.btnOrder} onClick={orderPizza}> <span className="btnText">Add</span> </button>
                    <button className="btnCancel" type="submit" style={styles.btnCancel} onClick={cancelPizza}> <span className="btnText">Cancel</span> </button>
                  </div>}
                <h6>Ready Time = </h6><span>{commitTimeData}</span>
              </div>
            </form>
          </div >
          
          <div style={{ width: "50%" }}>
         
            <h3 >Table Summary</h3>
            <Chart />
            
        </div>
      </div>
      <div style={styles.kitchenhead}>
      <div style={styles.tablecont}>
      <Table columns={columns} data={data} multiSelect />
      </div>
      <div style={styles.tablecont}>
      <Table columns={columnsc} data={data1} multiSelect />
      </div>
     
     
      </div>
      


    </div>
    </>
  )
}

export default KitchenQ;