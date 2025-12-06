import React, { useEffect, useState } from 'react';

interface SabotageOverlayProps {
    isActive: boolean;
}

export const SabotageOverlay: React.FC<SabotageOverlayProps> = ({ isActive }) => {
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (!isActive) return;

        // Random shake intervals
        const shakeInterval = setInterval(() => {
            setShake(true);
            setTimeout(() => setShake(false), 200);
        }, 2000 + Math.random() * 3000);

        return () => clearInterval(shakeInterval);
    }, [isActive]);

    if (!isActive) return null;

    return (
        <>
            {/* Screen shake effect on container */}
            <style>{`
                @keyframes sabotage-shake {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    10% { transform: translate(-5px, -5px) rotate(-1deg); }
                    20% { transform: translate(5px, -5px) rotate(1deg); }
                    30% { transform: translate(-5px, 5px) rotate(0deg); }
                    40% { transform: translate(5px, 5px) rotate(-1deg); }
                    50% { transform: translate(-5px, -5px) rotate(1deg); }
                    60% { transform: translate(5px, -5px) rotate(0deg); }
                    70% { transform: translate(-5px, 5px) rotate(-1deg); }
                    80% { transform: translate(5px, 5px) rotate(1deg); }
                    90% { transform: translate(-5px, -5px) rotate(0deg); }
                }
                
                .sabotage-shake {
                    animation: sabotage-shake 0.5s ease-in-out;
                }

                @keyframes color-shift {
                    0% { filter: hue-rotate(0deg); }
                    25% { filter: hue-rotate(90deg); }
                    50% { filter: hue-rotate(180deg); }
                    75% { filter: hue-rotate(270deg); }
                    100% { filter: hue-rotate(360deg); }
                }

                .sabotage-active {
                    animation: color-shift 3s linear infinite;
                }
            `}</style>

            {/* Warning banner */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                    <span className="animate-pulse">⚠️</span>
                    SABOTAGED!
                    <span className="animate-pulse">⚠️</span>
                </div>
            </div>

            {/* Random glitch overlay */}
            <div
                className={`fixed inset-0 pointer-events-none z-40 ${shake ? 'sabotage-shake' : ''}`}
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.03) 2px, rgba(255,0,0,0.03) 4px)',
                    mixBlendMode: 'multiply'
                }}
            />
        </>
    );
};
