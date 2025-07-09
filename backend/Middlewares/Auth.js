const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Unauthorized, JWT token is required' });
    }

    // ✅ If token has "Bearer " prefix, remove it
    if (token.startsWith("Bearer ")) {
        token = token.slice(7); // Remove "Bearer " from the beginning
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ✅ Gives you req.user._id in controllers
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Unauthorized, JWT token wrong or expired' });
    }
};

module.exports = ensureAuthenticated;
