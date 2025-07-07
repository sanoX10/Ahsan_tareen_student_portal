// middleware/auth.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
    const token = req.header('x-auth-token'); // Get token from header

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Attach user payload to request object
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Middleware to check user role
exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ msg: 'User role not found, authorization denied' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Access denied: You do not have the required role' });
        }
        next();
    };
};

/*
Explanation:
- `verifyToken`: This middleware checks for a JWT in the `x-auth-token` header. If present and valid, it decodes the token and attaches the user's information (from the token payload) to `req.user`.
- `authorizeRole`: This middleware takes an array of roles (e.g., `['admin']`, `['student', 'admin']`). It checks if the `req.user.role` (set by `verifyToken`) is included in the allowed roles. If not, it denies access.

Usage:
- To protect a route, you can use `verifyToken` first, then `authorizeRole`.
  Example: `router.get('/admin-data', verifyToken, authorizeRole(['admin']), (req, res) => { ... });`
*/
