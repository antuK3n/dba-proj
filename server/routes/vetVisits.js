const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all veterinary visits
router.get('/', async (req, res) => {
  try {
    const { pet_id, visit_type } = req.query;
    let query = `
      SELECT v.*, p.Pet_Name, p.Species, p.Breed, p.Photo_URL
      FROM Veterinary_Visit v
      JOIN Pet p ON v.Pet_ID = p.Pet_ID
      WHERE 1=1
    `;
    const params = [];

    if (pet_id) {
      query += ' AND v.Pet_ID = ?';
      params.push(pet_id);
    }
    if (visit_type) {
      query += ' AND v.Visit_Type = ?';
      params.push(visit_type);
    }

    query += ' ORDER BY v.Visit_Date DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single visit
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.*, p.Pet_Name, p.Species, p.Breed
       FROM Veterinary_Visit v
       JOIN Pet p ON v.Pet_ID = p.Pet_ID
       WHERE v.Visit_ID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Veterinary visit not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create veterinary visit
router.post('/', async (req, res) => {
  try {
    const {
      Pet_ID, Visit_Date, Veterinarian_Name, Visit_Type, Weight,
      Temperature, Diagnosis, General_Notes, Procedure_Cost, Next_Visit_Date
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO Veterinary_Visit (Pet_ID, Visit_Date, Veterinarian_Name, Visit_Type,
        Weight, Temperature, Diagnosis, General_Notes, Procedure_Cost, Next_Visit_Date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Pet_ID, Visit_Date, Veterinarian_Name, Visit_Type, Weight,
        Temperature, Diagnosis, General_Notes, Procedure_Cost, Next_Visit_Date]
    );

    const [newVisit] = await pool.query(
      `SELECT v.*, p.Pet_Name, p.Species
       FROM Veterinary_Visit v
       JOIN Pet p ON v.Pet_ID = p.Pet_ID
       WHERE v.Visit_ID = ?`,
      [result.insertId]
    );
    res.status(201).json(newVisit[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update veterinary visit
router.put('/:id', async (req, res) => {
  try {
    const {
      Visit_Date, Veterinarian_Name, Visit_Type, Weight,
      Temperature, Diagnosis, General_Notes, Procedure_Cost, Next_Visit_Date
    } = req.body;

    await pool.query(
      `UPDATE Veterinary_Visit SET Visit_Date = ?, Veterinarian_Name = ?, Visit_Type = ?,
        Weight = ?, Temperature = ?, Diagnosis = ?, General_Notes = ?,
        Procedure_Cost = ?, Next_Visit_Date = ?
       WHERE Visit_ID = ?`,
      [Visit_Date, Veterinarian_Name, Visit_Type, Weight,
        Temperature, Diagnosis, General_Notes, Procedure_Cost, Next_Visit_Date, req.params.id]
    );

    const [updated] = await pool.query(
      `SELECT v.*, p.Pet_Name, p.Species
       FROM Veterinary_Visit v
       JOIN Pet p ON v.Pet_ID = p.Pet_ID
       WHERE v.Visit_ID = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete veterinary visit
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Veterinary_Visit WHERE Visit_ID = ?', [req.params.id]);
    res.json({ message: 'Veterinary visit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vaccinations for a visit
router.get('/:id/vaccinations', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Vaccination WHERE Visit_ID = ? ORDER BY Date_Administered DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
