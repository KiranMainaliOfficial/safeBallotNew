import Log from '../models/Log.model.js';

export async function frequencyCheck({ ip }) {
    const windowStart = new Date(Date.now() - 60 * 1000);
    const recent = await Log.countDocuments({
        ip,
        action: 'VOTE',
        createdAt: { $gte: windowStart },
    });

    if (recent > 3) {
        return {
            flagged: true,
            type: 'FREQUENCY',
            severity: recent > 8 ? 'high' : 'medium',
            evidence: { votesInLastMinute: recent, ip },
        };
    }
    return { flagged: false };
}