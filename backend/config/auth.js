require('dotenv').config();

const authConfig = {
    // Priority: .env value -> default fallback
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret', 
    jwtExpiresIn: '24h', 
};

// Sanity Check: Log this on server startup to ensure .env is actually loading
// (Don't log this in production, but useful for your current debugging)
console.log(`[Config] JWT Secret loaded. Length: ${authConfig.jwtSecret.length}`);

module.exports = authConfig;