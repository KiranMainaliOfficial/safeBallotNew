import Election from '../models/Election.model.js';
import Candidate from '../models/Candidate.model.js';
import Log from '../models/Log.model.js';

export async function createElection(data, adminId, meta) {
    const e = await Election.create({ ...data, createdBy: adminId });
    await Log.create({
        userId: adminId,
        action: 'ADMIN_ACTION',
        ip: meta.ip,
        deviceFingerprint: meta.deviceFingerprint,
        userAgent: meta.userAgent,
        meta: { type: 'CREATE_ELECTION', electionId: e._id },
    });
    return e;
}

export async function listElections() {
    return Election.find().sort({ createdAt: -1 }).lean();
}

export async function getElection(id) {
    const election = await Election.findById(id).lean();
    if (!election) {
        throw Object.assign(new Error('Election not found'), { status: 404 });
    }
    const candidates = await Candidate.find({ electionId: id }).lean();
    return { ...election, candidates };
}

export async function updateStatus(id, status) {
    const updated = await Election.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );
    if (!updated) throw Object.assign(new Error('Election not found'), { status: 404 });
    return updated;
}

export async function addCandidate(electionId, data) {
    return Candidate.create({ ...data, electionId });
}