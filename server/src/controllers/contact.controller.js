import ContactMessage from '../models/ContactMessage.model.js';
import { ok } from '../utils/response.js';

export const submitContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;
        const userId = req.user ? req.user.id : null;

        const newMessage = await ContactMessage.create({
            name,
            email,
            subject,
            message,
            userId,
        });

        ok(res, newMessage, 'Contact inquiry submitted successfully', 201);
    } catch (e) {
        next(e);
    }
};
