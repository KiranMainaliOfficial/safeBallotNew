import Election from '../models/Election.model.js';
import Candidate from '../models/Candidate.model.js';
import Log from '../models/Log.model.js';
import Vote from '../models/Vote.model.js';
import { uploadToImageKit } from '../config/imagekit.js';

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
    let photoUrl = data.photoUrl || '';
    let partySymbolUrl = data.partySymbolUrl || '';
    
    if (data.photo) {
        photoUrl = await uploadToImageKit(data.photo, `candidate_${electionId}_${Date.now()}.jpg`);
    }
    if (data.partySymbol) {
        partySymbolUrl = await uploadToImageKit(data.partySymbol, `symbol_${electionId}_${Date.now()}.jpg`);
    }

    return Candidate.create({
        electionId,
        name: data.name,
        party: data.party || '',
        bio: data.bio || '',
        nid: data.nid,
        photoUrl,
        partySymbolUrl,
    });
}

export async function updateElection(id, data) {
    const updated = await Election.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw Object.assign(new Error('Election not found'), { status: 404 });
    return updated;
}

export async function deleteElection(id) {
    await Candidate.deleteMany({ electionId: id });
    await Vote.deleteMany({ electionId: id });
    const deleted = await Election.findByIdAndDelete(id);
    if (!deleted) throw Object.assign(new Error('Election not found'), { status: 404 });
    return deleted;
}

export async function updateCandidate(electionId, candidateId, data) {
    const candidate = await Candidate.findOne({ _id: candidateId, electionId });
    if (!candidate) {
        throw Object.assign(new Error('Candidate not found'), { status: 404 });
    }

    let photoUrl = candidate.photoUrl;
    let partySymbolUrl = candidate.partySymbolUrl;

    if (data.photo) {
        photoUrl = await uploadToImageKit(data.photo, `candidate_${electionId}_${Date.now()}.jpg`);
    }
    if (data.partySymbol) {
        partySymbolUrl = await uploadToImageKit(data.partySymbol, `symbol_${electionId}_${Date.now()}.jpg`);
    }

    candidate.name = data.name !== undefined ? data.name : candidate.name;
    candidate.party = data.party !== undefined ? data.party : candidate.party;
    candidate.bio = data.bio !== undefined ? data.bio : candidate.bio;
    candidate.nid = data.nid !== undefined ? data.nid : candidate.nid;
    if (data.photo) candidate.photoUrl = photoUrl;
    if (data.partySymbol) candidate.partySymbolUrl = partySymbolUrl;

    await candidate.save();
    return candidate;
}

export async function deleteCandidate(electionId, candidateId) {
    const candidate = await Candidate.findOneAndDelete({ _id: candidateId, electionId });
    if (!candidate) {
        throw Object.assign(new Error('Candidate not found'), { status: 404 });
    }
    await Vote.deleteMany({ candidateId });
    return candidate;
}