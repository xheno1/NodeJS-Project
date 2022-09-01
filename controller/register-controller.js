const mongoose =  require("mongoose");
const bcrypt = require("bcrypt");
const User = require(".././model/User");
const Upload = require(".././model/Upload");
const fs = require("fs");

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

// Async Promise for input validation
const inputValidation = bodyData => {
  const { name, email, password, confirm_pass } = bodyData;

  return new Promise((resolve, rejected) => {
    // Validation
    if (name === "" && email === "" && password === "" && confirm_pass === "") {
      return rejected("Input field must not be empty");
    } else if (password !== confirm_pass) {
      return rejected("Password and Confirm password does not match");
    } else if (!emailPattern.test(email)) {
      return rejected("Email pattern is not correct please try again!");
    } else {
      return resolve("All field is correct");
    }
  });
};

exports.showPage = (req, res) => {
  res.render("register");
};

exports.registerUser = async (req, res) => {
  try {
    // Do validation first
    // Throw an error if promise is rejected
    await inputValidation(req.body);

    // Then proceed to inserting data
    const { name, email, password } = req.body;

    // hash password
    const hashPass = await bcrypt.hash(password, 10);

    // Insert data in collection
    await User.create({ name, email, password: hashPass });

    // create file document for newly created user
    // but first find that user then use this to store in upload collection
    const user = await User.findOne({ email });
    await Upload.create({ user_id: mongoose.Types.ObjectId(user._id), name: user.name, email: user.email});

    // Create directory for user upload
    await fs.mkdir(`./uploads/${user._id}`, (err) => {
      if(err){
       throw Error(err) 
      }

      console.log(`Directory created for ${user._id}`);
    })

    // If success then render register success
    res.status(200).json({ status: "ok", message: "Register Success" });
  } catch (err) {
    console.log(err);

    // Show error
    res.json(err);
  }
};
