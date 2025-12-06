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
        <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
            {/* Colors - Grid Overlay */}
            <div className="bg-white rounded-2xl p-3 shadow-xl border-2 border-purple-500 w-full animate-slide-up">
                <div className="grid grid-cols-5 gap-2 justify-items-center">
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => {
                                vibrate();
                                onColorChange(color);
                            }}
                            className={`w-8 h-8 rounded-full transition-all flex-shrink-0 ${!isEraser && brushColor === color
                                ? 'scale-125 ring-3 ring-purple-400 ring-offset-2'
                                : 'hover:scale-110'
                                }`}
                            style={{
                                backgroundColor: color,
                                border: color === '#FFFFFF' ? '2px solid #ccc' : '2px solid rgba(0,0,0,0.1)',
                                boxShadow: !isEraser && brushColor === color ? '0 0 10px rgba(155, 89, 182, 0.5)' : 'none',
                                width: '32px',
                                height: '32px',
                                minWidth: '32px',
                                minHeight: '32px'
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-2xl p-2 flex items-center justify-between gap-2 w-full shadow-lg border-2 border-purple-200">
                {/* Sizes */}
                <div className="flex gap-1 pr-2 border-r-2 border-gray-100">
                    {SIZES.map((s) => (
                        <button
                            key={s.label}
                            onClick={() => {
                                vibrate();
                                onSizeChange(s.size);
                            }}
                            className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${brushSize === s.size
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                }`}
                        >
                            {s.emoji}
                        </button>
                    ))}
                </div>

                {/* Tools */}
                <div className="flex justify-between items-center bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                vibrate();
                                onUndo();
                            }}
                            className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-xl active:scale-95 transition-transform"
                            title="Undo"
                        >
                            ↩️
                        </button>
                        <button
                            onClick={() => {
                                vibrate();
                                onClear();
                            }}
                            className="w-12 h-12 bg-red-100 text-red-600 rounded-xl shadow-lg flex items-center justify-center text-xl active:scale-95 transition-transform"
                            title="Clear All"
                        >
                            🗑️
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                vibrate();
                                onEyedropperToggle();
                            }}
                            className={`w-12 h-12 rounded-xl shadow-lg flex items-center justify-center text-xl active:scale-95 transition-all border-2 ${isEyedropper
                                ? 'bg-cyan-100 border-cyan-500 scale-110'
                                : 'bg-white border-transparent'
                                }`}
                            title="Eyedropper"
                        >
                            👁️
                        </button>
                        <button
                            onClick={() => {
                                vibrate();
                                onEraserToggle();
                            }}
                            className={`w-12 h-12 rounded-xl shadow-lg flex items-center justify-center text-xl active:scale-95 transition-all border-2 ${isEraser
                                ? 'bg-pink-100 border-pink-500 scale-110'
                                : 'bg-white border-transparent'
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

