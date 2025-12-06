import React, { useState } from 'react';
import type { Player } from '../../types';
import { AvatarDisplay } from '../common/AvatarDisplay';
import { CurrencyService, formatCurrency } from '../../services/currency';
import { AuthService } from '../../services/auth';
import { StatsModal } from '../common/StatsModal';

interface ProfileScreenProps {
    player: Player;
    onBack: () => void;
    onUpdateProfile: (updates: Partial<Player>) => void;
    onEditAvatar: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
    player,
    onBack,
    onUpdateProfile,
    onEditAvatar
}) => {
    const [name, setName] = useState(player.name);
    const [showStats, setShowStats] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const balance = CurrencyService.getCurrency();

    const handleSave = () => {
        if (name.trim()) {
            onUpdateProfile({
                name: name.trim()
            });
            onBack();
        }
    };

    const handleLogout = () => {
        AuthService.logout();
        window.location.reload();
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 flex flex-col"
            style={{
                paddingTop: 'max(1.5rem, env(safe-area-inset-top) + 1rem)',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
            }}
        >
            {/* Home Button Card */}
            <button
                onClick={onBack}
                className="mx-4 mb-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/20 flex items-center gap-4 hover:bg-white/20 active:scale-95 transition-all"
            >
                <div className="text-3xl">🏠</div>
                <div className="flex-1 text-left">
                    <div className="text-lg font-bold text-white">Back to Home</div>
                    <div className="text-white/60 text-sm">Return to main menu</div>
                </div>
                <div className="text-2xl text-white/60">←</div>
            </button>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 mb-2">
                <h1 className="text-2xl font-black text-white drop-shadow-lg">👤 PROFILE</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowStats(true)}
                        className="bg-white/20 text-white px-3 py-2 rounded-xl font-bold hover:bg-white/30 transition-all"
                    >
                        📊 Stats
                    </button>
                    <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold">
                        {formatCurrency(balance)}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                {/* Name Input */}
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <label className="block text-sm font-bold text-gray-700 mb-2">NAME</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={15}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-bold text-center text-lg"
                    />
                </div>

                {/* Avatar Display */}
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <label className="block text-sm font-bold text-gray-700 mb-2">YOUR AVATAR</label>
                    <button
                        onClick={onEditAvatar}
                        className="w-full flex flex-col items-center p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <div className="w-32 h-32 relative mb-2 group-hover:scale-105 transition-transform">
                            <AvatarDisplay
                                strokes={player.avatarStrokes}
                                avatar={player.avatar}
                                frame={player.frame}
                                color={player.color}
                                size={128}
                            />
                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                                ✏️
                            </div>
                        </div>
                        <span className="text-blue-500 font-bold">Tap to Edit Avatar</span>
                    </button>
                </div>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-sm safe-area-inset-bottom">
                <button
                    onClick={handleSave}
                    className="w-full py-4 bg-black text-white font-bold text-xl rounded-2xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
                >
                    Save Changes
                </button>
                <button
                    onClick={handleSave}
                    className="w-full py-4 bg-black text-white font-bold text-xl rounded-2xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
                >
                    Save Changes
                </button>

                {/* Logout Option */}
                {AuthService.isLoggedIn() && (
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full mt-4 py-3 text-red-300 font-bold text-sm hover:text-white transition-colors"
                    >
                        Log Out of Account
                    </button>
                )}
            </div>

            {/* Logout Confirm Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center pop-in">
                        <div className="text-4xl mb-4">👋</div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">Log Out?</h3>
                        <p className="text-gray-600 mb-6 font-medium">You will return to the welcome screen.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 px-6 bg-red-500 text-white font-bold rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Modal */}
            {showStats && <StatsModal onClose={() => setShowStats(false)} />}
        </div>
    );
};
