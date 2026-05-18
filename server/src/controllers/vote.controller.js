import { castVote } from '../services/vote.service.js';
import { getResults } from '../services/result.service.js';
import { ok } from '../utils/response.js';

export const cast = async (req, res, next) => {
    try {
        const data = await castVote({
            user: req.user,
            electionId: req.body.electionId,
            candidateId: req.body.candidateId,
            meta: req.meta,
            io: req.app.get('io'),
        });
        ok(res, data, 'Vote recorded', 201);
    } catch (e) {
        next(e);
    }
};

export const results = async (req, res, next) => {
    try {
        ok(res, await getResults(req.params.electionId));
    } catch (e) {
        next(e);
    }
};