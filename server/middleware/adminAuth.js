const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Verify admin token middleware
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify this is an admin token (has isAdmin flag)
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Verify admin exists and is active
    const [admins] = await pool.query(
      'SELECT Admin_ID, Email, Full_Name, Role, Is_Active FROM Admin WHERE Admin_ID = ?',
      [decoded.id]
    );

    if (admins.length === 0) {
      return res.status(403).json({ error: 'Admin account not found' });
    }

    if (!admins[0].Is_Active) {
      return res.status(403).json({ error: 'Admin account is inactive' });
    }

    req.admin = admins[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Check specific role middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.admin.Role)) {
      return res.status(403).json({
        error: `Access denied. Requires: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

module.exports = { verifyAdmin, requireRole };
