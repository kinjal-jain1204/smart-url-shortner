const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware to parse incoming JSON data
app.use(cors());
app.use(express.json());

// ... under const app = express(); app.use(...) ...

const urlRoutes = require('./routes/urlRoutes');

// Shorten API
app.use('/api', urlRoutes);

// Top-level redirect: localhost:5000/:slug
app.use('/', urlRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI) // creates a asynchronous connection
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is healthy and running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});