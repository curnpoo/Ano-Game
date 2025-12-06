import React, { useState } from 'react';
import type { Player } from '../../types';
import { UNLOCKABLE_BRUSHES, BADGES } from '../../constants/cosmetics';

interface PlayerCosmeticsPanelProps {
    player: Player;
    onUpdateCosmetics: (type: 'brush', id: string) => void;
    onClose: () => void;
}

export const PlayerCosmeticsPanel: React.FC<PlayerCosmeticsPanelProps> = ({
    player,
    onUpdateCosmetics,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<'brushes' | 'badges'>('brushes');

    const unlockedBrushes = player.cosmetics?.brushesUnlocked || ['default'];
    const playerBadges = player.cosmetics?.badges || [];

    const activeBrush = player.cosmetics?.activeBrush || 'default';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] pop-in border-4 border-purple-500">
                {/* Header */}
                <div className="bg-purple-100 p-4 flex justify-between items-center border-b border-purple-200">
                    <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
                        <span>✨</span> Style Shop
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white text-gray-500 font-bold hover:bg-red-100 hover:text-red-500 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 bg-purple-50 gap-2">
                    {(['brushes', 'badges'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 rounded-xl font-bold text-sm capitalize transition-all ${activeTab === tab
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'bg-white text-purple-400 hover:bg-purple-100'
                                }`}
                        >
                            {tab === 'brushes' ? '🖌️ Brushes' : '🏅 Badges'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[300px]">
                    {activeTab === 'brushes' && (
                        <div className="grid grid-cols-2 gap-3">
                            {UNLOCKABLE_BRUSHES.map(brush => {
                                const isUnlocked = unlockedBrushes.includes(brush.id);
                                const isActive = activeBrush === brush.id;

                                return (
                                    <button
                                        key={brush.id}
                                        disabled={!isUnlocked}
                                        onClick={() => onUpdateCosmetics('brush', brush.id)}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${isActive
                                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                            : isUnlocked
                                                ? 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'
                                                : 'border-gray-100 bg-gray-50 opacity-60 grayscale'
                                            }`}
                                    >
                                        <div className="text-4xl mb-1">{brush.emoji}</div>
                                        <div className="font-bold text-sm text-gray-700">{brush.name}</div>
                                        {!isUnlocked && <div className="text-xs text-gray-400">🔒 Locked</div>}
                                        {isActive && <div className="text-xs text-purple-600 font-bold">Selected</div>}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'badges' && (
                        <div className="space-y-3">
                            {BADGES.map(badge => {
                                const hasBadge = playerBadges.includes(badge.id);

                                return (
                                    <div
                                        key={badge.id}
                                        className={`flex items-center gap-4 p-3 rounded-2xl border-2 ${hasBadge
                                            ? 'border-purple-100 bg-purple-50'
                                            : 'border-gray-100 bg-gray-50 opacity-50'
                                            }`}
                                    >
                                        <div className="text-4xl w-12 text-center">{badge.emoji}</div>
                                        <div>
                                            <div className="font-bold text-gray-800 flex items-center gap-2">
                                                {badge.name}
                                                {!hasBadge && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Locked</span>}
                                            </div>
                                            <div className="text-xs text-gray-500">{badge.description}</div>
                                        </div>
                                    </div>
                                );
                            })}

                            {playerBadges.length === 0 && (
                                <div className="text-center text-gray-400 py-8">
                                    <div className="text-4xl mb-2">🎁</div>
                                    <p>Play games to unlock badges!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
