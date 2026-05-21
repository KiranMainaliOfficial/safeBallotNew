import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../store/authStore';

export function useSocket() {
    const ref = useRef(null);
    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;
        ref.current = io(import.meta.env.VITE_API_URL, {
            auth: { token },
            withCredentials: true,
        });
        return () => ref.current?.disconnect();
    }, [token]);

    return ref;
}