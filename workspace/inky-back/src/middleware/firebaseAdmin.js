require("dotenv").config();
const admin = require("firebase-admin");

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

module.exports = admin;
