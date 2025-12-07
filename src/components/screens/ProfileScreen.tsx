import React, { useState } from 'react';
import type { Player } from '../../types';
import { AvatarDisplay } from '../common/AvatarDisplay';
import { CurrencyService, formatCurrency } from '../../services/currency';
import { StatsService } from '../../services/stats';
import { XPService } from '../../services/xp';

interface ProfileScreenProps {
    player: Player;
    onBack: () => void;
    onUpdateProfile: (updates: Partial<Player>) => void;
    onEditAvatar: () => void;
    onShowStats?: () => void;
}

type Tab = 'edit' | 'stats';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
    player,
    onBack,
    onUpdateProfile,
    onEditAvatar
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('edit');
    const [name, setName] = useState(player.name);
    const balance = CurrencyService.getCurrency();
    const stats = StatsService.getStats();
    const level = XPService.getLevel();

    const handleSave = () => {
        if (name.trim()) {
            onUpdateProfile({ name: name.trim() });
            onBack();
        }
    };

    const statItems = [
        { label: 'Games Played', value: stats.gamesPlayed, emoji: '🎮' },
        { label: 'Games Won', value: stats.gamesWon, emoji: '🏆' },
        { label: 'Rounds Won', value: stats.roundsWon, emoji: '✅' },
        { label: 'Rounds Lost', value: stats.roundsLost, emoji: '❌' },
        { label: 'Times Sabotaged', value: stats.timesSabotaged, emoji: '💥' },
        { label: 'Times Saboteur', value: stats.timesSaboteur, emoji: '🎭' },
        { label: 'Total $ Earned', value: formatCurrency(stats.totalCurrencyEarned), emoji: '💰' },
        { label: 'Total XP Earned', value: stats.totalXPEarned, emoji: '⭐' },
        { label: 'Highest Level', value: stats.highestLevel, emoji: '📈' },
    ];

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                paddingTop: 'max(1.5rem, env(safe-area-inset-top) + 1rem)',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                backgroundColor: 'var(--theme-bg-primary)'
            }}
        >
            {/* Home Button Card */}
            <button
                onClick={onBack}
                className="mx-4 mb-4 rounded-[2rem] p-4 border-2 flex items-center gap-4 hover:brightness-110 active:scale-95 transition-all shadow-lg"
                style={{
                    backgroundColor: 'var(--theme-card-bg)',
                    borderColor: 'var(--theme-border)'
                }}
            >
                <div className="text-3xl">🏠</div>
                <div className="flex-1 text-left">
                    <div className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>Back to Home</div>
                    <div className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>Return to main menu</div>
                </div>
                <div className="text-2xl" style={{ color: 'var(--theme-text-secondary)' }}>←</div>
            </button>

            {/* Header with Tabs */}
            <div className="px-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-black drop-shadow-lg" style={{ color: 'var(--theme-text)' }}>👤 PROFILE</h1>
                    <div className="px-4 py-2 rounded-xl font-bold text-white shadow-md"
                        style={{ backgroundColor: 'var(--theme-accent)' }}>
                        {formatCurrency(balance)}
                    </div>
                </div>

                {/* Tab Buttons */}
                <div
                    className="flex rounded-2xl p-1"
                    style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
                >
                    {(['edit', 'stats'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'shadow-md' : 'opacity-60'
                                }`}
                            style={{
                                backgroundColor: activeTab === tab ? 'var(--theme-card-bg)' : 'transparent',
                                color: activeTab === tab ? 'var(--theme-text)' : 'var(--theme-text-secondary)'
                            }}
                        >
                            {tab === 'edit' ? '✏️ Edit Profile' : '📊 Statistics'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 flex flex-col px-4 pb-4 overflow-y-auto">
                {activeTab === 'edit' ? (
                    /* Edit Tab Content */
                    <div className="flex-1 flex flex-col space-y-4">
                        {/* Name Input */}
                        <div className="rounded-[2rem] p-4 shadow-lg"
                            style={{
                                backgroundColor: 'var(--theme-card-bg)',
                                border: '2px solid var(--theme-border)'
                            }}>
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--theme-text-secondary)' }}>NAME</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={15}
                                className="w-full px-4 py-3 rounded-2xl border-2 focus:outline-none font-bold text-center text-lg"
                                style={{
                                    backgroundColor: 'var(--theme-bg-secondary)',
                                    color: 'var(--theme-text)',
                                    borderColor: 'var(--theme-border)'
                                }}
                            />
                        </div>

                        {/* Avatar Display */}
                        <div className="flex-1 rounded-[2rem] p-4 shadow-lg flex flex-col min-h-0"
                            style={{
                                backgroundColor: 'var(--theme-card-bg)',
                                border: '2px solid var(--theme-border)'
                            }}>
                            <label className="block text-sm font-bold mb-2 shrink-0" style={{ color: 'var(--theme-text-secondary)' }}>YOUR AVATAR</label>
                            <button
                                onClick={onEditAvatar}
                                className="flex-1 w-full flex flex-col items-center justify-center p-4 rounded-3xl border-2 border-dashed transition-all group hover:scale-[1.02]"
                                style={{
                                    borderColor: 'var(--theme-border)',
                                    backgroundColor: 'var(--theme-bg-secondary)'
                                }}
                            >
                                <div className="relative mb-4 group-hover:scale-110 transition-transform">
                                    <AvatarDisplay
                                        strokes={player.avatarStrokes}
                                        avatar={player.avatar}
                                        frame={player.frame}
                                        color={player.color}
                                        size={160}
                                        className="shadow-2xl"
                                    />
                                    <div className="absolute -bottom-2 -right-2 text-2xl text-white p-3 rounded-full shadow-lg border-2 border-white"
                                        style={{ backgroundColor: 'var(--theme-accent)' }}>
                                        ✏️
                                    </div>
                                </div>
                                <span className="font-black text-xl" style={{ color: 'var(--theme-accent)' }}>TAP TO EDIT</span>
                                <span className="text-sm font-medium opacity-60" style={{ color: 'var(--theme-text)' }}>Customize your look</span>
                            </button>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className="w-full py-4 text-white font-bold text-xl rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--theme-accent) 0%, #FFD700 100%)'
                            }}
                        >
                            Save Changes
                        </button>
                    </div>
                ) : (
                    /* Stats Tab Content */
                    <div className="space-y-4">
                        {/* Current Status Card */}
                        <div
                            className="rounded-2xl p-4 text-white text-center"
                            style={{ background: 'linear-gradient(135deg, var(--theme-accent), #9B59B6)' }}
                        >
                            <div className="text-lg font-bold mb-2">Current Status</div>
                            <div className="flex justify-around">
                                <div>
                                    <div className="text-2xl font-black">LVL {level}</div>
                                    <div className="text-xs opacity-80">Level</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black">{formatCurrency(balance)}</div>
                                    <div className="text-xs opacity-80">Balance</div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {statItems.map((item, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl p-4 text-center"
                                    style={{
                                        backgroundColor: 'var(--theme-card-bg)',
                                        border: '2px solid var(--theme-border)'
                                    }}
                                >
                                    <div className="text-2xl mb-1">{item.emoji}</div>
                                    <div className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>{item.value}</div>
                                    <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
