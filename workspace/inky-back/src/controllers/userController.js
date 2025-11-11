const { validationResult } = require("express-validator");
const userQueries = require("../queries/userQueries");
const User = require("../models/user");
const admin = require("firebase-admin");

// Register user (Firebase + PostgreSQL)
const registerUser = async (req, res) => {
  console.log("Request Body:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, lastName, firstName, role } = req.body;

  try {
    // 1) Créer l'utilisateur dans Firebase (Admin SDK)
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
    });
    const uid = userRecord.uid;
    console.log("Generated Firebase UID:", uid);
    const user = new User(uid, lastName, firstName, email, role);
    await userQueries.createUser(user);

    // 3) Redirection logique
    const redirectTo = role === "tattoo" ? "/create-artist" : "/";

    return res.status(201).json({
      uid,
      message: "User registered successfully",
      redirectTo,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all users
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

// Get user by ID
const getUserById = async (req, res) => {
  console.log("Fetching user with UID:", req.params.uid);
  try {
    const uid = req.params.uid;

    const requesterUid = req.user?.uid;
    const isAdmin = req.user?.admin === true;

    if (uid !== requesterUid && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

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

// Update user profile
const updateUser = async (req, res) => {
  const uid = req.params.uid;
  const { lastName, firstName } = req.body;

  // Debug log to verify UID and request body
  console.log("Updating user with UID:", uid);
  console.log("Request Body:", req.body);

  // Ensure UID is a string
  if (typeof uid !== "string") {
    return res.status(400).json({ error: "Invalid UID format." });
  }

  // Check if the authenticated user is authorized to update the profile
  if (!req.user || req.user.uid !== uid) {
    return res
      .status(403)
      .json({ error: "Unauthorized to update this profile." });
  }

  try {
    const updatedUser = { uid, lastName, firstName };
    await userQueries.updateUser(updatedUser);
    res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ error: "Error updating profile." });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { uid } = req.params;

  if (!req.user || req.user.uid !== uid) {
    return res.status(403).json({ error: "Unauthorized to delete this user." });
  }

  try {
    // Step 1: Delete user from Firebase Authentication
    await admin.auth().deleteUser(uid);
    console.log(` Successfully deleted Firebase user: ${uid}`);

    // Step 2: Delete user from PostgreSQL database
    const result = await userQueries.deleteUser(uid);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found in database." });
    }

    console.log(`Successfully deleted PostgreSQL user: ${uid}`);

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ error: "Failed to delete user." });
  }
};

// Login user
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
