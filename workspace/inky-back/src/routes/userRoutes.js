const express = require("express");
const { check } = require("express-validator");
const userController = require("../controllers/userController");
const firebase = require("../../firebase");

const router = express.Router();

// User routes
router.post(
  "/users",
  [
    check("name").notEmpty().withMessage("Name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
  ],
  userController.createUser
);

router.get("/users", userController.getUsers);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

/*
router.post(
  "/register",
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  userController.registerUser // Make sure you have a function for handling user registration
);
*/

module.exports = router;
