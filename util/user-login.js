const User = require(".././model/User");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config({ path: "./config.env" });

// JWT
const JWT_KEY = process.env.JWT;

module.exports = async function checkIfUserLogin(req) {
  try {
    // If there is a user logged in
    const { token } = req.cookies;
    const { email: userMail, login, id } = jwt.verify(token, JWT_KEY);

    // find if the user is still existing in db
    const userExist = await User.findOne({ email: userMail });

    // If user existing
    if (userExist && login) {
      return [true, userMail, id];
    } else {
      return [false, '', ''];
    }
  } catch (err) {
    // redirect user to login page
    return [false, '', ''];
  }
};
