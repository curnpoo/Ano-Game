import { useState, useEffect, useRef } from 'react';
import type { GameRoom } from '../types';
import { StorageService } from '../services/storage';
import { perfMeasure, perfPayload } from '../utils/perf';

export const useRoom = (roomCode: string | null, _currentPlayerId: string | null) => {
    const [room, setRoom] = useState<GameRoom | null>(null);
    const [error, setError] = useState<string | null>(null);
    const lastSignatureRef = useRef<string | null>(null);
    const lastUpdateAtRef = useRef<number | null>(null);

    // Real-time subscription to Firebase
    useEffect(() => {
        if (!roomCode) {
            setRoom(null);
            setError(null);
            lastSignatureRef.current = null;
            return;
        }

        // Subscribe to real-time updates
        const unsubscribe = StorageService.subscribeToRoom(roomCode, (roomData) => {
            if (lastUpdateAtRef.current !== null) {
                perfMeasure('room.subscription.update-gap', lastUpdateAtRef.current, { roomCode });
            }
            lastUpdateAtRef.current = performance.now();

            if (roomData) {
                perfPayload('room.snapshot.bytes', roomData, { roomCode });
                const signature = JSON.stringify({
                    roomCode: roomData.roomCode,
                    status: roomData.status,
                    roundNumber: roomData.roundNumber,
                    currentUploaderId: roomData.currentUploaderId,
                    players: roomData.players.map((player) => ({
                        id: player.id,
                        lastSeen: player.lastSeen,
                        score: roomData.scores?.[player.id] ?? 0,
                    })),
                    waitingPlayers: roomData.waitingPlayers?.map((player) => ({
                        id: player.id,
                        lastSeen: player.lastSeen,
                    })),
                    votes: roomData.votes,
                    playerStates: roomData.playerStates,
                });

                if (signature === lastSignatureRef.current) {
                    return;
                }

                lastSignatureRef.current = signature;
                setRoom(roomData);
                setError(null);
            } else {
                lastSignatureRef.current = null;
                lastUpdateAtRef.current = null;
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
