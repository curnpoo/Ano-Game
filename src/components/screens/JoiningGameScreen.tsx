import React, { useState, useEffect } from 'react';

const JOINING_TIPS = [
    "💡 Tip: Getting everything ready for you...",
    "💡 Tip: Sharpening the digital pencils...",
    "💡 Tip: Mixing the virtual paints...",
    "💡 Tip: Don't forget to vote for the funniest drawing!",
    "💡 Tip: The host better start the game soon..."
];

interface JoiningGameScreenProps {
    roomCode: string;
    onCancel: () => void;
}

export const JoiningGameScreen: React.FC<JoiningGameScreenProps> = ({ roomCode, onCancel }) => {
    const [tip, setTip] = useState('');
    const [showCancel, setShowCancel] = useState(false);

    useEffect(() => {
        setTip(JOINING_TIPS[Math.floor(Math.random() * JOINING_TIPS.length)]);

        // Show cancel button after a short delay so it doesn't flicker on fast joins
        const timer = setTimeout(() => {
            setShowCancel(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
            style={{ background: 'var(--theme-background, #f3e8d0)' }}>

            {/* Background Animation (Same as LoadingScreen for consistency) */}
            <style>{`
                @keyframes float-diagonal {
                    0%, 100% { transform: translate(0, 0) rotate(-5deg); }
                    50% { transform: translate(15px, -15px) rotate(5deg); }
                }
                .tool-bg-1 { animation: float-diagonal 4s ease-in-out infinite; }
                .tool-bg-2 { animation: float-diagonal 5s ease-in-out infinite; animation-delay: 0.5s; }
            `}</style>

            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute tool-bg-1 text-8xl" style={{ top: '10%', left: '10%' }}>🚀</div>
                <div className="absolute tool-bg-2 text-7xl" style={{ bottom: '20%', right: '15%' }}>🎨</div>
            </div>

            {/* Content Card */}
            <div
                className="relative backdrop-blur-sm p-8 rounded-[2rem] shadow-2xl max-w-md w-full mx-4 animate-bounce-in text-center"
                style={{
                    background: 'var(--theme-card-bg, rgba(255,255,255,0.95))',
                    border: '3px solid var(--theme-accent, #FFB74D)'
                }}
            >
                <div className="text-6xl mb-4 animate-bounce">
                    🎮
                </div>

                <h2 className="text-2xl font-black mb-2 tracking-wider"
                    style={{ color: 'var(--theme-text, #333)' }}>
                    Joining Room
                </h2>

                <div className="text-4xl font-black mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent tracking-widest">
                    {roomCode}
                </div>

                <div className="flex justify-center mb-6">
                    <div className="w-8 h-8 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
                </div>

                <p className="font-bold text-base italic mb-6 min-h-[3rem]"
                    style={{ color: 'var(--theme-text-secondary, #666)' }}>
                    {tip}
                </p>

                {showCancel && (
                    <div className="animate-fade-in pt-4 border-t"
                        style={{ borderColor: 'var(--theme-border, #e0e0e0)' }}>

                        <p className="text-sm mb-3 opacity-70">
                            Taking too long?
                        </p>

                        <button
                            onClick={onCancel}
                            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold py-3 px-6 rounded-xl transition-all w-full flex items-center justify-center gap-2"
                        >
                            <span>🏠</span> Go Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
