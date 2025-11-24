// server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const db = require('./models'); // Imports all models and the connection setup

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // For parsing application/json

// --- Routes will go here ---
app.get('/', (req, res) => {
  res.send('SSD Backend Service is running!');
});
// ----------------------------

// Sync database and start server
db.sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);
      console.log(`💾 Database connected and synchronized`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });