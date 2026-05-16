import { verifyAccess } from '../utils/jwt.js';

export function verifyJWT(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    try {
        req.user = verifyAccess(header.split(' ')); next();

    }
    catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
};