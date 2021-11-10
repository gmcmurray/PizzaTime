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
import Dropdown from '../components/DropDown';

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
      const [addFormData, setAddFormData] = useState({
        orderName: "",
        pizzas:""
      })
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
        // Reveal Add/Cancel Buttons
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
    //Define columns
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
    const items =[{id:"61738d66bad24764ccfd820f",
                  value:"MeatLovers"},
                  {id:"61738d66bad24764ccfd820e",
                    value:"Vegi"},
                    {id:"61738d66bad24764ccfd8210",
                      value:"Combo"}]
                      
    const data = React.useMemo(() => ddata)

    return(
        <>
        <div className="container my-1">
        <Link to="/"> ← Back to Pizza Menus</Link>
        <br />
            
            <h1>
                Kitchen Queue    <br /><br />
            </h1>
            
            <h3>
                Orders currently in the kitchen today {new Date().toLocaleDateString().slice(0,10)} <Clock /><br /><br />
            </h3>
            <h4> Phone Order: </h4> 
            <div style={{margin: '4px',justifyContent: 'space-evenly', display: 'flex', border: ' 2px solid red'}}>
            <form > 
              <input type="text" name="orderName" required="required" 
              placeholder="OrderName ..." onChange={handleAddFormChange} />
              <input type="text" name="phoneNumber" required="required" 
              placeholder="PhoneNumber ..." onChange={handleAddFormChange} />
              <input type="text" name="TimeWanted" required="required" 
              placeholder="Time Wanted ..." onChange={handleAddFormChange} />
              <input type="text" name="TimeCommit" required="required" 
              placeholder="Time Commit ..." onChange={handleAddFormChange} />
            </form>
            <Dropdown title="Select Pizzas" items={items}/>
             { show ?
              <button className="btnSch" type="submit" onClick={schedulePizza} > <span>Sched</span> </button> 
              : <div>
              <button className="btnOrder" type="submit" onClick={orderPizza}> <span className="btnText">Add</span> </button>
              <button className="btnCancel" type="submit" onClick={cancelPizza}> <span className="btnText">Cancel</span> </button>
             
             </div>}
              </div>
            
            <Table columns={columns} data={data} multiSelect/>
            
        </div>
        </>
    )
}

export default KitchenQ;