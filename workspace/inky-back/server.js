require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Public routes (registration and login)
app.use('/auth', authRoutes);

// Example of a protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});