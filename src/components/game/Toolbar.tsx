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
    isEyedropper: boolean;
    onEyedropperToggle: () => void;
}

const COLORS = [
    '#FFFFFF', // White
    '#000000', // Black
    '#FF69B4', // Hot Pink
    '#FF0000', // Red
    '#FF8C00', // Orange
    '#FFE135', // Yellow
    '#32CD32', // Lime Green
    '#00D9FF', // Cyan
    '#4169E1', // Blue
    '#9B59B6', // Purple
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
    isEyedropper,
    onEyedropperToggle
}) => {
    return (
        <div className="flex flex-col items-center gap-2 w-full max-w-md mx-auto pb-safe">
            {/* Colors - Compact Horizontal Scroll */}
            <div className="bg-white rounded-xl p-2 shadow-xl border-2 border-purple-500 w-full animate-slide-up overflow-x-auto no-scrollbar">
                <div className="flex gap-2 justify-between min-w-min px-1">
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => {
                                vibrate();
                                onColorChange(color);
                            }}
                            className={`w-7 h-7 rounded-full transition-all flex-shrink-0 ${!isEraser && brushColor === color
                                ? 'scale-125 ring-2 ring-purple-400 ring-offset-1'
                                : 'hover:scale-110'
                                }`}
                            style={{
                                backgroundColor: color,
                                border: color === '#FFFFFF' ? '1px solid #ccc' : '1px solid rgba(0,0,0,0.1)',
                                boxShadow: !isEraser && brushColor === color ? '0 0 8px rgba(155, 89, 182, 0.5)' : 'none'
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Controls Bar - Compact */}
            <div className="bg-white rounded-xl p-1.5 flex items-center justify-between gap-1 w-full shadow-lg border-2 border-purple-200">
                {/* Sizes */}
                <div className="flex gap-0.5 pr-1 border-r border-gray-100">
                    {SIZES.map((s) => (
                        <button
                            key={s.label}
                            onClick={() => {
                                vibrate();
                                onSizeChange(s.size);
                            }}
                            className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-sm transition-all ${brushSize === s.size
                                ? 'bg-purple-500 text-white shadow-sm'
                                : 'bg-gray-50 text-gray-400 active:bg-gray-100'
                                }`}
                        >
                            {s.emoji}
                        </button>
                    ))}
                </div>

                <div className="flex gap-1 flex-1 justify-end">
                    {/* Undo/Clear Group */}
                    <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                vibrate();
                                onUndo();
                            }}
                            className="w-9 h-9 bg-white rounded-md shadow-sm flex items-center justify-center text-lg active:scale-95 border border-gray-200"
                            title="Undo"
                        >
                            ↩️
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                vibrate();
                                onClear();
                            }}
                            className="w-9 h-9 bg-red-50 text-red-600 rounded-md shadow-sm flex items-center justify-center text-lg active:scale-95 border border-red-100"
                            title="Clear All"
                        >
                            🗑️
                        </button>
                    </div>

                    {/* Tools Group */}
                    <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                vibrate();
                                onEyedropperToggle();
                            }}
                            className={`w-9 h-9 rounded-md shadow-sm flex items-center justify-center text-lg active:scale-95 border transition-all ${isEyedropper
                                ? 'bg-cyan-100 border-cyan-400 text-cyan-700'
                                : 'bg-white border-gray-200'
                                }`}
                            title="Eyedropper"
                        >
                            👁️
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                vibrate();
                                onEraserToggle();
                            }}
                            className={`w-9 h-9 rounded-md shadow-sm flex items-center justify-center text-lg active:scale-95 border transition-all ${isEraser
                                ? 'bg-pink-100 border-pink-400 text-pink-700'
                                : 'bg-white border-gray-200'
                                }`}
                            title="Eraser"
                        >
                            🧼
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

