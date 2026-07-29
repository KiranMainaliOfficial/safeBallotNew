import FraudReport from '../models/FraudReport.model.js';
import Log from '../models/Log.model.js';
import Vote from '../models/Vote.model.js';
import Election from '../models/Election.model.js';
import User from '../models/User.model.js';
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

export const getDashboardStats = async (_req, res, next) => {
    try {
        const totalVoters = await User.countDocuments({ role: { $ne: 'admin' } });
        const totalVotes = await Vote.countDocuments();
        const activeElections = await Election.countDocuments({ status: 'active' });
        
        // Recent activity (votes cast)
        const recentVotes = await Vote.find()
            .populate('electionId', 'title')
            .sort({ castAt: -1 })
            .limit(10)
            .lean();

        const activity = recentVotes.map(v => ({
            ts: v.castAt,
            electionId: v.electionId?._id || v.electionId || 'Unknown',
            electionTitle: v.electionId?.title || 'Unknown Election',
            candidateId: v.candidateId
        }));

        // Recent fraud reports
        const alerts = await FraudReport.find()
            .sort({ detectedAt: -1 })
            .limit(20)
            .lean();

        ok(res, {
            totalVoters,
            totalVotes,
            activeElections,
            activity,
            alerts
        });
    } catch (e) {
        next(e);
    }
};