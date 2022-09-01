const registerController = require('../controller/register-controller')
const express = require('express');

const router = express();

// Get the logic in controller
router.route('/')
.get(registerController.showPage)
.post(registerController.registerUser)

module.exports = router;