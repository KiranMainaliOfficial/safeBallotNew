import mongoose from 'mongoose';
import crypto from 'crypto'; import Election from '../models/Election.model.js'; import Candidate from '../models/Candidate.model.js'; import Vote from '../models/Vote.model.js'; import VoterRegistry from '../models/VoterRegistry.model.js'; import Log from '../models/Log.model.js'; import { runFraudPipeline } from '../fraud/engine.js'; import { emitVoteUpdate } from '../sockets/voteSocket.js';

export async function castVote({ user, electionId, candidateId, meta, io }) {
    const session = await mongoose.startSession(); session.startTransaction(); try {
        const election = await Election.findById(electionId).session(session); if (!election) throw Object.assign(new Error('Election not found'), { status: 404 }); if (election.status !== 'active') { throw Object.assign(new Error('Election is not active'), { status: 400 }); } const now = Date.now(); if (now < election.startTime.getTime() || now > election.endTime.getTime()) { throw Object.assign(new Error('Election window is closed'), { status: 400 }); }

        const candidate = await Candidate.findOne({
            _id: candidateId,
            electionId,
        }).session(session);
        if (!candidate) {
            throw Object.assign(new Error('Candidate not found in this election'), { status: 400 });
        }

        // Atomic one-vote-per-user check
        const already = await VoterRegistry.findOne({
            userId: user.id,
            electionId,
        }).session(session);
        if (already) {
            throw Object.assign(new Error('You have already voted in this election'), { status: 409 });
        }

        // Fraud pipeline (pre-vote)
        const fraud = await runFraudPipeline({
            userId: user.id,
            electionId,
            ip: meta.ip,
            deviceFingerprint: meta.deviceFingerprint,
        });
        if (fraud.block) {
            throw Object.assign(new Error('Vote blocked: suspicious activity detected'), { status: 403 });
        }

        // Hash chain link
        const prevHash = election.lastVoteHash || 'GENESIS';
        const nonce = crypto.randomBytes(16).toString('hex');
        const ts = Date.now();
        const payload = `${prevHash}|${candidateId}|${nonce}|${ts}`;
        const voteHash = crypto.createHash('sha256').update(payload).digest('hex');

        // Anonymous vote (no userId)
        await Vote.create(
            [
                {
                    electionId,
                    candidateId,
                    voteHash,
                    prevHash,
                    nonce,
                    castAt: new Date(ts),
                },
            ],
            { session }
        );

        // Voter marker (no candidate)
        const receiptId = crypto.randomBytes(12).toString('hex');
        await VoterRegistry.create(
            [
                {
                    userId: user.id,
                    electionId,
                    hasVoted: true,
                    receiptId,
                    votedAt: new Date(ts),
                },
            ],
            { session }
        );

        await Candidate.updateOne(
            { _id: candidateId },
            { $inc: { voteCount: 1 } },
            { session }
        );
        await Election.updateOne(
            { _id: electionId },
            { $inc: { totalVotes: 1 }, $set: { lastVoteHash: voteHash } },
            { session }
        );

        await Log.create(
            [
                {
                    userId: user.id,
                    action: 'VOTE',
                    ip: meta.ip,
                    deviceFingerprint: meta.deviceFingerprint,
                    userAgent: meta.userAgent,
                    meta: { electionId, receiptId },
                },
            ],
            { session }
        );

        await session.commitTransaction();
        emitVoteUpdate(io, electionId);
        return { receiptId, voteHash };
    } catch (err) { await session.abortTransaction(); throw err; } finally { session.endSession(); }
}

