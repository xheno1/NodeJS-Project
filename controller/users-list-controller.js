const mongoose = require("mongoose");
const User = require(".././model/User");
const Upload = require(".././model/Upload");
const checkIfUserLogin = require(".././util/user-login");

const fs = require("fs");

const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });


exports.showPage = async (req, res) => {
  const [login, userMail] = await checkIfUserLogin(req);

  try {
    if (login) {
      // exclude password and __v in documents
      const userList = await User.find().select(["-password", "-__v"]);

      // render users list
      res.render("users-list", { userList, userMail });
    } else {
      await Promise.reject("User not logged in");
    }
  } catch (err) {
    // If there is no user logged in go back to login
    res.redirect("/login");
  }
};

exports.showEditUser = async (req, res) => {
  try {
    // If there is a user logged in
    const [login, userMail] = await checkIfUserLogin(req);

    if (login) {
      const user = await User.find(req.params).select(["-password", "-__v"]);
      const { name: fullname, email } = user[0];

      // Show the value on textbox and
      // Show only warning to user editing himself
      res.render("edit-user", { email, fullname, userMail });
    } else {
      await Promise.reject("User not logged in!");
    }
  } catch (err) {
    res.redirect("/user-list");
  }
};

exports.editUser = async (req, res) => {
  try {
    // Check if the user is editing himself if true and he edit logout the user
    const [login, userMail] = await checkIfUserLogin(req);

    if (login) {
      const user = await User.find(req.params).select(["-password", "-__v"]);
      const previousEmail = user[0].email;
      const { name, email } = req.body;

      // check if the email is already existing
      // then if the email is not yet existing update the user
      // if the user is editing himself logout user
      const value = await User.findOneAndUpdate({ email: previousEmail }, { name, email });

      if (value) {
        // Check if the user is editing himself and
        // he change his unique email
        if (userMail === previousEmail && previousEmail !== email) {
          // logout the user when he update his email
          res.status(200).json({ status: "ok", message: "Update Success", changeEmail: true });
        } else {
          // if the user did not edit his account or also if he edit other
          // user email
          res.status(200).json({ status: "ok", message: "Update Success", editOtherAccount: true });
        }
      }
    } else {
      await Promise.reject("User not logged in");
    }
  } catch (err) {
    if (err.code === 11000) res.status(200).json(err); // duplicate key
    else res.status(500).json({ status: "failed", message: "Internal Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Check the user if they try to delete himself by adding
    // or modifying the DOM attribute or element to prevent
    // them

    // ALSO the route delete is accessible in axios console log
    // So when we try use the console.log to send delete
    const [login, userMail] = await checkIfUserLogin(req);

    if (login) {
      // Check if the user is deleting himself (Prevent deleting user from client side when they add or edit an element in DOM)
      // If not then delete the user
      const user = await User.findOne({ _id: mongoose.Types.ObjectId(req.params._id) });

      // Delete user uploads directory
      await fs.rm(`./uploads/${user._id}`, { recursive: true }, err => {
        if (err) {
          throw Error(`Directory or user not found!`);
        }
      });

      await User.findOneAndDelete({ email: { $ne: userMail }, _id: { $eq: req.params._id } });

      // Delete also the user in uploads collection
      await Upload.findOneAndDelete({ user_id: mongoose.Types.ObjectId(req.params._id) });

      // redirect
      res.status(200).json({ status: "ok", message: "User deleted successfully!" });
    } else {
      await Promise.reject("User not logged in!");
    }
  } catch (err) {
    res.send("error");
  }
};
