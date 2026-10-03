const userModel = require("../models/user.model")

const jwt = require("jsonwebtoken")
/* user registration controller through POST /api/auth/register */

const emailServices = require("../services/email.services")

const tokenBlackListModel = require("../models/token.blacklist.model")

async function userRegisterController(req, res) {
  const { email, name, password } = req.body;

  const isExist = await userModel.findOne({email: email})

  if (isExist) {
    return res.status(422).json({
    message: "User already exists",
    status: "failed"
    });
  }

  const user = await userModel.create({
    email,
    password,
    name
  });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

  res.cookie("token", token)

   // Send welcome email after registration
  await emailServices.sendRegisterEmail(user.email, user.name);

  res.status(201).json({
    user:{
      id: user._id,
    email: user.email,
    name: user.name,
    },
    token
  })
}

/* user login controller through POST /api/auth/login */
async function userLoginController(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");

  if(!user){
    return res.status(404).json({
      message: "User not found",
      status: "failed"
    });
  }

  const isValidPassword = await user.comparePassword(password)

  if(!isValidPassword){
    return res.status(401).json({
      message: "Invalid password",
      status: "failed"
    });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

  res.cookie("token", token)

  res.status(201).json({
    user:{
      id: user._id,
      email: user.email,
      name: user.name,
    },
    token
  })
}

// user logout controller through POST /api/auth/logout
async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if (!token) {
        return res.status(200).json({
            message: "User logged out successfully"
        })
    }



    await tokenBlackListModel.create({
        token: token
    })

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })

}


module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}