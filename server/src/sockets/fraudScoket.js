let ioRef = null;

export const registerIo = (io) => {
    ioRef = io;
};

export const emitFraudAlert = (report) => {
    if (ioRef) ioRef.to('admin').emit('fraud:alert', report);
};