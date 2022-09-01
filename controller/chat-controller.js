const User = require(".././model/User");
const Chat = require(".././model/Chat");
const checkIfUserLogin = require(".././util/user-login");

const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

exports.showPage = async (req, res) => {
  try {
    // If there is a user logged in
    const [login, userMail] = await checkIfUserLogin(req);

    if (login) {
      const chats = await Chat.find();

      // Get the name who is login
      const user =  await User.findOne({ email: userMail })

      // should pass a data
      // render chat
      res.render("chats", {
        user: user.name,
        chatbox: chats
      });
    } else {
      await Promise.reject("User not logged in");
    }
  } catch (err) {
    // If there is no user logged in go back to login
    res.redirect("/login");
  }
};

exports.sendMessage = async (req, res) => {
  try {
    // If there is a user logged in
    const [login] = await checkIfUserLogin(req);

    if (login) {

      // Save chat on db
      await Chat.create({
        date: req.body.time,
        name: req.body.user,
        message: req.body.userMessage
      })

      res.status(200).json();
    } else {
      await Promise.reject("User not logged in");
    }
  } catch (err) {
    // If there is no user logged in go back to login
    res.redirect("/login");
  }
}
