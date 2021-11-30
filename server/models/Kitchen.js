const { Schema, model } = require('mongoose');
const jobSchema = require('./Job');

const kitchenSchema = new Schema(
  {
    date: {
      // day resolution not hour
      type: String,
      default: new Date().toLocaleDateString().slice(0,10),
      required: true
    },
    // queue ordernumber, timestamp entry, status
    queue: [jobSchema],

  }
);

const Kitchen = model('Kitchen', kitchenSchema);

module.exports = Kitchen;
