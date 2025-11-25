const dotenvResult = require('dotenv').config();

console.log("DEBUG: Current Working Directory:", process.cwd());
if (dotenvResult.error) {
  console.log("DEBUG: Dotenv Error:", dotenvResult.error);
} else {
  console.log("DEBUG: Dotenv Parsed Keys:", Object.keys(dotenvResult.parsed || {}));
}

// Use console.log for debugging outside of the object definition
console.log(`DEBUG: DB_PASSWORD Value is: [${process.env.DB_PASSWORD}]`);

module.exports = {
  "development": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres"
  },
  "test": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres"
  },
  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres"
  }
};
