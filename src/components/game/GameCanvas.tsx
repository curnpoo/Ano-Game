import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { DrawingStroke } from '../../types';

interface GameCanvasProps {
    imageUrl: string;
    brushColor: string;
    brushSize: number;
    isDrawingEnabled: boolean;
    onStrokesChange: (strokes: DrawingStroke[]) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
    imageUrl,
    brushColor,
    brushSize,
    isDrawingEnabled,
    onStrokesChange,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);

    // Initialize canvas size and image
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resizeCanvas = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            // Redraw everything after resize
            drawAll();
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [imageUrl]);

    const drawAll = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw all completed strokes (convert from percentage to pixels)
        strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.size;
            ctx.moveTo(stroke.points[0].x / 100 * width, stroke.points[0].y / 100 * height);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x / 100 * width, stroke.points[i].y / 100 * height);
            }
            ctx.stroke();
        });

        // Draw current stroke
        if (currentStroke && currentStroke.points.length >= 2) {
            ctx.beginPath();
            ctx.strokeStyle = currentStroke.color;
            ctx.lineWidth = currentStroke.size;
            ctx.moveTo(currentStroke.points[0].x / 100 * width, currentStroke.points[0].y / 100 * height);
            for (let i = 1; i < currentStroke.points.length; i++) {
                ctx.lineTo(currentStroke.points[i].x / 100 * width, currentStroke.points[i].y / 100 * height);
            }
            ctx.stroke();
        }
    }, [strokes, currentStroke]);

    useEffect(() => {
        drawAll();
    }, [drawAll]);

    // Get point as percentage of canvas
    const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        // Store as percentage (0-100)
        return {
            x: ((clientX - rect.left) / rect.width) * 100,
            y: ((clientY - rect.top) / rect.height) * 100
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawingEnabled) return;
        e.preventDefault(); // Prevent scroll on touch
        setIsDrawing(true);
        const point = getPoint(e);
        setCurrentStroke({
            color: brushColor,
            size: brushSize,
            points: [point]
        });
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !currentStroke) return;
        e.preventDefault();
        const point = getPoint(e);
        setCurrentStroke(prev => prev ? {
            ...prev,
            points: [...prev.points, point]
        } : null);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentStroke) {
            const newStrokes = [...strokes, currentStroke];
            setStrokes(newStrokes);
            onStrokesChange(newStrokes);
            setCurrentStroke(null);
        }
    };

    return (
        <div ref={containerRef} className="absolute inset-0 touch-none select-none overflow-hidden">
            {/* Drawing Layer - transparent canvas on top */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>
    );
};
