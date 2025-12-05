import React, { useState, useEffect } from 'react';
import type { GameRoom, GameSettings } from '../../types';
import { GameSettingsPanel } from '../game/GameSettingsPanel';

interface LobbyScreenProps {
    room: GameRoom;
    currentPlayerId: string;
    onUploadImage: (file: File) => void;
    onSettingsChange: (settings: Partial<GameSettings>) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
    room,
    currentPlayerId,
    onUploadImage,
    onSettingsChange
}) => {
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!room || !room.players) {
        return <div>Error: Invalid room data</div>;
    }

    const isHost = room.hostId === currentPlayerId;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUploadImage(e.target.files[0]);
        }
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(room.roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-90s-animated p-4 flex flex-col items-center relative overflow-hidden">
            {/* Decorative bubbles */}
            <div className="absolute top-10 left-5 text-4xl bubble-float">🎈</div>
            <div className="absolute top-32 right-8 text-5xl bubble-float" style={{ animationDelay: '0.5s' }}>🎪</div>
            <div className="absolute bottom-40 left-10 text-4xl bubble-float" style={{ animationDelay: '1s' }}>🎯</div>

            <div className={`w-full max-w-md space-y-5 relative z-10 py-6 ${mounted ? 'slide-up' : 'opacity-0'}`}>
                {/* Room Header */}
                <div className="bg-white rounded-[2rem] p-5 flex justify-between items-center"
                    style={{
                        boxShadow: '0 10px 0 rgba(0, 217, 255, 0.3), 0 20px 40px rgba(0, 0, 0, 0.15)',
                        border: '4px solid transparent',
                        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #00D9FF, #32CD32)',
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box'
                    }}>
                    <div>
                        <div className="text-sm text-cyan-500 uppercase tracking-wider font-bold">🏠 Room Code</div>
                        <div className="text-3xl font-mono font-bold rainbow-text">{room.roomCode}</div>
                    </div>
                    <button
                        onClick={copyRoomCode}
                        className={`px-4 py-2 rounded-xl font-bold transition-all jelly-hover text-sm ${copied
                            ? 'bg-green-400 text-white'
                            : 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-white'
                            }`}
                        style={{
                            boxShadow: '0 4px 0 rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                </div>

                {/* Round Info */}
                <div className="bg-white/90 rounded-2xl px-4 py-3 text-center"
                    style={{ boxShadow: '0 4px 0 rgba(155, 89, 182, 0.2)' }}>
                    <span className="font-bold text-purple-600">
                        Round {room.roundNumber + 1} of {room.settings.totalRounds}
                    </span>
                    {room.roundNumber > 0 && (
                        <span className="ml-3 text-gray-500">
                            Score: {room.scores[currentPlayerId] || 0} pts
                        </span>
                    )}
                </div>

                {/* Game Settings */}
                <GameSettingsPanel
                    settings={room.settings}
                    onSettingsChange={onSettingsChange}
                    isHost={isHost}
                />

                {/* Players List */}
                <div className="bg-white rounded-[2rem] p-5 space-y-3"
                    style={{
                        boxShadow: '0 10px 0 rgba(155, 89, 182, 0.3), 0 20px 40px rgba(0, 0, 0, 0.15)',
                        border: '4px solid transparent',
                        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #FF69B4, #9B59B6)',
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box'
                    }}>
                    <h3 className="text-lg font-bold flex items-center"
                        style={{
                            background: 'linear-gradient(135deg, #FF69B4, #9B59B6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                        👥 Players
                        <span className="ml-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white px-3 py-1 rounded-full text-sm">
                            {room.players.length}
                        </span>
                    </h3>
                    <div className="space-y-2 stagger-children">
                        {Array.isArray(room.players) && room.players.map((player, index) => {
                            if (!player) return null;
                            const isPlayerHost = player.id === room.hostId;
                            return (
                                <div
                                    key={player.id || index}
                                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 pop-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                            style={{
                                                backgroundColor: player.color || '#ccc',
                                                boxShadow: `0 2px 0 rgba(0,0,0,0.2)`
                                            }}
                                        >
                                            {player.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={`font-bold ${player.id === currentPlayerId ? 'text-pink-600' : 'text-gray-700'}`}>
                                            {player.name}
                                            {player.id === currentPlayerId && (
                                                <span className="ml-2 text-xs bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {room.scores[player.id] > 0 && (
                                            <span className="text-sm font-bold text-purple-500">
                                                {room.scores[player.id]} pts
                                            </span>
                                        )}
                                        <span className="text-xl">{isPlayerHost ? '👑' : '🎮'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upload Area - Only host can start round */}
                {isHost ? (
                    <div className="bg-white rounded-[2rem] p-6 text-center relative cursor-pointer hover:scale-[1.02] transition-transform"
                        style={{
                            boxShadow: '0 10px 0 rgba(255, 140, 0, 0.3), 0 20px 40px rgba(0, 0, 0, 0.15)',
                            border: '4px dashed #FF8C00',
                            background: 'linear-gradient(135deg, #fff7ed, #fffbeb)'
                        }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="space-y-3 pointer-events-none">
                            <div className="text-5xl bounce-scale">📤</div>
                            <div>
                                <h3 className="text-xl font-bold"
                                    style={{
                                        background: 'linear-gradient(135deg, #FF8C00, #FF69B4)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                    Upload Image to Start Round!
                                </h3>
                                <p className="text-orange-400 font-medium mt-1 text-sm">👆 Tap or drag & drop</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/90 rounded-2xl p-6 text-center"
                        style={{ boxShadow: '0 6px 0 rgba(155, 89, 182, 0.2)' }}>
                        <div className="text-4xl mb-2 animate-pulse">⏳</div>
                        <p className="font-bold text-purple-600">
                            Waiting for host to start the round...
                        </p>
                    </div>
                )}

                <div className="text-center text-sm text-white/80 font-medium drop-shadow-lg">
                    ✨ Fill in the blank and vote for the best drawing! ✨
                </div>
            </div>
        </div>
    );
};
