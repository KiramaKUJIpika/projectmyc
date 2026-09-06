const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'comicshop_dev_secret_change_in_production';

/**
 * Middleware: require valid JWT token
 * Attaches req.userId and req.userEmail on success
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
}

/**
 * Generate a signed JWT token for a user
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
}

module.exports = { authenticateToken, generateToken };
