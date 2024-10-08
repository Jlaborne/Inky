const pool = require('../db/pool');
const User = require('../models/user');

const { v4: uuidv4 } = require('uuid');

// Get all users
const getUsers = async () => {
  try {
    const resultQuery = await pool.query("SELECT * FROM users ORDER BY id ASC");
    return resultQuery.rows.map(row => new User(row.id, row.name, row.email));
  } catch (error) {
    console.log(`getUsers error: ${error}`);
    throw error;
  }
};

// Get user by ID
const getUserById = async (id) => {
  try {
    const resultQuery = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const result = resultQuery.rows[0];
    return new User(result.id, result.name, result.email);
  } catch (error) {
    console.log(`getUserById error: ${error}`);
    throw error;
  }
};

// Create a new user
const createUser = async (user) => {
  try {
    const userId = uuidv4();
    const resultQuery = await pool.query(
      "INSERT INTO users (id, name, email) VALUES ($1, $2, $3) RETURNING id",
      [userId, user.name, user.email]
    );
    user.id = resultQuery.rows[0].id;
    return user;
  } catch (error) {
    console.log(`createUser error: ${error}`);
    throw error;
  }
};

// Update an existing user
const updateUser = async (user) => {
  try {
    await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3",
      [user.name, user.email, user.id]
    );
    return user;
  } catch (error) {
    console.log(`updateUser error: ${error}`);
    throw error;
  }
};

// Delete a user
const deleteUser = async (id) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
  } catch (error) {
    console.log(`deleteUser error: ${error}`);
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