export function captureMeta(req, _res, next) {
    req.meta = {
        ip: req.headers['x-forwarded-for']?.split(',')?.trim() || req.ip,
        userAgent: req.headers['user-agent'] || 'unknown',
        deviceFingerprint: req.headers['x-device-fp'] || 'unknown',
    };
    next();
}