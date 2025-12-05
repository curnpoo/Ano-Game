import React, { useState, useEffect } from 'react';

export const InstallPromptModal: React.FC = () => {
    const [show, setShow] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Show if not standalone
        if (!isStandalone) {
            // Small delay for effect
            setTimeout(() => setShow(true), 500);
        }
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl border-4 border-purple-500 pop-in">
                <div className="text-6xl mb-4 bounce-scale">📱</div>
                <h2 className="text-2xl font-bold text-purple-600 mb-2">Install for Best Experience!</h2>
                <p className="text-gray-600 mb-6">
                    Add this app to your home screen for full-screen gameplay and better performance.
                </p>

                {isIOS ? (
                    <div className="bg-gray-100 rounded-xl p-4 mb-6 text-left text-sm space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">1️⃣</span>
                            <span>Tap the <strong>Share</strong> button <span className="text-blue-500 text-xl">⎋</span> below</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">2️⃣</span>
                            <span>Scroll down and tap <strong>Add to Home Screen</strong> ➕</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-100 rounded-xl p-4 mb-6 text-sm">
                        Tap your browser menu (⋮) and select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.
                    </div>
                )}

                <button
                    onClick={() => setShow(false)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-transform shadow-lg"
                >
                    Got it, let's play! 🚀
                </button>
            </div>
        </div>
    );
};
