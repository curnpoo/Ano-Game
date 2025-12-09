import { useState, useEffect } from 'react';
import { AvatarService } from '../services/avatarService';
import type { DrawingStroke } from '../types';

export const useAvatar = (playerId?: string) => {
    const [strokes, setStrokes] = useState<DrawingStroke[] | null>(null);
    // Initialize loading to true if we have an ID to fetch, preventing flash of fallback
    const [isLoading, setIsLoading] = useState(!!playerId);

    useEffect(() => {
        if (!playerId) {
            setStrokes(null);
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const fetchAvatar = async () => {
            setIsLoading(true);
            try {
                const data = await AvatarService.getAvatarStrokes(playerId);
                if (isMounted) {
                    setStrokes(data);
                }
            } catch (error) {
                console.error('Failed to fetch avatar', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchAvatar();

        return () => {
            isMounted = false;
        };
    }, [playerId]);

    return { strokes, isLoading };
};
