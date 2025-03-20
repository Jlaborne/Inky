const express = require("express");
const { param, body } = require("express-validator");
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/users", userController.getUsers);
router.get("/users/:uid", userController.getUserById);
router.patch("/users/:uid", authenticate, [param("uid").trim().escape(), body("firstName").optional().trim().escape(), body("lastName").optional().trim().escape()], userController.updateUser);
router.delete("/users/:uid", authenticate, userController.deleteUser);

module.exports = router;
