import React, { useState, useEffect } from 'react';
import type { GameRoom } from '../../types';
import { AvatarDisplay } from '../common/AvatarDisplay';

interface ResultsScreenProps {
    room: GameRoom;
    currentPlayerId: string;
    onNextRound: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
    room,
    currentPlayerId,
    onNextRound
}) => {
    const [mounted, setMounted] = useState(false);
    const [showPodium, setShowPodium] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTimeout(() => setShowPodium(true), 500);
    }, []);

    const latestResult = room.roundResults[room.roundResults.length - 1];
    const isHost = room.hostId === currentPlayerId;

    if (!latestResult) {
        return (
            <div className="min-h-screen bg-90s-animated flex items-center justify-center">
                <div className="text-2xl font-bold text-white">Loading results...</div>
            </div>
        );
    }

    // Get top 3
    const [first, second, third] = latestResult.rankings;

    const getPlayer = (playerId: string) => room.players.find(p => p.id === playerId);

    return (
        <div className={`min-h-screen bg-90s-animated flex flex-col items-center justify-center p-4 ${mounted ? 'pop-in' : 'opacity-0'}`}>
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
                    🏆 Round {room.roundNumber} Results!
                </h1>
                <p className="text-white/80 font-medium">
                    Round {room.roundNumber} of {room.settings.totalRounds}
                </p>
            </div>

            {/* Podium */}
            <div className={`flex items-end justify-center gap-4 mb-8 transition-all duration-700 ${showPodium ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* 2nd Place */}
                {second && (() => {
                    const p = getPlayer(second.playerId);
                    return (
                        <div className="flex flex-col items-center pop-in" style={{ animationDelay: '0.3s' }}>
                            <div className="text-4xl mb-2">🥈</div>
                            <div className="mb-2">
                                <AvatarDisplay
                                    strokes={p?.avatarStrokes}
                                    avatar={p?.avatar}
                                    frame={p?.frame}
                                    color={p?.color}
                                    size={80}
                                    className="shadow-md"
                                />
                            </div>
                            <div className="bg-gradient-to-b from-gray-300 to-gray-400 w-24 h-24 rounded-t-lg flex flex-col items-center justify-center"
                                style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.2)' }}>
                                <span className="text-2xl font-bold text-gray-700">2nd</span>
                                <span className="text-sm text-gray-600">{second.votes} votes</span>
                                <span className="text-xs text-gray-500">+{second.points} pts</span>
                            </div>
                            <p className="mt-2 font-bold text-white text-sm">{second.playerName}</p>
                        </div>
                    );
                })()}

                {/* 1st Place */}
                {first && (() => {
                    const p = getPlayer(first.playerId);
                    return (
                        <div className="flex flex-col items-center pop-in" style={{ animationDelay: '0.1s' }}>
                            <div className="text-5xl mb-2 animate-bounce">🥇</div>
                            <div className="mb-2 relative">
                                <AvatarDisplay
                                    strokes={p?.avatarStrokes}
                                    avatar={p?.avatar}
                                    frame={p?.frame}
                                    color={p?.color}
                                    size={96}
                                    className="shadow-lg border-4 border-yellow-400"
                                />
                            </div>
                            <div className="bg-gradient-to-b from-yellow-400 to-yellow-500 w-28 h-32 rounded-t-lg flex flex-col items-center justify-center"
                                style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.2)' }}>
                                <span className="text-3xl font-bold text-yellow-800">1st</span>
                                <span className="text-sm text-yellow-700">{first.votes} votes</span>
                                <span className="text-xs text-yellow-600">+{first.points} pts</span>
                            </div>
                            <p className="mt-2 font-bold text-white">{first.playerName}</p>
                        </div>
                    );
                })()}

                {/* 3rd Place */}
                {third && (() => {
                    const p = getPlayer(third.playerId);
                    return (
                        <div className="flex flex-col items-center pop-in" style={{ animationDelay: '0.5s' }}>
                            <div className="text-3xl mb-2">🥉</div>
                            <div className="mb-2">
                                <AvatarDisplay
                                    strokes={p?.avatarStrokes}
                                    avatar={p?.avatar}
                                    frame={p?.frame}
                                    color={p?.color}
                                    size={64}
                                    className="shadow-md"
                                />
                            </div>
                            <div className="bg-gradient-to-b from-orange-300 to-orange-400 w-20 h-16 rounded-t-lg flex flex-col items-center justify-center"
                                style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.2)' }}>
                                <span className="text-xl font-bold text-orange-800">3rd</span>
                                <span className="text-xs text-orange-700">{third.votes} votes</span>
                                <span className="text-xs text-orange-600">+{third.points} pts</span>
                            </div>
                            <p className="mt-2 font-bold text-white text-sm">{third.playerName}</p>
                        </div>
                    );
                })()}
            </div>

            {/* Current Scores */}
            <div className="bg-white/90 rounded-2xl p-4 mb-6 w-full max-w-sm"
                style={{ boxShadow: '0 4px 0 rgba(155, 89, 182, 0.3)' }}>
                <h3 className="text-lg font-bold text-purple-600 mb-3 text-center">📊 Leaderboard</h3>
                <div className="space-y-2">
                    {room.players
                        .sort((a, b) => (room.scores[b.id] || 0) - (room.scores[a.id] || 0))
                        .map((player, i) => (
                            <div key={player.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-400">#{i + 1}</span>
                                    <AvatarDisplay
                                        strokes={player.avatarStrokes}
                                        avatar={player.avatar}
                                        frame={player.frame}
                                        color={player.color}
                                        size={32}
                                    />
                                    <span className="font-medium">{player.name}</span>
                                </div>
                                <span className="font-bold text-purple-600">{room.scores[player.id] || 0} pts</span>
                            </div>
                        ))}
                </div>
            </div>

            {/* Next Round Button */}
            {isHost ? (
                <button
                    onClick={onNextRound}
                    className="btn-90s bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-xl jelly-hover"
                >
                    ➡️ Next Round
                </button>
            ) : (
                <p className="text-white/80 font-medium animate-pulse">
                    Waiting for host to start next round...
                </p>
            )}
        </div>
    );
};
