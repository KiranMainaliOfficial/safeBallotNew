import { Router } from 'express';
import * as c from '../../controllers/election.controller.js';
import { verifyJWT, verifyJWTOptional, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validator.middleware.js';
import { captureMeta } from '../../middleware/captureMeta.middleware.js';
import {
    createElectionSchema,
    candidateSchema,
    statusSchema,
} from '../../validators/election.validator.js';

const r = Router();
r.get('/', verifyJWTOptional, c.list);
r.get('/:id', verifyJWTOptional, c.detail);
r.post(
    '/',
    verifyJWT,
    requireRole('admin'),
    captureMeta,
    validate(createElectionSchema),
    c.create
);
r.patch(
    '/:id/status',
    verifyJWT,
    requireRole('admin'),
    validate(statusSchema),
    c.setStatus
);
r.post(
    '/:id/candidates',
    verifyJWT,
    requireRole('admin'),
    validate(candidateSchema),
    c.addCandidate
);

export default r;