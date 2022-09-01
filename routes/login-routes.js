const loginController  =  require('.././controller/login-controller')
const express = require("express");

const router = express.Router();

router.route('/')
.get(loginController.showPage)
.post(loginController.loginUser);

module.exports = router;