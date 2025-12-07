import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/auth';
import { StorageService } from '../services/storage';
import { XPService } from '../services/xp';
import { StatsService } from '../services/stats';
import type { Player, Screen } from '../types';

interface UsePlayerSessionProps {
    setCurrentScreen: (screen: Screen) => void;
}

export const usePlayerSession = ({ setCurrentScreen }: UsePlayerSessionProps) => {
    const [player, setPlayer] = useState<Player | null>(null);
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Initial 2s loading artificial delay (can be reduced if we want, but keeping for now)
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Restore session
    useEffect(() => {
        const initSession = async () => {
            // 1. Sync with Auth
            const authUser = await AuthService.syncUser();
            let session = StorageService.getSession();

            if (authUser) {
                if (!session || session.id !== authUser.id) {
                    if (authUser.avatarStrokes && authUser.color) {
                        session = {
                            id: authUser.id,
                            name: authUser.username,
                            color: authUser.color,
                            frame: authUser.frame || 'none',
                            avatarStrokes: authUser.avatarStrokes,
                            joinedAt: authUser.createdAt,
                            lastSeen: Date.now(),
                            cosmetics: authUser.cosmetics,
                            level: XPService.getLevel(),
                            xp: XPService.getXP(),
                            stats: StatsService.getStats()
                        };
                        StorageService.saveSession(session);
                        setPlayer(session);
                    }
                }
            }

            if (session) {
                setPlayer(session);

                // Auto-rejoin logic
                const lastRoomCode = StorageService.getRoomCode();
                const lastActive = StorageService.getLastLocalActivity();
                const isRecent = Date.now() - lastActive < 10 * 60 * 1000; // 10 minutes

                if (lastRoomCode && isRecent) {
                    setRoomCode(lastRoomCode);
                    try {
                        const room = await StorageService.joinRoom(lastRoomCode, session);
                        if (!room) {
                            StorageService.leaveRoom();
                            setCurrentScreen('home');
                        }
                        // If room exists, App.tsx's useRoom effect will handle routing
                    } catch (e) {
                        console.error('Failed to auto-rejoin', e);
                        setCurrentScreen('home');
                    }
                } else {
                    setCurrentScreen('home');
                }
            }
        };
        initSession();
    }, [setCurrentScreen]);

    const handleUpdateProfile = useCallback((profileData: Partial<Player>) => {
        if (!player) return;
        const updatedPlayer = {
            ...player,
            ...profileData,
            level: XPService.getLevel(),
            xp: XPService.getXP(),
            stats: StatsService.getStats()
        };
        setPlayer(updatedPlayer);
        StorageService.saveSession(updatedPlayer);

        if (roomCode) {
            StorageService.joinRoom(roomCode, updatedPlayer);
        }
    }, [player, roomCode]);

    return {
        player,
        setPlayer,
        roomCode,
        setRoomCode,
        isInitialLoading,
        handleUpdateProfile
    };
};
