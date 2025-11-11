const userQueries = require("../src/queries/userQueries");
const { pool } = require("../src/db/pool");

jest.mock("../src/db/pool"); // Mock the database

test("getUserById should return user details", async () => {
  const mockUser = {
    uid: "123",
    last_name: "Doe",
    first_name: "John",
    email: "john@example.com",
    role: "user",
  };

  pool.query.mockResolvedValueOnce({ rows: [mockUser] });

  const user = await userQueries.getUserById("123");
  expect(user).toEqual(mockUser);
});
