const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load environment variables from .env.test for testing
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log("📦 Connecté à la base :", process.env.DB_NAME);

module.exports = { pool };
