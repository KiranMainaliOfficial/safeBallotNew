import Log from '../models/Log.model.js';

export async function ruleBasedCheck({ ip, deviceFingerprint }) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const sameIpVotes = await Log.countDocuments({
        ip,
        action: 'VOTE',
        createdAt: { $gte: since },
    });

    const sameDevice = await Log.countDocuments({
        deviceFingerprint,
        action: 'VOTE',
        createdAt: { $gte: since },
    });

    //     if (sameIpVotes > 5) {
    //         return { flagged: true, reason: 'Multiple votes from same IP' };
    //     }
    //     if (sameDevice > 5) {
    //         return { flagged: true, reason: 'Multiple votes from same device' };
    //     }

    //     return { flagged: false };
    // }
    if (sameIpVotes >= 3 || sameDevice >= 2) {
        return {
            flagged: true,
            type: 'SAME_IP',
            severity: sameIpVotes >= 5 ? 'high' : 'medium',
            evidence: {
                sameIpVotes, sameDevice, ip, deviceFingerprint
            },
        };
    }
    return { flagged: false };
}

