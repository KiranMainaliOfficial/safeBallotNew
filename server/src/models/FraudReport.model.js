import mongoose from 'mongoose';

const fraudSchema = new mongoose.Schema(
    {
        electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: {
            type: String,
            enum: ['SAME_IP', 'FREQUENCY', 'ZSCORE_ANOMALY'],
            required: true,
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low',
        },
        evidence: mongoose.Schema.Types.Mixed,
        status: {
            type: String,
            enum: ['open', 'reviewed', 'dismissed'],
            default: 'open',
        },
        detectedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model('FraudReport', fraudSchema);