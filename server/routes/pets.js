const express = require('express');
const router = express.Router();
const pool = require('../db');

// =============================================
// SUBQUERY 1: Top 10 Most Favorited Pets
// Shows all available pets that rank in the top 10 by favorites, including ties
// Ordered by rank, then alphabetically by name when tied
// =============================================
router.get('/popular', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        ranked.*,
        (SELECT COUNT(DISTINCT fav_count) + 1
         FROM (SELECT COUNT(*) as fav_count FROM Favorite GROUP BY Pet_ID) counts
         WHERE fav_count > ranked.favorite_count) as pet_rank
      FROM (
        SELECT p.Pet_ID, p.Pet_Name, p.Species, p.Breed, p.Age, p.Photo_URL, COUNT(f.Favorite_ID) as favorite_count
        FROM Pet p
        JOIN Favorite f ON p.Pet_ID = f.Pet_ID
        WHERE p.Status = 'Available'
        GROUP BY p.Pet_ID
        HAVING COUNT(f.Favorite_ID) >= (
            SELECT MIN(top_counts.fav_count)
            FROM (
                SELECT DISTINCT COUNT(*) as fav_count
                FROM Favorite
                GROUP BY Pet_ID
                ORDER BY fav_count DESC
                LIMIT 10
            ) as top_counts
        )
      ) as ranked
      ORDER BY favorite_count DESC, Pet_Name ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// SUBQUERY 2: New Arrivals Section
// Shows all available pets that rank in the top 5 most recent arrivals, including ties
// =============================================
router.get('/new-arrivals', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.Pet_ID, p.Pet_Name, p.Species, p.Breed, p.Age, p.Photo_URL, p.Date_Arrived
      FROM Pet p
      WHERE p.Status = 'Available'
      AND p.Date_Arrived >= (
          SELECT MIN(top_dates.Date_Arrived)
          FROM (
              SELECT DISTINCT Date_Arrived
              FROM Pet
              WHERE Status = 'Available'
              ORDER BY Date_Arrived DESC
              LIMIT 5
          ) as top_dates
      )
      ORDER BY p.Date_Arrived DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// STORED PROCEDURE 1: Search Available Pets by Species
// Uses stored procedure to filter available pets by species
// =============================================
router.get('/search-by-species/:species', async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_get_available_pets_by_species(?)', [req.params.species]);
    res.json(rows[0]); // Stored procedures return nested arrays
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get distinct species for filter dropdown
router.get('/species', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT Species FROM Pet ORDER BY Species');
    res.json(rows.map(r => r.Species));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
