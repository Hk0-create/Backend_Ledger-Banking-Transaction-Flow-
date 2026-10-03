const userModel = require("../models/user.model");

const jwt = require("jsonwebtoken")

const tokenBlackListModel = require("../models/token.blacklist.model")


async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if(!token){
    return res.status(401).json({
      message: "Unauthorized access. Token is missing.",
      status: "failed"
    });
  }

  const isTokenBlacklisted = await tokenBlackListModel.findOne({ token: token });
  if(isTokenBlacklisted){
    return res.status(401).json({
      message: "Unauthorized access. Token is blacklisted.",
      status: "failed"
    });
  }
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    req.user = user;
    return next();

  }catch(err){
    return res.status(401).json({
      message: "Unauthorized access. Invalid token.",
      status: "failed"
    });
  } 
}

async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if(!token){
    return res.status(401).json({
      message: "Unauthorized access. Token is missing.",
      status: "failed"
    });
  }
  const isTokenBlacklisted = await tokenBlackListModel.findOne({ token: token });
  if(isTokenBlacklisted){
    return res.status(401).json({
      message: "Unauthorized access. Token is blacklisted.",
      status: "failed"
    });
  }

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    req.user = user;
    return next();
  }catch(err){
    return res.status(401).json({
      message: "Unauthorized access. Invalid token.",
      status: "failed"
    });
  }
}


module.exports = {
  authMiddleware,
  authSystemUserMiddleware
}
