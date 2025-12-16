import React, { useState, useEffect } from 'react';
import { ProfileStatusCard } from '../common/ProfileStatusCard';
import { FriendsPanel } from '../common/FriendsPanel';
import { AdminModal } from '../common/AdminModal';
import { HelpGuideOverlay } from '../common/HelpGuideOverlay';
import { GuestSignUpModal } from '../common/GuestSignUpModal';
import { AuthService } from '../../services/auth';
import type { Player } from '../../types';

interface HomeScreenProps {
    player: Player;
    onPlay: () => void;
    onProfile: () => void;
    onSettings: () => void;
    onStore: () => void;
    onCasino: () => void;
    onLevelProgress: () => void;
    onGallery: () => void;
    lastGameDetails?: {
        roomCode: string;
        hostName: string;
        playerCount: number;
    } | null;
    onRejoin?: (code: string) => void;
    onRegister: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
    player,
    onPlay,
    onProfile,
    onSettings,
    onStore,
    onCasino,
    onLevelProgress,
    onGallery,
    lastGameDetails,
    onRejoin,
    onRegister
}) => {
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showHelpGuide, setShowHelpGuide] = useState(false);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Helper for admin button
    const isAdmin = player.name.trim().toLowerCase() === 'curren';
    const isGuest = !AuthService.isLoggedIn();

    const handleRestrictedAction = (action: () => void) => {
        if (isGuest) {
            setShowGuestModal(true);
        } else {
            action();
        }
    };

    return (
        <div
            className={`fixed inset-0 overflow-y-auto overflow-x-hidden flex flex-col items-center select-none ${mounted ? 'pop-in' : 'opacity-0'}`}
            style={{
                background: 'transparent',
                paddingTop: 'max(1rem, env(safe-area-inset-top))',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            }}
        >
            {/* Color Accents (decorative glow) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[120px] animate-[pulse_15s_ease-in-out_infinite_-2s]" />
            </div>

            {/* Content Container */}
            <div className="flex-1 w-full max-w-md flex flex-col z-10 p-5 gap-4 min-h-full relative justify-center">

                {/* Top Section: Profile Only */}
                <div className="flex flex-col gap-2.5 shrink-0">
                    <div 
                        onClick={(e) => {
                            if (isGuest) {
                                e.stopPropagation();
                                setShowGuestModal(true);
                            }
                        }}
                        className={`relative ${isGuest ? 'cursor-pointer' : ''}`}
                    >
                        {isGuest && <div className="absolute top-2 right-2 z-20 text-sm opacity-60">🔒</div>}
                        <ProfileStatusCard player={player} onClick={isGuest ? undefined : onLevelProgress} />
                    </div>
                </div>

                {/* Guest Banner */}
                {isGuest && (
                    <div 
                        onClick={() => setShowGuestModal(true)}
                        className="w-full py-2 px-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-between cursor-pointer active:scale-95 transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-orange-400">⚠️</span>
                            <span className="text-xs font-bold text-orange-200">Guest Account</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md">
                            Sign Up
                        </span>
                    </div>
                )}

                {/* Main Action Grid - Expands to fill available space */}
                <div className="flex-1 min-h-0 flex flex-col justify-center gap-3">

                    {/* Split Action Card: FRIENDS (Left) + PLAY (Right) */}
                    <div className="grid grid-cols-2 gap-3 h-[170px] shrink-0">
                        {/* Friends Panel - Left Side */}
                        <div 
                            className={`min-w-0 transition-all duration-300 relative rounded-[2.5rem] overflow-hidden ${isGuest ? 'grayscale opacity-70' : ''}`}
                            onClick={(e) => {
                                if (isGuest) {
                                    e.stopPropagation();
                                    setShowGuestModal(true);
                                }
                            }}
                            style={{ 
                                background: 'var(--theme-glass-bg)',
                                border: '1px solid var(--theme-glass-border)'
                            }}
                        >
                            {/* Backdrop blur for frosted glass effect */}
                            <div className="absolute inset-0 backdrop-blur-md rounded-[2.5rem] z-0" />
                            {isGuest && <div className="absolute top-2 right-2 z-20 text-sm opacity-60">🔒</div>}
                            <FriendsPanel
                                player={player}
                                onJoinRoom={isGuest ? undefined : onRejoin}
                                className={`w-full h-full !rounded-[2.5rem] border-2 !border-green-500/20 hover:!border-green-500/40 cursor-pointer active:scale-95 !bg-transparent relative z-[1] ${isGuest ? 'pointer-events-none' : ''}`}
                                style={{
                                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.05)'
                                }}
                            />
                        </div>

                        {/* Play Button - Right Side (Special & Glowing) */}
                        <button
                            onClick={onPlay}
                            className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl border-4 transform transition-all duration-300 hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center p-4"
                            style={{
                                borderColor: 'var(--theme-accent)',
                                boxShadow: '0 0 50px -10px var(--theme-accent), 0 20px 40px -10px rgba(0,0,0,0.3)',
                                background: 'var(--theme-glass-bg)',
                            }}
                        >
                            {/* Backdrop blur for frosted glass effect */}
                            <div className="absolute inset-0 backdrop-blur-md rounded-[2.5rem] z-0" />
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-accent)]/20 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity z-[1]" />
                            <div className="absolute inset-0 bg-[var(--theme-accent)]/5 animate-pulse z-[1]" />

                            <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                                <div className="text-5xl mb-1 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">🎮</div>
                                <div className="text-3xl font-black drop-shadow-md tracking-tight" style={{ color: 'var(--theme-text)' }}>PLAY</div>
                                <div className="font-bold text-[9px] tracking-[0.2em] uppercase opacity-80 group-hover:opacity-100 px-2 py-1 rounded-full" style={{ background: 'var(--theme-glass-bg)', color: 'var(--theme-text-secondary)' }}>
                                    Start
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Rejoin Card (Conditional) */}
                    {lastGameDetails && onRejoin && (
                        <button
                            onClick={() => onRejoin(lastGameDetails.roomCode)}
                            className="w-full rounded-2xl p-3 flex items-center justify-between group active:scale-95 transition-all shrink-0 relative overflow-hidden"
                            style={{
                                background: 'var(--theme-glass-bg)',
                                border: '2px solid var(--theme-accent)',
                            }}
                        >
                            {/* Backdrop blur for frosted glass effect */}
                            <div className="absolute inset-0 backdrop-blur-md rounded-2xl z-0" />
                            {/* Theme color tint overlay */}
                            <div className="absolute inset-0 z-0 bg-[var(--theme-accent)] opacity-10 mix-blend-overlay" />
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-xl group-hover:rotate-12 transition-transform shadow-lg">
                                    🔙
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-black text-orange-400 uppercase tracking-wider">Back to Game</div>
                                    <div className="font-bold truncate max-w-[120px]" style={{ color: 'var(--theme-text)' }}>{lastGameDetails.hostName}'s Room</div>
                                </div>
                            </div>
                            <div className="bg-orange-500 text-black font-black text-xs px-3 py-1.5 rounded-full uppercase tracking-wide relative z-10">Join</div>
                        </button>
                    )}

                    {/* Secondary Actions Grid - Bento Style */}
                    <div className="grid grid-cols-2 gap-3 flex-1 min-h-[200px]">
                        {[
                            { id: 'casino', label: 'CASINO', emoji: '🎰', onClick: () => handleRestrictedAction(onCasino), delay: '100ms', glow: 'bg-yellow-500' },
                            { id: 'store', label: 'STORE', emoji: '🛒', onClick: () => handleRestrictedAction(onStore), delay: '200ms', glow: 'bg-purple-500' },
                            { id: 'profile', label: 'PROFILE', emoji: '👤', onClick: () => handleRestrictedAction(onProfile), delay: '300ms', glow: 'bg-blue-500' },
                            { id: 'settings', label: 'SETTINGS', emoji: '⚙️', onClick: onSettings, delay: '400ms', glow: 'bg-gray-500' }
                        ].map((card, i) => (
                            <button
                                key={card.id}
                                onClick={card.onClick}
                                className={`
                                    rounded-3xl p-4 shadow-lg overflow-hidden
                                    transform transition-all duration-200 hover:scale-[1.02] active:scale-95
                                    flex flex-col items-center justify-center gap-3 group relative
                                    ${isGuest && card.id !== 'settings' ? 'grayscale opacity-80' : ''}
                                `}
                                style={{
                                    background: 'var(--theme-glass-bg)',
                                    border: '2px solid var(--theme-accent)',
                                    animationDelay: card.delay
                                }}
                            >
                                {/* Backdrop blur for frosted glass effect */}
                                <div className="absolute inset-0 backdrop-blur-md rounded-3xl z-0" />
                                {/* Theme color tint overlay */}
                                <div className="absolute inset-0 z-[1] bg-[var(--theme-accent)] opacity-10 mix-blend-overlay" />

                                {/* Breathing Glow Background (Hidden for Guest) */}
                                {!isGuest && (
                                    <div
                                        className={`absolute top-1/2 left-1/2 w-20 h-20 rounded-full blur-[25px] ${card.glow} animate-breathe -translate-x-1/2 -translate-y-1/2 z-[1] opacity-30`}
                                        style={{ animationDelay: `${i * 0.5}s`, animationFillMode: 'both' }}
                                    />
                                )}

                                {isGuest && card.id !== 'settings' && (
                                    <div className="absolute top-2 right-2 text-xs opacity-50 z-20">🔒</div>
                                )}

                                <div className={`text-5xl group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-md z-10 relative`} style={{ animationDelay: `${i * 0.5}s` }}>{card.emoji}</div>
                                <div className="text-sm font-black tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity z-10 relative" style={{ color: 'var(--theme-text)' }}>{card.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar: Match History & Footer */}
                <div className="shrink-0 pt-6 flex flex-col items-center gap-4">
                    {/* Match History Button */}
                    <button
                        onClick={() => handleRestrictedAction(onGallery)}
                        className={`w-full rounded-2xl p-3 flex items-center justify-between group active:scale-95 transition-all hover:brightness-110 relative overflow-hidden ${isGuest ? 'grayscale opacity-70' : ''}`}
                        style={{ 
                            background: 'var(--theme-glass-bg)',
                            border: '2px solid var(--theme-accent)',
                        }}
                    >
                        {/* Backdrop blur for frosted glass effect */}
                        <div className="absolute inset-0 backdrop-blur-md rounded-2xl z-0" />
                        {/* Theme color tint overlay */}
                        <div className="absolute inset-0 z-[1] bg-[var(--theme-accent)] opacity-10 mix-blend-overlay" />
                        {isGuest && <div className="absolute top-2 right-2 z-20 text-xs opacity-50">🔒</div>}
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                                📊
                            </div>
                            <div className="font-bold text-sm" style={{ color: 'var(--theme-text)' }}>View Match History</div>
                        </div>
                        <div className="text-lg opacity-50 group-hover:translate-x-1 transition-transform relative z-10" style={{ color: 'var(--theme-text-secondary)' }}>→</div>
                    </button>

                    <div className="text-[10px] font-bold tracking-[0.2em] opacity-30" style={{ color: 'var(--theme-text-secondary)' }}>
                        BORED AT WORK GAMES
                    </div>
                </div>
            </div>

            {/* Admin Modal */}
            {showAdminModal && (
                <AdminModal onClose={() => setShowAdminModal(false)} />
            )}

            {/* Help Guide Overlay */}
            {showHelpGuide && (
                <HelpGuideOverlay onClose={() => setShowHelpGuide(false)} />
            )}

            {/* Guest Sign Up Modal */}
            <GuestSignUpModal
                isOpen={showGuestModal}
                onClose={() => setShowGuestModal(false)}
                onConfirm={() => {
                   setShowGuestModal(false);
                   onRegister();
                }}
            />

            {/* Help Button - Adaptive Corner/Pill */}
            <button
                onClick={() => setShowHelpGuide(true)}
                className="
                    fixed z-50 
                    bg-white/10 backdrop-blur-xl 
                    text-white/90 font-bold text-sm 
                    border-white/10
                    hover:bg-white/20 hover:text-white 
                    active:scale-95 transition-all
                    
                    /* Mobile: Corner Hugging */
                    bottom-0 left-0
                    border-t border-r
                    rounded-tr-[2rem]
                    pt-4 pr-6
                    pb-[max(1rem,env(safe-area-inset-bottom))]
                    pl-[max(1.5rem,env(safe-area-inset-left))]
                    
                    /* Desktop: Floating Pill */
                    md:bottom-6 md:left-6
                    md:rounded-full
                    md:border
                    md:pt-3 md:pr-6 md:pb-3 md:pl-6
                "
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg text-purple-400 font-black">?</span>
                    <span className="tracking-wide">Help</span>
                </div>
            </button>

            {/* Hidden admin trigger */}
            {isAdmin && (
                <button
                    className="absolute top-0 right-0 w-16 h-16 z-50 opacity-0"
                    onDoubleClick={() => setShowAdminModal(true)}
                />
            )}
        </div>
    );
};

