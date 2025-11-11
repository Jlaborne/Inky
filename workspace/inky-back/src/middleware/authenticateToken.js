const admin = require("./firebaseAdmin");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing Bearer token" });
    }

    const token = authHeader.slice(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    console.log("Authenticated UID:", decodedToken.uid);
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res
      .status(403)
      .json({ message: "Forbidden: Invalid or expired token" });
  }
};

module.exports = authenticateToken;
