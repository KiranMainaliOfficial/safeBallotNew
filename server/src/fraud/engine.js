import { ruleBasedCheck } from './ruleBased.js';
import { frequencyCheck } from './frequencyAnalysis.js';
import { zScoreCheck } from './zScoreDetector.js';
import FraudReport from '../models/FraudReport.model.js';
import { emitFraudAlert } from '../sockets/fraudSocket.js';

export async function runFraudPipeline(ctx) {
    const reports = [];
    const checks = [
        await ruleBasedCheck(ctx),
        await frequencyCheck(ctx),
        await zScoreCheck(ctx),
    ];

    for (const r of checks) {
        if (r?.flagged) {
            const doc = await FraudReport.create({
                electionId: ctx.electionId,
                userId: ctx.userId,
                type: r.type,
                severity: r.severity,
                evidence: r.evidence,
            });
            emitFraudAlert(doc);
            reports.push(doc);
        }
    }
    // High severity blocks the vote
    return { block: reports.some(r => r.severity === 'high'), reports };
}