import * as svc from '../services/auth.service.js';
import { ok } from '../utils/response.js';
import User from '../models/User.model.js';

export const register = async (req, res, next) => {
    try {
        const data = await svc.register({ ...req.body, meta: req.meta });
        ok(res, data, 'Registered. OTP sent to email.', 201);
    } catch (e) {
        next(e);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const data = await svc.verifyOtp(req.body);
        ok(res, data, 'Email verified');
    } catch (e) {
        next(e);
    }
};

export const login = async (req, res, next) => {
    try {
        const data = await svc.login({ ...req.body, meta: req.meta });
        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: false,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        ok(res, { accessToken: data.accessToken, user: data.user }, 'Logged in');
    } catch (e) {
        next(e);
    }
};

export const logout = async (_req, res) => {
    res.clearCookie('refreshToken');
    ok(res, null, 'Logged out');
};

export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
        ok(res, user, 'Profile retrieved');
    } catch (e) {
        next(e);
    }
};

export const submitKyc = async (req, res, next) => {
    try {
        const data = await svc.submitKyc(req.user.id, req.body, req.meta);
        ok(res, data, 'KYC submitted');
    } catch (e) {
        next(e);
    }
};

export const verifyFace = async (req, res, next) => {
    try {
        const { image } = req.body;
        if (!image) {
            throw Object.assign(new Error('Live camera snapshot image is required'), { status: 400 });
        }
        const data = await svc.verifyFace(req.user.id, image, req.meta);
        ok(res, data, 'Face matched successfully');
    } catch (e) {
        next(e);
    }
};