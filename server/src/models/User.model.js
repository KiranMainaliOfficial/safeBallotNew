import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, unique: true, sparse: true, trim: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String, enum: ['voter', 'admin', 'auditor'],
            default: 'voter'
        },
        isVerified: { type: Boolean, default: false },
        otpHash: String,
        otpExpires: Date, registeredIp: String, deviceFingerprint: String, failedLoginAttempts: { type: Number, default: 0 }, lockUntil: Date,
        kycComplete: { type: Boolean, default: false },
        faceEmbedding: { type: [Number], default: undefined },
        faceRegistered: { type: Boolean, default: false },
        faceVerifiedAt: { type: Date },
        kycData: {
            selfie: String,
            location: {
                latitude: Number,
                longitude: Number,
            },
            address: String,
            nid: String,
            phone: String,
            fatherName: String,
            grandfatherName: String,
            declarationAccepted: { type: Boolean, default: false },
            submittedAt: Date,
        },
    }, { timestamps: true });

export default mongoose.model('User', userSchema);