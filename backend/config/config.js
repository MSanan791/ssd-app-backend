// config/config.js

require('dotenv').config(); // Ensure dotenv is required here to load .env variables

module.exports = {
  "development": {
    "username": "postgres",
    "password": "YourNewPassword",
    "database": "ssd_db",
    "host": process.env.DB_HOST,
    "dialect": "postgres"
  }
};