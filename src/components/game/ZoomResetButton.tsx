import React from 'react';
import { vibrate, HapticPatterns } from '../../utils/haptics';

interface ZoomResetButtonProps {
    scale: number;
    isVisible: boolean;
    onReset: () => void;
}

/**
 * Floating button to reset zoom level
 * 
 * iOS-style design:
 * - Pill shape with blur backdrop
 * - Shows current zoom level
 * - Smooth fade in/out animation
 * - Haptic feedback on tap
 */
export const ZoomResetButton: React.FC<ZoomResetButtonProps> = ({
    scale,
    isVisible,
    onReset
}) => {
    const handleClick = () => {
        vibrate(HapticPatterns.medium);
        onReset();
    };

    // Format scale as percentage (e.g., "2.5×")
    const zoomLabel = `${scale.toFixed(1)}×`;

    return (
        <button
            onClick={handleClick}
            className={`
                absolute top-3 right-3 z-50
                flex items-center gap-1.5
                px-3 py-1.5
                bg-black/40 backdrop-blur-xl
                border border-white/20
                rounded-full
                text-white font-bold text-sm
                shadow-lg shadow-black/20
                transition-all duration-300 ease-out
                active:scale-95
                ${isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }
            `}
            style={{
                // iOS-like spring animation for appear/disappear
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
            aria-label={`Reset zoom from ${zoomLabel}`}
        >
            {/* Zoom icon */}
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
            </svg>

            {/* Zoom level label */}
            <span className="tabular-nums">{zoomLabel}</span>

            {/* Reset indicator */}
            <span className="text-white/60 text-xs">Reset</span>
        </button>
    );
};
