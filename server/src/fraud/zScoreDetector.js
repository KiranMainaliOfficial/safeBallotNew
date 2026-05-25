import Log from '../models/Log.model.js';

/**
 * Custom statistical anomaly detection using Z-score.
 * No ML libraries; pure math.
 *   mean   = Σx / n
 *   stdDev = √(Σ(x - mean)² / n)
 *   z      = (x - mean) / stdDev
 * |z| > 2.5  => anomaly.
 */
export async function zScoreCheck({ electionId }) {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const logs = await Log.find({
        action: 'VOTE',
        'meta.electionId': electionId,
        createdAt: { $gte: since },
    })
        .select('createdAt')
        .lean();

    if (logs.length < 10) return { flagged: false };

    // Bucket vote counts per minute
    const buckets = {};
    for (const l of logs) {
        const minute = Math.floor(new Date(l.createdAt).getTime() / 60000);
        buckets[minute] = (buckets[minute] || 0) + 1;
    }
    const counts = Object.values(buckets);

    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance =
        counts.reduce((acc, x) => acc + (x - mean) ** 2, 0) / counts.length;
    const stdDev = Math.sqrt(variance) || 1;

    const latest = counts[counts.length - 1];
    const z = (latest - mean) / stdDev;

    if (Math.abs(z) > 2.5) {
        return {
            flagged: true,
            type: 'ZSCORE_ANOMALY',
            severity: Math.abs(z) > 4 ? 'high' : 'medium',
            evidence: {
                mean: mean.toFixed(2),
                stdDev: stdDev.toFixed(2),
                latest,
                zScore: z.toFixed(2),
            },
        };
    }
    return { flagged: false };
}