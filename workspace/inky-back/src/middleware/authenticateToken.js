const admin = require("./firebaseAdmin"); // Import initialized Firebase Admin

// Middleware to verify Firebase token
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Decoded token:", decodedToken);
    req.user = decodedToken; // Attach user data to request
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

module.exports = authenticateToken;
