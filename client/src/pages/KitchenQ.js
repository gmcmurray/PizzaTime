import React, { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from 'react-table';
import { useQuery } from '@apollo/client';
import { QUERY_KITCHENQUEUE } from '../utils/queries';
import mockdata from '../utils/mockdata.json';
import Clock from '../components/Clock';
import {ADD_ORDER } from '../utils/mutations';
import { ADD_ORDER_KITCHEN } from '../utils/mutations';
import  '../utils/table.css'
import { useStoreContext } from '../utils/GlobalState';
import Dropddown from '../components/DropDown';
import 'bootstrap/dist/css/bootstrap.min.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

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
    width: '15%',
    display: 'block'
  },
  btnCancel: {
    background: 'red',
    color: 'black',
    width: '100%',
    display: 'block'
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
      })

    return (
        <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
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

  function KitchenQ() {
    
    // State Variable to collect form information
      const [addFormData, setAddFormData] = useState({
        orderName: "",
        phoneNumber:"",
        timeWanted:"",
        MeatLovers:0,
        Vegetarian:0,
        Combo:0

      })
      // State Variable to Hide Schedule Button
      const [show, setShow] = React.useState(true)
      

      const handleAddFormChange = (event)=>{
        event.preventDefault();


        const fieldName = event.target.getAttribute('name');
        const fieldValue = event.target.value;

        const newFormData = { ...addFormData};
        newFormData[fieldName] = fieldValue;

        setAddFormData(newFormData);

      }

      async function schedulePizza(event){
        event.preventDefault();
        setShow(false)
        // Go and schedule pizza 
        // Return commit time and either add order or cancel
        console.log("Schedule that pizza!")
      }

      async function orderPizza(event){
        event.preventDefault();
       
        setTimeout(function() {
          setShow(true)
        }, 1500);
        
        // Order the pizza
        // Add to the kitchen
        // const  {data} = await addOrder(
        // { variables: { products: productIds } });
        console.log("Order that pizza!")
      }

      function cancelPizza(event){
        event.preventDefault();
        setTimeout(function() {
          setShow(true)
        }, 1500);
        
        // Cancel Order
        // Clear form , wait 3 seconds and show Schedule button 
       
        console.log("Cancel that pizza!")
      }

 // Get data from database to populate pizza order queue

      let {loading, data:quedata} = useQuery(QUERY_KITCHENQUEUE, 
        {variables: {today: new Date().toLocaleDateString().slice(0,10)}});
      const  bqueue = quedata?.kitchentoday.queue|| [];
      let ddata=[]
      if(bqueue){
      console.log("quedata",quedata) 
      console.log(bqueue)
      for (let x = 0;x < bqueue.length; x++) {
                ddata[x]={
                  priority: bqueue[x].priority,
                  orderId: bqueue[x].orderId,
                  orderName: bqueue[x].orderName,
                  pizzas: bqueue[x].pizzas,
                  commitTime: bqueue[x].commitTime}
            }
          }
   
        else{
         ddata = mockdata;
        }

    // set data to populate table

    const data = React.useMemo(() => ddata)

    //Define columns for table

    const columns = React.useMemo(() => [
        {
            Header: 'Pizza #',
            accessor: (row, i) =>i+1,
        },
        {
          Header: 'Order Name',
          accessor: 'orderName'
      },
        {
            Header: 'Item Ordered',
            accessor: 'pizzas'
        },
        {
            Header: 'Priority',
            accessor: 'priority'
        },
        {
            Header: 'Commit Time',
            accessor: 'commitTime'
        },
        {
          Header: 'Status '
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
      value: "Vegi"
    },
    {
      id: "61738d66bad24764ccfd8210",
      value: "Combo"
    }]
                      
    return (
      <>
        <div className="container my-1">
          <Link to="/"> ← Back to Pizza Menus</Link>
          <br />

          <h1>
            Kitchen Queue    <br /><br />
          </h1>
          <h3>
            Orders currently in the kitchen today {new Date().toLocaleDateString().slice(0, 10)} <Clock /><br /><br />
          </h3>
          <h4> Phone Order: </h4>
          <div style={{ margin: '4px', justifyContent: 'space-evenly', display: 'flex', border: ' 2px solid red' }}>
            <form style={{ margin: '4px', justifyContent: 'space-evenly', display: 'flex-wrap' }}  >
              <input type="text" name="orderName" required="required"
                placeholder="OrderName ..." onChange={handleAddFormChange} />

              <input type="text" name="phoneNumber" required="required"
                placeholder="PhoneNumber ..." onChange={handleAddFormChange} />

              <input type="text" name="TimeWanted" required="required"
                placeholder="Time Wanted ..." onChange={handleAddFormChange} />

                <input type="text" name="MeatLovers" required="required"
                placeholder="MeatLovers ..." onChange={handleAddFormChange} />

                <input type="text" name="Vegetarian" required="required"
                placeholder="Vegetarian ..." onChange={handleAddFormChange} />

                <input type="text" name="Combo" required="required"
                placeholder="Combo ..." onChange={handleAddFormChange} />
           
              {/* <Dropddown title="Select Pizzas" items={items}  /> */}
              {show ?
                <button className="btnSch" type="submit" style={styles.btnSch} onClick={schedulePizza} > <span>Sched</span> </button>
                : <div >
                  <button className="btnOrder" type="submit" style={styles.btnOrder} onClick={orderPizza}> <span className="btnText">Add</span> </button>
                  <button className="btnCancel" type="submit" style={styles.btnCancel} onClick={cancelPizza}> <span className="btnText">Cancel</span> </button>
                </div>}
            </form>
          </div>

          {/* <div className="App container">
      
            <DropdownButton
              alignRight
              title="Dropdown right"
              id="dropdown-menu-align-right"
              onSelect={handleSelect}
            >
              <Dropdown.Item eventKey="Vegitarian">Vegitarian</Dropdown.Item>
              <Dropdown.Item eventKey="MeatLovers">MeatLovers</Dropdown.Item>
              <Dropdown.Item eventKey="Combo">Combo</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item eventKey="some link">some link</Dropdown.Item>
            </DropdownButton>
            <h4>You selected {value}</h4>
          </div> */}

          <Table columns={columns} data={data} multiSelect />

        </div>
      </>
    )
}

export default KitchenQ;