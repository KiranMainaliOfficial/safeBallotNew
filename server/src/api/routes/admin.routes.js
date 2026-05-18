import { Router } from 'express';
import * as c from '../../controllers/admin.controller.js';
import { verifyJWT, requireRole } from '../../middleware/auth.middleware.js';

const r = Router();
r.get('/fraud', verifyJWT, requireRole('admin', 'auditor'), c.listFraud);
r.patch('/fraud/:id', verifyJWT, requireRole('admin'), c.updateFraud);
r.get('/logs', verifyJWT, requireRole('admin', 'auditor'), c.listLogs);

export default r;