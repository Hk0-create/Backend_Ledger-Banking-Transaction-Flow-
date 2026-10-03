const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.services');
const mongoose = require('mongoose');




/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */


async function  createTransaction(req, res){

  const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

  if(!fromAccount || !toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
      message: "Missing required fields like fromAccount, toAccount, amount or idempotencyKey",
      status: "failed"
    });

  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  })

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  })

  if(!fromUserAccount || !toUserAccount){
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
      status: "failed"
    });
  }


  // validate idempotency key

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey
  });

  if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status === "Completed"){
      return res.status(200).json({
        message: "Transaction already completed",
        status: "success",
        transaction: isTransactionAlreadyExists
      });
    }

    if(isTransactionAlreadyExists.status === "Pending"){
      return res.status(200).json({
        message: "Transaction is still pending",
        status: "success",
        transaction: isTransactionAlreadyExists
      });
    }

    if(isTransactionAlreadyExists.status === "Failed"){
      return res.status(500).json({
        message: "Transaction failed previously. Please try again.",
        status: "failed"
      });
    }

    if(isTransactionAlreadyExists.status === "Reversed"){
      return res.status(500).json({
        message: "Transaction was reversed previously. Please try again.",
        status: "failed"
      });
    }

  }

  // check account status

  if(fromUserAccount.status !== "Active" || toUserAccount.status !== "Active"){
    return res.status(400).json({
      message: "One or both accounts are not active. Please check account status.",
      status: "failed"
    })
  }

  // derive sender balance from ledger

  const balance = await fromUserAccount.getBalance();

  if (balance < amount){
    return res.status(400).json({
      message: `Insufficient balance the current balance is ${balance}. Requested amount is ${amount}.`,
      status: "failed"
    })
  }

 let transaction;
  try{
  // create transaction (PENDING)

  // 5. create transaction (PENDING) - Corrected Code
    const session = await mongoose.startSession();
    session.startTransaction();

    // Yahan 'await' aur '{ session }' zaroor lagayein taaki ID mil jaye
    transaction = await transactionModel.create([{
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "Pending"
    }], { session });

    
    const savedTransaction = transaction[0];

    const debitLedgerEntry = await ledgerModel.create([{
      account: fromAccount,
      amount: amount,
      transaction: savedTransaction._id, 
      type: "Debit"
    }], { session });
    
    const craditLedgerEntry = await ledgerModel.create([{
      account: toAccount,
      amount: amount,
      transaction: savedTransaction._id, 
      type: "Credit"
    }], { session });

    savedTransaction.status = "Completed";
    await savedTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();
  }catch(err){
    return res.status(400).json({
      message: "Transaction failed due to an error please try again later",
      status: "failed",
      error: err.message
    })
  }
  
  // send email notification
  await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, fromAccount, toAccount);

  return res.status(201).json({
    message: "Transaction completed successfully",
    status: "success",
    transaction
  })
}

async function createInitialFundsTransaction(req, res){
  const {toAccount, amount, idempotencyKey} = req.body;

  if(!toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
      message: "Missing required fields like toAccount, amount or idempotencyKey",
      status: "failed"
    });
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  })

  if(!toUserAccount){
    return res.status(400).json({
      message: "Invalid toAccount",
      status: "failed"
    });
  }
  const fromUserAccount = await accountModel.findOne({
    // systemAccount: true,
    user: req.user._id
  })

  if(!fromUserAccount){
    return res.status(400).json({
      message: "System account not found for the user",
      status: "failed"
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  transaction = await transactionModel.create([{
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "Pending"

  }],{session})[0];

  const debitLedgerEntry = await ledgerModel.create([{
    account: fromUserAccount._id,
    amount: amount,
    transaction: transaction._id,
    type: "Debit"
  }], {session});

  await(()=>{
    return new Promise((resolve )=> setTimeout(resolve, 1000*1000));
  })()

  const creditLedgerEntry = await ledgerModel.create([{
    account: toAccount,
    amount: amount,
    transaction: transaction._id,
    type: "Credit"
  }], {session});

  // transaction.status = "Completed";
  // await transaction.save({session});

  await transactionModel.findOneAndUpdate(
    {_id: transaction._id},
    {status:"Completed"},
    {session}
  )

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction,
    status: "success"
  })
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction
}
