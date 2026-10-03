const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

router.post("/register", authController.userRegisterController); // POST /api/auth/register
  // Registration logic here

router.post("/login", authController.userLoginController); // POST /api/auth/login

// POST /api/auth/logout
router.post("/logout", authController.userLogoutController);

module.exports = router;