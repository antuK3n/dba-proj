const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register
router.post('/register', async (req, res) => {
  try {
    const {
      Email, Password, Full_Name, Contact_No, Address,
      Housing_Type, Has_Other_Pets, Has_Children, Experience_Level
    } = req.body;

    // Check if email exists
    const [existing] = await pool.query('SELECT * FROM Adopter WHERE Email = ?', [Email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const [result] = await pool.query(
      `INSERT INTO Adopter (Email, Password_Hash, Full_Name, Contact_No, Address,
        Housing_Type, Has_Other_Pets, Has_Children, Experience_Level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Email, hashedPassword, Full_Name, Contact_No, Address,
        Housing_Type || 'House', Has_Other_Pets || 'No', Has_Children || 'No', Experience_Level || 'First-time']
    );

    const token = jwt.sign({ id: result.insertId, email: Email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        Adopter_ID: result.insertId,
        Email,
        Full_Name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const [users] = await pool.query('SELECT * FROM Adopter WHERE Email = ?', [Email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(Password, user.Password_Hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.Adopter_ID, email: user.Email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        Adopter_ID: user.Adopter_ID,
        Email: user.Email,
        Full_Name: user.Full_Name,
        Contact_No: user.Contact_No,
        Address: user.Address,
        Housing_Type: user.Housing_Type,
        Has_Other_Pets: user.Has_Other_Pets,
        Has_Children: user.Has_Children,
        Experience_Level: user.Experience_Level
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user (verify token)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [users] = await pool.query(
      'SELECT Adopter_ID, Email, Full_Name, Contact_No, Address, Housing_Type, Has_Other_Pets, Has_Children, Experience_Level FROM Adopter WHERE Adopter_ID = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
