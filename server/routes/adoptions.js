const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all adoptions
router.get('/', async (req, res) => {
  try {
    const { status, approval_status } = req.query;
    let query = `
      SELECT a.*, p.Pet_Name, p.Species, p.Breed, p.Photo_URL,
             ad.Full_Name as Adopter_Name, ad.Email as Adopter_Email
      FROM Adoption a
      JOIN Pet p ON a.Pet_ID = p.Pet_ID
      JOIN Adopter ad ON a.Adopter_ID = ad.Adopter_ID
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND a.Status = ?';
      params.push(status);
    }
    if (approval_status) {
      query += ' AND a.Approval_Status = ?';
      params.push(approval_status);
    }

    query += ' ORDER BY a.Application_Date DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single adoption
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, p.Pet_Name, p.Species, p.Breed, p.Photo_URL,
              ad.Full_Name as Adopter_Name, ad.Email as Adopter_Email, ad.Contact_No, ad.Address
       FROM Adoption a
       JOIN Pet p ON a.Pet_ID = p.Pet_ID
       JOIN Adopter ad ON a.Adopter_ID = ad.Adopter_ID
       WHERE a.Adoption_ID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create adoption application
router.post('/', async (req, res) => {
  try {
    const { Pet_ID, Adopter_ID, Application_Date, Adoption_Fee } = req.body;

    // Check if pet is available
    const [pet] = await pool.query('SELECT Status FROM Pet WHERE Pet_ID = ?', [Pet_ID]);
    if (pet.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    if (pet[0].Status !== 'Available') {
      return res.status(400).json({ error: 'Pet is not available for adoption' });
    }

    const [result] = await pool.query(
      `INSERT INTO Adoption (Pet_ID, Adopter_ID, Application_Date, Adoption_Fee, Approval_Status, Status)
       VALUES (?, ?, ?, ?, 'Pending', 'Applied')`,
      [Pet_ID, Adopter_ID, Application_Date || new Date(), Adoption_Fee]
    );

    // Update pet status to Reserved
    await pool.query('UPDATE Pet SET Status = ? WHERE Pet_ID = ?', ['Reserved', Pet_ID]);

    const [newAdoption] = await pool.query(
      `SELECT a.*, p.Pet_Name, p.Species, p.Breed
       FROM Adoption a
       JOIN Pet p ON a.Pet_ID = p.Pet_ID
       WHERE a.Adoption_ID = ?`,
      [result.insertId]
    );
    res.status(201).json(newAdoption[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update adoption (approve/deny/complete)
router.put('/:id', async (req, res) => {
  try {
    const { Approval_Status, Adoption_Date, Contract_Signed, Status } = req.body;

    // Get current adoption to check pet
    const [current] = await pool.query('SELECT Pet_ID FROM Adoption WHERE Adoption_ID = ?', [req.params.id]);
    if (current.length === 0) {
      return res.status(404).json({ error: 'Adoption not found' });
    }

    await pool.query(
      `UPDATE Adoption SET Approval_Status = ?, Adoption_Date = ?, Contract_Signed = ?, Status = ?
       WHERE Adoption_ID = ?`,
      [Approval_Status, Adoption_Date, Contract_Signed, Status, req.params.id]
    );

    // Update pet status based on adoption status
    if (Status === 'Completed') {
      await pool.query('UPDATE Pet SET Status = ? WHERE Pet_ID = ?', ['Adopted', current[0].Pet_ID]);
    } else if (Status === 'Cancelled' || Approval_Status === 'Denied') {
      await pool.query('UPDATE Pet SET Status = ? WHERE Pet_ID = ?', ['Available', current[0].Pet_ID]);
    }

    const [updated] = await pool.query(
      `SELECT a.*, p.Pet_Name, p.Species, p.Breed
       FROM Adoption a
       JOIN Pet p ON a.Pet_ID = p.Pet_ID
       WHERE a.Adoption_ID = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete adoption
router.delete('/:id', async (req, res) => {
  try {
    // Get pet ID before deleting
    const [adoption] = await pool.query('SELECT Pet_ID FROM Adoption WHERE Adoption_ID = ?', [req.params.id]);
    if (adoption.length > 0) {
      // Set pet back to available
      await pool.query('UPDATE Pet SET Status = ? WHERE Pet_ID = ?', ['Available', adoption[0].Pet_ID]);
    }

    await pool.query('DELETE FROM Adoption WHERE Adoption_ID = ?', [req.params.id]);
    res.json({ message: 'Adoption deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
