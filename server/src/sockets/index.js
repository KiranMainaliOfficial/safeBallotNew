import { verifyAccess } from '../utils/jwt.js';
import { registerIo } from './fraudSocket.js';
import { logger } from '../config/logger.js';

export function initSockets(io) {
    registerIo(io);

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('No token'));
        try {
            socket.user = verifyAccess(token);
            next();
        } catch {
            next(new Error('Unauthorized socket'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`socket connected: ${socket.user.email}`);
        if (socket.user.role === 'admin' || socket.user.role === 'auditor') {
            socket.join('admin');
        }

        socket.on('subscribe:election', (id) => {
            socket.join(`election:${id}`);
        });

        socket.on('disconnect', () => {
            logger.info(`socket disconnected: ${socket.user.email}`);
        });
    });
}
