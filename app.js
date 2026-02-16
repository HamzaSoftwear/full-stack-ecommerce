const express = require('express');
require('dotenv/config');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// Routers
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/categories');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');
const authjwt = require('./auth/jwt');

const app = express();

// ==== ENV CONFIG ====
const api = process.env.API_URL || '/api/v1';
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.CONNECTION_DB;

// ==== CORS CONFIG ====
app.use(cors());




// ==== BASIC MIDDLEWARES ====
app.use(express.json());
// app.use(express.urlencoded({ extended: true })); 

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl || req.url}`);
  if (req.method === 'OPTIONS') {
    console.log('  → OPTIONS preflight request');
  }
  next();
});

// JWT middleware (after json parser, before routes)
app.use(authjwt());

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==== ROUTES ====

// Health check
app.get(`${api}/health`, (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/upload`, uploadRouter);

// ==== JWT ERROR HANDLER ====
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid or missing token' });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ==== DB CONNECTION ====
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ==== START SERVER ====
app.listen(PORT, () => {
  console.log(`Server is started on port ${PORT}`);
  console.log('📌 Routes registered:');
  console.log(`   GET ${api}/health`);
  console.log(`   GET ${api}/categories`);
  console.log(`   GET ${api}/products`);
  console.log(`   CORS enabled for: http://localhost:5173`);
});
