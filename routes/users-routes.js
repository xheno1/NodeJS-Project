const loginSuccessRouter =  require(".././controller/login-success-controller")
const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', loginSuccessRouter.loginSuccess);

module.exports = router;
