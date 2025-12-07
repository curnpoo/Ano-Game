import React, { useState, useEffect } from 'react';

interface ForceAdvanceButtonProps {
    isHost: boolean;
    onForceAdvance: () => void;
    waitingForPlayers: string[]; // Names of players holding up the game
    phaseName: string; // 'vote' or 'draw'
    timeoutSeconds?: number; // How long to wait before showing button (default 45s)
}

export const ForceAdvanceButton: React.FC<ForceAdvanceButtonProps> = ({
    isHost,
    onForceAdvance,
    waitingForPlayers,
    phaseName,
    timeoutSeconds = 45
}) => {
    const [showButton, setShowButton] = useState(false);
    const [countdown, setCountdown] = useState(timeoutSeconds);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (!isHost || waitingForPlayers.length === 0) {
            setShowButton(false);
            setCountdown(timeoutSeconds);
            return;
        }

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setShowButton(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isHost, waitingForPlayers.length, timeoutSeconds]);

    if (!isHost || waitingForPlayers.length === 0) return null;

    if (!showButton) {
        return (
            <div className="text-center text-xs opacity-50 mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
                Force advance available in {countdown}s...
            </div>
        );
    }

    if (confirming) {
        return (
            <div className="mt-4 p-4 rounded-2xl border-2 border-red-500 bg-red-500/10">
                <p className="text-sm font-bold text-red-400 mb-3 text-center">
                    Skip {waitingForPlayers.join(', ')}?
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setConfirming(false)}
                        className="flex-1 py-2 rounded-xl font-bold transition-all"
                        style={{ backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-text)' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onForceAdvance();
                            setConfirming(false);
                        }}
                        className="flex-1 py-2 rounded-xl font-bold bg-red-500 text-white transition-all hover:bg-red-600"
                    >
                        Skip Them
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="mt-4 w-full py-3 rounded-xl font-bold text-sm transition-all border-2 border-dashed border-red-400/50 text-red-400 hover:bg-red-500/10"
        >
            ⏩ Force Advance ({phaseName})
        </button>
    );
};
