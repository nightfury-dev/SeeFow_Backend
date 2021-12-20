const express = require("express");
const router = express.Router();

const UserController = require("../controllers/UserController");

router.post("/register", UserController.registerUser);
router.post("/add", UserController.add);
router.post("/login", UserController.loginUser);
router.post("/get", UserController.getUsers);
router.get("/count", UserController.getDocumentCount);
router.post("/edit", UserController.editUser);
router.post("/delete", UserController.deleteUsers);
router.post("/check", UserController.check);
router.post("/update-user", UserController.updateUser);
router.post("/search", UserController.search);

module.exports = router;
