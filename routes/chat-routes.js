const chatController = require(".././controller/chat-controller");
const express = require("express");

const router = express.Router();

router.route("/")
.get(chatController.showPage)
.post(chatController.sendMessage);

module.exports = router;
