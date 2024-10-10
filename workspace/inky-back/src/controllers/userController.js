const { validationResult } = require('express-validator');
const userQueries = require('../queries/userQueries');
const User = require('../models/user');
const { auth } = require("../../firebase");
const { createUserWithEmailAndPassword } = require('firebase/auth');

// Create a new user
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = new User(-1, req.body.name, req.body.email);
    const result = await userQueries.createUser(user);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send("Error creating user");
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const result = await userQueries.getUsers();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send("Error fetching users");
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await userQueries.getUserById(id);
    if (!result) {
        return res.status(404).send("User not found");
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send("Error fetching user");
  }
};

// Update an existing user
const updateUser = async (req, res) => {
  try {
    const user = new User(req.params.id, req.body.name, req.body.email);
    const result = await userQueries.updateUser(user);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send("Error updating user");
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await userQueries.deleteUser(id);
    res.status(200).send("User deleted");
  } catch (error) {
    res.status(500).send("Error deleting user");
  }
};

// Register user
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Use auth from imported firebase module
    res.status(201).json({ uid: userCredential.user.uid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  registerUser,
};
