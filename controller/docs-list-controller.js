const formidable = require("formidable");
const fs = require("fs");

const User = require(".././model/User");
const Upload = require(".././model/Upload");
const checkIfUserLogin = require(".././util/user-login");

const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

exports.showPage = async (req, res) => {
  const [login, userMail, id] = await checkIfUserLogin(req);

  try {
    if (login) {
      // Show uploads
      const files = await Upload.aggregate([
        {
          $unwind: `$file`,
        },
        {
          $match: { email: userMail },
        },
      ]);

      //  Render sharedFiles look for the user id in sharedTo
      //  then render the file in page
      const sharedFiles = await Upload.aggregate([
        {
          $unwind: "$file",
        },
        {
          $unwind: "$file.sharedTo",
        },
        {
          $match: {
            "file.sharedTo": id,
          },
        },
      ]);

      res.render("docs-list", { files, sharedFiles });
    } else {
      await Promise.reject("User not logged in");
    }
  } catch (err) {
    // If there is no user logged in go back to login
    res.redirect("/login");
  }
};

exports.downloadSharedFile = async (req, res) => {
  const [login, , id] = await checkIfUserLogin(req);

  try {
    if (login) {
      // Shared files that we will download
      const sharedFiles = await Upload.aggregate([
        {
          $unwind: "$file",
        },
        {
          $unwind: "$file.sharedTo",
        },
        {
          $match: {
            "file.sharedTo": id,
            "file.fileId": mongoose.Types.ObjectId(req.params.file),
          },
        },
      ]);

      //  Create File directory of file that we want to download file
      const sharedUserId = sharedFiles[0].user_id.toString();
      const fileName = sharedFiles[0].file.fileName;

      const fileDirectory = `${__dirname}/.././uploads/${sharedUserId}/${fileName}`;

      //  download file
      res.download(fileDirectory);
    } else {
      await Promise.reject("User not logged in!");
    }
  } catch (err) {
    
    res.redirect("/login");
  }
};

exports.downloadMyFile = async (req,  res) => {
  const [login, , id] = await checkIfUserLogin(req);

  try {
    if (login) {
      // Shared files that we will download
      const myFiles = await Upload.aggregate([
        {
          $unwind: "$file",
        },
        {
          $match: {
            "file.fileId": mongoose.Types.ObjectId(req.params.file),
            user_id: mongoose.Types.ObjectId(id)
          }
        }
      ]);

      //  Create File directory of file that we want to download file
      const fileName = myFiles[0].file.fileName;

      const fileDirectory = `${__dirname}/.././uploads/${id}/${fileName}`;

      //  download file
      res.download(fileDirectory);
    } else {
      await Promise.reject("User not logged in!");
    }
  } catch (err) {
    res.redirect("/login");
  }
}

exports.uploadFile = async (req, res, next) => {
  const [login, userMail, id] = await checkIfUserLogin(req);

  try {
    if (login) {
      // Use to parse the  file
      const form = formidable({ multiples: true });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          next(err);
          return;
        }

        // Check first if the file is already uploaded
        const isFileAlreadyUploaded = await Upload.aggregate([
          {
            $match: {
              user_id: mongoose.Types.ObjectId(id)
            }
          },
          {
            $unwind: "$file"
          },
          {
            $match: {
              "file.fileName": { $eq: files.file_upload.originalFilename}
            }
          }
        ])

        // If file is already existing send a response that a 
        // file is already uploaded
        if(isFileAlreadyUploaded.length) return res.redirect('/docs-list');

        // Save the file in folder
        const oldpath = files.file_upload.filepath;
        const newpath = `./uploads/${id}/${files.file_upload.originalFilename}`;

        fs.copyFile(oldpath, newpath, function (err) {
          try{
            if (err) throw Error(err);

            // files to be pushed in embedded user upload
            const fileName = {
              fileId: mongoose.Types.ObjectId(),
              fileName: files.file_upload.originalFilename,
              fileLabel: fields.file_label,
              sharedTo: [],
            };

            // Then save it to database
            Upload.findOneAndUpdate(
              { email: userMail },
              { $push: { file: fileName } },
              (err, docs) => {
                // redirect after inserting data
                res.redirect("/docs-list");
              }
            );

          }catch(err){
            res.redirect("/docs-list");
          }
        });
      });
    } else {
      await Promise.reject("User not logged in!");
    }
  } catch (err) {
    res.redirect("/login");
  }
};

exports.deleteFile = async (req, res) => {
  const [login, , id] = await checkIfUserLogin(req);

  try {
    if (login) {

      // Now exclude the file in array element in index of this user
      // then join the two findFile and this array
      const findUser = await Upload.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $unwind: `$file`,
        },
        {
          $match: {
            "file.fileId": { $ne: mongoose.Types.ObjectId(req.params.file) },
          },
        },
        {
          $project: {
            file: 1,
            _id: 0
          }
        }
      ]);

      const newFileArray = findUser.map(file => file.file)

      // get the file name of we are deleting
      const getFileName = await Upload.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $unwind: `$file`,
        },
        {
          $match: {
            "file.fileId": mongoose.Types.ObjectId(req.params.file)
          }
        }
      ])

      // remove file from file directory
      await fs.rm(`./uploads/${id}/${getFileName[0].file.fileName}`, {recursive: true}, err => {
        if (err) {
          throw Error(`Directory or file not found!`);
        }
      });

      // Then save the new list of file into database
      await Upload.findOneAndUpdate(
        { user_id: mongoose.Types.ObjectId(id) },
        { file: newFileArray }
      );

      // send a status code if everything is correct
      res.status(200).json();
    } else {
      await Promise.reject("User not logged in!");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/login");
  }
};

exports.editFile = async (req, res) => {
  const [login, , id] = await checkIfUserLogin(req);

  try {
    if (login) {
      // const updatedFile = [];

      // find the file that we are editing
      const findFile = await Upload.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $unwind: `$file`,
        },
        {
          $match: {
            "file.fileId": mongoose.Types.ObjectId(req.body.file_Id),
          },
        },
        {
          $set: { // update the label name of file
            "file.fileLabel": req.body.file_LabeL, 
          },
        },
        {
          $project: {
            _id: 0,
            file: 1,
          },
        },
      ]);

      // find the file of user that we dont want to edit
      const findUser = await Upload.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $unwind: `$file`,
        },
        {
          $match: {
            "file.fileId": { $ne: mongoose.Types.ObjectId(req.body.file_Id) },
          },
        },
        {
          $project: {
            _id: 0,
            file: 1,
          },
        },
      ]);

      // Now exclude the file in array element in index of this user
      // then join the findFile and this array
      // map to transform the array object
      const newFindFile = findFile.map((el) => {
        // create a placeholder
        const arr = {
          fileId: "",
          fileName: "",
          fileLabel: "",
          sharedTo: [],
        };

        //  assign a value
        arr.fileId = mongoose.Types.ObjectId(el.file.fileId);
        arr.fileName = el.file.fileName;
        arr.fileLabel = el.file.fileLabel;
        arr.sharedTo = el.file.sharedTo;

        // return the new value
        return arr;
      });

      const excludedFile = findUser.map((el) => {
        // create a placeholder
        const arr = {
          fileId: "",
          fileName: "",
          fileLabel: "",
          sharedTo: [],
        };

        //  assign a value
        arr.fileId = mongoose.Types.ObjectId(el.file.fileId);
        arr.fileName = el.file.fileName;
        arr.fileLabel = el.file.fileLabel;
        arr.sharedTo = el.file.sharedTo;

        // return the new value
        return arr;
      });

      // merge the edit file and the file that we did not edit
      const newfileArray = newFindFile.concat(excludedFile);

      // Update the user file array data
      await Upload.findOneAndUpdate({ user_id: id }, { file: newfileArray });

      // send success
      res.status(200).json();
    } else {
      await Promise.reject("User not loggged in!");
    }
  } catch (err) {
    res.redirect("/login");
  }
};

///////////////////////////////////////////////////////////////
// Share File

exports.showShareFile = async (req, res) => {
  const [login, userMail, id] = await checkIfUserLogin(req);

  // console.log(await Upload.find());

  try {
    if (login) {
      // locate the file in array that is shown in Upload Sharing <h1>
      const file = await Upload.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $unwind: "$file",
        },
        {
          $match: {
            "file.fileId": mongoose.Types.ObjectId(req.params.file),
          },
        },
        {
          $project: {
            file: 1,
            _id: 0,
          },
        },
      ]);

      // show all list of users
      const users = await User.find().select(["-password", "-__v"]);

      // Render the file that is shared
      const renderFileSharedToUser = await Upload.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $unwind: "$file", // destructure file array
        },
        {
          $match: {
            "file.fileId": mongoose.Types.ObjectId(file[0].file.fileId) // look for file that we will look for user that we sharedTo
          }
        },
        {
          $unwind: "$file.sharedTo"
        }
      ]);

      // Show the file name
      res.render("share", {
        filename: file[0].file.fileName,
        users,
        renderFileSharedToUser,
        userMail,
      });
    } else {
      await Promise.reject("User not logged in!");
    }
  } catch (err) {
    res.redirect("/login");
  }
};

exports.shareFileToUser = async (req, res) => {
  const [login, , id] = await checkIfUserLogin(req);

  try {
    if (login) {

      let sharedToUser = [];
      const fileArray = [];

      // Look for file first
      const file = await Upload.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $unwind: "$file",
        },
        {
          $match: {
            "file.fileId": mongoose.Types.ObjectId(req.params.file),
          },
        },
      ]);

      // Assign this to sharedTo array
      // So that we can check if we already share the file
      sharedToUser = file[0].file.sharedTo;

      // Then get the sharedTo array to know if we already share this file to user
      // file[0].file.sharedTo
      const isFileAlreadyShare = file[0].file.sharedTo.some((sharedTo) => {
        if (sharedTo === req.body.user) return true;
      });

      // Then insert the data in sharedTo array if we did not share it yet
      if (!isFileAlreadyShare) sharedToUser.push(req.body.user);
      else return res.status(400).json({ status: "failed", message: "file already share"});

      // used this to put this into file array
      const fileObj = {
        ...file[0].file, // destructure
      };

      // Assign a new value to sharedTo
      fileObj.sharedTo = sharedToUser;

      // but exclude first the array element that we are updating
      const excludeShareFile = await Upload.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $unwind: "$file",
        },
        {
          $match: {
            "file.fileId": { $ne: mongoose.Types.ObjectId(req.params.file) },
          },
        },
        {
          $project: {
            file: 1,
            _id: 0,
          },
        },
      ]);

      // Push the  new updated file array
      // the files that we are sharing
      excludeShareFile.forEach((files) => fileArray.push(files.file));

      // push the updated file array
      // list of files that we exclude
      fileArray.push(fileObj);

      // put the sharedToUser in Uploads
      await Upload.findOneAndUpdate(
        { user_id: mongoose.Types.ObjectId(id) },
        { file: fileArray }
      );

      res.status(200).json( { status: "ok", message: "Successfully share!"});
    } else {
      await Promise.reject("User not logged in!");
    }
  } catch (err) {
    res.redirect("/login");
  }
};

exports.removeShareFile = async (req, res) => {
  const [login, , id] = await checkIfUserLogin(req);

  try {
    if (login) {

      // find the file that we want to remove the sharedTo other user
      // this is the file that we are removing the sharedTo
      const file = await Upload.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $unwind: "$file",
        },
        {
          $match: {
            "file.fileId": mongoose.Types.ObjectId(req.params.file),
          },
        },
        {
          $unwind: "$file.sharedTo",
        },
        {
          $match: { "file.sharedTo": { $ne: req.body.userId } } // exclude the user in sharedTo array to remove
        },
        {
          $project: {
            file: 1,
            _id: 0,
          },
        },
      ]);

      // Assign an empty array to file sharedTo
      // We want to clear the sharedTo list of file
      // file[0].file.sharedTo = [];

      // now get the file that we are not removing the user
      // this is the file that we are not the removing the shared user
      const excludeSharedTo = await Upload.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $unwind: "$file",
        },
        {
          $match: {
            "file.fileId": { $ne: mongoose.Types.ObjectId(req.params.file) },
          },
        },
        {
          $project: {
            file: 1,
            _id: 0,
          },
        },
      ]);
      
      // Now update the file array. in this array it contains the user
      // that we did not remove from array. we have to  assign this new
      // array to the file that we are sharing
      if(file.length > 0){
        const fileShareListUpdated = file[0];
        const updatedSharedTo = file.map(sharedToUser => sharedToUser.file.sharedTo)

        // Updated sharedTo list
        fileShareListUpdated.file.sharedTo = updatedSharedTo;

        // Merge the file that we update and the file that we did not update
        // remove the file: {} by using map 
        const mergeFileList = excludeSharedTo.concat(fileShareListUpdated).map(files => files.file);

        // Now finally update the file list of user
        await Upload.findOneAndUpdate({ user_id: id }, { file: mergeFileList});

        res.status(200).json();
      }else{

        // IF there is only one left in the shared user
        // just get the file id then assign the sharedTo 
        // array into empty array
        const file = await Upload.aggregate([
          {
            $match: {
              user_id: mongoose.Types.ObjectId(id),
            },
          },
          {
            $unwind: "$file",
          },
          {
            $match: {
              "file.fileId": mongoose.Types.ObjectId(req.params.file),
            },
          },
        ])

        // Assign an empty array of sharedTo in the file that
        // we are removing the user in that file
        const emptySharedFile = file.map(updatedSharedToFile => {
          updatedSharedToFile.file.sharedTo = [];
          return updatedSharedToFile.file;
        })

        // Now transform the excludeSharedTo
        const newFileList = excludeSharedTo.map(files => files.file).concat(emptySharedFile)

        // Finally update the file list of user
        await Upload.findOneAndUpdate({ user_id: id }, { file: newFileList});

        res.status(200).json();
      }
    } else {
      await Promise.reject("User not logged in!");
    }
  } catch (err) {
    res.redirect("/login");
  }
};
