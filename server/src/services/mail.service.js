import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let transporter = null;

if (env.SMTP.host) {
    transporter = nodemailer.createTransport({
        host: env.SMTP.host,
        port: 587,
        secure: false,
        auth: { user: env.SMTP.user, pass: env.SMTP.pass },
    });
}

export async function sendOtp(email, otp) {
    if (!transporter) {
        logger.info(`[DEV OTP] ${email} -> ${otp}`);
        return;
    }
    await transporter.sendMail({
        from: 'SafeBallot <noreply@safeballot.app>',
        to: email,
        subject: 'Your SafeBallot verification code',
        text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    });
}