require("dotenv").config();
const admin = require("firebase-admin");

// Use `cert()` with the JSON file path from the environment variable
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

// Middleware to verify Firebase token
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token using Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Decoded token:", decodedToken);
    req.user = decodedToken; // Attach user data to the request
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

module.exports = authenticateToken;
