import { useState, useEffect, useCallback, useRef } from 'react';
import type { LoadingStage } from '../types';

export interface UseLoadingProgressReturn {
    stages: LoadingStage[];
    isOnline: boolean;
    isSlow: boolean;
    isAllComplete: boolean;
    addStage: (id: string, label: string) => void;
    updateStage: (id: string, status: LoadingStage['status'], error?: string) => void;
    completeCurrentStage: () => void;
    clearStages: () => void;
    startScenario: (scenario: 'initial' | 'join' | 'start' | 'upload' | 'create') => void;
}

const SCENARIO_STAGES: Record<string, { id: string; label: string }[]> = {
    initial: [
        { id: 'auth', label: 'Connecting to account...' },
        { id: 'profile', label: 'Loading profile data...' },
        { id: 'room', label: 'Checking for active games...' },
    ],
    join: [
        { id: 'connect', label: 'Connecting to server...' },
        { id: 'room', label: 'Fetching room data...' },
        { id: 'players', label: 'Loading player profiles...' },
        { id: 'sync', label: 'Syncing game state...' },
    ],
    create: [
        { id: 'connect', label: 'Connecting to server...' },
        { id: 'create', label: 'Creating room...' },
        { id: 'configure', label: 'Configuring settings...' },
    ],
    start: [
        { id: 'init', label: 'Initializing round...' },
        { id: 'roles', label: 'Assigning player roles...' },
        { id: 'sync', label: 'Syncing all players...' },
    ],
    upload: [
        { id: 'process', label: 'Processing image...' },
        { id: 'compress', label: 'Compressing for upload...' },
        { id: 'upload', label: 'Uploading to cloud...' },
        { id: 'verify', label: 'Verifying upload...' },
    ],
};

const SLOW_THRESHOLD_MS = 5000;

export const useLoadingProgress = (): UseLoadingProgressReturn => {
    const [stages, setStages] = useState<LoadingStage[]>([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSlow, setIsSlow] = useState(false);
    const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Network status listeners
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Track slow loading
    useEffect(() => {
        const hasLoading = stages.some(s => s.status === 'loading');

        if (hasLoading) {
            if (!slowTimerRef.current) {
                slowTimerRef.current = setTimeout(() => setIsSlow(true), SLOW_THRESHOLD_MS);
            }
        } else {
            if (slowTimerRef.current) {
                clearTimeout(slowTimerRef.current);
                slowTimerRef.current = null;
            }
            setIsSlow(false);
        }

        return () => {
            if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
        };
    }, [stages]);

    const addStage = useCallback((id: string, label: string) => {
        setStages(prev => {
            if (prev.some(s => s.id === id)) return prev;
            return [...prev, { id, label, status: 'pending' }];
        });
    }, []);

    // SEQUENTIAL UPDATE: Only allows updating the CURRENT loading stage
    // or marking a completed stage. Enforces strict top-to-bottom order.
    const updateStage = useCallback((id: string, status: LoadingStage['status'], error?: string) => {
        setStages(prev => {
            const targetIndex = prev.findIndex(s => s.id === id);
            if (targetIndex === -1) return prev;

            // Find the current loading stage index
            const currentLoadingIndex = prev.findIndex(s => s.status === 'loading');

            // RULE 1: Can only update to 'loading' if no stage is currently loading
            //         or if updating the already-loading stage
            if (status === 'loading') {
                if (currentLoadingIndex !== -1 && currentLoadingIndex !== targetIndex) {
                    // Another stage is loading, ignore this request
                    console.warn(`[Loading] Ignoring out-of-order loading request for ${id}`);
                    return prev;
                }
                // RULE 2: Can't start loading if there are pending stages before this one
                const hasPendingBefore = prev.slice(0, targetIndex).some(s => s.status === 'pending');
                if (hasPendingBefore) {
                    console.warn(`[Loading] Ignoring loading request for ${id} - pending stages exist before it`);
                    return prev;
                }
            }

            // RULE 3: Can only mark as completed if this is the current loading stage
            if (status === 'completed') {
                if (currentLoadingIndex !== targetIndex && prev[targetIndex].status !== 'loading') {
                    console.warn(`[Loading] Ignoring completion for ${id} - not currently loading`);
                    return prev;
                }
            }

            // Apply the update
            const updated = prev.map((s, i) => {
                if (i !== targetIndex) return s;
                return { ...s, status, error };
            });

            // Auto-advance: If marking as completed, start the next pending stage
            if (status === 'completed') {
                const nextPendingIndex = updated.findIndex((s, i) => i > targetIndex && s.status === 'pending');
                if (nextPendingIndex !== -1) {
                    updated[nextPendingIndex] = { ...updated[nextPendingIndex], status: 'loading' };
                }
            }

            return updated;
        });
    }, []);

    // Helper: Complete the current loading stage and auto-advance
    const completeCurrentStage = useCallback(() => {
        setStages(prev => {
            const currentLoadingIndex = prev.findIndex(s => s.status === 'loading');
            if (currentLoadingIndex === -1) return prev;

            const updated = [...prev];
            updated[currentLoadingIndex] = { ...updated[currentLoadingIndex], status: 'completed' };

            // Start next pending stage
            const nextPendingIndex = updated.findIndex((s, i) => i > currentLoadingIndex && s.status === 'pending');
            if (nextPendingIndex !== -1) {
                updated[nextPendingIndex] = { ...updated[nextPendingIndex], status: 'loading' };
            }

            return updated;
        });
    }, []);

    const clearStages = useCallback(() => {
        setStages([]);
        setIsSlow(false);
        if (slowTimerRef.current) {
            clearTimeout(slowTimerRef.current);
            slowTimerRef.current = null;
        }
    }, []);

    const startScenario = useCallback((scenario: keyof typeof SCENARIO_STAGES) => {
        clearStages();
        const scenarioStages = SCENARIO_STAGES[scenario] || [];
        // All start as pending, then first becomes loading
        const initializedStages: LoadingStage[] = scenarioStages.map((s, i) => ({
            ...s,
            status: i === 0 ? 'loading' : 'pending' as const,
        }));
        setStages(initializedStages);
    }, [clearStages]);

    // Computed: all stages complete (and at least one stage exists)
    const isAllComplete = stages.length > 0 && stages.every(s => s.status === 'completed');

    return {
        stages,
        isOnline,
        isSlow,
        isAllComplete,
        addStage,
        updateStage,
        completeCurrentStage,
        clearStages,
        startScenario,
    };
};
