import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { DrawingStroke } from '../../types';
import { vibrate, HapticPatterns } from '../../utils/haptics';
import { renderStrokeToContext } from '../../utils/drawingRenderer';
import { usePerfRenderCounter } from '../../utils/perf';

interface GameCanvasProps {
    imageUrl: string;
    brushColor: string;
    brushSize: number;
    brushType?: string;
    isDrawingEnabled: boolean;
    strokes: DrawingStroke[];
    onStrokesChange: (strokes: DrawingStroke[]) => void;
    isEraser?: boolean;
    isEyedropper?: boolean;
    onColorPick?: (color: string) => void;
    zoomScale?: number;
    sabotageType?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
    imageUrl,
    brushColor,
    brushSize,
    brushType = 'default',
    isDrawingEnabled,
    strokes,
    onStrokesChange,
    isEraser = false,
    isEyedropper = false,
    onColorPick,
    zoomScale: _zoomScale = 1,
    sabotageType
}) => {
    usePerfRenderCounter('GameCanvas');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const currentStrokeRef = useRef<DrawingStroke | null>(null);
    const isDrawingRef = useRef(false);
    const drawFrameRef = useRef<number | null>(null);
    
    // Track active touch count to prevent drawing during multi-touch gestures
    const touchCountRef = useRef(0);

    // No internal image canvas needed for display, only for eyedropper color picking
    // But we still need to load the image into a hidden canvas if we want to pick colors from it.
    // We can keep imageCanvasRef logic.
    const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!imageUrl) return;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                imageCanvasRef.current = canvas;
            }
        };
    }, [imageUrl]);

    const drawAll = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const toScreen = (p: { x: number, y: number }) => ({
            x: (p.x / 100) * width,
            y: (p.y / 100) * height
        });

        const renderStroke = (stroke: DrawingStroke) => {
            if (stroke.points.length === 0) return;

            const points = stroke.points.map(toScreen);
            renderStrokeToContext(ctx, stroke, points);
        };

        strokes.forEach(renderStroke);

        if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
            renderStroke(currentStrokeRef.current);
        }

        // Restore context
        ctx.globalCompositeOperation = 'source-over';
    }, [strokes]);

    const scheduleDraw = useCallback(() => {
        if (drawFrameRef.current !== null) return;
        drawFrameRef.current = window.requestAnimationFrame(() => {
            drawFrameRef.current = null;
            drawAll();
        });
    }, [drawAll]);

    // Handle resize - match resolution to container size
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resizeCanvas = () => {
            // Simply match the container's size (controlled by parent CSS)
            const width = container.clientWidth;
            const height = container.clientHeight;
            const maxDpr = Math.min(window.devicePixelRatio || 1, 2);
            const nextWidth = Math.round(width * maxDpr);
            const nextHeight = Math.round(height * maxDpr);

            if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
                canvas.width = nextWidth;
                canvas.height = nextHeight;
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
                scheduleDraw();
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [scheduleDraw]);

    // Draw when strokes change
    useEffect(() => {
        scheduleDraw();
    }, [scheduleDraw]);

    useEffect(() => {
        return () => {
            if (drawFrameRef.current !== null) {
                window.cancelAnimationFrame(drawFrameRef.current);
            }
        };
    }, []);

    const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;

        // Apply Sabotage: Visual Distortion (Shake & Blur)
        if (sabotageType === 'visual_distortion') {
            const jitterAmount = 1.5; // % of canvas size
            x += (Math.random() - 0.5) * jitterAmount;
            y += (Math.random() - 0.5) * jitterAmount;
        }

        return { x, y };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        // Track touch count for multi-touch detection
        if ('touches' in e) {
            touchCountRef.current = e.touches.length;
            // Don't start drawing if multiple fingers are touching
            if (e.touches.length > 1) {
                // Cancel any in-progress drawing
                if (isDrawing) {
                    setIsDrawing(false);
                    isDrawingRef.current = false;
                    currentStrokeRef.current = null;
                    scheduleDraw();
                }
                return;
            }
        }
        
        if (!isDrawingEnabled && !isEyedropper) return;
        if ('touches' in e) e.preventDefault();
        vibrate(HapticPatterns.soft);
        const point = getPoint(e);

        if (isEyedropper && onColorPick) {
            // Eyedropper logic remains same...
            const canvas = canvasRef.current;
            const imgCanvas = imageCanvasRef.current;
            if (!canvas) return;
            // 1. Try picking from strokes
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const x = (point.x / 100) * canvas.width;
                const y = (point.y / 100) * canvas.height;
                const p = ctx.getImageData(x, y, 1, 1).data;
                if (p[3] > 0) {
                    const hex = "#" + [p[0], p[1], p[2]].map(x => x.toString(16).padStart(2, '0')).join('');
                    onColorPick(hex);
                    return;
                }
            }
            // 2. Try picking from image
            if (imgCanvas) {
                const ctx = imgCanvas.getContext('2d');
                if (ctx) {
                    const x = (point.x / 100) * imgCanvas.width;
                    const y = (point.y / 100) * imgCanvas.height;
                    const p = ctx.getImageData(x, y, 1, 1).data;
                    /* Check for alpha in image too, though usually opaque */
                    if (p[3] > 0) {
                        const hex = "#" + [p[0], p[1], p[2]].map(x => x.toString(16).padStart(2, '0')).join('');
                        onColorPick(hex);
                        return;
                    }
                }
            }

            // 3. Fallback to White (Background)
            // If we hit nothing (transparent), we assume we hit the paper which is white.
            onColorPick('#FFFFFF');
            return;
        }

        setIsDrawing(true);
        isDrawingRef.current = true;
        currentStrokeRef.current = {
            color: brushColor,
            size: brushSize,
            points: [point],
            isEraser,
            type: brushType // Use prop
        };
        scheduleDraw();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        // Update touch count and cancel drawing if multi-touch detected
        if ('touches' in e) {
            touchCountRef.current = e.touches.length;
            if (e.touches.length > 1) {
                // Cancel in-progress drawing when second finger touches
                if (isDrawing) {
                    setIsDrawing(false);
                    isDrawingRef.current = false;
                    currentStrokeRef.current = null;
                    scheduleDraw();
                }
                return;
            }
        }
        
        if (!isDrawingRef.current || !currentStrokeRef.current) return;
        e.preventDefault();
        const point = getPoint(e);
        currentStrokeRef.current.points.push(point);
        scheduleDraw();
    };

    const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
        // Update touch count
        if (e && 'touches' in e) {
            touchCountRef.current = e.touches.length;
        }
        
        if (!isDrawingRef.current) return;
        setIsDrawing(false);
        isDrawingRef.current = false;
        if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
            onStrokesChange([...strokes, currentStrokeRef.current]);
        }
        currentStrokeRef.current = null;
        scheduleDraw();
    };

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full touch-none"
            style={{
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                zIndex: 20
            }}
        >
            <canvas
                ref={canvasRef}
                className={`w-full h-full block touch-none ${isEyedropper ? 'cursor-cell' : 'cursor-crosshair'}`}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
            />
        </div>
    );
};
