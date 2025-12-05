
import { useState, useEffect, useRef } from 'react';
import type { ChatMessage, Player } from '../../types';
import { StorageService } from '../../services/storage';

interface FloatingChatProps {
    roomCode: string;
    player: Player;
    messages: ChatMessage[];
}

interface Bubble {
    id: string;
    message: ChatMessage;
    x: number;
    y: number;
    createdAt: number;
}

export const FloatingChat = ({ roomCode, player, messages }: FloatingChatProps) => {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [inputText, setInputText] = useState('');
    const [isInputVisible, setIsInputVisible] = useState(false);
    const lastProcessedIdRef = useRef<string | null>(null);

    // Initial load: don't show old messages as bubbles, only new ones
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (!lastProcessedIdRef.current) {
                lastProcessedIdRef.current = lastMsg.id;
            }
        }
    }, []);

    // Effect: Handle new messages
    useEffect(() => {
        if (messages.length === 0) return;

        // Find index of last processed
        const lastIndex = messages.findIndex(m => m.id === lastProcessedIdRef.current);
        const actualNewMessages = lastIndex === -1
            ? messages // All new if last not found (or fresh load)
            : messages.slice(lastIndex + 1);

        if (actualNewMessages.length > 0) {
            const newBubbles = actualNewMessages.map(msg => createBubble(msg));
            setBubbles(prev => [...prev, ...newBubbles]);
            lastProcessedIdRef.current = actualNewMessages[actualNewMessages.length - 1].id;
        }

    }, [messages]);

    // Effect: Cleanup old bubbles (every 1s check)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setBubbles(prev => prev.filter(b => now - b.createdAt < 10000)); // 10 seconds
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const createBubble = (msg: ChatMessage): Bubble => {
        // Random position logic:
        // Prioritize Left and Right sides to avoid center canvas and bottom toolbar
        const zones = ['left', 'right', 'left', 'right', 'top']; // Higher weight to sides
        const zone = zones[Math.floor(Math.random() * zones.length)];

        let x = 50;
        let y = 50;

        switch (zone) {
            case 'top':
                // Top 15-25% (avoid absolute top header)
                x = 20 + Math.random() * 60;
                y = 15 + Math.random() * 10;
                break;
            case 'left':
                // Left 2-15%
                x = 2 + Math.random() * 13;
                y = 20 + Math.random() * 50; // Avoid very bottom
                break;
            case 'right':
                // Right 85-98%
                x = 85 + Math.random() * 13;
                y = 20 + Math.random() * 50; // Avoid very bottom
                break;
        }

        return {
            id: crypto.randomUUID(), // Local bubble ID
            message: msg,
            x,
            y,
            createdAt: Date.now()
        };
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        try {
            await StorageService.sendChatMessage(roomCode, player, inputText);
            setInputText('');
            setIsInputVisible(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Bubbles */}
            {bubbles.map(b => (
                <div
                    key={b.id}
                    className="absolute flex flex-col items-center animate-float-fade"
                    style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        maxWidth: '200px',
                        transform: 'translate(-50%, -50%)', // Center on coordinate
                    }}
                >
                    {/* Avatar/Name */}
                    <div
                        className="w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center text-lg shadow-md mb-1 z-10 relative"
                        style={{ borderColor: b.message.playerName === player.name ? '#FF69B4' : '#ccc' }} // Highlight self?
                    >
                        {/* Use emoji or initial */}
                        {b.message.playerAvatar || b.message.playerName.charAt(0)}
                    </div>

                    {/* Message Bubble */}
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-purple-100 text-sm font-medium text-gray-800 break-words w-full text-center relative">
                        {b.message.text}
                        {/* Little triangle pointer (optional, CSS might be complex, skipping for simplicity) */}
                    </div>
                </div>
            ))}

            {/* Input Trigger / Field */}
            <div className="absolute bottom-24 right-4 pointer-events-auto flex flex-col items-end gap-2">
                {isInputVisible ? (
                    <div className="bg-white p-2 rounded-2xl shadow-xl flex gap-2 border-2 border-purple-500 pop-in w-[250px]">
                        <input
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            className="flex-1 bg-gray-50 rounded-xl px-3 outline-none text-sm"
                            placeholder="Data!"
                            maxLength={50}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="bg-purple-600 text-white rounded-xl px-3 py-2 font-bold hover:bg-purple-700 active:scale-95 transition-all text-xs"
                        >
                            SEND
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsInputVisible(true)}
                        className="w-12 h-12 rounded-full bg-white/80 backdrop-blur shadow-lg border-2 border-purple-400 flex items-center justify-center text-2xl hover:scale-110 transition-all hover:bg-white active:scale-95"
                    >
                        💬
                    </button>
                )}
            </div>

            {/* Click outside to close input (optional overlay) */}
            {isInputVisible && (
                <div
                    className="fixed inset-0 z-[-1] pointer-events-auto"
                    onClick={() => setIsInputVisible(false)}
                />
            )}
        </div>
    );
};
