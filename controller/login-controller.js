const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require(".././model/User");

dotenv.config({ path: "./config.env" });

// JWT
const JWT_KEY = process.env.JWT;

exports.showPage = (req, res) => {
  // Parse the token from cookies
  const { token } = req.cookies;

  // Check if there is a session already for this user
  if (checkSession(token)) return res.redirect("/users");

  // If not then show login
  res.render("login");
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    // execute the findOne
    const user = await User.findOne({ email }).exec();

    // If user not existing
    if (!user) return res.status(200).json({ status: "failed", message: "User not existing" });

    // compare password
    const hashPass = await bcrypt.compare(password, user.password);

    // if condition met then send status
    if (user && hashPass) {
      // Create token
      const token = jwt.sign({ id: user._id, email: user.email, login: true }, JWT_KEY);

      // Store token in cookie
      res.cookie("token", token, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });

      // Send status
      res.status(200).json({ status: "ok", message: "Login Success" });
    } else {
      res.status(200).json({ status: "failed", message: "Email or Password not correct" });
    }
  } catch (err) {
    // Server error
    res.status(500).json({ status: "failed", message: err });
  }
};

//////////////////////////////////
// Check if there is a session
function checkSession(token) {
  try {
    const verify = jwt.verify(token, JWT_KEY);

    if (verify.login) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
