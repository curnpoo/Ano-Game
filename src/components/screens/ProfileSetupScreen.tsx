import React, { useState } from 'react';
import type { Player, DrawingStroke } from '../../types';
import { GameCanvas } from '../game/GameCanvas';

interface ProfileSetupScreenProps {
    onComplete: (player: Omit<Player, 'id' | 'joinedAt' | 'lastSeen'>) => void;
    initialName?: string;
}

const COLORS = ['#FF69B4', '#9B59B6', '#3498DB', '#1ABC9C', '#F1C40F', '#E67E22', '#E74C3C', '#34495E', '#000000'];
const FRAMES = [
    { id: 'none', name: 'Simple', class: '' },
    { id: 'glow', name: 'Glow', class: 'shadow-[0_0_15px_currentColor]' },
    { id: 'border', name: 'Bold', class: 'border-4 border-current' },
    { id: 'dash', name: 'Dash', class: 'border-4 border-dashed border-current' },
    { id: 'double', name: 'Double', class: 'border-double border-8 border-current' },
    { id: 'ring', name: 'Ring', class: 'ring-4 ring-current ring-offset-2' }
];

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onComplete, initialName = '' }) => {
    const [name, setName] = useState(initialName);
    const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
    const [color, setColor] = useState(COLORS[0]);
    const [frame, setFrame] = useState(FRAMES[0].id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onComplete({
                name: name.trim(),
                avatarStrokes: strokes,
                color,
                frame: FRAMES.find(f => f.id === frame)?.class || ''
            });
        }
    };

    const handleClear = () => {
        setStrokes([]);
    };

    const handleUndo = () => {
        setStrokes(prev => prev.slice(0, -1));
    };

    return (
        <div className="min-h-screen bg-90s-pattern flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md border-4 border-purple-500 pop-in max-h-[90vh] overflow-y-auto">
                <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                    Draw Your Avatar!
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">NAME</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-lg font-bold text-center"
                            maxLength={12}
                            autoFocus
                        />
                    </div>

                    {/* Drawing Canvas */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">DRAW YOUR FACE</label>
                        <div className="flex justify-center mb-2">
                            <div
                                className={`w-48 h-48 rounded-full bg-white overflow-hidden relative shadow-sm ${FRAMES.find(f => f.id === frame)?.class}`}
                                style={{ color: color, border: '2px solid #eee' }}
                            >
                                <GameCanvas
                                    imageUrl={TRANSPARENT_PIXEL}
                                    brushColor={color}
                                    brushSize={5}
                                    isDrawingEnabled={true}
                                    strokes={strokes}
                                    onStrokesChange={setStrokes}
                                />
                            </div>
                        </div>
                        <div className="flex justify-center gap-2 mb-4">
                            <button
                                type="button"
                                onClick={handleUndo}
                                className="px-3 py-1 bg-gray-200 rounded-lg text-sm font-bold hover:bg-gray-300"
                                disabled={strokes.length === 0}
                            >
                                ↩ Undo
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200"
                                disabled={strokes.length === 0}
                            >
                                🗑️ Clear
                            </button>
                        </div>
                    </div>

                    {/* Color Grid */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">COLOR</label>
                        <div className="flex justify-between gap-2 flex-wrap">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-4 ring-offset-2 ring-gray-400' : ''}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Frame Grid */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">FRAME</label>
                        <div className="grid grid-cols-3 gap-2">
                            {FRAMES.map(f => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setFrame(f.id)}
                                    className={`px-2 py-1 rounded-lg text-sm font-bold transition-colors ${frame === f.id ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full btn-90s bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed jelly-hover"
                    >
                        START PLAYING! 🚀
                    </button>
                </form>
            </div>
        </div>
    );
};
