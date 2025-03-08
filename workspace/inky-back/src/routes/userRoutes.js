const express = require("express");
const { check } = require("express-validator");
const userController = require("../controllers/userController");
const firebase = require("../../firebase");
const authenticate = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/users", userController.getUsers);
router.get("/users/:uid", userController.getUserById);
//router.put("/users/:id", userController.updateUser);
router.put("/users/:uid", authenticate, userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

router.post(
  "/register",
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.registerUser // Make sure you have a function for handling user registration
);

module.exports = router;
