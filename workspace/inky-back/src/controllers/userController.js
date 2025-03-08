const { validationResult } = require("express-validator");
const userQueries = require("../queries/userQueries");
const User = require("../models/user");
const { auth } = require("../../firebase");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");

// Register user (Firebase + PostgreSQL)
const registerUser = async (req, res) => {
  console.log("Request Body:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, lastName, firstName, role } = req.body;
  let userCredential = null;

  try {
    // Step 1: Register user in Firebase
    userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    if (!uid) {
      console.error("Error: Firebase UID is missing!");
      return res.status(500).json({ error: "Failed to get Firebase UID" });
    }

    console.log("Generated Firebase UID:", uid);

    // Step 2: Save user to PostgreSQL WITHOUT PASSWORD
    const user = new User(uid, lastName, firstName, email, role);
    await userQueries.createUser(user);

    // Step 3: Set Redirect URL
    let redirectTo = role === "tattoo" ? "/create-artist" : "/";

    return res.status(201).json({
      uid,
      message: "User registered successfully",
      redirectTo,
    });
  } catch (error) {
    console.error("Error during registration:", error);

    // Step 4: Rollback Firebase User if PostgreSQL Fails
    if (userCredential) {
      await userCredential.user.delete();
      console.log("Rolled back Firebase user:", userCredential.user.uid);
    }

    return res.status(500).json({ error: error.message });
  }
};

// ✅ Get all users
const getUsers = async (req, res) => {
  console.log("Fetching all users...");
  try {
    const result = await userQueries.getUsers();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
};

// ✅ Get user by ID
const getUserById = async (req, res) => {
  console.log("Fetching user with UID:", req.params.uid);
  try {
    const uid = req.params.uid;
    const result = await userQueries.getUserById(uid);

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Error fetching user");
  }
};

// ✅ Update user profile
const updateUser = async (req, res) => {
  console.log("Updating user:", req.params.uid, "Request Body:", req.body);

  const { uid } = req.params;
  const { lastName, firstName, email, role } = req.body;

  if (!req.user || req.user.uid !== uid) {
    return res
      .status(403)
      .json({ error: "Unauthorized to update this profile." });
  }

  try {
    const updatedUser = { uid, lastName, firstName, email, role };
    await userQueries.updateUser(updatedUser);
    res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating profile." });
  }
};

// ✅ Delete a user
const deleteUser = async (req, res) => {
  console.log("Deleting user:", req.params.uid);

  const { uid } = req.params;

  if (!req.user || req.user.uid !== uid) {
    return res.status(403).json({ error: "Unauthorized to delete this user." });
  }

  try {
    await userQueries.deleteUser(uid);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Error deleting user");
  }
};

// ✅ Login user
const loginUser = async (req, res) => {
  console.log("Login request:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    // Retrieve user from PostgreSQL
    const user = await userQueries.getUserById(uid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      uid: user.uid,
      role: user.role,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
};
