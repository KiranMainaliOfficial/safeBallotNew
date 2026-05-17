import Candidate from '../models/Candidate.model.js';

export async function emitVoteUpdate(io, electionId) {
    const tally = await Candidate.find({ electionId })
        .select('name voteCount')
        .lean();

    io.to(`election:${electionId}`).emit('count:update', tally);
    io.to('admin').emit('vote:new', { electionId, tally, ts: Date.now() });
}