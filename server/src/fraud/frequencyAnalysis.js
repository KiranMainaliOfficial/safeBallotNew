import Log from '../models/Log.model.js';
import { parseUserAgent } from '../utils/uaParser.js';

export async function frequencyCheck({ ip, userAgent }) {
    const windowStart = new Date(Date.now() - 60 * 1000);
    const recent = await Log.countDocuments({
        ip,
        action: 'VOTE',
        createdAt: { $gte: windowStart },
    });

    if (recent > 3) {
        const { browser, os } = parseUserAgent(userAgent);
        return {
            flagged: true,
            type: 'FREQUENCY',
            severity: recent > 8 ? 'high' : 'medium',
            evidence: {
                votesInLastMinute: recent,
                ip,
                browser,
                os,
                userAgent,
            },
        };
    }
    return { flagged: false };
}