// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all products
router.get('/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;