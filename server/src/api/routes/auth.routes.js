import { Router } from 'express';
import * as c from '../../controllers/auth.controller.js';
import { validate } from '../../middleware/validator.middleware.js';
import {
    registerSchema,
    loginSchema,
    otpSchema,
    kycSchema,
} from '../../validators/auth.validator.js';
import { loginLimiter } from '../../middleware/rateLimiter.middleware.js';
import { captureMeta } from '../../middleware/captureMeta.middleware.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';

const r = Router();
r.post('/register', captureMeta, validate(registerSchema), c.register);
r.post('/verify-otp', validate(otpSchema), c.verifyOtp);
r.post('/login', loginLimiter, captureMeta, validate(loginSchema), c.login);
r.post('/logout', verifyJWT, c.logout);
r.get('/me', verifyJWT, c.getMe);
r.post('/kyc', verifyJWT, captureMeta, validate(kycSchema), c.submitKyc);
r.post('/verify-face', verifyJWT, captureMeta, c.verifyFace);

export default r;