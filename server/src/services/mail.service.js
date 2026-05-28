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
        html: `<h2 style="color: #111827; text-align: center;"> 🛡️ SafeBallot Secure Verification </h2> <p style="color: #374151; font-size: 16px;"> Hello Voter, </p> <p style="color: #374151; font-size: 16px;"> To continue securely with your SafeBallot session, please use the verification code below: </p> <div style="margin: 30px 0; text-align: center;"> <span style=" display: inline-block; background: #111827; color: #ffffff; padding: 16px 32px; font-size: 32px; letter-spacing: 8px; border-radius: 10px; font-weight: bold; "> ${otp} </span> </div> <p style="color: #ef4444; font-size: 14px; text-align: center;"> ⏳ This code will expire in 10 minutes. </p> <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" /> <p style="color: #6b7280; font-size: 14px;"> For your protection, never share this code with anyone. If you did not request this verification, you may safely ignore this email. </p> <p style="text-align: center; color: #111827; font-weight: bold; margin-top: 30px;"> Secure • Transparent • Trusted </p> <p style="text-align: center; color: #6b7280; font-size: 14px;"> — Team SafeBallot </p> </div>`,
    });
}