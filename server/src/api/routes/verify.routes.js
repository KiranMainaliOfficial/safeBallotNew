import { Router } from 'express';
import * as c from '../../controllers/verify.controller.js';

// PUBLIC: anyone can verify integrity, no auth required
const r = Router();
r.get('/election/:electionId', c.verifyElection);
r.get('/receipt/:receiptId', c.verifyReceipt);

export default r;