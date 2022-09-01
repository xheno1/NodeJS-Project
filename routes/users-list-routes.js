const userController = require(".././controller/users-list-controller");
const express = require("express");

const router = express.Router();

router.route("/")
.get(userController.showPage)

// For edit and delete user routes
router.route("/:_id")
.get(userController.showEditUser)
.patch(userController.editUser)
.delete(userController.deleteUser)

module.exports = router;
