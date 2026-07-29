import { verifyAccess } from '../utils/jwt.js';

export function verifyJWT(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    try {
        const token = header.split(' ')[1];

        console.log("HEADER:", header);
        console.log("TOKEN:", token);
        console.log("USER:", verifyAccess(token));

        req.user = verifyAccess(token);
        next();
    }
    catch (error) {
        console.error("AUTH ERROR:", error);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

export function verifyJWTOptional(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return next();
    }
    try {
        const token = header.split(' ')[1];
        req.user = verifyAccess(token);
        next();
    }
    catch (error) {
        // Continue without setting user if token is invalid/expired
        next();
    }
}

export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
};