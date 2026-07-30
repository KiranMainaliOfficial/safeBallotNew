import Joi from 'joi';

export const contactSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be at least 2 characters long',
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email cannot be empty',
        'string.email': 'Please enter a valid email address',
    }),
    subject: Joi.string().min(3).max(200).required().messages({
        'string.empty': 'Subject cannot be empty',
        'string.min': 'Subject must be at least 3 characters long',
    }),
    message: Joi.string().min(10).max(2000).required().messages({
        'string.empty': 'Message cannot be empty',
        'string.min': 'Message must be at least 10 characters long',
    }),
});
