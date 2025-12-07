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
        <div className="backdrop-blur-sm rounded-2xl p-4 space-y-4"
            style={{
                backgroundColor: 'var(--theme-card-bg)',
                boxShadow: '0 6px 0 rgba(155, 89, 182, 0.2)',
                border: '3px solid #9B59B6'
            }}>
            <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                ⚙️ Game Settings
            </h3>

            {/* Timer Duration */}
            <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
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
                                    ? 'hover:opacity-80'
                                    : 'opacity-50 cursor-not-allowed'
                                }`}
                            style={{
                                backgroundColor: settings.timerDuration === seconds ? undefined : 'var(--theme-bg-secondary)',
                                color: settings.timerDuration === seconds ? undefined : 'var(--theme-text)',
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
                <label className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
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
                                    ? 'hover:opacity-80'
                                    : 'opacity-50 cursor-not-allowed'
                                }`}
                            style={{
                                backgroundColor: settings.totalRounds === rounds ? undefined : 'var(--theme-bg-secondary)',
                                color: settings.totalRounds === rounds ? undefined : 'var(--theme-text)',
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
                <p className="text-xs text-center italic" style={{ color: 'var(--theme-text-secondary)' }}>
                    Only the host can change settings
                </p>
            )}
        </div>
    );
};
