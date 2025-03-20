const { pool } = require("../db/pool");
const User = require("../models/user");

// Get all users
const getUsers = async () => {
  try {
    const resultQuery = await pool.query("SELECT * FROM users ORDER BY uid ASC");
    return resultQuery.rows.map((row) => {
      return new User(row.uid, row.last_name, row.first_name, row.email, row.password, row.role);
    });
  } catch (error) {
    console.error(`getUsers error: ${error}`);
    throw error;
  }
};

// Get user by UID
const getUserById = async (uid) => {
  try {
    const resultQuery = await pool.query("SELECT uid, last_name, first_name, email, role FROM users WHERE uid = $1", [uid]);
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

const createUser = async (user) => {
  try {
    console.log("🟢 Creating user with UID:", user.uid);
    console.log("📝 Running query: INSERT INTO users (uid, last_name, first_name, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING uid");
    console.log("🛠 Query parameters:", [user.uid, user.lastName, user.firstName, user.email, user.role]);

    const resultQuery = await pool.query("INSERT INTO users (uid, last_name, first_name, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING uid", [user.uid, user.lastName, user.firstName, user.email, user.role]);

    console.log("🔍 Query Result:", resultQuery);

    if (!resultQuery || !resultQuery.rows) {
      throw new Error("Database query returned undefined!");
    }

    return resultQuery.rows[0];
  } catch (error) {
    console.error("❌ createUser error:", error);
    throw error;
  }
};

// Update user details (with email change validation)
const updateUser = async ({ uid, lastName, firstName }) => {
  const query = `
    UPDATE users
    SET last_name = $1, first_name = $2, updated_at = NOW()
    WHERE uid = $3
    RETURNING *;
  `;

  try {
    const { rows } = await pool.query(query, [lastName, firstName, uid]);

    if (rows.length === 0) {
      throw new Error("User not found.");
    }

    return rows[0];
  } catch (error) {
    console.error("updateUser error:", error);
    throw error;
  }
};

// Delete a user from PostgreSQL
const deleteUser = async (uid) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE uid = $1 RETURNING *", [uid]);

    if (result.rowCount === 0) {
      console.warn(`No user found with UID: ${uid}`);
      return null; // Return null to handle this case properly
    }

    console.log(`Deleted PostgreSQL user: ${uid}`);
    return result; // Ensure we return the result
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
