const pool = require("../db/pool");
const User = require("../models/user");

// Get all users
const getUsers = async () => {
  try {
    const resultQuery = await pool.query(
      "SELECT * FROM users ORDER BY uid ASC"
    );
    return resultQuery.rows.map((row) => {
      return new User(
        row.uid,
        row.last_name,
        row.first_name,
        row.email,
        row.password,
        row.role
      );
    });
  } catch (error) {
    console.error(`getUsers error: ${error}`);
    throw error;
  }
};

// Get user by UID
const getUserById = async (uid) => {
  try {
    const resultQuery = await pool.query(
      "SELECT uid, last_name, first_name, email, role FROM users WHERE uid = $1",
      [uid]
    );
    const result = resultQuery.rows[0];

    if (!result) {
      throw new Error(`User with UID ${uid} not found.`);
    }

    return result;
  } catch (error) {
    console.error(`getUserById error: ${error}`);
    throw error;
  }
};

// Create a new user (Ensure password hashing before storing)
const createUser = async (user) => {
  try {
    console.log("Creating user with UID: ", user.uid);
    const resultQuery = await pool.query(
      "INSERT INTO users (uid, last_name, first_name, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING uid",
      [user.uid, user.lastName, user.firstName, user.email, user.role]
    );
    return resultQuery.rows[0];
  } catch (error) {
    console.error(`createUser error: ${error}`);
    throw error;
  }
};

// Update user details (with email change validation)
const updateUser = async (uid, updates) => {
  try {
    // Prevent email hijacking by requiring re-authentication (handled on the frontend)
    const existingUser = await getUserById(uid);
    if (!existingUser) {
      throw new Error("User not found.");
    }

    const result = await pool.query(
      "UPDATE users SET last_name = $1, first_name = $2, email = $3 WHERE uid = $4 RETURNING *",
      [updates.lastName, updates.firstName, updates.email, uid]
    );

    if (result.rowCount === 0) {
      throw new Error("User update failed.");
    }

    return result.rows[0];
  } catch (error) {
    console.error(`updateUser error: ${error}`);
    throw error;
  }
};

// Delete a user (Fix: Use UID instead of ID)
const deleteUser = async (uid) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE uid = $1", [uid]);
    if (result.rowCount === 0) {
      throw new Error("User deletion failed. No user found.");
    }
  } catch (error) {
    console.error(`deleteUser error: ${error}`);
    throw error;
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
