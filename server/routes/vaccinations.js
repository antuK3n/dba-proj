const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all vaccinations
router.get('/', async (req, res) => {
  try {
    const { status, pet_id } = req.query;
    let query = `
      SELECT vac.*, v.Pet_ID, p.Pet_Name, p.Species
      FROM Vaccination vac
      JOIN Veterinary_Visit v ON vac.Visit_ID = v.Visit_ID
      JOIN Pet p ON v.Pet_ID = p.Pet_ID
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND vac.Status = ?';
      params.push(status);
    }
    if (pet_id) {
      query += ' AND v.Pet_ID = ?';
      params.push(pet_id);
    }

    query += ' ORDER BY vac.Date_Administered DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single vaccination
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT vac.*, v.Pet_ID, p.Pet_Name, p.Species
       FROM Vaccination vac
       JOIN Veterinary_Visit v ON vac.Visit_ID = v.Visit_ID
       JOIN Pet p ON v.Pet_ID = p.Pet_ID
       WHERE vac.Vaccination_ID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vaccination not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create vaccination
router.post('/', async (req, res) => {
  try {
    const {
      Visit_ID, Vaccine_Name, Date_Administered, Administered_By,
      Manufacturer, Next_Due_Date, Site, Reaction, Status, Cost
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO Vaccination (Visit_ID, Vaccine_Name, Date_Administered, Administered_By,
        Manufacturer, Next_Due_Date, Site, Reaction, Status, Cost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Visit_ID, Vaccine_Name, Date_Administered, Administered_By,
        Manufacturer, Next_Due_Date, Site, Reaction, Status || 'Completed', Cost]
    );

    const [newVaccination] = await pool.query(
      'SELECT * FROM Vaccination WHERE Vaccination_ID = ?',
      [result.insertId]
    );
    res.status(201).json(newVaccination[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vaccination
router.put('/:id', async (req, res) => {
  try {
    const {
      Vaccine_Name, Date_Administered, Administered_By,
      Manufacturer, Next_Due_Date, Site, Reaction, Status, Cost
    } = req.body;

    await pool.query(
      `UPDATE Vaccination SET Vaccine_Name = ?, Date_Administered = ?, Administered_By = ?,
        Manufacturer = ?, Next_Due_Date = ?, Site = ?, Reaction = ?, Status = ?, Cost = ?
       WHERE Vaccination_ID = ?`,
      [Vaccine_Name, Date_Administered, Administered_By,
        Manufacturer, Next_Due_Date, Site, Reaction, Status, Cost, req.params.id]
    );

    const [updated] = await pool.query(
      'SELECT * FROM Vaccination WHERE Vaccination_ID = ?',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete vaccination
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Vaccination WHERE Vaccination_ID = ?', [req.params.id]);
    res.json({ message: 'Vaccination deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overdue vaccinations
router.get('/status/overdue', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT vac.*, v.Pet_ID, p.Pet_Name, p.Species
       FROM Vaccination vac
       JOIN Veterinary_Visit v ON vac.Visit_ID = v.Visit_ID
       JOIN Pet p ON v.Pet_ID = p.Pet_ID
       WHERE vac.Next_Due_Date < CURDATE() AND vac.Status != 'Completed'
       ORDER BY vac.Next_Due_Date ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
