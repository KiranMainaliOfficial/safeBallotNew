import mongoose from 'mongoose';

const registrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true,
    },
    hasVoted: { type: Boolean, default: true },
    receiptId: { type: String, required: true, unique: true },
    votedAt: { type: Date, default: Date.now },
});

registrySchema.index({ userId: 1, electionId: 1 }, { unique: true });

export default mongoose.model('VoterRegistry', registrySchema);