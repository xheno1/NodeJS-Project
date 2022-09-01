const logoutController = require(".././controller/logout-controller");
const express = require("express");

const router = express.Router();

router.get("/", logoutController.logOutUser);

module.exports = router;
