import React, { useState } from 'react';
import { vibrate } from '../../utils/haptics';

interface BentoToolbarProps {
    brushColor: string;
    brushSize: number;
    brushType?: string;
    isEraser: boolean;
    onColorChange: (color: string) => void;
    onSizeChange: (size: number) => void;
    onTypeChange?: (type: string) => void;
    onEraserToggle: () => void;
    onUndo: () => void;
    onClear: () => void;
    isEyedropper: boolean;
    onEyedropperToggle: () => void;

    // Unlocked items
    availableColors?: { id: string; name: string }[];
    availableBrushes?: { id: string; name: string; emoji: string }[];
}

const SIZES = [
    { label: 'S', size: 5, emoji: '•' },
    { label: 'M', size: 12, emoji: '●' },
    { label: 'L', size: 24, emoji: '⬤' },
];

export const BentoToolbar: React.FC<BentoToolbarProps> = ({
    brushColor,
    brushSize,
    brushType = 'default',
    isEraser,
    onColorChange,
    onSizeChange,
    onTypeChange,
    onEraserToggle,
    onUndo,
    onClear,
    isEyedropper,
    onEyedropperToggle,
    availableColors = [],
    availableBrushes = []
}) => {
    // Determine which colors to show (default if empty/undefined)
    const effectiveColors = availableColors.length > 0 ? availableColors.map(c => c.id) : [
        '#FFFFFF', '#000000', '#FF69B4', '#FF0000', '#FF8C00', '#FFE135', '#32CD32', '#00D9FF', '#4169E1', '#9B59B6'
    ];

    const [showSizes, setShowSizes] = useState(false);

    // Glass/Video Game UI Texture primitives
    const cardBase = "bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-1.5 flex flex-col gap-1.5 relative overflow-visible";
    const buttonBase = "relative flex items-center justify-center rounded-xl transition-all active:scale-90 duration-200 touch-manipulation";
    // Made active tool more obvious: brighter bg, larger scale, border
    const activeToolClass = "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.6)] ring-2 ring-white scale-110 z-20 font-black";
    const inactiveToolClass = "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10";

    return (
        <div className="w-full max-w-lg mx-auto pointer-events-auto grid grid-cols-6 gap-2 p-2 safe-area-bottom-padding select-none relative">

            {/* --- LEFT COLUMN: Utility (Size, Eyedropper, Clear) --- */}
            <div className={`col-span-1 ${cardBase} items-center justify-between`}>

                {/* Size Trigger */}
                <button
                    onClick={() => {
                        vibrate();
                        setShowSizes(!showSizes);
                    }}
                    className={`w-full aspect-square ${buttonBase} ${showSizes ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60'}`}
                    title="Brush Size"
                >
                    <span className="text-sm font-bold">
                        {SIZES.find(s => s.size === brushSize)?.label || 'M'}
                    </span>

                    {/* Size Popup - EXPANDS UP */}
                    {showSizes && (
                        <div className="absolute left-0 bottom-full mb-3 w-full bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-1.5 flex flex-col gap-2 shadow-2xl z-50 animate-fade-in origin-bottom">
                            {SIZES.map((s) => (
                                <button
                                    key={s.label}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        vibrate();
                                        onSizeChange(s.size);
                                        setShowSizes(false);
                                    }}
                                    className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${brushSize === s.size ? 'bg-white text-black font-bold' : 'text-white/60 hover:bg-white/20'}`}
                                >
                                    <span style={{ transform: `scale(${s.label === 'S' ? 0.8 : s.label === 'M' ? 1 : 1.2})` }}>
                                        ●
                                    </span>
                                </button>
                            )).reverse()} {/* Reverse to show Small at bottom near trigger if desired, or keep as is. Let's stack S-M-L bottom-up? Array is S,M,L. Flex-col. Map gives S top. Reverse gives L top. Let's keep S top? Or S close to finger? Usually S at bottom is better? Let's use reverse which puts L at top, S at bottom. */}
                        </div>
                    )}
                </button>

                {/* Eyedropper */}
                <button
                    onClick={() => {
                        vibrate();
                        onEyedropperToggle();
                    }}
                    className={`w-full aspect-square ${isEyedropper ? activeToolClass : inactiveToolClass} ${buttonBase}`}
                    title="Eyedropper"
                >
                    <span className="text-2xl">👁️</span>
                </button>

                {/* Clear */}
                <button
                    onClick={() => {
                        vibrate();
                        onClear();
                    }}
                    className={`w-full aspect-square ${buttonBase} bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20`}
                    title="Clear"
                >
                    <span className="text-2xl">🗑️</span>
                </button>
            </div>

            {/* --- CENTER COLUMN: Palette & Properties --- */}
            <div className={`col-span-4 ${cardBase} gap-2`}>

                {/* Colors Grid */}
                <div className="flex-1 bg-black/20 rounded-xl p-1.5 overflow-y-auto no-scrollbar grid grid-cols-5 gap-1.5 content-start h-[88px] touch-scroll-allowed">
                    {effectiveColors.map((color) => {
                        const isSelected = !isEraser && brushColor === color;
                        return (
                            <button
                                key={color}
                                onClick={() => {
                                    vibrate();
                                    onColorChange(color);
                                }}
                                className={`aspect-square rounded-full transition-all duration-200 ${isSelected ? 'scale-110 shadow-lg ring-2 ring-white z-10' : 'hover:scale-110 opacity-80 hover:opacity-100 ring-1 ring-white/20'}`}
                                style={{
                                    backgroundColor: color,
                                    // Removed logic for conditional border, now using tailwind rings for uniform high contrast
                                }}
                            />
                        );
                    })}
                </div>

                {/* Types Row (Icons Only) */}
                {availableBrushes.length > 0 && onTypeChange && (
                    <div className="h-10 bg-black/20 rounded-lg p-1 flex gap-1 overflow-x-auto no-scrollbar items-center">
                        {/* Default/Normal Brush */}
                        <button
                            onClick={() => {
                                vibrate();
                                onTypeChange('default');
                            }}
                            className={`h-full aspect-square rounded-md flex items-center justify-center transition-all ${brushType === 'default' && !isEraser ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                        >
                            <span className="text-lg">🖌️</span>
                        </button>

                        {availableBrushes.map((b) => (
                            <button
                                key={b.id}
                                onClick={() => {
                                    vibrate();
                                    onTypeChange(b.id);
                                }}
                                className={`h-full aspect-square rounded-md flex items-center justify-center transition-all ${brushType === b.id && !isEraser ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                                title={b.name}
                            >
                                <span className="text-lg">{b.emoji}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* --- RIGHT COLUMN: Core Tools (Brush, Eraser, Undo) --- */}
            <div className={`col-span-1 ${cardBase} items-center justify-between`}>
                {/* Brush (Reset) */}
                <button
                    onClick={() => {
                        vibrate();
                        if (isEraser) onEraserToggle();
                        if (isEyedropper) onEyedropperToggle();
                    }}
                    className={`w-full aspect-square ${!isEraser && !isEyedropper ? activeToolClass : inactiveToolClass} ${buttonBase}`}
                    title="Brush"
                >
                    <span className="text-3xl">🖌️</span>
                </button>

                {/* Eraser */}
                <button
                    onClick={() => {
                        vibrate();
                        onEraserToggle();
                    }}
                    className={`w-full aspect-square ${isEraser ? activeToolClass : inactiveToolClass} ${buttonBase}`}
                    title="Eraser"
                >
                    <span className="text-3xl">🧼</span>
                </button>

                {/* Undo */}
                <button
                    onClick={() => {
                        vibrate();
                        onUndo();
                    }}
                    className={`w-full aspect-square ${buttonBase} bg-white/5 border border-white/5 text-white/80 hover:bg-white/10`}
                    title="Undo"
                >
                    <span className="text-2xl">↩️</span>
                </button>
            </div>

        </div>
    );
}
