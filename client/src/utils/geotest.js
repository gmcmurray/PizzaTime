let obj1 = ["afsdlkj","lkajsdflk"]
console.log(obj1.join())

let obj2 = { x:23,
         y:["afsdlkj","lkajsdflk"]}

         obj2.y=obj2.y.join()

// var temp = "This is a string.";
// var count = (temp.match(/is/g) || []).length;
// console.log(count);
let temp = '61738d66bad24764ccfd820e,61738d66bad2,4764ccfd8210'
console.log((temp.match(/,/g)).length )       
console.log(obj2)
console.log("new", new Date().toLocaleDateString().slice(0,10))
// ==="2021-10-28" )
console.log("now", Date.now())

let qtime=15;
let newtime = Date.now() + qtime*60000;
let commtime = newtime.toString();
console.log("commtime",commtime, newtime)

 const jobs = [    {
          pizzas: [
            '61738d66bad24764ccfd820e,61738d66bad24764ccfd820e,61738d66bad24764ccfd8210,61738d66bad24764ccfd8210'
          ],
          _id: "6174466ea25e014d94abec37",
          orderId: "6174466ea25e014d94abec31",
          priority: '1635010158653',
          status: 'active',
          commitTime: '1635385927041'
        },
        {
          pizzas: [
            '61738d66bad24764ccfd820e,61738d66bad24764ccfd820e,61738d66bad24764ccfd8210,61738d66bad24764ccfd8210'
          ],
          _id: "617446bfcece093328dd128c",
          orderId: "617446becece093328dd1286",
          priority: '1635010239256',
          status: 'active',
          commitTime: '1635385927041'
        },
        {
          pizzas: [ '61738d66bad24764ccfd820e,61738d66bad24764ccfd820e' ],
          _id: "617446f89176c40ea876bb10",
          orderId: "617446f89176c40ea876bb0a",
          priority: '1635010296545',
          status: 'active',
          commitTime: '1635385927041'
        },
        {
          pizzas: [ '61738d66bad24764ccfd820e,61738d66bad24764ccfd820e' ],
          _id: "61746292ffe01d5cc49f84b1",
          orderId: "61746292ffe01d5cc49f84ab",
          priority: '1635017362562',
          status: 'active',
          commitTime: '1635385927041'
        },
        {
          pizzas: [ '61738d66bad24764ccfd820e,61738d66bad24764ccfd820e' ],
          _id: "6174691a469faa5c84107675",
          orderId: "6174691a469faa5c8410766f",
          priority: '1635019034201',
          status: 'active',
          commitTime: '1635385927041'
        },
        {
          pizzas: [ '61738d66bad24764ccfd820e,61738d66bad24764ccfd820e' ],
          _id: "61746e1cd4ca8e1f18d291c4",
          orderId: "61746e1bd4ca8e1f18d291be",
          priority: '1635020316064',
          status: 'active',
          commitTime: '1635385927041'
        },
        {
          pizzas: [ '61738d66bad24764ccfd820e,61738d66bad24764ccfd820e' ],
          _id: "61746e3fd4ca8e1f18d291d0",
          orderId: "61746e3fd4ca8e1f18d291ca",
          priority: '1635020351712',
          status: 'active',
          commitTime: '1635385927041'
        }
    ]

    let nnow = Date.now()-5000000;
    console.log("nnow", nnow );
    let pizzacount =0 ;
    let capacity = 5;
    for (let x = 0; x <  jobs.length; x++) {
        if (parseInt( jobs[x].commitTime) < nnow) {
           console.log("change it")
           jobs[x].status = 'complete'
        }
        else if (pizzacount < capacity) {
            jobs[x].status = 'inoven'
            pizzacount+=(jobs[x].pizzas[0].match(/,/g).length+1)
               }
               else {  jobs[x].status = 'active'
               pizzacount+=( jobs[x].pizzas[0].match(/,/g).length+1)
        
                       }       
    }
    console.log(pizzacount)
