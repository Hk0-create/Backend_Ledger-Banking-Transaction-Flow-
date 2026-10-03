const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:[true,"User is required"],
    index:true
  },

  status:{
    type:String,
    enum:{
      values:["Active","Frozen", "Closed" ],
      message:"Status must be either Active, Frozen or Closed"
    },
      default:"Active"
  },
  currency:{
    type:String,
    required:[true,"Currency is required for creating an account"],
    default:"PKR"
  }
},{
  timestamps:true
})

accountSchema.index({ user: 1, status:1 })

accountSchema.methods.getBalance = async function() {
  const balanceData = await ledgerModel.aggregate([
    {$match:{account: this._id}},
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum:{
            $cond:[
              {$eq:["$type","Debit"]},
              "$amount",
              0
            ]
          }
        },
          totalCredit: {
            $sum:{
              $cond:[
                {$eq:["$type","Credit"]},
                "$amount",
                0
              ]
            }
          }
        }
    },
    {
      $project: {
        _id: 0,
        balance: {$subtract:["$totalCredit","$totalDebit"]}
      }
    }
  ]);

  if(balanceData.length === 0){
    return 0;
  }
  return balanceData[0].balance;
}
const accountModel= mongoose.model("Account",accountSchema)

module.exports = accountModel