const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  account:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"account",
    required:[true, "ledger must be associated with an account"],
    index:true,
    immutable:true

  },

  amount:{
    type:Number,
    required:[true, "Amount is required for creating a ledger entry"],
    immutable:true
  },

  transaction:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"transaction",
    required:[true, "Transaction is required for creating a ledger entry"],
    index:true,
    immutable:true
  },
  type:{
    type:String,
    enum:{
      values:["Debit", "Credit" ],
      message:"Type must be either Debit or Credit" 
    },
    required:[true, "Type is required for creating a ledger entry"],
    immutable:true
  }
});


function preventLedgerModification(){
  throw new Error("Ledger entries cannot be modified or deleted");
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('findOneAndRemove', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);


const ledgerModel = mongoose.model("Ledger", ledgerSchema);

module.exports = ledgerModel;