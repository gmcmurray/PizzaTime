export default function calculatequeuetime(pizzasOrdered, requestTime, capacity, avgcooktime, pizzacount) {
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