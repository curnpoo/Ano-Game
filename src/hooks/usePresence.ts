import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

export interface PresenceMap {
    [playerId: string]: number; // timestamp
}

export const usePresence = (roomCode: string | null) => {
    const [presence, setPresence] = useState<PresenceMap>({});

    useEffect(() => {
        if (!roomCode) {
            setPresence({});
            return;
        }

        const presenceRef = ref(database, `presence/${roomCode}`);

        const handleSnapshot = (snapshot: any) => {
            if (snapshot.exists()) {
                setPresence(snapshot.val());
            } else {
                setPresence({});
            }
        };

        const unsubscribe = onValue(presenceRef, handleSnapshot);

        return () => {
            // Cleanup handled by unsubscribe function returned from onValue
            unsubscribe();
        };
    }, [roomCode]);

    const isOnline = (playerId: string) => {
        const lastSeen = presence[playerId];
        if (!lastSeen) return false;
        // Consider offline if no heartbeat for 60 seconds (2 heartbeats missed)
        return Date.now() - lastSeen < 60000;
    };

    return { presence, isOnline };
};
