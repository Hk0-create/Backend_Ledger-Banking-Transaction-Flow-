const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

  fromAccount: {

    type: mongoose.Schema.Types.ObjectId,
    ref:"account",
    required: [true, "From account is required for creating a transaction"],
    index: true
  },

  toAccount:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"account",
    required:[true, "To account is required for creating a transaction"],
    index:true
  },

  status:{
    type:String,
    enum:{
      values:["Pending", "Completed", "Failed", "Reversed" ],
      message:"Status must be either Pending, Completed, Failed or Reversed",
    },
    default:"Pending"
  },

  amount:{
    type:Number,
    required:[true, "Amount is required for creating a transaction"],
    min$:[0, "Amount must be greater than or equal to 0"]
  },

  idempotencyKey:{
    type:String,
    required:[true, "Idempotency key is required for creating a transaction"],
    index:true,
    unique:true
  }},{
    timestamps:true
});

const transactionModel = mongoose.model("Transaction", transactionSchema);

module.exports = transactionModel;