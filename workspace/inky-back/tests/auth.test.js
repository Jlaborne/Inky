const request = require("supertest");
const app = require("../server"); // Express server instance
const { pool } = require("../src/db/pool");
const admin = require("firebase-admin");

// Mock Firebase Admin SDK
jest.mock("firebase-admin", () => ({
  auth: jest.fn(() => ({
    createUser: jest.fn(async ({ email }) => ({
      uid: "mock-firebase-uid",
      email,
    })),
    getUser: jest.fn(async () => ({
      uid: "mock-firebase-uid",
      email: "testuser@example.com",
    })),
    deleteUser: jest.fn(async () => Promise.resolve()),
  })),
}));

// Mock PostgreSQL Database Queries
jest.mock("../src/db/pool", () => ({
  query: jest.fn(),
}));

describe("Authentication API Tests", () => {
  let testUser = {
    email: "testuser@example.com",
    password: "password123",
    lastName: "Doe",
    firstName: "John",
    role: "tattoo",
  };

  afterAll(() => {
    jest.clearAllMocks(); // Clear mocks after tests
  });

  it("should create a new user", async () => {
    // Mock PostgreSQL insert query
    pool.query.mockResolvedValueOnce({ rows: [{ uid: "mock-firebase-uid" }] });

    const res = await request(app).post("/auth/register").send(testUser);

    console.log("Response:", res.body); // Debugging output

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("uid", "mock-firebase-uid");
    expect(res.body).toHaveProperty("message", "User registered successfully");

    // Verify that Firebase & PostgreSQL methods were called
    expect(admin.auth().createUser).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      expect.any(Array)
    );
  });

  it("should return error for duplicate email", async () => {
    // Mock Firebase & PostgreSQL behavior for duplicate email
    admin
      .auth()
      .createUser.mockRejectedValueOnce(new Error("Email already exists"));
    pool.query.mockRejectedValueOnce(new Error("User already exists"));

    const res = await request(app).post("/auth/register").send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toContain("already exists");

    // Ensure Firebase was called but rejected
    expect(admin.auth().createUser).toHaveBeenCalledTimes(1);
    expect(pool.query).not.toHaveBeenCalled();
  });
});
