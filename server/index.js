const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const petsRouter = require('./routes/pets');
const adoptersRouter = require('./routes/adopters');
const adoptionsRouter = require('./routes/adoptions');
const vetVisitsRouter = require('./routes/vetVisits');
const vaccinationsRouter = require('./routes/vaccinations');
const favoritesRouter = require('./routes/favorites');
const authRouter = require('./routes/auth');
const adminAuthRouter = require('./routes/adminAuth');
const adminRouter = require('./routes/admin');
const uploadRouter = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/pets', petsRouter);
app.use('/api/adopters', adoptersRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/vet-visits', vetVisitsRouter);
app.use('/api/vaccinations', vaccinationsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pet Adoption Center API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
