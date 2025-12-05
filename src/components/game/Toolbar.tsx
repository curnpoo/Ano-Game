import React from 'react';
import { vibrate } from '../../utils/haptics';

interface ToolbarProps {
    brushColor: string;
    brushSize: number;
    isEraser: boolean;
    onColorChange: (color: string) => void;
    onSizeChange: (size: number) => void;
    onEraserToggle: () => void;
    onUndo: () => void;
    onClear: () => void;
}

const COLORS = [
    '#FF69B4', // Hot Pink
    '#FF0000', // Red
    '#FF8C00', // Orange
    '#FFE135', // Yellow
    '#32CD32', // Lime Green
    '#00D9FF', // Cyan
    '#4169E1', // Blue
    '#9B59B6', // Purple
    '#000000', // Black
];

const SIZES = [
    { label: 'S', size: 5, emoji: '•' },
    { label: 'M', size: 12, emoji: '●' },
    { label: 'L', size: 24, emoji: '⬤' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
    brushColor,
    brushSize,
    isEraser,
    onColorChange,
    onSizeChange,
    onEraserToggle,
    onUndo,
    onClear,
}) => {
    return (
        <div className="rounded-2xl p-2 flex items-center gap-2 w-full max-w-md overflow-x-auto"
            style={{
                background: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                border: '3px solid #9B59B6'
            }}>

            {/* Sizes */}
            <div className="flex gap-1 pr-2 border-r-2 border-gray-200">
                {SIZES.map((s) => (
                    <button
                        key={s.label}
                        onClick={() => {
                            vibrate();
                            onSizeChange(s.size);
                        }}
                        className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center transition-all ${brushSize === s.size
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {s.emoji}
                    </button>
                ))}
            </div>

            {/* Colors */}
            <div className="flex gap-1 flex-1 overflow-x-auto py-1">
                {COLORS.map((color) => (
                    <button
                        key={color}
                        onClick={() => {
                            vibrate();
                            onColorChange(color);
                            if (isEraser) onEraserToggle(); // Turn off eraser when color selected
                        }}
                        className={`w-7 h-7 rounded-full transition-all flex-shrink-0 ${!isEraser && brushColor === color
                            ? 'scale-125 ring-3 ring-purple-400 ring-offset-2'
                            : 'hover:scale-110'
                            }`}
                        style={{
                            backgroundColor: color,
                            border: '2px solid rgba(0,0,0,0.1)'
                        }}
                    />
                ))}
            </div>

            {/* Eraser Toggle */}
            <button
                onClick={() => {
                    vibrate();
                    onEraserToggle();
                }}
                className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center transition-all ${isEraser
                    ? 'bg-pink-500 text-white scale-110'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                title="Eraser"
            >
                🧽
            </button>

            {/* Actions */}
            <div className="flex gap-1 pl-2 border-l-2 border-gray-200">
                <button
                    onClick={() => {
                        vibrate();
                        onUndo();
                    }}
                    className="w-9 h-9 rounded-xl bg-yellow-100 text-lg flex items-center justify-center transition-all hover:bg-yellow-200 active:scale-95"
                    title="Undo"
                >
                    ↩️
                </button>
                <button
                    onClick={() => {
                        vibrate();
                        onClear();
                    }}
                    className="w-9 h-9 rounded-xl bg-red-100 text-lg flex items-center justify-center transition-all hover:bg-red-200 active:scale-95"
                    title="Clear All"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};
