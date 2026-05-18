import Election from '../models/Election.model.js';
import Candidate from '../models/Candidate.model.js';

export async function getResults(electionId) {
    const election = await Election.findById(electionId).lean();
    if (!election) {
        throw Object.assign(new Error('Election not found'), { status: 404 });
    }
    const candidates = await Candidate.find({ electionId })
        .select('name party voteCount')
        .sort({ voteCount: -1 })
        .lean();

    return {
        election: {
            id: election._id,
            title: election.title,
            totalVotes: election.totalVotes,
            status: election.status,
        },
        candidates,
    };
}