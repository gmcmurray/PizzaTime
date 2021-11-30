const { Schema } = require('mongoose');

// This is a subdocument schema, it won't become its own model but we'll use it as the schema for the Kitchen 'updateOrder'
// array in Kitchen.js
const jobSchema = new Schema(
{
    orderId: {type: Schema.Types.ObjectId,
            ref: 'Order'}, // linked to orders,linked referen
    orderName: {type: String},  // firstInitial, lastName, Date, RandomNumber 0-999
    priority: {type: String}, // ordercreatedAt time stamp in milliseconds
    status: {type:String},  // prelim, active, in-oven, cancel, complete
    pizzas: {type: String},
    commitTime: {type:String},
    sales: {type:String}
  }
);

module.exports = jobSchema;