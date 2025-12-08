import React from 'react';

interface UpdateNotificationProps {
    onUpdate: () => void;
    onDismiss: () => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onUpdate, onDismiss }) => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pointer-events-none animate-fade-in">
            <div className="glass-panel rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-yellow-400 pointer-events-auto animate-slide-up">
                {/* Icon */}
                <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl shadow-lg animate-bounce-gentle">
                        ✨
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black text-center mb-3 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Update Available!
                </h3>

                {/* Message */}
                <p className="text-center text-white/90 font-medium mb-6 leading-relaxed">
                    A new version is ready! You can resume your same game after the update. 🎨
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onDismiss}
                        className="flex-1 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all active:scale-95 border border-white/20"
                    >
                        Later
                    </button>
                    <button
                        onClick={onUpdate}
                        className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black transition-all active:scale-95 shadow-lg"
                    >
                        Refresh Now 🚀
                    </button>
                </div>
            </div>
        </div>
    );
};
