import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
    {
        electionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Election',
            required: true,
            index: true,
        },
        name: { type: String, required: true, trim: true },
        party: { type: String, default: '' },
        bio: { type: String, default: '' },
        photoUrl: { type: String, default: '' },
        voteCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model('Candidate', candidateSchema);