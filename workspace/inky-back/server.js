require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/userRoutes");
const tattooArtistRoutes = require("./src/routes/tattooArtistsRoutes");
const authenticateToken = require("./middleware/authenticateToken");
const portfolioRoutes = require("./src/routes/portfolioRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Public routes (registration and login)
app.use("/auth", authRoutes);

app.use("/api", userRoutes);

app.use("/api", tattooArtistRoutes);

// Use the portfolio routes under /api/portfolio
app.use("/api", portfolioRoutes);

// Serve 'uploads' directory as a static resource
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Example of a protected route
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
