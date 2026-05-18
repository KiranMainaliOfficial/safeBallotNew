import Election from '../models/Election.model.js';
import Vote from '../models/Vote.model.js';
import Candidate from '../models/Candidate.model.js';
import VoterRegistry from '../models/VoterRegistry.model.js';

export async function verifyElection(electionId) {
    const election = await Election.findById(electionId).lean();
    if (!election) {
        throw Object.assign(new Error('Election not found'), { status: 404 });
    }

    const votes = await Vote.find({ electionId })
        .sort({ castAt: 1 })
        .select('candidateId voteHash prevHash nonce castAt')
        .lean();

    let prev = 'GENESIS';
    let brokenAt = null;
    const tally = new Map();

    for (let i = 0; i < votes.length; i++) {
        const v = votes[i];
        if (v.prevHash !== prev) {
            brokenAt = i;
            break;
        }
        tally.set(
            String(v.candidateId),
            (tally.get(String(v.candidateId)) || 0) + 1
        );
        prev = v.voteHash;
    }

    const candidates = await Candidate.find({ electionId }).select('name voteCount').lean();

    const mismatches = candidates.filter((c) => (tally.get(String(c._id)) || 0) !== c.voteCount);

    return {
        ok: brokenAt === null && mismatches.length === 0,
        totalVotes: votes.length, headHash: prev,
        storedHead: election.lastVoteHash,
        headMatches: prev === election.lastVoteHash,
        brokenAt,
        mismatches: mismatches.map((m) => ({
            candidateId: m._id, name: m.name,
            stored: m.voteCount,
            recomputed: tally.get(String(m._id)) || 0,
        })),
    };
}

export async function verifyReceipt(receiptId) {
    const reg = await VoterRegistry.findOne({ receiptId }).select('electionId votedAt').lean();
    if (!reg)
        return { found: false };
    return {
        found: true,
        electionId: reg.electionId,
        votedAt: reg.votedAt,
    };
}