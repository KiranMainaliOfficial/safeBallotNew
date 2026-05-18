import { Router } from 'express';
import auth from './routes/auth.routes.js';
import elections from './routes/election.routes.js';
import votes from './routes/vote.routes.js';
import admin from './routes/admin.routes.js';
import verify from './routes/verify.routes.js';

const r = Router();
r.get('/health', (_req, res) =>
    res.json({ success: true, message: 'ok', ts: Date.now() })
);
r.use('/auth', auth);
r.use('/elections', elections);
r.use('/votes', votes);
r.use('/admin', admin);
r.use('/verify', verify);

export default r;