const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const { verifyAdmin } = require('../middleware/adminAuth');

// Apply admin authentication to all routes
router.use(verifyAdmin);

// =============================================
// DASHBOARD STATISTICS
// =============================================
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [[petStats]] = await pool.query(`
      SELECT
        COUNT(*) as total_pets,
        SUM(Status = 'Available') as available,
        SUM(Status = 'Adopted') as adopted,
        SUM(Status = 'Reserved') as reserved,
        SUM(Status = 'Medical Hold') as medical_hold
      FROM Pet
    `);

    const [[adopterStats]] = await pool.query(`
      SELECT COUNT(*) as total_adopters FROM Adopter
    `);

    const [[adoptionStats]] = await pool.query(`
      SELECT
        COUNT(*) as total_adoptions,
        SUM(Status = 'Pending') as pending,
        SUM(Status = 'Completed') as completed,
        SUM(Status = 'Cancelled') as cancelled,
        SUM(Status = 'Returned') as returned
      FROM Adoption
    `);

    const [[vetStats]] = await pool.query(`
      SELECT COUNT(*) as total_visits FROM Veterinary_Visit
    `);

    const [[vaccinationStats]] = await pool.query(`
      SELECT
        COUNT(*) as total_vaccinations,
        SUM(Status = 'Overdue') as overdue
      FROM Vaccination
    `);

    res.json({
      pets: petStats,
      adopters: adopterStats,
      adoptions: adoptionStats,
      vetVisits: vetStats,
      vaccinations: vaccinationStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recent activity
router.get('/dashboard/activity', async (req, res) => {
  try {
    const [recentAdoptions] = await pool.query(`
      SELECT a.*, p.Pet_Name, p.Species, p.Photo_URL, ad.Full_Name as Adopter_Name
      FROM Adoption a
      JOIN Pet p ON a.Pet_ID = p.Pet_ID
      JOIN Adopter ad ON a.Adopter_ID = ad.Adopter_ID
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    const [recentPets] = await pool.query(`
      SELECT * FROM Pet ORDER BY created_at DESC LIMIT 5
    `);

    const [recentAdopters] = await pool.query(`
      SELECT Adopter_ID, Email, Full_Name, created_at FROM Adopter
      ORDER BY created_at DESC LIMIT 5
    `);

    res.json({ recentAdoptions, recentPets, recentAdopters });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// PET MANAGEMENT
// =============================================
router.get('/pets', async (req, res) => {
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

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pets/:id', async (req, res) => {
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

router.post('/pets', async (req, res) => {
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

router.put('/pets/:id', async (req, res) => {
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

router.delete('/pets/:id', async (req, res) => {
  try {
    const [pet] = await pool.query('SELECT * FROM Pet WHERE Pet_ID = ?', [req.params.id]);
    if (pet.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    await pool.query('DELETE FROM Pet WHERE Pet_ID = ?', [req.params.id]);
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// ADOPTER MANAGEMENT
// =============================================
router.get('/adopters', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.Adopter_ID, a.Email, a.Full_Name, a.Contact_No, a.Address,
             a.Housing_Type, a.Has_Other_Pets, a.Has_Children, a.Experience_Level,
             a.created_at,
             (SELECT COUNT(*) FROM Adoption WHERE Adopter_ID = a.Adopter_ID) as adoption_count,
             (SELECT COUNT(*) FROM Favorite WHERE Adopter_ID = a.Adopter_ID) as favorites_count
      FROM Adopter a
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/adopters/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT Adopter_ID, Email, Full_Name, Contact_No, Address, Housing_Type,
              Has_Other_Pets, Has_Children, Experience_Level, created_at
       FROM Adopter WHERE Adopter_ID = ?`,
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

router.put('/adopters/:id', async (req, res) => {
  try {
    const {
      Full_Name, Contact_No, Address, Housing_Type,
      Has_Other_Pets, Has_Children, Experience_Level
    } = req.body;

    await pool.query(
      `UPDATE Adopter SET Full_Name = ?, Contact_No = ?, Address = ?,
        Housing_Type = ?, Has_Other_Pets = ?, Has_Children = ?, Experience_Level = ?
       WHERE Adopter_ID = ?`,
      [Full_Name, Contact_No, Address, Housing_Type,
        Has_Other_Pets, Has_Children, Experience_Level, req.params.id]
    );

    const [updated] = await pool.query(
      'SELECT Adopter_ID, Email, Full_Name, Contact_No, Address, Housing_Type, Has_Other_Pets, Has_Children, Experience_Level FROM Adopter WHERE Adopter_ID = ?',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/adopters/:id', async (req, res) => {
  try {
    const [adopter] = await pool.query('SELECT * FROM Adopter WHERE Adopter_ID = ?', [req.params.id]);
    if (adopter.length === 0) {
      return res.status(404).json({ error: 'Adopter not found' });
    }
    await pool.query('DELETE FROM Adopter WHERE Adopter_ID = ?', [req.params.id]);
    res.json({ message: 'Adopter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// ADOPTION MANAGEMENT
// =============================================
router.get('/adoptions', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT a.*, p.Pet_Name, p.Species, p.Breed, p.Photo_URL,
             ad.Full_Name as Adopter_Name, ad.Email as Adopter_Email, ad.Contact_No
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

    query += ' ORDER BY a.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/adoptions/:id/cancel', async (req, res) => {
  try {
    const [adoption] = await pool.query('SELECT Adoption_ID FROM Adoption WHERE Adoption_ID = ?', [req.params.id]);
    if (adoption.length === 0) {
      return res.status(404).json({ error: 'Adoption not found' });
    }

    await pool.query(
      `UPDATE Adoption SET Status = 'Cancelled' WHERE Adoption_ID = ?`,
      [req.params.id]
    );

    // Note: Pet status is automatically set to 'Available' by database trigger

    const [updated] = await pool.query(
      `SELECT a.*, p.Pet_Name FROM Adoption a JOIN Pet p ON a.Pet_ID = p.Pet_ID WHERE a.Adoption_ID = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/adoptions/:id/complete', async (req, res) => {
  try {
    const [adoption] = await pool.query('SELECT Adoption_ID FROM Adoption WHERE Adoption_ID = ?', [req.params.id]);
    if (adoption.length === 0) {
      return res.status(404).json({ error: 'Adoption not found' });
    }

    // Note: Adoption_Date and Contract_Signed are auto-set by database trigger
    // Note: Pet status is automatically set to 'Adopted' by database trigger
    await pool.query(
      `UPDATE Adoption SET Status = 'Completed' WHERE Adoption_ID = ?`,
      [req.params.id]
    );

    const [updated] = await pool.query(
      `SELECT a.*, p.Pet_Name FROM Adoption a JOIN Pet p ON a.Pet_ID = p.Pet_ID WHERE a.Adoption_ID = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/adoptions/:id', async (req, res) => {
  try {
    // Note: Pet status is automatically set to 'Available' by database trigger
    await pool.query('DELETE FROM Adoption WHERE Adoption_ID = ?', [req.params.id]);
    res.json({ message: 'Adoption deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// VET VISITS MANAGEMENT
// =============================================
router.get('/vet-visits', async (req, res) => {
  try {
    const { pet_id, visit_type } = req.query;
    let query = `
      SELECT v.*, p.Pet_Name, p.Species, p.Breed
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

router.post('/vet-visits', async (req, res) => {
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
      `SELECT v.*, p.Pet_Name FROM Veterinary_Visit v JOIN Pet p ON v.Pet_ID = p.Pet_ID WHERE v.Visit_ID = ?`,
      [result.insertId]
    );
    res.status(201).json(newVisit[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/vet-visits/:id', async (req, res) => {
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
      `SELECT v.*, p.Pet_Name FROM Veterinary_Visit v JOIN Pet p ON v.Pet_ID = p.Pet_ID WHERE v.Visit_ID = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/vet-visits/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Veterinary_Visit WHERE Visit_ID = ?', [req.params.id]);
    res.json({ message: 'Veterinary visit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// VACCINATION MANAGEMENT
// =============================================
router.get('/vaccinations', async (req, res) => {
  try {
    const { status, pet_id } = req.query;
    let query = `
      SELECT vac.*, v.Pet_ID, v.Visit_Date, p.Pet_Name, p.Species
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

router.post('/vaccinations', async (req, res) => {
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

router.put('/vaccinations/:id', async (req, res) => {
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

router.delete('/vaccinations/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Vaccination WHERE Vaccination_ID = ?', [req.params.id]);
    res.json({ message: 'Vaccination deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// ADMIN USER MANAGEMENT (Super Admin only)
// =============================================
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT Admin_ID, Email, Full_Name, created_at FROM Admin'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', verifyAdmin, async (req, res) => {
  try {
    const { Email, Password, Full_Name } = req.body;

    const hashedPassword = await bcrypt.hash(Password, 10);

    const [result] = await pool.query(
      `INSERT INTO Admin (Email, Password_Hash, Full_Name) VALUES (?, ?, ?)`,
      [Email, hashedPassword, Full_Name]
    );

    const [newAdmin] = await pool.query(
      'SELECT Admin_ID, Email, Full_Name FROM Admin WHERE Admin_ID = ?',
      [result.insertId]
    );
    res.status(201).json(newAdmin[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
