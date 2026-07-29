import * as svc from '../services/election.service.js';
import { ok } from '../utils/response.js';

export const create = async (req, res, next) => {
    try {
        const data = await svc.createElection(req.body, req.user.id, req.meta);
        ok(res, data, 'Election created', 201);
    } catch (e) {
        next(e);
    }
};

export const list = async (_req, res, next) => {
    try {
        ok(res, await svc.listElections());
    } catch (e) {
        next(e);
    }
};

export const detail = async (req, res, next) => {
    try {
        ok(res, await svc.getElection(req.params.id));
    } catch (e) {
        next(e);
    }
};

export const setStatus = async (req, res, next) => {
    try {
        ok(res, await svc.updateStatus(req.params.id, req.body.status));
    } catch (e) {
        next(e);
    }
};

export const addCandidate = async (req, res, next) => {
    try {
        const data = await svc.addCandidate(req.params.id, req.body);
        ok(res, data, 'Candidate added', 201);
    } catch (e) {
        next(e);
    }
};

export const update = async (req, res, next) => {
    try {
        const data = await svc.updateElection(req.params.id, req.body);
        ok(res, data, 'Election updated');
    } catch (e) {
        next(e);
    }
};

export const remove = async (req, res, next) => {
    try {
        const data = await svc.deleteElection(req.params.id);
        ok(res, data, 'Election deleted');
    } catch (e) {
        next(e);
    }
};

export const updateCandidate = async (req, res, next) => {
    try {
        const data = await svc.updateCandidate(req.params.id, req.params.candidateId, req.body);
        ok(res, data, 'Candidate updated');
    } catch (e) {
        next(e);
    }
};

export const deleteCandidate = async (req, res, next) => {
    try {
        const data = await svc.deleteCandidate(req.params.id, req.params.candidateId);
        ok(res, data, 'Candidate deleted');
    } catch (e) {
        next(e);
    }
};