import { logger } from '../config/logger.js';

export function errorHandler(err, _req, res, _next) {
    logger.error({ msg: err.message, stack: err.stack });
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
    });
}