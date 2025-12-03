// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <--- 1. MISSING IN YOUR FILE
const db = require('./models');
const apiRouter = require('./routes/api'); // <--- 2. MISSING IN YOUR FILE (Ensure backend/routes/api.js exists!)

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // <--- Enable CORS
app.use(express.json());
// Increase limit for audio uploads if needed, though Multer usually handles this
app.use(express.urlencoded({ extended: true })); 

// --- Mount Routes ---
app.use('/api', apiRouter); // <--- 3. THIS WIRES UP THE ROUTE

// Basic Test Route
app.get('/', (req, res) => {
  res.send('SSD Backend Service is running!');
});

// Sync database and start server
// '0.0.0.0' is crucial for Android Emulator/Physical Device access
db.sequelize.sync()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => { 
      console.log(`✅ Server listening on port ${PORT}`);
      console.log(`💾 Database connected and synchronized`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });