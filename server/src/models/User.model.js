import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String, enum: ['voter', 'admin', 'auditor'],
            default: 'voter'
        },
        isVerified: { type: Boolean, default: false },
        otpHash: String,
        otpExpires: Date, registeredIp: String, deviceFingerprint: String, failedLoginAttempts: { type: Number, default: 0 }, lockUntil: Date,
    }, { timestamps: true });

export default mongoose.model('User', userSchema);