const checkIfUserLogin = require(".././util/user-login");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

exports.loginSuccess = async (req, res) => {
  try {
    // If there is a user logged in
    const [login, userMail] = await checkIfUserLogin(req);

    if(login){
      res.render("login-success", { email: userMail });
    }else{
      await Promise.reject('User not logged in')
    }
  } catch (err) {
    // If there is no user logged in go back to login
    res.redirect("/login");
  }
};
