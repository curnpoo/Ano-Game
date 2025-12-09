import { useState, useCallback, useRef } from 'react';
import { useGesture } from '@use-gesture/react';
import { vibrate, HapticPatterns } from '../utils/haptics';

interface UseZoomPanOptions {
    minScale?: number;
    maxScale?: number;
}

interface UseZoomPanReturn {
    scale: number;
    isZoomed: boolean;
    isPinching: boolean; // Exposed so parent can disable drawing
    resetZoom: () => void;
    bind: ReturnType<typeof useGesture>;
    contentStyle: React.CSSProperties;
}

/**
 * iOS-like pinch-to-zoom hook
 * 
 * Features:
 * - Two-finger pinch only (no pan - this is a drawing canvas)
 * - Exposes isPinching so parent can disable drawing during gesture
 * - Smooth spring animation on release
 * - Rubber-banding at limits
 */
export function useZoomPan(options: UseZoomPanOptions = {}): UseZoomPanReturn {
    const {
        minScale = 1,
        maxScale = 4
    } = options;

    const [scale, setScale] = useState(1);
    const [isPinching, setIsPinching] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Store the scale at gesture start
    const initialScaleRef = useRef(1);

    // Track if we've vibrated at bounds
    const vibratedRef = useRef(false);

    /**
     * Reset zoom to 1x
     */
    const resetZoom = useCallback(() => {
        vibrate(HapticPatterns.medium);
        setIsAnimating(true);
        setScale(1);
        initialScaleRef.current = 1;
        // Reset animating flag after transition
        setTimeout(() => setIsAnimating(false), 350);
    }, []);

    /**
     * Combined gesture handler - only handles pinch
     */
    const bind = useGesture(
        {
            onPinchStart: () => {
                setIsPinching(true);
                setIsAnimating(false);
                initialScaleRef.current = scale;
                vibratedRef.current = false;
            },
            onPinch: ({ offset: [d], memo = initialScaleRef.current }) => {
                // d is the scale multiplier from gesture start
                // offset[0] for pinch is the scale value directly
                let newScale = d;

                // Apply rubber-band resistance at limits
                if (newScale < minScale) {
                    const overshoot = minScale - newScale;
                    newScale = minScale - (overshoot * 0.3);
                } else if (newScale > maxScale) {
                    const overshoot = newScale - maxScale;
                    newScale = maxScale + (overshoot * 0.3);
                }

                // Haptic at bounds
                if ((newScale <= minScale || newScale >= maxScale) && !vibratedRef.current) {
                    vibrate(HapticPatterns.light);
                    vibratedRef.current = true;
                } else if (newScale > minScale && newScale < maxScale) {
                    vibratedRef.current = false;
                }

                setScale(newScale);
                return memo;
            },
            onPinchEnd: () => {
                setIsPinching(false);
                setIsAnimating(true);

                // Clamp to bounds with animation
                let finalScale = scale;
                if (finalScale < minScale) finalScale = minScale;
                if (finalScale > maxScale) finalScale = maxScale;

                // Snap back to 1 if very close
                if (finalScale < 1.15) {
                    finalScale = 1;
                }

                setScale(finalScale);
                initialScaleRef.current = finalScale;

                // Reset animating flag after transition
                setTimeout(() => setIsAnimating(false), 350);
            }
        },
        {
            pinch: {
                // Start from current scale
                from: () => [scale, 0],
                // Allow some overshoot for rubber-band
                scaleBounds: { min: minScale * 0.5, max: maxScale * 1.5 },
                rubberband: 0.15
            }
        }
    );

    /**
     * Transform style for the content
     */
    const contentStyle: React.CSSProperties = {
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        // Only animate when not actively pinching
        transition: isAnimating
            ? 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : 'none',
        willChange: isPinching ? 'transform' : 'auto'
    };

    return {
        scale,
        isZoomed: scale > 1.05,
        isPinching,
        resetZoom,
        bind,
        contentStyle
    };
}
