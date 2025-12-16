import React, { useState, useRef, useEffect } from 'react';
import { vibrate, HapticPatterns } from '../../utils/haptics';
import { formatCurrency } from '../../services/currency';

interface BetSelectorProps {
    value: number;
    onChange: (value: number) => void;
    maxBet: number;
    disabled?: boolean;
}

const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100, 250];
const ADJUSTMENTS = [-10, -5, -1, 1, 5, 10];

export const BetSelector: React.FC<BetSelectorProps> = ({
    value,
    onChange,
    maxBet,
    disabled = false
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // Sync input value when value changes externally
    useEffect(() => {
        if (!isEditing) {
            setInputValue(value.toString());
        }
    }, [value, isEditing]);

    const handlePreset = (amount: number) => {
        if (disabled || amount > maxBet) return;
        onChange(amount);
        vibrate(HapticPatterns.medium);
    };

    const handleMax = () => {
        if (disabled || maxBet < 1) return;
        onChange(maxBet);
        vibrate(HapticPatterns.medium);
    };

    const handleAdjust = (delta: number) => {
        if (disabled) return;
        const newValue = Math.max(1, Math.min(maxBet, value + delta));
        if (newValue !== value) {
            onChange(newValue);
            vibrate(HapticPatterns.light);
        }
    };

    const handleTapBetDisplay = () => {
        if (disabled) return;
        setIsEditing(true);
        setInputValue(value.toString());
        vibrate(HapticPatterns.light);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow numbers
        const val = e.target.value.replace(/[^0-9]/g, '');
        setInputValue(val);
    };

    const handleInputSubmit = () => {
        const numValue = parseInt(inputValue, 10);
        if (!isNaN(numValue) && numValue >= 1) {
            onChange(Math.min(numValue, maxBet));
            vibrate(HapticPatterns.medium);
        }
        setIsEditing(false);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputSubmit();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setInputValue(value.toString());
        }
    };

    return (
        <div className="w-full space-y-3">
            {/* Big Bet Display - Tappable */}
            <div 
                className="text-center py-3"
                style={{
                    textShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)'
                }}
            >
                <div className="text-sm uppercase tracking-widest text-yellow-500/70 font-bold mb-1">
                    Your Bet {!isEditing && <span className="text-xs opacity-50">(tap to edit)</span>}
                </div>
                
                {isEditing ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-black text-yellow-400">$</span>
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputSubmit}
                            onKeyDown={handleInputKeyDown}
                            className="w-32 text-4xl font-black text-center bg-black/50 border-2 border-yellow-500 rounded-xl px-3 py-2 text-yellow-400 outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                            style={{
                                caretColor: '#facc15'
                            }}
                        />
                        <button
                            onClick={handleInputSubmit}
                            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-xl active:scale-95 transition-all"
                        >
                            ✓
                        </button>
                    </div>
                ) : (
                    <div 
                        onClick={handleTapBetDisplay}
                        className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600 cursor-pointer hover:scale-105 transition-transform active:scale-95"
                        style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                        }}
                    >
                        {formatCurrency(value)}
                    </div>
                )}
            </div>

            {/* Preset Chips */}
            <div className="flex flex-wrap justify-center gap-2">
                {PRESET_AMOUNTS.map((amount) => {
                    const isDisabled = amount > maxBet;
                    const isSelected = amount === value;
                    
                    return (
                        <button
                            key={amount}
                            onClick={() => handlePreset(amount)}
                            disabled={disabled || isDisabled}
                            className={`
                                px-3 py-2 rounded-full font-bold text-sm transition-all
                                border-2 active:scale-95
                                ${isSelected 
                                    ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 border-yellow-300 text-black shadow-[0_0_15px_rgba(255,215,0,0.5)]' 
                                    : isDisabled
                                        ? 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'
                                        : 'bg-gray-900 border-yellow-600/50 text-yellow-500 hover:border-yellow-500'
                                }
                            `}
                        >
                            ${amount}
                        </button>
                    );
                })}
                
                {/* MAX Button */}
                <button
                    onClick={handleMax}
                    disabled={disabled || maxBet < 1}
                    className={`
                        px-4 py-2 rounded-full font-black text-sm transition-all
                        border-2 active:scale-95 uppercase tracking-wider
                        ${value === maxBet
                            ? 'bg-gradient-to-b from-purple-500 to-purple-700 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                            : maxBet < 1
                                ? 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'
                                : 'bg-purple-900/50 border-purple-500/50 text-purple-400 hover:border-purple-400'
                        }
                    `}
                >
                    MAX
                </button>
            </div>

            {/* Fine-Tune Adjustments */}
            <div className="flex justify-center items-center gap-1">
                {ADJUSTMENTS.map((delta) => {
                    const wouldBeDisabled = delta < 0 
                        ? value + delta < 1 
                        : value + delta > maxBet;
                    
                    return (
                        <button
                            key={delta}
                            onClick={() => handleAdjust(delta)}
                            disabled={disabled || wouldBeDisabled}
                            className={`
                                px-3 py-2 rounded-xl font-bold text-xs transition-all
                                border active:scale-95
                                ${wouldBeDisabled
                                    ? 'bg-gray-800/30 border-gray-700/50 text-gray-600 cursor-not-allowed'
                                    : delta < 0
                                        ? 'bg-red-900/30 border-red-500/30 text-red-400 hover:bg-red-900/50'
                                        : 'bg-green-900/30 border-green-500/30 text-green-400 hover:bg-green-900/50'
                                }
                            `}
                        >
                            {delta > 0 ? '+' : ''}{delta}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BetSelector;

