  
   
function calculatequeuetime(pizzas, requestTime, capacity, avgcooktime, pizzacount, nnow) {
  let qtime = avgcooktime;
  if (requestTime - nnow > (1 + pizzacount / capacity) * avgcooktime) {
    return [qtime, requestTime]
  }
  // Calculate queue time
  else {
    if (pizzacount < capacity) {
      qtime = avgcooktime;
    }
    else {
      qtime = Math.ceil(avgcooktime * (pizzacount - capacity) / capacity) + 15;
    }
    console.log(`your pizza will ready in ${qtime} minutes`)
    console.log('qtime', qtime)
    // Calculate commitTime
    let newtime = new Date(nnow + qtime * 60000);

    let commtime = newtime.getHours().toString() + ':' + newtime.getMinutes().toString();
    console.log("commtime", commtime)

    return [qtime, commtime]
  }
}
// statuschangeJobs updates the job status in queue and returns active count of pizzas
// if auto parameter is true then updates based on commitTime else uses
// manual kitchen status and returns pizzacount.
function statuschangeJobs(queue, capacity, nnow, auto) {
  let nqueue = [...queue]
  nqueue.sort((a, b) => (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0));
  let pizzacount = 0;  //active orders (not completed) of pizzas
  console.log("nqueue", nqueue, "nnow", nnow);
  //Update each job status of queue prior to entering order by commitTime
  let prty = 0;
  if (auto) {
    for (let x = 0; x < nqueue.length; x++) {
      if (parseInt(nqueue[x].commitTime) < nnow) {
        nqueue[x].status = 'complete';
        nqueue[x].priority = 999;
      }
      else if (pizzacount < capacity) {
        nqueue[x].priority = ++prty;
        nqueue[x].status = 'inoven';
        pizzacount += nqueue[x].pizzas.match(/,/g).length;
      }
      else {
        nqueue[x].status = 'active';
        pizzacount += nqueue[x].pizzas.match(/,/g).length;
        nqueue[x].priority = ++prty;
      }
    }
  }
  else { // Use existing queue status from kitchen
    for (let x = 0; x < nqueue.length; x++) { }
    if (nqueue[x].status = 'active' || 'inoven') { pizzacount += 1 }
  }
  nqueue.sort((a, b) => (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0));
  return [nqueue, pizzacount]
}
 

module.exports = {statuschangeJobs, calculatequeuetime}