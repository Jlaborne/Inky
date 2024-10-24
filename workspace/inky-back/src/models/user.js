class User {
  constructor(uid, lastName, firstName, email, password, role) {
    this.uid = uid;
    this.lastName = lastName;
    this.firstName = firstName;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Method to update user's information
  updateUser({ lastName, firstName, email, password, role }) {
    if (lastName) this.lastName = lastName;
    if (firstName) this.firstName = firstName;
    if (email) this.email = email;
    if (password) this.password = password;
    if (role) this.role = role;
    this.updatedAt = new Date();
  }
}

// Enumération pour le rôle de l'utilisateur
const UserRole = Object.freeze({
  ADMIN: "admin",
  USER: "user",
  TATTOO: "tattoo",
});

module.exports = User;
