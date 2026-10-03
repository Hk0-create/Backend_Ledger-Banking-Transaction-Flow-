const accountModel = require("../models/account.model");


async function createAccountController(req, res) {
  const user = req.user; // Assuming the user is attached to the request object by the auth middleware

  const account = await accountModel.create({
    user: user._id,
  })
  res.status(201).json({
    account
  })

}


async function getUserAccountsController(req, res) {
  const accounts = await accountModel.find({ user: req.user._id });
  return res.status(200).json({
    message: "Accounts retrieved successfully",
    status: "success",
    accounts
  })
}

async function getAccountBalanceController(req, res) {
  const { accountId } = req.params;
  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id
  })
  if(!account){
    return res.status(404).json({
      message: "Account not found",
      status: "failed"
    })
  }
  const balance = await account.getBalance();
  return res.status(200).json({
    accountId: account._id,
    balance: balance,
    message: "Account balance retrieved successfully",
  })
}
module.exports = {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController
}