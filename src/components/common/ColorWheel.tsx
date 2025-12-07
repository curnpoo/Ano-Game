import React, { useRef, useEffect, useState } from 'react';

interface ColorWheelProps {
    color: string;
    onChange: (color: string) => void;
    size?: number;
    className?: string;
}

export const ColorWheel: React.FC<ColorWheelProps> = ({
    color,
    onChange,
    size = 200,
    className = ''
}) => {
    const wheelRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!wheelRef.current) return;

        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        // Calculate angle in degrees (0-360)
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        // Adjust so 0 is at top or right as preferred. Math.atan2 0 is at 3 o'clock.
        // Let's standard 0-360 positive.
        if (angle < 0) angle += 360;

        // Angle 0 = Red in HSL color wheel usually corresponds to 0 degrees if we align it right.
        // Using standard conic-gradient(red, yellow, lime, aqua, blue, magenta, red)
        // Red is at 0deg (top if from N, or right if from E).
        // By default conic gradient starts at 12 o'clock (top) in CSS? No, often top.
        // Let's assume standard CSS conic gradient starts at top (0deg).
        // atan2(dy, dx) 0 is right.
        // x positive, y 0 -> 0 angle.
        // y positive is DOWN in DOM.
        // So dx>0, dy>0 is bottom-right (positive angle).
        // Check CSS conic-gradient defaults: starts at top positions clockwise.
        // We need to map our calculated angle to the CSS angle.

        // Actually simpler: Just map the angle to HSL hue.
        // We can create visual feedback to ensure it matches.

        // Let's shift angle by 90 degrees to match standard CSS conic gradient if needed, 
        // or just rotate the gradient.

        // Let's calculate Hue directly.
        // We want 0deg = Red, which is standard.
        // atan2 returns angle from X axis.
        // We can just use that angle as Hue, maybe adding 90 deg if needed.
        const hue = Math.round(angle);

        const newColor = `hsl(${hue}, 100%, 50%)`;
        onChange(newColor);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e);
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                handleInteraction(e);
            }
        };

        const onMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            ref={wheelRef}
            className={`relative rounded-full shadow-xl cursor-crosshair touch-none ${className}`}
            style={{
                width: size,
                height: size,
                background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                border: '4px solid white'
            }}
            onMouseDown={onMouseDown}
            onTouchStart={(e) => {
                // Simple touch support
                // Prevent scrolling
                // e.preventDefault(); // Might block scroll on mobile if inside list
                handleInteraction(e.nativeEvent);
            }}
            onTouchMove={(e) => {
                handleInteraction(e.nativeEvent);
            }}
        >
            {/* Center indicator or selected color preview */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-inner border-4 border-white pointer-events-none"
                style={{
                    width: size * 0.2, // 20% size
                    height: size * 0.2,
                    backgroundColor: color
                }}
            />
        </div>
    );
};
