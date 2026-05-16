import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: {
            type: String,
            enum: ['LOGIN', 'LOGIN_FAIL', 'REGISTER', 'VOTE', 'ADMIN_ACTION', 'LOGOUT'],
            required: true,
        },
        ip: String,
        deviceFingerprint: String,
        userAgent: String,
        meta: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
);

logSchema.index({ ip: 1, createdAt: -1 });
logSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model('Log', logSchema);