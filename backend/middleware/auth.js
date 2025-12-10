const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = (req, res, next) => {
    // 1. Get the header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // 2. Extract Token
        // Split by space. Convention is "Bearer <token>"
        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ msg: 'Token format invalid. Use "Bearer <token>"' });
        }

        // 3. THE FIX: Trim whitespace/newlines
        const token = parts[1].trim();

        // --- DEBUGGING BLOCK (Remove after fix) ---
        console.log('------------------------------------------------');
        console.log(`🔐 Config Secret: "${authConfig.jwtSecret}" (Len: ${authConfig.jwtSecret.length})`);
        console.log(`🔑 Received Token: "${token.substring(0, 10)}..." (Total Len: ${token.length})`);
        // ------------------------------------------

        // 4. Verify
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        
        // 5. Attach user to request
        req.user = decoded.user;
        next();

    } catch (err) {
        console.error(`❌ Token Verification Failed: ${err.message}`);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};