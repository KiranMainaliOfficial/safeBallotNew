import { Router } from 'express';
import * as c from '../../controllers/contact.controller.js';
import { validate } from '../../middleware/validator.middleware.js';
import { contactSchema } from '../../validators/contact.validator.js';
import { verifyJWTOptional } from '../../middleware/auth.middleware.js';

const r = Router();

r.post('/', verifyJWTOptional, validate(contactSchema), c.submitContact);

export default r;
