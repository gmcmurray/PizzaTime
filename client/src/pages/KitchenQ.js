import React, { useEffect,useState } from 'react';

import { Link } from 'react-router-dom';
import { useTable, useSortBy } from 'react-table';
import { useQuery,useMutation } from '@apollo/client';
import { QUERY_KITCHENQUEUE , QUERY_GET_COMMTIME } from '../utils/queries';
import mockdata from '../utils/mockdata.json';
import Clock from '../components/Clock';
import Chart from '../components/Chart';
import {ADD_ORDER } from '../utils/mutations';
import { ADD_ORDER_KITCHEN } from '../utils/mutations';
import  '../utils/table.css'
import { useStoreContext } from '../utils/GlobalState';
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
  }
};

function Table ({columns, data}) {
  const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
      } = useTable({
        columns,
        data,
      },
      useSortBy)
      const firstPageRows = rows.slice(0, 20)
    return (
        <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                  {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                  
                  </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
        
    )
}
function calculatequeuetime(pizzasOrdered, requestTime, capacity, avgcooktime, pizzacount) {
  let nnow=  Date.now();
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
    
  today = mm + '/' + dd + '/' + yyyy;
  let ftime = today +" " + requestTime + ":00" ;
  let d = new Date(ftime)
  let rqTimeMill = d.getTime()  //Now in milliseconds since 1970

  pizzacount=pizzacount+pizzasOrdered.length  //pizzacount active in queue + ordered pizza count
  let qtime = avgcooktime;
  // If scheduled far enough into future => commitTime = requestTime, qtime = avgcooktime
  console.log('request', requestTime,'now', nnow)
  if (rqTimeMill - nnow > (1 + pizzacount / capacity) * avgcooktime) {
    console.log(`your pizza will ready in ${qtime} minutes`)
    console.log(`your pizza will be ready for pick up at ${requestTime}, ${nnow}`)
    return [qtime, requestTime]
  }
  // Calculate queue time
  else {
    if (pizzacount < capacity) {
      qtime = avgcooktime;
    }
    else {
      qtime = Math.ceil(avgcooktime * (pizzacount - capacity) / capacity) + avgcooktime;  //empty queue and run through oven
    }
    console.log(`your pizza will ready in ${qtime} minutes`)
    console.log('qtime', qtime)
    // Calculate commitTime - adding minutes to order with qtime
    let newtime = new Date(nnow + qtime * 60000);
    // Format time to add leading 0 for minutes 0-9
    let mins = newtime.getMinutes()<10 ? "0"+ newtime.getMinutes().toString() : newtime.getMinutes().toString();
    let hrs = newtime.getHours()<10 ? "0"+ newtime.getHours().toString() : newtime.getHours().toString();
    let commtime = hrs + ':' + mins;
    console.log("commtime", commtime)

    return [qtime, commtime]
  }
}
function KitchenQ() {
  const [sortedField, setSortedField] = React.useState(null);
  let nnow = Date.now()
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

//Get data from kitchen
  let { loading, data: quedata } = useQuery(QUERY_KITCHENQUEUE,
    { variables: { today: new Date().toLocaleDateString().slice(0, 10) } });
  const bqueue = quedata?.kitchentoday.queue || [];
  let ddata = []
  if (bqueue) {
    console.log("quedata", quedata)
    console.log(bqueue)
    for (let x = 0; x < bqueue.length; x++) {
      ddata[x] = {
        priority: bqueue[x].priority,
        orderId: bqueue[x].orderId,
        orderName: bqueue[x].orderName,
        pizzas: bqueue[x].pizzas,
        commitTime: bqueue[x].commitTime,
        status: bqueue[x].status
      }
    }
  }

  else {
    ddata = mockdata;
  }

  // set data to populate table
  const data = React.useMemo(() => ddata)

  async function schedulePizza(event) {
    event.preventDefault();
    setShow(false)
    // Go and schedule pizza 
    // Return commit time and either add order or cancel

    let neworder = { ...addFormData };
    // const pizzacount =      bqueue;
    const pizzacount=3;
    let pizaorder = [];
    const menuitems = {
      "MeatLovers": "61738d66bad24764ccfd820f",
      "Vegetarian": "61738d66bad24764ccfd820e",
      "Combo": "61738d66bad24764ccfd8210"
    };
    let pmenu = Object.keys(menuitems);
    for (const item of pmenu) {
      if (neworder[item]) {
        for (let y = 0; y < parseInt(neworder[item]); y++) {
          pizaorder.push(menuitems[item])
        }
      }
    }
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
      setShow(true)
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
      Header: 'Numb #',
      accessor: (row, i) => i + 1,
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
    //   Header: 'Priority',
    //   accessor: 'priority'
    // },
    {
      Header: 'Commit Time',
      accessor: 'commitTime'
    },
    {
      Header: 'Status ',
      accessor:'status'
    },
    {
      Header: 'Action '
    }
  ])

  // create items to populate dropdown pizza selection menu with hardcoded id for ordering purposes and text value

  const items = [{
    id: "61738d66bad24764ccfd820f",
    value: "MeatLovers"
  },
  {
    id: "61738d66bad24764ccfd820e",
    value: "Vegetarian"
  },
  {
    id: "61738d66bad24764ccfd8210",
    value: "Combo"
  }]
  var options = { hour12: false };
  var date = new Date();
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
          <Chart />
          <div style={{ width: "50%" }}>
            <h3 >Table Summary</h3>
            
        </div>
      </div>
      <Table columns={columns} data={data} multiSelect />


    </div>
    </>
  )
}

export default KitchenQ;