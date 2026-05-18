import { Router } from 'express';
import * as c from '../../controllers/vote.controller.js';
import { verifyJWT, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validator.middleware.js';
import { castVoteSchema } from '../../validators/vote.validator.js';
import { voteLimiter } from '../../middleware/rateLimiter.middleware.js';
import { captureMeta } from '../../middleware/captureMeta.middleware.js';

const r = Router();
r.post(
    '/',
    verifyJWT,
    requireRole('voter'),
    voteLimiter,
    captureMeta,
    validate(castVoteSchema),
    c.cast
);
r.get('/results/:electionId', verifyJWT, c.results);

export default r;