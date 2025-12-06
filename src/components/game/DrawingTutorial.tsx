import React, { useEffect, useState } from 'react';

interface DrawingTutorialProps {
    onClose: () => void;
}

export const DrawingTutorial: React.FC<DrawingTutorialProps> = ({ onClose }) => {
    const [step, setStep] = useState(0); // 0: Intro, 1: Controls
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleDismiss = () => {
        setMounted(false);
        setTimeout(onClose, 300); // Allow fade out
    };

    return (
        <div className={`fixed inset-0 z-[100] touch-none ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDismiss} />

            {/* Content Container - Full Screen to allow absolute positioning of specific tooltips */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 pb-32">

                {/* Top Section - Timer/Info */}
                <div className="mt-20 flex justify-center animate-bounce">
                    <div className="bg-white text-black p-3 rounded-xl shadow-xl max-w-xs text-center border-4 border-yellow-400">
                        <p className="font-bold">⏰ Watch the Timer!</p>
                        <p className="text-sm">You only have a few seconds to draw!</p>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t-4 border-l-4 border-yellow-400"></div>
                    </div>
                </div>

                {/* Center - Start */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl text-center border-4 border-purple-500 max-w-sm">
                        <h2 className="text-2xl font-bold mb-2">Ready to Draw? 🎨</h2>
                        <p className="mb-4 text-gray-600">Here's a quick guide to your tools!</p>
                        <button
                            onClick={handleDismiss}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg"
                        >
                            Got it! Let's Go! 🚀
                        </button>
                    </div>
                </div>

                {/* Bottom Section - Toolbar mapping */}
                {/* These are roughly positioned to match the toolbar layout */}
                <div className="relative w-full h-20">
                    {/* Left: Undo/Clear */}
                    <div className="absolute left-0 bottom-10 animate-pulse">
                        <div className="bg-white text-black p-2 rounded-lg shadow-lg text-sm font-bold border-2 border-red-400 mb-2">
                            ↩️ Undo & Clear
                        </div>
                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-red-400 border-r-[10px] border-r-transparent mx-auto"></div>
                    </div>

                    {/* Right: Tools */}
                    <div className="absolute right-0 bottom-10 animate-pulse delay-100">
                        <div className="bg-white text-black p-2 rounded-lg shadow-lg text-sm font-bold border-2 border-cyan-400 mb-2">
                            👁️ Eyedropper & Eraser 🧼
                        </div>
                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-cyan-400 border-r-[10px] border-r-transparent mx-auto"></div>
                    </div>

                    {/* Center Top of Toolbar: Colors */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-20 animate-pulse delay-200 w-full text-center">
                        <div className="inline-block bg-white text-black p-2 rounded-lg shadow-lg text-sm font-bold border-2 border-green-400">
                            🎨 Pick Colors & Size
                        </div>
                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-green-400 border-r-[10px] border-r-transparent mx-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
