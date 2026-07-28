import Joi from 'joi';

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(80).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
        'string.pattern.base': 'Phone number must be in international format (e.g. +1234567890)'
    }),
    password: Joi.string().min(8).max(128).required(),
});

export const otpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const kycSchema = Joi.object({
    selfie: Joi.string().required(),
    selfies: Joi.array().items(Joi.string()).min(1).optional(),
    location: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required()
    }).optional(),
    address: Joi.string().min(5).max(200).optional(),
    nid: Joi.string().min(5).max(30).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    fatherName: Joi.string().min(2).max(80).required(),
    grandfatherName: Joi.string().min(2).max(80).required(),
    declarationAccepted: Joi.boolean().invalid(false).required(),
}).or('location', 'address');