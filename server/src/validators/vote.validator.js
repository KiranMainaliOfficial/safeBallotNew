import Joi from 'joi';

export const castVoteSchema = Joi.object({
    electionId: Joi.string().hex().length(24).required(),
    candidateId: Joi.string().hex().length(24).required(),
});