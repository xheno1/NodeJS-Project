const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  date: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  message: {
    type: String,
    require: true,
  },
});

const Chat = mongoose.model("chats", chatSchema);
module.exports = Chat;
