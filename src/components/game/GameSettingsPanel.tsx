import React from 'react';
import type { GameSettings } from '../../types';

interface GameSettingsPanelProps {
    settings: GameSettings;
    onSettingsChange: (settings: Partial<GameSettings>) => void;
    isHost: boolean;
}

const TIMER_OPTIONS = [10, 20, 30, 60];
const ROUND_OPTIONS = [3, 5, 7, 10];

export const GameSettingsPanel: React.FC<GameSettingsPanelProps> = ({
    settings,
    onSettingsChange,
    isHost
}) => {
    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 space-y-4"
            style={{
                boxShadow: '0 6px 0 rgba(155, 89, 182, 0.2)',
                border: '3px solid #9B59B6'
            }}>
            <h3 className="text-lg font-bold text-purple-600 flex items-center gap-2">
                ⚙️ Game Settings
            </h3>

            {/* Timer Duration */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                    ⏱️ Drawing Time
                </label>
                <div className="flex gap-2">
                    {TIMER_OPTIONS.map((seconds) => (
                        <button
                            key={seconds}
                            onClick={() => isHost && onSettingsChange({ timerDuration: seconds })}
                            disabled={!isHost}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all ${settings.timerDuration === seconds
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-105'
                                : isHost
                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            style={{
                                boxShadow: settings.timerDuration === seconds
                                    ? '0 3px 0 rgba(155, 89, 182, 0.4)'
                                    : '0 2px 0 rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            {seconds}s
                        </button>
                    ))}
                </div>
            </div>

            {/* Number of Rounds */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                    🔄 Number of Rounds
                </label>
                <div className="flex gap-2">
                    {ROUND_OPTIONS.map((rounds) => (
                        <button
                            key={rounds}
                            onClick={() => isHost && onSettingsChange({ totalRounds: rounds })}
                            disabled={!isHost}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all ${settings.totalRounds === rounds
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white scale-105'
                                : isHost
                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            style={{
                                boxShadow: settings.totalRounds === rounds
                                    ? '0 3px 0 rgba(0, 217, 255, 0.4)'
                                    : '0 2px 0 rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            {rounds}
                        </button>
                    ))}
                </div>
            </div>

            {!isHost && (
                <p className="text-xs text-gray-400 text-center italic">
                    Only the host can change settings
                </p>
            )}
        </div>
    );
};
