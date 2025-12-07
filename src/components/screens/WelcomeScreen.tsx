import React, { useEffect, useState } from 'react';
import logo from '../../assets/logo_icon.png';

import { AboutModal } from '../common/AboutModal';
import { InstallPromptModal } from '../common/InstallPromptModal';
import { ShareModal } from '../common/ShareModal';

interface WelcomeScreenProps {
    onPlay: () => void;
    joiningRoomCode?: string | null;
}

// Floating bubble component
const FloatingBubble: React.FC<{ delay: number; size: number; color: string; left: string }> = ({ delay, size, color, left }) => (
    <div
        className="absolute rounded-full gpu-accelerate"
        style={{
            width: size,
            height: size,
            left,
            bottom: '-100px',
            background: `radial-gradient(circle at 30% 30%, ${color}, transparent)`,
            animation: `bubble-rise ${15 + Math.random() * 10}s ease-in infinite`,
            animationDelay: `${delay}s`,
            opacity: 0.6,
        }}
    />
);

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPlay, joiningRoomCode }) => {
    const [mounted, setMounted] = useState(false);

    const [showAbout, setShowAbout] = useState(false);
    const [showShare, setShowShare] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const bubbles = [
        { delay: 0, size: 60, color: '#FF69B4', left: '10%' },
        { delay: 2, size: 40, color: '#00D9FF', left: '25%' },
        { delay: 4, size: 80, color: '#9B59B6', left: '45%' },
        { delay: 1, size: 50, color: '#32CD32', left: '65%' },
        { delay: 3, size: 70, color: '#FFE135', left: '80%' },
        { delay: 5, size: 45, color: '#FF8C00', left: '90%' },
    ];

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 p-8 text-center overflow-hidden">
            {/* Floating Bubbles Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {bubbles.map((bubble, i) => (
                    <FloatingBubble key={i} {...bubble} />
                ))}
            </div>

            <div className={`text-center space-y-8 max-w-md w-full relative z-10 ${mounted ? 'pop-in' : 'opacity-0'}`}>
                <div className="space-y-4 flex flex-col items-center">
                    {/* Logo with rounded corners to hide white background corners */}
                    <img
                        src={logo}
                        alt="Ano Draw"
                        className="w-40 h-40 object-cover rounded-[2rem] shadow-xl bubble-float border-4 border-white/50"
                        style={{ animationDelay: '0.5s' }}
                    />

                    <h1 className="text-5xl font-bold tracking-tight drop-shadow-lg"
                        style={{
                            textShadow: '0px 4px 0 #9B59B6, 0px 8px 0 rgba(0,0,0,0.2)'
                        }}>
                        <span className="rainbow-text">Ano</span>
                        <br />
                        <span style={{ color: 'var(--theme-text)' }}>Draw</span>
                    </h1>

                    <p className="text-xl font-bold bubble-float" style={{ animationDelay: '0.5s', color: 'var(--theme-text-secondary)' }}>
                        ✨ The party drawing game! ✨
                    </p>
                </div>

                {joiningRoomCode && (
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-2 border-purple-400 animate-bounce-in">
                        <div className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-1">
                            Joining Room
                        </div>
                        <div className="text-3xl font-black text-gray-800 tracking-wider">
                            {joiningRoomCode}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 font-medium">
                            Log in to join!
                        </div>
                    </div>
                )}

                <button
                    onClick={onPlay}
                    className="w-full btn-90s bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white font-bold text-2xl py-5 px-8 jelly-hover pulse-glow"
                >
                    {joiningRoomCode ? '🚀 Join & Play! 🚀' : '🚀 Play Now! 🚀'}
                </button>

                <div className="flex flex-wrap justify-center gap-3 text-lg">

                    <button
                        onClick={() => setShowAbout(true)}
                        className="hover:scale-110 transition-transform wiggle-hover bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full font-bold"
                    >
                        ℹ️ About
                    </button>
                    <button
                        onClick={() => setShowShare(true)}
                        className="hover:scale-110 transition-transform wiggle-hover bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full font-bold"
                    >
                        📤 Share
                    </button>
                </div>
            </div>

            {/* Modals */}

            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
            <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />
            <InstallPromptModal />

            {/* Decorative Stars */}
            <div className="absolute top-10 left-10 text-4xl animate-pulse">⭐</div>
            <div className="absolute top-20 right-16 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-32 left-20 text-3xl animate-pulse" style={{ animationDelay: '1s' }}>🌟</div>
            <div className="absolute bottom-20 right-10 text-4xl animate-pulse" style={{ animationDelay: '0.3s' }}>💫</div>
        </div>
    );
};
