export const fmtDate = (d) => new Date(d).toLocaleString();

export const pct = (n, total) =>
    total ? `${((n / total) * 100).toFixed(1)}%` : '0%';