import React from 'react';

interface SabotageOverlayProps {
    isActive: boolean;
    effectName?: string;
    showBanner?: boolean;
}

export const SabotageOverlay: React.FC<SabotageOverlayProps> = ({ isActive, effectName, showBanner = true }) => {
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

            {/* Warning banner - Compact & Stationary */}
            {showBanner && (
            <div className="fixed top-20 left-0 right-0 z-[100] flex justify-center pointer-events-none">
                <div className="bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold shadow-xl border border-red-400/50 flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
                    <div className="flex items-center gap-2 text-sm leading-none">
                        <span className="animate-pulse">⚠️</span>
                        SABOTAGED!
                        <span className="animate-pulse">⚠️</span>
                    </div>
                    {effectName && (
                        <div className="text-[10px] text-red-100 font-medium uppercase tracking-widest mt-0.5">
                            {effectName}
                        </div>
                    )}
                </div>
            </div>
            )}

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
