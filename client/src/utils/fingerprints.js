export function generateFingerprint() {
    if (localStorage.getItem('device_fp')) return;
    const data = [
        navigator.userAgent,
        navigator.language,
        `${screen.width}x${screen.height}`,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 0,
    ].join('|');
    let h = 0;
    for (let i = 0; i < data.length; i++) {
        h = (h << 5) - h + data.charCodeAt(i);
        h |= 0;
    }
    localStorage.setItem('device_fp', Math.abs(h).toString(16));
}