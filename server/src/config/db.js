import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDB() {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URI, { autoIndex: true });
    logger.info('MongoDB connected');
}