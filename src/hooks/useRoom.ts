import { useState, useEffect } from 'react';
import type { GameRoom } from '../types';
import { StorageService } from '../services/storage';

export const useRoom = (roomCode: string | null, _currentPlayerId: string | null) => {
    const [room, setRoom] = useState<GameRoom | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Real-time subscription to Firebase
    useEffect(() => {
        if (!roomCode) {
            setRoom(null);
            setError(null);
            return;
        }

        // Subscribe to real-time updates
        const unsubscribe = StorageService.subscribeToRoom(roomCode, (roomData) => {
            if (roomData) {
                setRoom(roomData);
                setError(null);
            } else {
                setRoom(null);
                setError('Room not found');
            }
        });

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, [roomCode]);

    // Note: lastSeen is updated via heartbeat in App.tsx

    const refreshRoom = async () => {
        if (!roomCode) return;
        try {
            const data = await StorageService.getRoom(roomCode);
            if (data) {
                setRoom(data);
                setError(null);
            }
        } catch (err) {
            console.error('Failed to refresh room:', err);
        }
    };

    return { room, error, refreshRoom };
};
