import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import routes from './api/index.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { globalLimiter } from './middleware/rateLimiter.middleware.js';
import { env } from './config/env.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
    cors({
        origin: env.CLIENT_URL,
        credentials: true,
    })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morgan('combined'));

app.use('/api', globalLimiter);
app.use('/api', routes);

app.use(errorHandler);

export default app;