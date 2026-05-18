import * as svc from '../services/verify.service.js';
import { ok } from '../utils/response.js';

export const verifyElection = async (req, res, next) => {
    try {
        ok(res, await svc.verifyElection(req.params.electionId));
    } catch (e) { next(e); }
};

export const verifyReceipt = async (req, res, next) => {
    try {
        ok(res, await svc.verifyReceipt(req.params.receiptId));
    }
    catch (e) {
        next(e);

    }
};