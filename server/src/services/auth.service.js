import bcrypt from 'bcrypt';
import User from '../models/User.model.js';
import Log from '../models/Log.model.js';
import { sha256, generateOtp } from '../utils/crypto.js';
import { signAccess, signRefresh } from '../utils/jwt.js';
import { sendOtp } from './mail.service.js';

export async function register({ name, email, password, meta }) {
    const exists = await User.findOne({ email });
    if (exists) {
        throw Object.assign(new Error('Email already registered'), { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const user = await User.create({
        name,
        email,
        passwordHash,
        otpHash: sha256(otp),
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
        registeredIp: meta.ip,
        deviceFingerprint: meta.deviceFingerprint,
    });

    await sendOtp(email, otp);
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
        },
    };
}