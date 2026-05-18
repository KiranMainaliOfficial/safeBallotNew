import FraudReport from '../models/FraudReport.model.js';
import Log from '../models/Log.model.js';
import { ok } from '../utils/response.js';

export const listFraud = async (_req, res, next) => {
    try {
        const items = await FraudReport.find()
            .sort({ detectedAt: -1 })
            .limit(200)
            .lean();
        ok(res, items);
    } catch (e) {
        next(e);
    }
};

export const updateFraud = async (req, res, next) => {
    try {
        const updated = await FraudReport.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        ok(res, updated, 'Updated');
    } catch (e) {
        next(e);
    }
};

export const listLogs = async (_req, res, next) => {
    try {
        const items = await Log.find().sort({ createdAt: -1 }).limit(500).lean();
        ok(res, items);
    } catch (e) {
        next(e);
    }
};