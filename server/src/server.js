import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSockets } from './sockets/index.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: env.CLIENT_URL, credentials: true },
});

initSockets(io);
app.set('io', io);

connectDB()
    .then(() => {
        server.listen(env.PORT, () =>
            logger.info(`SafeBallot API listening on :${env.PORT}`)
        );
    })
    .catch((err) => {
        logger.error({ msg: 'Startup failed', error: err.message });
        process.exit(1);
    });

process.on('unhandledRejection', (e) =>
    logger.error({ unhandledRejection: e?.message || e })
);
process.on('uncaughtException', (e) =>
    logger.error({ uncaughtException: e.message })
);