const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all favorites
router.get('/', async (req, res) => {
  try {
    const { adopter_id } = req.query;
    let query = `
      SELECT f.*, p.*, a.Full_Name as Adopter_Name
      FROM Favorite f
      JOIN Pet p ON f.Pet_ID = p.Pet_ID
      JOIN Adopter a ON f.Adopter_ID = a.Adopter_ID
      WHERE 1=1
    `;
    const params = [];

    if (adopter_id) {
      query += ' AND f.Adopter_ID = ?';
      params.push(adopter_id);
    }

    query += ' ORDER BY f.Date_Added DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to favorites
router.post('/', async (req, res) => {
  try {
    const { Adopter_ID, Pet_ID, Notes } = req.body;

    // Check if already favorited
    const [existing] = await pool.query(
      'SELECT * FROM Favorite WHERE Adopter_ID = ? AND Pet_ID = ?',
      [Adopter_ID, Pet_ID]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Pet already in favorites' });
    }

    const [result] = await pool.query(
      'INSERT INTO Favorite (Adopter_ID, Pet_ID, Notes) VALUES (?, ?, ?)',
      [Adopter_ID, Pet_ID, Notes || null]
    );

    const [newFavorite] = await pool.query(
      `SELECT f.*, p.*
       FROM Favorite f
       JOIN Pet p ON f.Pet_ID = p.Pet_ID
       WHERE f.Favorite_ID = ?`,
      [result.insertId]
    );
    res.status(201).json(newFavorite[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update favorite notes
router.put('/:id', async (req, res) => {
  try {
    const { Notes } = req.body;
    await pool.query(
      'UPDATE Favorite SET Notes = ? WHERE Favorite_ID = ?',
      [Notes, req.params.id]
    );
    const [updated] = await pool.query(
      `SELECT f.*, p.*
       FROM Favorite f
       JOIN Pet p ON f.Pet_ID = p.Pet_ID
       WHERE f.Favorite_ID = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from favorites
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Favorite WHERE Favorite_ID = ?', [req.params.id]);
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from favorites by adopter and pet
router.delete('/adopter/:adopterId/pet/:petId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM Favorite WHERE Adopter_ID = ? AND Pet_ID = ?',
      [req.params.adopterId, req.params.petId]
    );
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if pet is favorited by adopter
router.get('/check/:adopterId/:petId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Favorite WHERE Adopter_ID = ? AND Pet_ID = ?',
      [req.params.adopterId, req.params.petId]
    );
    res.json({ isFavorited: rows.length > 0, favorite: rows[0] || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
