import twilio from 'twilio';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let client = null;

if (env.TWILIO.accountSid && env.TWILIO.authToken && env.TWILIO.accountSid !== 'your_twilio_account_sid' && env.TWILIO.authToken !== 'your_twilio_auth_token') {
    client = twilio(env.TWILIO.accountSid, env.TWILIO.authToken);
}

export async function sendSms(to, body) {
    if (!client) {
        logger.info(`[DEV SMS] ${to} -> ${body}`);
        return;
    }
    try {
        await client.messages.create({
            body,
            from: env.TWILIO.phoneNumber,
            to,
        });
        logger.info(`SMS sent successfully to ${to}`);
    } catch (error) {
        logger.error(`Failed to send SMS to ${to}: ${error.message}`);
        throw error;
    }
}
