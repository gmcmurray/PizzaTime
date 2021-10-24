const { Schema, model } = require('mongoose');
const jobSchema = require('./Job');

const kitchenSchema = new Schema(
  {
    date: {
      // day resolution not hour
      type: Date,
      default: Date.now,
      required: true
    },
    // queue ordernumber, timestamp entry, status
    queue: [jobSchema],
  }
);

const Kitchen = model('Kitchen', kitchenSchema);

module.exports = Kitchen;
