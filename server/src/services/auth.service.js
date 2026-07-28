import bcrypt from 'bcrypt';
import User from '../models/User.model.js';
import Log from '../models/Log.model.js';
import { sha256, generateOtp } from '../utils/crypto.js';
import { signAccess, signRefresh } from '../utils/jwt.js';
import { sendOtp } from './mail.service.js';
import { sendSms } from './twilo.service.js';
import { uploadToImageKit } from '../config/imagekit.js';
import { generateFaceEmbedding, getSingleFaceEmbedding, computeCosineSimilarity } from './ai.service.js';


export async function register({ name, email, phone, password, meta }) {
    const exists = await User.findOne({ email });
    if (exists) {
        throw Object.assign(new Error('Email already registered'), { status: 409 });
    }
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
        throw Object.assign(new Error('Phone number already registered'), { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    console.log("OTP GENERATED FOR USER:", email, "->", otp);
    const user = await User.create({
        name,
        email,
        phone,
        passwordHash,
        otpHash: sha256(otp),
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
        registeredIp: meta.ip,
        deviceFingerprint: meta.deviceFingerprint,
    });

    try {
        await sendOtp(email, otp);
    } catch (err) {
        console.error("SMTP sending failed but proceeding:", err.message);
    }
    try {
        await sendSms(phone, `Your SafeBallot verification code is: ${otp}`);
    } catch (err) {
        console.error("Twilio SMS sending failed but proceeding:", err.message);
    }
    await Log.create({
        userId: user._id,
        action: 'REGISTER',
        ip: meta.ip,
        deviceFingerprint: meta.deviceFingerprint,
        userAgent: meta.userAgent,
    });

    return { id: user._id, email: user.email };
}

export async function verifyOtp({ email, otp }) {
    const user = await User.findOne({ email });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    if (!user.otpHash || !user.otpExpires || user.otpExpires < new Date()) {
        throw Object.assign(new Error('OTP expired'), { status: 400 });
    }
    if (sha256(otp) !== user.otpHash) {
        throw Object.assign(new Error('Invalid OTP'), { status: 400 });
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    await user.save();
    return { verified: true };
}

export async function login({ email, password, meta }) {
    const user = await User.findOne({ email });
    if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    if (user.lockUntil && user.lockUntil > new Date()) {
        throw Object.assign(new Error('Account temporarily locked'), { status: 423 });
    }
    if (!user.isVerified) {
        throw Object.assign(new Error('Email not verified'), { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        await user.save();
        await Log.create({
            userId: user._id,
            action: 'LOGIN_FAIL',
            ip: meta.ip,
            deviceFingerprint: meta.deviceFingerprint,
            userAgent: meta.userAgent,
        });
        throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    await Log.create({
        userId: user._id,
        action: 'LOGIN',
        ip: meta.ip,
        deviceFingerprint: meta.deviceFingerprint,
        userAgent: meta.userAgent,
    });

    const payload = {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
    };
    return {
        accessToken: signAccess(payload),
        refreshToken: signRefresh(payload),
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            kycComplete: user.kycComplete || false,
        },
    };
}

export async function submitKyc(userId, kycData, meta) {
    const user = await User.findById(userId);
    if (!user) {
        throw Object.assign(new Error('User not found'), { status: 404 });
    }

    const { selfie, selfies, ...otherKycData } = kycData;

    // 1. Upload main reference selfie to ImageKit
    console.log("Uploading reference selfie to ImageKit...");
    const imageUrl = await uploadToImageKit(selfie, `selfie_${userId}_${Date.now()}.jpg`);
    console.log("Uploaded successfully. URL:", imageUrl);

    // 2. Generate face embedding from captured selfies
    const photosToEmbed = (selfies && selfies.length > 0) ? selfies : [selfie];
    console.log(`Generating face embedding from ${photosToEmbed.length} images...`);
    const embedding = await generateFaceEmbedding(photosToEmbed);
    console.log("Face embedding generated successfully.");

    // 3. Update User Document
    user.faceEmbedding = embedding;
    user.faceRegistered = true;
    user.kycComplete = true;
    user.kycData = {
        ...otherKycData,
        selfie: imageUrl,
        submittedAt: new Date(),
    };

    await user.save();

    await Log.create({
        userId: user._id,
        action: 'KYC_SUBMIT',
        ip: meta.ip,
        deviceFingerprint: meta.deviceFingerprint,
        userAgent: meta.userAgent,
    });

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycComplete: user.kycComplete,
    };
}

export async function verifyFace(userId, liveImage, meta) {
    const user = await User.findById(userId);
    if (!user) {
        throw Object.assign(new Error('User not found'), { status: 404 });
    }
    if (!user.faceRegistered || !user.faceEmbedding) {
        throw Object.assign(new Error('Biometric credentials not found. Please complete face registration first.'), { status: 400 });
    }

    console.log("Generating embedding for live face scan...");
    const liveEmbedding = await getSingleFaceEmbedding(liveImage);
    
    console.log("Comparing embeddings...");
    const similarity = computeCosineSimilarity(user.faceEmbedding, liveEmbedding);
    console.log("Similarity Score computed:", similarity);

    const MATCH_THRESHOLD = 0.60; // Standard similarity threshold
    const matched = similarity >= MATCH_THRESHOLD;

    if (matched) {
        user.faceVerifiedAt = new Date();
        await user.save();

        await Log.create({
            userId: user._id,
            action: 'BIOMETRIC_MATCH_SUCCESS',
            ip: meta.ip,
            deviceFingerprint: meta.deviceFingerprint,
            userAgent: meta.userAgent,
            meta: { score: similarity },
        });

        return { success: true, score: similarity };
    } else {
        await Log.create({
            userId: user._id,
            action: 'BIOMETRIC_MATCH_FAIL',
            ip: meta.ip,
            deviceFingerprint: meta.deviceFingerprint,
            userAgent: meta.userAgent,
            meta: { score: similarity },
        });

        throw Object.assign(new Error(`Face match failed (similarity: ${(similarity * 100).toFixed(1)}%). Please align your face in a well-lit environment.`), { status: 400 });
    }
}