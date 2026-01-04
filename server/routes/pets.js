const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all pets
router.get('/', async (req, res) => {
  try {
    const { species, status, search } = req.query;
    let query = 'SELECT * FROM Pet WHERE 1=1';
    const params = [];

    if (species) {
      query += ' AND Species = ?';
      params.push(species);
    }
    if (status) {
      query += ' AND Status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (Pet_Name LIKE ? OR Breed LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY Date_Arrived DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single pet
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Pet WHERE Pet_ID = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create pet
router.post('/', async (req, res) => {
  try {
    const {
      Pet_Name, Species, Breed, Age, Gender, Color, Date_Arrived,
      Spayed_Neutered, Temperament, Special_Needs,
      Photo_URL, Status
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO Pet (Pet_Name, Species, Breed, Age, Gender, Color, Date_Arrived,
        Spayed_Neutered, Temperament, Special_Needs, Photo_URL, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Pet_Name, Species, Breed, Age, Gender, Color, Date_Arrived,
        Spayed_Neutered, Temperament, Special_Needs, Photo_URL, Status]
    );

    const [newPet] = await pool.query('SELECT * FROM Pet WHERE Pet_ID = ?', [result.insertId]);
    res.status(201).json(newPet[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update pet
router.put('/:id', async (req, res) => {
  try {
    const {
      Pet_Name, Species, Breed, Age, Gender, Color, Date_Arrived,
      Spayed_Neutered, Temperament, Special_Needs,
      Photo_URL, Status
    } = req.body;

    await pool.query(
      `UPDATE Pet SET Pet_Name = ?, Species = ?, Breed = ?, Age = ?, Gender = ?,
        Color = ?, Date_Arrived = ?, Spayed_Neutered = ?,
        Temperament = ?, Special_Needs = ?, Photo_URL = ?, Status = ?
       WHERE Pet_ID = ?`,
      [Pet_Name, Species, Breed, Age, Gender, Color, Date_Arrived,
        Spayed_Neutered, Temperament, Special_Needs,
        Photo_URL, Status, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM Pet WHERE Pet_ID = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pet
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Pet WHERE Pet_ID = ?', [req.params.id]);
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pet's veterinary history
router.get('/:id/vet-history', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.*,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'Vaccination_ID', vac.Vaccination_ID,
          'Vaccine_Name', vac.Vaccine_Name,
          'Date_Administered', vac.Date_Administered,
          'Status', vac.Status
        )) FROM Vaccination vac WHERE vac.Visit_ID = v.Visit_ID) as vaccinations
       FROM Veterinary_Visit v
       WHERE v.Pet_ID = ?
       ORDER BY v.Visit_Date DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
