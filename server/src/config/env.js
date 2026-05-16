import 'dotenv/config';

export const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_TTL: '15m',
    JWT_REFRESH_TTL: '7d',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    SMTP: {
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};