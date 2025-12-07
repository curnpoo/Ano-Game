import React, { useState, useCallback } from 'react';
import { CurrencyService, formatCurrency } from '../../services/currency';
import { vibrate, HapticPatterns } from '../../utils/haptics';

interface CasinoScreenProps {
    onClose: () => void;
}

const SYMBOLS = ['🍒', '🍋', '🍊', '💎', '7️⃣', '🎰'];
const WINNING_COMBOS: { [key: string]: number } = {
    '7️⃣': 10,  // Triple 7s = 10x
    '💎': 7,   // Triple diamonds = 7x
    '🎰': 5,   // Triple jackpot = 5x
    '🍒': 3,   // Triple cherries = 3x
    '🍋': 2,   // Triple lemons = 2x
    '🍊': 2    // Triple oranges = 2x
};

export const CasinoScreen: React.FC<CasinoScreenProps> = ({ onClose }) => {
    const [balance, setBalance] = useState(CurrencyService.getCurrency());
    const [bet, setBet] = useState(1);
    const [reels, setReels] = useState(['🎰', '🎰', '🎰']);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<{ message: string; win: number } | null>(null);
    const [spinningReels, setSpinningReels] = useState([false, false, false]);

    // Update balance when it changes externally
    React.useEffect(() => {
        const handleCurrencyUpdate = () => {
            setBalance(CurrencyService.getCurrency());
        };
        window.addEventListener('currency-updated', handleCurrencyUpdate);
        // Also check on mount just in case
        setBalance(CurrencyService.getCurrency());

        return () => window.removeEventListener('currency-updated', handleCurrencyUpdate);
    }, []);

    const spin = useCallback(async () => {
        if (spinning || balance < bet) return;

        setResult(null);
        setSpinning(true);
        vibrate(HapticPatterns.light);

        // Deduct bet
        CurrencyService.spendCurrency(bet);
        setBalance(CurrencyService.getCurrency());

        // Start spinning animation
        setSpinningReels([true, true, true]);

        // Generate random results
        const results = Array(3).fill(0).map(() =>
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        );

        // Stop reels one by one
        setTimeout(() => {
            setReels([results[0], reels[1], reels[2]]);
            setSpinningReels([false, true, true]);
            vibrate(HapticPatterns.light);
        }, 500);

        setTimeout(() => {
            setReels([results[0], results[1], reels[2]]);
            setSpinningReels([false, false, true]);
            vibrate(HapticPatterns.light);
        }, 1000);

        setTimeout(() => {
            setReels(results);
            setSpinningReels([false, false, false]);

            // Check for wins
            let winAmount = 0;
            let message = '';

            // All three match
            if (results[0] === results[1] && results[1] === results[2]) {
                const multiplier = WINNING_COMBOS[results[0]] || 2;
                winAmount = bet * multiplier;
                message = `🎉 JACKPOT! ${results[0]} x3 = ${multiplier}x`;
                vibrate(HapticPatterns.success);
            }
            // Two match
            else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
                winAmount = bet * 1.5;
                message = `✨ Two of a kind! +${winAmount.toFixed(0)}$`;
                vibrate(HapticPatterns.medium);
            }
            // No match
            else {
                message = '😢 No luck this time...';
                vibrate(HapticPatterns.error);
            }

            if (winAmount > 0) {
                CurrencyService.addCurrency(Math.floor(winAmount));
                setBalance(CurrencyService.getCurrency());
            }

            setResult({ message, win: winAmount });
            setSpinning(false);
        }, 1500);
    }, [spinning, balance, bet, reels]);

    return (
    return (
        <div
            className="fixed inset-0 flex flex-col items-center p-4 z-50 overflow-y-auto"
            style={{
                paddingTop: 'max(1.5rem, env(safe-area-inset-top) + 1rem)',
                backgroundColor: 'var(--theme-bg-primary)'
            }}
        >
            {/* Home Button Card */}
            <button
                onClick={onClose}
                className="w-full max-w-md mb-6 rounded-[2rem] p-4 border-2 flex items-center gap-4 hover:brightness-110 active:scale-95 transition-all shadow-lg"
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

            {/* Title */}
            <div className="text-center mb-6">
                <h1 className="text-4xl font-black text-yellow-500 drop-shadow-lg mb-2">
                    🎰 CASINO 🎰
                </h1>
                <div className="text-yellow-400 text-xl font-bold">
                    {formatCurrency(balance)}
                </div>
            </div>

            {/* Slot Machine */}
            <div className="bg-gradient-to-b from-yellow-600 to-yellow-700 p-6 rounded-[2rem] shadow-2xl border-4 border-yellow-400 mb-6 w-full max-w-md">
                <div className="bg-black rounded-2xl p-4 flex gap-2 justify-center">
                    {reels.map((symbol, i) => (
                        <div
                            key={i}
                            className={`w-20 h-24 bg-white rounded-xl flex items-center justify-center text-5xl
                                ${spinningReels[i] ? 'animate-bounce' : 'pop-in'}
                            `}
                            style={{
                                boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.3)',
                                animationDelay: `${i * 100}ms`
                            }}
                        >
                            {spinningReels[i] ? (
                                <span className="animate-spin">🎲</span>
                            ) : symbol}
                        </div>
                    ))}
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className={`text-center mb-4 pop-in ${result.win > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <div className="text-2xl font-bold">{result.message}</div>
                    {result.win > 0 && (
                        <div className="text-3xl font-bold text-yellow-400 animate-pulse">
                            +${Math.floor(result.win)}
                        </div>
                    )}
                </div>
            )}

            {/* Bet Selector */}
            <div className="flex items-center gap-4 mb-6">
                <span className="font-bold" style={{ color: 'var(--theme-text)' }}>BET:</span>
                {[1, 2, 5].map(amount => (
                    <button
                        key={amount}
                        onClick={() => setBet(amount)}
                        disabled={balance < amount}
                        className={`w-12 h-12 rounded-full font-bold text-lg transition-all border-2
                            ${bet === amount
                                ? 'scale-110 shadow-lg'
                                : 'hover:opacity-80'}
                            ${balance < amount ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        style={{
                            backgroundColor: bet === amount ? 'var(--theme-accent)' : 'var(--theme-bg-secondary)',
                            color: bet === amount ? '#fff' : 'var(--theme-text)',
                            borderColor: 'var(--theme-border)'
                        }}
                    >
                        ${amount}
                    </button>
                ))}
            </div>

            {/* Spin Button */}
            <button
                onClick={spin}
                disabled={spinning || balance < bet}
                className={`px-12 py-4 rounded-2xl font-bold text-2xl transition-all w-full max-w-xs
                    ${spinning
                        ? 'bg-gray-600 text-gray-400'
                        : balance < bet
                            ? 'bg-red-600 text-white opacity-50'
                            : 'hover:scale-105 shadow-xl'}
                `}
                style={{
                    background: (!spinning && balance >= bet) ? 'linear-gradient(135deg, var(--theme-accent) 0%, #FFD700 100%)' : undefined,
                    color: '#fff'
                }}
            >
                {spinning ? '🎲 SPINNING...' : balance < bet ? '💸 BROKE!' : `SPIN! ($${bet})`}
            </button>

            {/* Paytable */}
            <div className="mt-8 text-center text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                <div className="font-bold mb-2">PAYOUTS:</div>
                <div className="flex flex-wrap justify-center gap-2">
                    {Object.entries(WINNING_COMBOS).map(([symbol, mult]) => (
                        <span key={symbol} className="px-2 py-1 rounded border opacity-70"
                            style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
                            {symbol}x3 = {mult}x
                        </span>
                    ))}
                </div>
                <div className="mt-2 text-xs">Two of a kind = 1.5x</div>
            </div>
        </div>
    );
};
