const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [admins] = await pool.query(
      'SELECT * FROM Admin WHERE Email = ?',
      [Email]
    );

    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const admin = admins[0];

    const validPassword = await bcrypt.compare(Password, admin.Password_Hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create token with isAdmin flag
    const token = jwt.sign(
      { id: admin.Admin_ID, email: admin.Email, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        Admin_ID: admin.Admin_ID,
        Email: admin.Email,
        Full_Name: admin.Full_Name,
        Role: admin.Role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current admin (verify token)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Not an admin token' });
    }

    const [admins] = await pool.query(
      'SELECT Admin_ID, Email, Full_Name, Role, created_at FROM Admin WHERE Admin_ID = ?',
      [decoded.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(admins[0]);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
