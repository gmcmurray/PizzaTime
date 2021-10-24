function calculatequeuetime(neworder, newqueue) {
  const capacity=20;
  const avgcooktime = 15;  
  let qtime;
    let inprog = newqueue.filter(({ status }) => status !== 'complete').reduce((total, obj) => obj.quantity + total, 0)
    if (inprog < capacity) {
        qtime = avgcooktime;
    }
    else {
        qtime = Math.ceil(avgcooktime * (inprog - capacity) / capacity) + 15;
    }
    console.log(`your pizza will ready in ${qtime} minutes`)
    return qtime
}

function statuschangeJobs(queue){
    let nqueue = [...queue]
    let nnow = Date.now()
    // sort queue
    queue.sort((a,b) => (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0));
    // mark jobs complete that have passed theri commitTime -assume complete
    let count =0;
    for (let x = 0; x < queue.length; x++) {
      if (parseInt(queue[x].commitTime) < nnow) {
        nqueue[x].status = 'complete'
      }
      else if (count < capacity) {
        nqueue[x].status = 'inoven'
      }
     }
     return nqueue
    }

     

    module.exports=  { statuschangeJobs, calculatequeuetime}