const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');

// Get all adopters
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT Adopter_ID, Email, Full_Name, Contact_No, Address, Housing_Type, Has_Other_Pets, Has_Children, Experience_Level, created_at FROM Adopter'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single adopter
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT Adopter_ID, Email, Full_Name, Contact_No, Address, Housing_Type, Has_Other_Pets, Has_Children, Experience_Level, created_at FROM Adopter WHERE Adopter_ID = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Adopter not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create adopter
router.post('/', async (req, res) => {
  try {
    const {
      Email, Password, Full_Name, Contact_No, Address,
      Housing_Type, Has_Other_Pets, Has_Children, Experience_Level
    } = req.body;

    const hashedPassword = await bcrypt.hash(Password, 10);

    const [result] = await pool.query(
      `INSERT INTO Adopter (Email, Password_Hash, Full_Name, Contact_No, Address,
        Housing_Type, Has_Other_Pets, Has_Children, Experience_Level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Email, hashedPassword, Full_Name, Contact_No, Address,
        Housing_Type, Has_Other_Pets || 'No', Has_Children || 'No', Experience_Level || 'First-time']
    );

    const [newAdopter] = await pool.query(
      'SELECT Adopter_ID, Email, Full_Name, Contact_No, Address, Housing_Type, Has_Other_Pets, Has_Children, Experience_Level FROM Adopter WHERE Adopter_ID = ?',
      [result.insertId]
    );
    res.status(201).json(newAdopter[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update adopter
router.put('/:id', async (req, res) => {
  try {
    const {
      Full_Name, Email, Contact_No, Address, Housing_Type,
      Has_Other_Pets, Has_Children, Experience_Level, Password
    } = req.body;

    // Check if email is being changed to one that already exists
    if (Email) {
      const [existing] = await pool.query(
        'SELECT Adopter_ID FROM Adopter WHERE Email = ? AND Adopter_ID != ?',
        [Email, req.params.id]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already in use by another account' });
      }
    }

    // Build update query dynamically
    let updateQuery = `UPDATE Adopter SET Full_Name = ?, Email = ?, Contact_No = ?, Address = ?,
        Housing_Type = ?, Has_Other_Pets = ?, Has_Children = ?, Experience_Level = ?`;
    let params = [Full_Name, Email, Contact_No, Address, Housing_Type,
        Has_Other_Pets, Has_Children, Experience_Level];

    // If password is provided, hash it and add to update
    if (Password) {
      const hashedPassword = await bcrypt.hash(Password, 10);
      updateQuery += `, Password_Hash = ?`;
      params.push(hashedPassword);
    }

    updateQuery += ` WHERE Adopter_ID = ?`;
    params.push(req.params.id);

    await pool.query(updateQuery, params);

    const [updated] = await pool.query(
      'SELECT Adopter_ID, Email, Full_Name, Contact_No, Address, Housing_Type, Has_Other_Pets, Has_Children, Experience_Level FROM Adopter WHERE Adopter_ID = ?',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete adopter
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Adopter WHERE Adopter_ID = ?', [req.params.id]);
    res.json({ message: 'Adopter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get adopter's adoption history
router.get('/:id/adoptions', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, p.Pet_Name, p.Species, p.Breed, p.Photo_URL
       FROM Adoption a
       JOIN Pet p ON a.Pet_ID = p.Pet_ID
       WHERE a.Adopter_ID = ?
       ORDER BY a.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get adopter's favorites
router.get('/:id/favorites', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, p.*
       FROM Favorite f
       JOIN Pet p ON f.Pet_ID = p.Pet_ID
       WHERE f.Adopter_ID = ?
       ORDER BY f.Date_Added DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
