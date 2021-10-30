import React, { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from 'react-table';
import { useQuery } from '@apollo/client';
import { QUERY_KITCHENQUEUE } from '../utils/queries';
import mockdata from '../utils/mockdata.json';
import Moment from 'moment'

import  '../utils/table.css'
import { useStoreContext } from '../utils/GlobalState';

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
                  pizzas: bqueue[x].pizzas}
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
            Header: 'Order #',
            accessor: 'orderId'
        },
        {
            Header: 'Item Ordered',
            accessor: 'pizzas'
        },
        
        {
            Header: 'Priority',
            accessor: 'priority'
        }

    ])
     
    const data = React.useMemo(() => ddata)

    return(
        <>

        <div className="container my-1">
        <Link to="/"> ← Back to Pizza Menus</Link>
        <br />
        
            <h1>
                Kitchen Queue <br /><br />
            </h1>

            <h3>
                Orders currently in the kitchen today {new Date().toLocaleDateString().slice(0,10)}<br /><br />
            </h3>
          
            <Table columns={columns} data={data}/>
            
        </div>
        </>
    )
}

export default KitchenQ;