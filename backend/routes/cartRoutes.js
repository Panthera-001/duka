// backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to ensure user is logged in
function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ error: 'You must be logged in' });
}

// Apply middleware to all cart routes
router.use(ensureAuthenticated);

// Add product to cart
router.post('/cart', (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const userId = req.session.user.id;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const query = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
  db.query(query, [userId, product_id, quantity], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Product added to cart!', cartId: result.insertId });
  });
});

// Get cart items for logged-in user
router.get('/cart', (req, res) => {
  const userId = req.session.user.id;

  const query = `
    SELECT p.id, p.name, p.price, c.id AS cart_id, c.quantity, p.price * c.quantity AS total
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// DELETE item from cart
router.delete('/cart/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.session.user.id;

  const checkQuery = 'SELECT * FROM cart WHERE id = ? AND user_id = ?';
  db.query(checkQuery, [id, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found or does not belong to you' });
    }

    const deleteQuery = 'DELETE FROM cart WHERE id = ?';
    db.query(deleteQuery, [id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Item removed from cart' });
    });
  });
});

// UPDATE quantity of cart item
router.put('/cart/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.session.user.id;

  if (typeof quantity !== 'number' || quantity < 1) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  const checkQuery = 'SELECT * FROM cart WHERE id = ? AND user_id = ?';
  db.query(checkQuery, [id, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found or does not belong to you' });
    }

    const updateQuery = 'UPDATE cart SET quantity = ? WHERE id = ?';
    db.query(updateQuery, [quantity, id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Cart item updated' });
    });
  });
});

module.exports = router;