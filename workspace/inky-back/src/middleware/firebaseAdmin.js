const admin = require("firebase-admin");

// Get service account path from env
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

module.exports = admin;
