import React from 'react';
import type { Player } from '../../types';
import { AvatarDisplay } from '../common/AvatarDisplay';

interface SaboteurPanelProps {
    players: Player[];
    currentPlayerId: string;
    uploaderId: string;
    onSelectTarget: (targetId: string) => void;
    selectedTargetId?: string;
}

export const SaboteurPanel: React.FC<SaboteurPanelProps> = ({
    players,
    currentPlayerId,
    uploaderId,
    onSelectTarget,
    selectedTargetId
}) => {
    // Eligible targets: everyone except saboteur and uploader
    const eligibleTargets = players.filter(
        p => p.id !== currentPlayerId && p.id !== uploaderId
    );

    if (eligibleTargets.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-4 z-50 animate-slide-up">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-3">
                    <span className="text-2xl">🕵️</span>
                    <h3 className="font-bold text-lg">You're the Saboteur!</h3>
                    <p className="text-sm text-red-200">Pick someone to mess with when they start drawing</p>
                </div>

                <div className="flex justify-center gap-3 flex-wrap">
                    {eligibleTargets.map(player => (
                        <button
                            key={player.id}
                            onClick={() => onSelectTarget(player.id)}
                            className={`flex flex-col items-center p-3 rounded-xl transition-all ${selectedTargetId === player.id
                                    ? 'bg-white text-red-600 scale-110 shadow-lg'
                                    : 'bg-red-700 hover:bg-red-500'
                                }`}
                        >
                            <div className="w-12 h-12 mb-1">
                                <AvatarDisplay
                                    strokes={player.avatarStrokes}
                                    avatar={player.avatar}
                                    frame={player.frame}
                                    size={48}
                                    color={player.color}
                                />
                            </div>
                            <span className="text-xs font-bold truncate max-w-[60px]">
                                {player.name}
                            </span>
                        </button>
                    ))}
                </div>

                {selectedTargetId && (
                    <div className="text-center mt-3 text-sm text-red-200 animate-pulse">
                        ✓ Target locked! They'll get sabotaged when they start drawing.
                    </div>
                )}
            </div>
        </div>
    );
};
