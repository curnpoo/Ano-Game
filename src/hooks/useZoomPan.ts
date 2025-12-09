import { useState, useCallback, useRef } from 'react';
import { usePinch, useDrag } from '@use-gesture/react';
import { vibrate, HapticPatterns } from '../utils/haptics';

interface ZoomPanState {
    scale: number;
    offsetX: number;
    offsetY: number;
}

interface UseZoomPanOptions {
    minScale?: number;
    maxScale?: number;
    rubberBandFactor?: number; // How much to allow past limits (0.3 = 30% past)
}

interface UseZoomPanReturn {
    scale: number;
    offsetX: number;
    offsetY: number;
    isZoomed: boolean;
    resetZoom: () => void;
    bindPinch: ReturnType<typeof usePinch>;
    bindDrag: ReturnType<typeof useDrag>;
    containerStyle: React.CSSProperties;
    contentStyle: React.CSSProperties;
}

/**
 * iOS-like pinch-to-zoom hook with spring physics
 * 
 * Implements Apple HIG patterns:
 * - Velocity preservation for momentum
 * - Rubber-band effect at limits
 * - Spring animation on release
 * - Haptic feedback at bounds
 */
export function useZoomPan(options: UseZoomPanOptions = {}): UseZoomPanReturn {
    const {
        minScale = 1,
        maxScale = 4,
        rubberBandFactor = 0.2
    } = options;

    const [state, setState] = useState<ZoomPanState>({
        scale: 1,
        offsetX: 0,
        offsetY: 0
    });

    // Track if we're actively gesturing (for disabling spring during interaction)
    const [isGesturing, setIsGesturing] = useState(false);

    // Track last scale for relative scaling
    const lastScaleRef = useRef(1);

    // Track if we've vibrated at bounds (to avoid spam)
    const vibratedAtBoundsRef = useRef(false);

    /**
     * Apply rubber-band resistance when going past limits
     * iOS uses this for natural-feeling overscroll
     */
    const applyRubberBand = useCallback((value: number, min: number, max: number): number => {
        if (value < min) {
            const overshoot = min - value;
            return min - (overshoot * rubberBandFactor);
        }
        if (value > max) {
            const overshoot = value - max;
            return max + (overshoot * rubberBandFactor);
        }
        return value;
    }, [rubberBandFactor]);

    /**
     * Clamp a value within bounds and trigger haptic if hitting limit
     */
    const clampWithHaptic = useCallback((value: number, min: number, max: number): number => {
        if (value <= min || value >= max) {
            if (!vibratedAtBoundsRef.current) {
                vibrate(HapticPatterns.light);
                vibratedAtBoundsRef.current = true;
            }
        } else {
            vibratedAtBoundsRef.current = false;
        }
        return Math.max(min, Math.min(max, value));
    }, []);

    /**
     * Reset zoom to 1x with spring animation
     */
    const resetZoom = useCallback(() => {
        vibrate(HapticPatterns.medium);
        setState({ scale: 1, offsetX: 0, offsetY: 0 });
        lastScaleRef.current = 1;
    }, []);

    /**
     * Pinch gesture handler
     * Uses @use-gesture for precise multi-touch tracking
     */
    const bindPinch = usePinch(
        ({ offset: [scale], first, last, memo }) => {
            if (first) {
                setIsGesturing(true);
                vibratedAtBoundsRef.current = false;
                // Memo stores the starting scale
                return state.scale;
            }

            // Calculate new scale relative to starting scale
            const startScale = memo ?? 1;
            let newScale = startScale * scale;

            // Apply rubber-band during gesture, clamp on release
            if (last) {
                setIsGesturing(false);
                newScale = clampWithHaptic(newScale, minScale, maxScale);

                // If scale is very close to 1, snap back
                if (newScale < 1.1) {
                    newScale = 1;
                    setState(prev => ({ ...prev, scale: 1, offsetX: 0, offsetY: 0 }));
                    lastScaleRef.current = 1;
                    return;
                }
            } else {
                newScale = applyRubberBand(newScale, minScale, maxScale);
            }

            lastScaleRef.current = newScale;
            setState(prev => ({ ...prev, scale: newScale }));

            return memo;
        },
        {
            scaleBounds: { min: minScale * (1 - rubberBandFactor), max: maxScale * (1 + rubberBandFactor) },
            from: () => [lastScaleRef.current, 0],
            rubberband: true
        }
    );

    /**
     * Drag/pan gesture handler (only active when zoomed)
     */
    const bindDrag = useDrag(
        ({ offset: [x, y], first, last }) => {
            // Only allow panning when zoomed in
            if (state.scale <= 1) return;

            if (first) {
                setIsGesturing(true);
            }

            if (last) {
                setIsGesturing(false);
            }

            // Calculate max pan based on zoom level
            // When zoomed 2x, can pan 50% of size in each direction
            const maxPan = ((state.scale - 1) / state.scale) * 50;

            setState(prev => ({
                ...prev,
                offsetX: Math.max(-maxPan, Math.min(maxPan, x)),
                offsetY: Math.max(-maxPan, Math.min(maxPan, y))
            }));
        },
        {
            from: () => [state.offsetX, state.offsetY],
            enabled: state.scale > 1,
            filterTaps: true
        }
    );

    /**
     * Container style - prevents overflow during zoom
     */
    const containerStyle: React.CSSProperties = {
        touchAction: 'none',
        overflow: 'hidden',
        position: 'relative'
    };

    /**
     * Content style - applies zoom transform with iOS-like spring
     * 
     * The timing function approximates iOS spring:
     * - Fast initial response
     * - Gentle settle at end
     * - Slight natural bounce feel
     */
    const contentStyle: React.CSSProperties = {
        transform: `scale(${state.scale}) translate(${state.offsetX}%, ${state.offsetY}%)`,
        transformOrigin: 'center center',
        // iOS-like spring timing (only apply when not gesturing)
        transition: isGesturing
            ? 'none'
            : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform'
    };

    return {
        scale: state.scale,
        offsetX: state.offsetX,
        offsetY: state.offsetY,
        isZoomed: state.scale > 1,
        resetZoom,
        bindPinch,
        bindDrag,
        containerStyle,
        contentStyle
    };
}
