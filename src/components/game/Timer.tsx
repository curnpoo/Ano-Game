import React, { useEffect, useState, useRef } from 'react';

interface TimerProps {
    endsAt: number;
    onTimeUp: () => void;
}

export const Timer: React.FC<TimerProps> = ({ endsAt, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(() => Math.max(0, (endsAt - Date.now()) / 1000));
    const [shakeIntensity, setShakeIntensity] = useState(0);
    const onTimeUpRef = useRef(onTimeUp);
    const hasCalledRef = useRef(false);

    // Keep ref updated with latest callback
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    useEffect(() => {
        // Reset the called flag when endsAt changes (new turn)
        hasCalledRef.current = false;

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, (endsAt - now) / 1000);

            setTimeLeft(remaining);

            // Calculate shake intensity based on remaining time
            if (remaining <= 5 && remaining > 0) {
                setShakeIntensity((5 - remaining) * 2); // 0 to 10 scale
            } else {
                setShakeIntensity(0);
            }

            if (remaining <= 0 && !hasCalledRef.current) {
                hasCalledRef.current = true;
                clearInterval(interval);
                // Use ref to call the latest callback
                onTimeUpRef.current();
            }
        }, 30); // Higher fps for smooth shake

        return () => clearInterval(interval);
    }, [endsAt]);

    // Color and visual logic
    const getVisuals = () => {
        if (timeLeft > 10) return {
            color: '#32CD32',
            bg: 'from-green-400 to-emerald-500',
            glow: 'rgba(50, 205, 50, 0.5)',
            emoji: '⏳'
        };
        if (timeLeft > 5) return {
            color: '#FFE135',
            bg: 'from-yellow-400 to-orange-500',
            glow: 'rgba(255, 225, 53, 0.6)',
            emoji: '😰'
        };
        return {
            color: '#FF0055', // Hot pink-red
            bg: 'from-red-500 to-pink-600',
            glow: 'rgba(255, 0, 85, 0.8)',
            emoji: '💥'
        };
    };

    const visuals = getVisuals();
    const totalDuration = 20; // Assumption or passed prop? Using relative percentage for ring
    // We can assume typical round is 15-20s. Let's make progress relative to "full" ring.
    // If endsAt is far in future, visual clamp at 100%.
    const progress = Math.min(100, (timeLeft / totalDuration) * 100);

    return (
        <div
            className="relative w-32 h-32 flex items-center justify-center gpu-accelerate select-none"
            style={{
                filter: `drop-shadow(0 0 ${10 + shakeIntensity * 2}px ${visuals.glow})`,
                transform: `rotate(${Math.sin(Date.now() / 20) * shakeIntensity}deg) scale(${1 + shakeIntensity * 0.02})`
            }}
        >
            {/* Outer pulsating glow */}
            <div
                className="absolute inset-[-10px] rounded-full opacity-50 blur-xl transition-colors duration-300"
                style={{ background: visuals.color }}
            />

            {/* Main Background Circle */}
            <div className="absolute inset-0 rounded-full bg-white border-4 border-white shadow-inner" />

            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                {/* Track */}
                <circle
                    cx="64" cy="64" r="56"
                    stroke="#eee" strokeWidth="12" fill="none"
                />
                {/* Progress */}
                <circle
                    cx="64" cy="64" r="56"
                    stroke={visuals.color}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={351} // 2 * pi * 56
                    strokeDashoffset={351 - (351 * progress) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-100"
                />
            </svg>

            {/* Fuse Spark Particle (Orbiting) */}
            {timeLeft > 0 && (
                <div
                    className="absolute w-full h-full animate-spin"
                    style={{
                        animationDuration: '2s', // Arbitrary spin speed for dynamic feel? Or match progress?
                        // Actually, matching the tip of the progress bar is hard with CSS spin.
                        // Let's just have a "fuse" spark that follows the ring visually or simple orbits.
                        // Simple orbit is fun.
                        animationTimingFunction: 'linear'
                    }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-6 h-6 bg-yellow-300 rounded-full blur-sm"
                        style={{ boxShadow: '0 0 10px yellow, 0 0 20px orange' }} />
                </div>
            )}


            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="text-4xl font-black italic tracking-tighter"
                    style={{
                        color: visuals.color,
                        textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                    }}>
                    {Math.ceil(timeLeft)}
                </div>
                <div className="text-2xl animate-bounce" style={{ filter: 'grayscale(0)' }}>
                    {visuals.emoji}
                </div>
            </div>
        </div>
    );
};
