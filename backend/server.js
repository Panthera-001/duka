// backend/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const authRoutes = require('./routes/authRoutes'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Session setup
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: 'http://localhost:8080' // frontend URL
}));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use(express.json());

// Routes
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api/auth', authRoutes); // Auth routes

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Routes
app.use('/api', productRoutes);
app.use('/api', cartRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
