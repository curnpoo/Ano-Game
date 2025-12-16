import React, { useEffect, useState, useRef } from 'react';
import type { GameRoom, Player } from '../../types';

interface DrawingHeaderProps {
    room: GameRoom;
    player: Player;
    onSettings: () => void;
    onDone: () => void;
    
    // Timer functionality
    timerEndsAt: number | null;
    timerDuration: number;
    onTimeUp: () => void;
    
    // UI State
    hasSubmitted: boolean;
    submittedCount: number;
    totalPlayers: number;
}

export const DrawingHeader: React.FC<DrawingHeaderProps> = ({
    room,
    player,
    onSettings,
    onDone,
    timerEndsAt,
    timerDuration = 20,
    onTimeUp,
    hasSubmitted,
    submittedCount,
    totalPlayers
}) => {
    // --- Timer Logic (Ported/Adapted) ---
    // Stabilize endsAt
    const stableEndsAtRef = useRef<number>(timerEndsAt || 0);
    if (Math.abs((timerEndsAt || 0) - stableEndsAtRef.current) > 500) {
        stableEndsAtRef.current = timerEndsAt || 0;
    }
    const stableEndsAt = stableEndsAtRef.current;
    
    const [timeLeft, setTimeLeft] = useState(() => Math.max(0, (stableEndsAt - Date.now()) / 1000));
    const onTimeUpRef = useRef(onTimeUp);
    const hasCalledRef = useRef(false);

    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    // Timer Interval
    useEffect(() => {
        if (!stableEndsAt) return;
        
        const updateTime = () => {
            const now = Date.now();
            const remaining = Math.max(0, (stableEndsAt - now) / 1000);
            setTimeLeft(remaining);
            
            if (remaining <= 0 && !hasCalledRef.current) {
                hasCalledRef.current = true;
                onTimeUpRef.current();
            }
        };

        updateTime(); // Initial
        const interval = setInterval(updateTime, 100);
        return () => clearInterval(interval);
    }, [stableEndsAt]);

    const progress = Math.min(100, (timeLeft / timerDuration) * 100);
    const isLowTime = timeLeft <= 5;

    // --- Sabotage Logic ---
    const isSabotaged = room.sabotageTargetId === player.id && room.sabotageTriggered;
    const sabotageEffect = room.sabotageEffect;

    // --- Visuals ---
    // Bento Container Styles
    const containerClasses = `
        relative w-full overflow-hidden
        bg-white/10 backdrop-blur-xl 
        border border-white/20 shadow-2xl
        rounded-[2rem]
        transition-all duration-300
        ${isLowTime && !hasSubmitted ? 'shadow-red-500/30 border-red-500/30' : ''}
        ${isSabotaged ? 'animate-shake-gentle border-red-500/50 bg-red-900/10' : ''}
    `;

    return (
        <div 
            className="fixed top-0 left-0 right-0 z-50 px-3 mt-2 pointer-events-none flex justify-center"
            style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
            {/* Main Bento Container (Pointer events auto) */}
            <div className={`${containerClasses} p-3 max-w-lg w-full pointer-events-auto grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2`}>
                
                {/* --- Row 1 --- */}

                {/* Left: Settings Button */}
                <div className="col-start-1 row-start-1">
                    <button
                        onClick={onSettings}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all border border-white/10 text-xl shadow-sm"
                        aria-label="Settings"
                    >
                        ⚙️
                    </button>
                </div>

                {/* Center: Status / Message */}
                <div className="col-start-2 row-start-1 flex items-center justify-center">
                     {isSabotaged ? (
                         <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-pulse">
                             <span>⚠️</span>
                             <span className="uppercase tracking-wide">
                                 {sabotageEffect?.type === 'reduce_colors' ? 'Monochrome!' :
                                  sabotageEffect?.type === 'visual_distortion' ? 'Glitch Mode!' :
                                  sabotageEffect?.type === 'subtract_time' ? 'Time Thief!' : 'SABOTAGED!'}
                             </span>
                         </div>
                     ) : hasSubmitted ? (
                        <div className="bg-green-500 text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1">
                            <span>✅</span> Submitted
                        </div>
                     ) : (
                        <div className="bg-white/20 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-800 border border-white/10 backdrop-blur-sm">
                            <span className="text-purple-600">Round {room.roundNumber}/{room.settings.totalRounds}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">{submittedCount}/{totalPlayers} done</span>
                        </div>
                     )}
                </div>

                {/* Right: Timer Count (Large) */}
                <div className="col-start-3 row-start-1 flex justify-end">
                     <div className={`
                        flex flex-col items-center justify-center w-10 h-10 rounded-full border bg-black/5
                        ${isLowTime ? 'text-red-500 border-red-500/30' : 'text-gray-700 border-gray-500/20'}
                     `}>
                         <span className="text-sm font-black tabular-nums leading-none">{Math.ceil(timeLeft)}</span>
                         <span className="text-[0.5rem] uppercase font-bold opacity-50">sec</span>
                     </div>
                </div>


                {/* --- Row 2 (Spanning) --- */}
                
                {/* Timer Bar + Done Button Container */}
                <div className="col-span-3 row-start-2 flex items-center gap-3">
                    
                    {/* Progress Bar */}
                    <div className="flex-1 h-3 bg-black/10 rounded-full overflow-hidden relative shadow-inner">
                         <div 
                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-linear
                                ${isLowTime ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-gradient-to-r from-green-400 to-emerald-500'}
                            `}
                            style={{ width: `${progress}%` }}
                         />
                    </div>

                    {/* Done Button (Bottom Right) */}
                    <button
                        onClick={onDone}
                        disabled={hasSubmitted}
                        className={`
                            h-9 px-4 rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-1 min-w-[80px] justify-center
                            ${hasSubmitted 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-black text-white hover:bg-gray-800 active:scale-95 border border-transparent shadow-lg'
                            }
                        `}
                    >
                        {hasSubmitted ? 'Done' : 'Finish'}
                        {!hasSubmitted && <span className="text-green-400">✓</span>}
                    </button>
                    
                </div>

            </div>
        </div>
    );
};
