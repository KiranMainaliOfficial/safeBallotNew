import crypto from 'crypto';

export const sha256 = (input) =>
    crypto.createHash('sha256').update(input).digest('hex');

export const randomToken = (bytes = 16) =>
    crypto.randomBytes(bytes).toString('hex');

export const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();