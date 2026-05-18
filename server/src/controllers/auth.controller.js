import * as svc from '../services/auth.service.js';
import { ok } from '../utils/response.js';

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
            httpOnly: true,
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