import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import type { PlayerDrawing } from '../types';

export interface DrawingsMap {
    [playerId: string]: PlayerDrawing;
}

export const useDrawings = (roomCode: string | null, roundNumber: number | null) => {
    const [drawings, setDrawings] = useState<DrawingsMap>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!roomCode || roundNumber === null || roundNumber === 0) {
            setDrawings({});
            setLoading(false);
            return;
        }

        setLoading(true);
        const drawingsRef = ref(database, `drawings/${roomCode}/${roundNumber}`);

        const unsubscribe = onValue(drawingsRef, (snapshot) => {
            if (snapshot.exists()) {
                setDrawings(snapshot.val());
            } else {
                setDrawings({});
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [roomCode, roundNumber]);

    return { drawings, loading };
};
