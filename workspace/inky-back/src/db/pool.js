const { Pool } = require("pg");
require("dotenv").config();

// Use a different DB for tests
const isTestEnv = process.env.NODE_ENV === "test";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: isTestEnv ? process.env.DB_TEST_NAME : process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;
