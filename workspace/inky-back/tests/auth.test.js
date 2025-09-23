const request = require("supertest");
const app = require("../server"); // Express server instance
const admin = require("firebase-admin");
const { pool } = require("../src/db/pool"); // Ensure pool is imported

// Debug log to verify pool import
console.log("Pool imported:", !!pool);

describe("Authentication API Tests", () => {
  let testUser = {
    email: "testuser4@example.com",
    password: "password123",
    lastName: "Doe",
    firstName: "John",
    role: "tattoo",
  };

  afterEach(async () => {
    // Clean up Firebase user after each test
    try {
      const userRecord = await admin.auth().getUserByEmail(testUser.email);
      console.log(`Deleting Firebase user: ${userRecord.uid}`);
      await admin.auth().deleteUser(userRecord.uid);
    } catch (error) {
      // Handle error if user does not exist in Firebase
      if (error.code !== "auth/user-not-found") {
        console.error("Firebase cleanup error:", error);
      } else {
        console.log("Firebase user not found, skipping deletion.");
      }
    }

    // Clean up PostgreSQL user after each test
    try {
      const result = await pool.query("DELETE FROM users WHERE email = $1 RETURNING *", [testUser.email]);
      if (result.rowCount > 0) {
        console.log(`Deleted PostgreSQL user: ${result.rows[0].uid}`);
      } else {
        console.log("PostgreSQL user not found, skipping deletion.");
      }
    } catch (error) {
      console.error("PostgreSQL cleanup error:", error);
    }
  });

  it("should create a new user", async () => {
    const res = await request(app).post("/auth/register").send(testUser);
    console.log("Test: should create a new user", res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
  });

  it("should return error for duplicate email", async () => {
    // First, create the user
    await request(app).post("/auth/register").send(testUser);

    // Then, attempt to create the user again
    const res = await request(app).post("/auth/register").send(testUser);
    console.log("Test: should return error for duplicate email", res.body);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Email already in use");
  });
});
