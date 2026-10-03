const {Router} = require("express");
const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require("../middleware/auth.middleware");


const transactionRouter = Router();

//new transactions

transactionRouter.post("/", authMiddleware.authMiddleware, transactionController.createTransaction);


// POST /api/transactions
// Create a new transaction
// Protected route, only authenticated users can create a transaction

transactionRouter.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction);


module.exports = transactionRouter;