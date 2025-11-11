/*const { validationResult } = require("express-validator");
const userQueries = require("../queries/userQueries");
const User = require("../models/user");
const { auth } = require("../../firebase");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");

// Create a new user
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { lastName, firstName, email, password, role } = req.body;
    const user = new User(lastName, firstName, email, password, role);
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

// Mettre à jour les informations d'un utilisateur
const updateUser = async (req, res) => {
  const { uid } = req.params;
  const { lastName, firstName, email } = req.body;

  // Vérifier que l'utilisateur authentifié correspond à l'utilisateur à mettre à jour
  if (req.user.uid !== uid) {
    return res.status(403).json({ error: "Accès interdit." });
  }

  try {
    const updatedUser = {
      uid,
      lastName,
      firstName,
      email,
    };
    await userQueries.updateUser(updatedUser);
    res.status(200).json({ message: "Informations mises à jour avec succès." });
  } catch (error) {
    console.error(`updateUser error: ${error}`);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour des informations." });
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
  console.log("Request Body:", req.body);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, lastName, firstName, role } = req.body;

  try {
    // Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Get the Firebase UID
    const uid = userCredential.user.uid;

    // Save user to your Postgres database
    const user = new User(uid, lastName, firstName, email, password, role);
    await userQueries.createUser(user);

    // Redirect based on role
    if (role === "tattoo") {
      res.status(201).json({
        uid,
        message: "Tattoo artist registered. Please create your profile.",
        redirectTo: "/create-tattoo-artist-page",
      });
    } else {
      res.status(201).json({ uid, message: "User registered successfully." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
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

    // Retrieve user from PostgreSQL database
    const user = await userQueries.getUserById(uid);

    // Check if the user was retrieved successfully
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Send response with user information
    res.status(200).json({
      uid: user.uid,
      role: user.role,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  registerUser,
  loginUser,
};
*/
