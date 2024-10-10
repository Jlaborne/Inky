class User {
  constructor(uid, name, firstName, email, password, role) {
    this.uid = uid;
    this.name = name;
    this.firstName = firstName;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Method to update user's information
  updateUser({ name, firstName, email, password, role }) {
    if (name) this.name = name;
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
