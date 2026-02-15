const mongoose = require("mongoose")

const orderSchema = mongoose.Schema({
    Orderitem: [{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Orderitem",
      required:true
    }],
    address:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    phone:{
      type:String,
      required:true
    },
    status:{
      type:String,
      default:"Pending"
    },
    totalPrice:{
      type:Number,
    },
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
    },
    dateOrdered:{
      type:Date,
      default:Date.now
    },
})

module.exports = mongoose.model("Order", orderSchema)