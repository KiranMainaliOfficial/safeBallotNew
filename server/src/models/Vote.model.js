import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true,
        index: true,
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true,
    },
    voteHash: { type: String, required: true, unique: true },
    prevHash: { type: String, required: true },
    nonce: { type: String, required: true },
    castAt: { type: Date, default: Date.now },
});

voteSchema.index({ electionId: 1, castAt: 1 });

export default mongoose.model('Vote', voteSchema);