class User {
  constructor(uid, lastName, firstName, email, role, createdAt, updatedAt) {
    this.uid = uid;
    this.lastName = lastName;
    this.firstName = firstName;
    this.email = email;
    this.role = role;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }

  // Method to update user's information
  updateUser({ lastName, firstName, email, role }) {
    if (lastName !== undefined) this.lastName = lastName;
    if (firstName !== undefined) this.firstName = firstName;
    if (email !== undefined) {
      if (!this.validateEmail(email)) {
        throw new Error("Invalid email format.");
      }
      this.email = email;
    }
    if (role !== undefined) this.role = role;
    this.updatedAt = new Date();
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Enum for User Roles
const UserRole = Object.freeze({
  ADMIN: "admin",
  USER: "user",
  TATTOO: "tattoo",
});

module.exports = User;
