const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");
const router = express.Router();

// post /api/accounts/
// create a new account
//protected route, only authenticated users can create an account

router.post("/", authMiddleware.authMiddleware, accountController.createAccountController);

// get /api/accounts/
// get all accounts
//protected route, only authenticated users can get all accounts

router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountsController);

// get balance of a specific account
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController);


module.exports = router;