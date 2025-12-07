import React, { useState } from 'react';
import { CurrencyService, formatCurrency } from '../../services/currency';
import { XPService } from '../../services/xp';
import { AvatarDisplay } from '../common/AvatarDisplay';
import { AdminModal } from '../common/AdminModal';
import type { Player } from '../../types';

interface HomeScreenProps {
    player: Player;
    onPlay: () => void;
    onProfile: () => void;
    onSettings: () => void;
    onStore: () => void;
    onCasino: () => void;
    lastGameDetails?: {
        roomCode: string;
        hostName: string;
        playerCount: number;
    } | null;
    onRejoin?: (code: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
    player,
    onPlay,
    onProfile,
    onSettings,
    onStore,
    onCasino,
    lastGameDetails,
    onRejoin
}) => {
    const balance = CurrencyService.getCurrency();
    const [showAdminModal, setShowAdminModal] = useState(false);

    const cards = [
        {
            id: 'play',
            label: 'PLAY',
            emoji: '🎮',
            color: 'from-green-400 to-emerald-600',
            border: 'border-green-500',
            onClick: onPlay,
            description: 'Start a game'
        },
        {
            id: 'casino',
            label: 'CASINO',
            emoji: '🎰',
            color: 'from-yellow-400 to-orange-500',
            border: 'border-yellow-500',
            onClick: onCasino,
            description: 'Try your luck'
        },
        {
            id: 'store',
            label: 'STORE',
            emoji: '🛒',
            color: 'from-purple-400 to-purple-600',
            border: 'border-purple-500',
            onClick: onStore,
            description: 'Buy cosmetics'
        },
        {
            id: 'profile',
            label: 'PROFILE',
            emoji: '👤',
            color: 'from-blue-400 to-blue-600',
            border: 'border-blue-500',
            onClick: onProfile,
            description: 'Customize avatar'
        },
        {
            id: 'settings',
            label: 'SETTINGS',
            emoji: '⚙️',
            color: 'from-gray-400 to-gray-600',
            border: 'border-gray-500',
            onClick: onSettings,
            description: 'App settings'
        }
    ];

    // Admin Card
    if (player.name.trim().toLowerCase() === 'curren') {
        cards.push({
            id: 'admin',
            label: 'ADMIN',
            emoji: '⚠️',
            color: 'from-red-400 to-red-600',
            border: 'border-red-500',
            onClick: () => setShowAdminModal(true),
            description: 'God Mode'
        });
    }

    return (
        <div
            className="min-h-screen flex flex-col p-4"
            style={{
                paddingTop: 'max(1.5rem, env(safe-area-inset-top) + 1rem)',
                paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom) + 1rem)'
            }}
        >
            {/* Header with player info - Profile Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] p-6 shadow-xl mb-8 relative overflow-hidden"
                style={{
                    backgroundColor: 'var(--theme-card-bg)',
                    border: '2px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                }}>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-20 h-20">
                        <AvatarDisplay
                            strokes={player.avatarStrokes}
                            avatar={player.avatar}
                            frame={player.frame}
                            color={player.color}
                            size={80}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-2xl font-black">{player.name}</h2>
                            <div className="text-xl font-bold text-[#FFD700] drop-shadow-sm">{formatCurrency(balance)}</div>
                        </div>
                        {/* Level & XP */}
                        <div className="flex items-center gap-3">
                            <span className="bg-[#FFD700] text-black text-xs font-black px-2 py-1 rounded-lg">
                                LVL {XPService.getLevel()}
                            </span>
                            <div className="flex-1 bg-black/20 rounded-full h-3 overflow-hidden border border-white/10">
                                <div
                                    className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] h-full transition-all duration-300"
                                    style={{ width: `${XPService.getLevelProgress()}%` }}
                                    role="progressbar"
                                    aria-valuenow={XPService.getLevelProgress()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation Cards */}
            <div className="flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
                    {/* Large Play Button - spans 2 columns */}
                    <button
                        onClick={onPlay}
                        className="col-span-2 rounded-[2rem] p-8 shadow-2xl border-4 transform transition-all duration-200 hover:scale-[1.02] active:scale-95 group relative overflow-hidden"
                        style={{
                            backgroundColor: 'var(--theme-card-bg)', // Keep card bg
                            borderColor: 'var(--theme-accent)',
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-accent)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="text-6xl mb-2 group-hover:rotate-12 transition-transform duration-300">🎮</div>
                        <div className="text-4xl font-black text-[var(--theme-text)] drop-shadow-sm">PLAY</div>
                        <div className="text-[var(--theme-text-secondary)] font-bold text-sm">Start a new game</div>
                    </button>

                    {/* Secondary Actions */}
                    {[
                        { id: 'casino', label: 'CASINO', emoji: '🎰', onClick: onCasino },
                        { id: 'store', label: 'STORE', emoji: '🛒', onClick: onStore },
                        { id: 'profile', label: 'PROFILE', emoji: '👤', onClick: onProfile },
                        { id: 'settings', label: 'SETTINGS', emoji: '⚙️', onClick: onSettings }
                    ].map(card => (
                        <button
                            key={card.id}
                            onClick={card.onClick}
                            className="bg-white rounded-[1.5rem] p-4 shadow-lg border-2 transform transition-all duration-200 hover:scale-[1.03] active:scale-95 flex flex-col items-center justify-center gap-1"
                            style={{
                                backgroundColor: 'var(--theme-card-bg)',
                                borderColor: 'var(--theme-border)',
                                color: 'var(--theme-text)'
                            }}
                        >
                            <div className="text-3xl mb-1">{card.emoji}</div>
                            <div className="text-sm font-bold opacity-90">{card.label}</div>
                        </button>
                    ))}

                    {/* Rejoin Card (6th Card) */}
                    {lastGameDetails && onRejoin && (
                        <button
                            onClick={() => onRejoin(lastGameDetails.roomCode)}
                            className="col-span-2 bg-white rounded-[1.5rem] p-4 shadow-lg border-2 border-orange-200 flex items-center justify-between group active:scale-95 transition-all mt-2"
                            style={{
                                backgroundColor: 'var(--theme-card-bg)',
                                borderColor: 'var(--theme-accent)'
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100/20 rounded-full flex items-center justify-center text-xl group-hover:rotate-12 transition-transform">
                                    🔙
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-bold text-[var(--theme-accent)] uppercase tracking-wider">Rejoin Game</div>
                                    <div className="text-[var(--theme-text)] font-bold">{lastGameDetails.hostName}'s Game</div>
                                    <div className="text-xs text-[var(--theme-text-secondary)]">{lastGameDetails.playerCount} Players • {lastGameDetails.roomCode}</div>
                                </div>
                            </div>
                            <div className="text-[var(--theme-accent)] font-bold text-sm">Join →</div>
                        </button>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[var(--theme-text-secondary)] text-xs font-bold tracking-widest opacity-50 mt-8">
                ANTIGRAVITY GAMES
            </div>

            {/* Admin Modal */}
            {showAdminModal && (
                <AdminModal onClose={() => setShowAdminModal(false)} />
            )}
        </div>
    );
};
