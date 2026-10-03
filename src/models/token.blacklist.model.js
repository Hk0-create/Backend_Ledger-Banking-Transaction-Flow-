const mongoose = require('mongoose');

const tokenBlackListSchema = new mongoose.Schema({
  token:{
    type:String,
    required:[true, "Token is required for blacklisting"],
    unique:[true, "Token already exists in the blacklist"]
  }
},{
  timestamps:true
});

tokenBlackListSchema.index({ createdAt: 1 },{
  expireAfterSeconds: 60 * 60 * 24 // 1 day
});

const tokenBlackListModel = mongoose.model("tokenBlackList", tokenBlackListSchema);

module.exports = tokenBlackListModel;