import { useState, useRef, useEffect, useCallback } from 'react';
import type { DrawingStroke } from '../types';

interface UseDrawingStateProps {
    onToast?: (message: string, type: 'error' | 'success' | 'info') => void;
}

export const useDrawingState = ({ onToast }: UseDrawingStateProps = {}) => {
    const [brushColor, setBrushColor] = useState('#FF69B4');
    const [brushSize, setBrushSize] = useState(12);
    const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
    const strokesRef = useRef<DrawingStroke[]>([]);

    const [isEraser, setIsEraser] = useState(false);
    const [isEyedropper, setIsEyedropper] = useState(false);

    // Keep ref in sync with state
    useEffect(() => {
        strokesRef.current = strokes;
    }, [strokes]);

    const handleUndo = useCallback(() => {
        setStrokes(prev => prev.slice(0, -1));
    }, []);

    const handleClear = useCallback(() => {
        setStrokes([]);
    }, []);

    const handleEraserToggle = useCallback(() => {
        setIsEraser(prev => !prev);
        setIsEyedropper(false);
    }, []);

    const handleEyedropperToggle = useCallback(() => {
        setIsEyedropper(prev => !prev);
        setIsEraser(false);
    }, []);

    const handleColorPick = useCallback((color: string) => {
        setBrushColor(color);
        setIsEyedropper(false);
        setIsEraser(false);
        onToast?.('Color picked! 🎨', 'success');
    }, [onToast]);

    const setBrushSizeSafe = useCallback((size: number) => {
        setBrushSize(size);
    }, []);

    return {
        brushColor,
        setBrushColor,
        brushSize,
        setBrushSize: setBrushSizeSafe,
        strokes,
        setStrokes,
        strokesRef,
        isEraser,
        isEyedropper,
        handleUndo,
        handleClear,
        handleEraserToggle,
        handleEyedropperToggle,
        handleColorPick,
        setIsEraser,
        setIsEyedropper
    };
};
