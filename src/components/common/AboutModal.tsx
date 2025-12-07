import React from 'react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-[2rem] max-w-md w-full p-8 space-y-6 pop-in text-center relative"
                onClick={e => e.stopPropagation()}
                style={{
                    boxShadow: '0 20px 0 rgba(155, 89, 182, 0.3), 0 40px 80px rgba(0, 0, 0, 0.3)',
                    border: '5px solid #FF69B4'
                }}>

                <h2 className="text-3xl font-bold text-purple-600">About Ano Draw</h2>

                <div className="text-6xl animate-bounce py-4">🎨</div>

                <p className="text-xl font-bold text-gray-700">
                    A <span className="text-pink-500">Bored at Work</span> production.
                </p>

                <p className="text-sm text-gray-500">
                    Made with ❤️ by Curren and a computer.
                </p>

                <button
                    onClick={onClose}
                    className="btn-90s bg-gray-200 text-gray-600 font-bold text-lg py-3 px-8 rounded-xl hover:bg-gray-300 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};
