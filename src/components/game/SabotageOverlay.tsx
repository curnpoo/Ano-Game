import React from 'react';

interface SabotageOverlayProps {
    isActive: boolean;
    effectName?: string;
}

export const SabotageOverlay: React.FC<SabotageOverlayProps> = ({ isActive, effectName }) => {
    // No state needed for constant effects
    // The shaking of the screen is handled by parent or CSS classes

    if (!isActive) return null;

    return (
        <>
            {/* Screen shake effect on container */}
            <style>{`
                @keyframes sabotage-shake {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(2px, 2px) rotate(1deg); }
                    50% { transform: translate(-2px, -2px) rotate(-1deg); }
                    75% { transform: translate(-2px, 2px) rotate(0deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                
                .sabotage-shake {
                    animation: sabotage-shake 0.2s linear infinite; /* Constant wiggle */
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
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-bounce w-full max-w-sm text-center px-4">
                <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg border-2 border-red-400">
                    <div className="flex items-center justifying-center gap-2 mb-1 justify-center text-lg">
                        <span className="animate-pulse">⚠️</span>
                        SABOTAGED!
                        <span className="animate-pulse">⚠️</span>
                    </div>
                    {effectName && (
                        <div className="text-sm text-red-100 font-normal uppercase tracking-wider">
                            {effectName}
                        </div>
                    )}
                </div>
            </div>

            {/* Random glitch overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-40 sabotage-shake"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.03) 2px, rgba(255,0,0,0.03) 4px)',
                    mixBlendMode: 'multiply'
                }}
            />
        </>
    );
};
