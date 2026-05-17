import Joi from 'joi';

export const createElectionSchema = Joi.object({
    title: Joi.string().min(3).max(120).required(),
    description: Joi.string().max(1000).allow(''),
    startTime: Joi.date().required(),
    endTime: Joi.date().greater(Joi.ref('startTime')).required(),
});

export const candidateSchema = Joi.object({
    name: Joi.string().min(2).max(120).required(),
    party: Joi.string().max(120).allow(''),
    bio: Joi.string().max(1000).allow(''),
    photoUrl: Joi.string().uri().allow(''),
});

export const statusSchema = Joi.object({
    status: Joi.string().valid('draft', 'active', 'closed').required(),
});