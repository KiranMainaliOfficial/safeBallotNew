import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        status: {
            type: String,
            enum: ['draft', 'active', 'closed'],
            default: 'draft',
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        totalVotes: { type: Number, default: 0 },
        lastVoteHash: { type: String, default: 'GENESIS' },
        settings: {
            allowRevote: { type: Boolean, default: false },
            requireOtp: { type: Boolean, default: true },
            maxVotesPerIp: { type: Number, default: 1 },
        },
    },
    { timestamps: true }
);

export default mongoose.model('Election', electionSchema);