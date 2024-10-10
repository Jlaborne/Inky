const express = require("express");
const cors = require("cors"); 
const userRoutes = require("./src/routes/userRoutes");

require('./firebase');

const app = express();
const port = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", userRoutes);

// Catch-all route for root URL
app.get("/", (req, res) => {
  res.json({ info: "Node.js, Express, and Postgres API" });
});

// Start the server
app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

module.exports = app;
