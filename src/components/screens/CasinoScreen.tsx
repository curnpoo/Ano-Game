import React, { useState, useCallback, useEffect } from 'react';
import { CurrencyService, formatCurrency } from '../../services/currency';
import { CasinoService } from '../../services/casino';
import type { SpinResult } from '../../services/casino';
import { vibrate, HapticPatterns } from '../../utils/haptics';
import { BetSelector } from '../common/BetSelector';

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

// Payout reference data
const PAYOUT_INFO = [
    { symbols: '7️⃣7️⃣7️⃣', multiplier: 10, label: 'Triple 7s' },
    { symbols: '💎💎💎', multiplier: 7, label: 'Diamonds' },
    { symbols: '🎰🎰🎰', multiplier: 5, label: 'Jackpot' },
    { symbols: '🍒🍒🍒', multiplier: 3, label: 'Cherries' },
    { symbols: '2 Match', multiplier: 1.5, label: 'Any Pair' },
];

export const CasinoScreen: React.FC<CasinoScreenProps> = ({ onClose }) => {
    const [balance, setBalance] = useState(CurrencyService.getCurrency());
    const [bet, setBet] = useState(1);
    const [reels, setReels] = useState(['🎰', '🎰', '🎰']);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<{ message: string; win: number } | null>(null);
    const [spinningReels, setSpinningReels] = useState([false, false, false]);
    const [showStats, setShowStats] = useState(false);

    // Update balance when it changes externally
    useEffect(() => {
        const handleCurrencyUpdate = () => {
            setBalance(CurrencyService.getCurrency());
        };
        window.addEventListener('currency-updated', handleCurrencyUpdate);
        setBalance(CurrencyService.getCurrency());

        return () => window.removeEventListener('currency-updated', handleCurrencyUpdate);
    }, []);

    // Clamp bet to balance if balance changes
    useEffect(() => {
        if (bet > balance && balance >= 1) {
            setBet(Math.max(1, balance));
        }
    }, [balance, bet]);

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

        // Stop reels one by one with "thud" haptics
        setTimeout(() => {
            setReels([results[0], reels[1], reels[2]]);
            setSpinningReels([false, true, true]);
            vibrate(HapticPatterns.light);
        }, 600);

        setTimeout(() => {
            setReels([results[0], results[1], reels[2]]);
            setSpinningReels([false, false, true]);
            vibrate(HapticPatterns.light);
        }, 1200);

        setTimeout(async () => {
            setReels(results);
            setSpinningReels([false, false, false]);

            // Check for wins
            let winAmount = 0;
            let message = '';
            let spinResult: SpinResult = 'loss';

            // All three match
            if (results[0] === results[1] && results[1] === results[2]) {
                const multiplier = WINNING_COMBOS[results[0]] || 2;
                winAmount = bet * multiplier;
                message = `JACKPOT! ${results[0]} x3 = ${multiplier}x`;
                spinResult = 'jackpot';
                vibrate(HapticPatterns.success);
            }
            // Two match
            else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
                winAmount = bet * 1.5;
                message = `Nice hit! 2 of a kind!`;
                spinResult = 'two_of_a_kind';
                vibrate(HapticPatterns.medium);
            }
            // No match
            else {
                message = 'Try again!';
                spinResult = 'loss';
                vibrate(HapticPatterns.error);
            }

            if (winAmount > 0) {
                CurrencyService.addCurrency(Math.floor(winAmount));
                setBalance(CurrencyService.getCurrency());
            }

            // Track casino stats
            await CasinoService.recordSpin(bet, Math.floor(winAmount), spinResult);

            setResult({ message, win: winAmount });
            setSpinning(false);
        }, 1800);
    }, [spinning, balance, bet, reels]);


    return (
        <div
            className="fixed inset-0 overflow-y-auto flex flex-col items-center bg-black"
            style={{ height: '100dvh' }}
        >
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[80%] bg-[radial-gradient(circle,rgba(255,215,0,0.15)_0%,rgba(0,0,0,0)_70%)] animate-pulse-slow" />
                <div className="absolute bottom-0 w-full h-[300px] bg-gradient-to-t from-red-900/20 to-transparent opacity-50" />

                {/* Neon Grid Floor */}
                <div className="absolute bottom-0 w-full h-[50%] opacity-20"
                    style={{
                        background: 'linear-gradient(transparent 50%, #8000FF 50%), linear-gradient(90deg, rgba(128,0,255,0.3) 1px, transparent 1px)',
                        backgroundSize: '100% 40px, 40px 100%',
                        transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)'
                    }}
                />
            </div>

            {/* Content Container */}
            <div
                className="relative z-10 w-full max-w-md flex flex-col px-4 pb-6"
                style={{
                    paddingTop: 'max(1rem, env(safe-area-inset-top) + 0.5rem)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-white/10 text-white border border-white/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                        ←
                    </button>
                    <div className="px-5 py-2 rounded-full border border-yellow-500/50 bg-black/40 text-yellow-400 font-mono font-black text-xl shadow-[0_0_20px_rgba(255,215,0,0.2)] backdrop-blur-md">
                        {formatCurrency(balance)}
                    </div>
                </div>

                {/* Logo - Compact */}
                <div className="mb-4 relative text-center">
                    <h1
                        className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 tracking-tighter"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' }}
                    >
                        CASINO
                    </h1>
                    <div className="text-pink-500 font-cursive text-xl -mt-2 transform -rotate-6 filter drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]">
                        Night
                    </div>
                </div>

                {/* Slot Machine Frame - Polished */}
                <div 
                    className="w-full relative p-4 rounded-3xl border-4 border-yellow-600 shadow-[0_0_50px_rgba(255,165,0,0.3),inset_0_2px_20px_rgba(255,215,0,0.1)]"
                    style={{
                        background: 'linear-gradient(180deg, #2a2218 0%, #1a1510 50%, #0d0a08 100%)',
                    }}
                >
                    {/* Gold Texture Overlay */}
                    <div 
                        className="absolute inset-0 rounded-3xl opacity-20 pointer-events-none"
                        style={{
                            backgroundImage: 'url(/textures/slot_machine_texture.png)',
                            backgroundSize: 'cover',
                            mixBlendMode: 'overlay'
                        }}
                    />

                    {/* Decorative Rivets */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                        {[...Array(5)].map((_, i) => (
                            <div key={`top-${i}`} className="w-3 h-3 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-700 shadow-inner" />
                        ))}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                        {[...Array(5)].map((_, i) => (
                            <div key={`bot-${i}`} className="w-3 h-3 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-700 shadow-inner" />
                        ))}
                    </div>

                    {/* Animated Lights */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between px-2">
                        {[...Array(6)].map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${spinning ? 'animate-pulse bg-red-500 shadow-[0_0_12px_red]' : 'bg-red-900'}`} 
                                style={{ animationDelay: `${i * 100}ms` }} 
                            />
                        ))}
                    </div>

                    {/* Reels Window */}
                    <div className="mt-8 mb-3 bg-gradient-to-b from-gray-200 to-white rounded-xl p-1 shadow-[inset_0_4px_12px_rgba(0,0,0,0.3)] border-4 border-gray-700 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none z-10" />
                        <div className="flex bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg overflow-hidden">
                            {reels.map((symbol, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 h-20 flex items-center justify-center text-5xl border-r last:border-r-0 border-gray-300
                                    ${spinningReels[i] ? 'animate-slot-spin blur-sm' : 'animate-bounce-short'}`}
                                >
                                    {spinningReels[i] ? '🎰' : symbol}
                                </div>
                            ))}
                        </div>

                        {/* Win Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent z-20 pointer-events-none shadow-[0_0_8px_red]" />
                    </div>

                    {/* Result Display */}
                    <div className="h-10 text-center flex items-center justify-center">
                        {result ? (
                            <div className={`font-black text-lg animate-pop-in ${result.win > 0 ? 'text-green-400 drop-shadow-[0_0_8px_lime]' : 'text-red-400'}`}>
                                {result.message}
                                {result.win > 0 && <span className="block text-xl text-yellow-400">+{formatCurrency(result.win)}</span>}
                            </div>
                        ) : (
                            <div className="text-yellow-600/50 font-bold tracking-widest text-xs uppercase">Good Luck!</div>
                        )}
                    </div>

                    {/* SPIN Button - Inside machine frame for premium feel */}
                    <button
                        onClick={spin}
                        disabled={spinning || balance < bet}
                        className={`w-full py-4 rounded-2xl font-black text-xl tracking-widest uppercase transition-all border-2
                            ${spinning
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed scale-95 border-gray-700'
                                : balance < bet
                                    ? 'bg-red-900/50 text-red-500 border-red-500/50'
                                    : 'bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-black border-yellow-400 shadow-[0_0_25px_rgba(255,165,0,0.6)] animate-shimmer bg-[length:200%_auto] hover:scale-[1.02] active:scale-95'
                            }
                        `}
                    >
                        {spinning ? '🎰 Spinning...' : balance < bet ? '💸 Add Funds' : '★ SPIN ★'}
                    </button>
                </div>

                {/* Bet Selector */}
                <div className="mt-4 bg-black/40 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                    <BetSelector
                        value={bet}
                        onChange={setBet}
                        maxBet={balance}
                        disabled={spinning}
                    />
                </div>

                {/* Payout Reference */}
                <div className="mt-4 bg-black/40 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                    <div className="text-center text-xs uppercase tracking-widest text-yellow-500/70 font-bold mb-3">
                        📊 Payout Table (Bet: {formatCurrency(bet)})
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {PAYOUT_INFO.map((info, i) => (
                            <div 
                                key={i} 
                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5"
                            >
                                <span className="text-sm">{info.symbols}</span>
                                <span className="font-mono font-bold text-yellow-400 text-sm">
                                    {formatCurrency(Math.floor(bet * info.multiplier))}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Stats Trigger */}
                <button
                    onClick={() => setShowStats(true)}
                    className="mx-auto mt-4 py-3 px-10 rounded-2xl bg-white/10 border border-white/10 text-sm font-bold text-white/80 uppercase tracking-widest hover:bg-white/20 hover:text-white transition-all active:scale-95 shadow-lg backdrop-blur-sm"
                >
                    View Stats
                </button>

                {/* Stats Modal */}
                {showStats && <CasinoStatsModal onClose={() => setShowStats(false)} />}
            </div>
        </div>
    );
};


// Casino Stats Modal Component (Expanded with Real-Time Updates)
const CasinoStatsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [stats, setStats] = useState(CasinoService.getStats());
    const [winRate, setWinRate] = useState(CasinoService.getWinRate());
    const [roi, setRoi] = useState(CasinoService.getROI());

    // Real-time updates
    useEffect(() => {
        const updateStats = () => {
            setStats(CasinoService.getStats());
            setWinRate(CasinoService.getWinRate());
            setRoi(CasinoService.getROI());
        };

        // Update every 500ms for real-time feel
        const interval = setInterval(updateStats, 500);
        return () => clearInterval(interval);
    }, []);

    const statGroups = [
        {
            title: 'Overview',
            items: [
                { label: 'Total Spins', value: stats.totalSpins, emoji: '🎰' },
                { label: 'Win Rate', value: `${winRate}%`, emoji: '📈' },
                { label: 'ROI', value: `${roi >= 0 ? '+' : ''}${roi}%`, emoji: roi >= 0 ? '💰' : '📉', color: roi >= 0 ? '#4ade80' : '#f87171' },
            ]
        },
        {
            title: 'Winnings',
            items: [
                { label: 'Jackpots (3x)', value: stats.jackpotWins, emoji: '💎' },
                { label: 'Pairs (2x)', value: stats.twoOfAKindWins, emoji: '✨' },
                { label: 'Biggest Win', value: formatCurrency(stats.biggestWin), emoji: '🏆', color: '#facc15' },
            ]
        },
        {
            title: 'Betting',
            items: [
                { label: 'Total Wagered', value: formatCurrency(stats.totalBetAmount), emoji: '💵' },
                { label: 'Total Won', value: formatCurrency(stats.totalWinnings), emoji: '💰', color: '#4ade80' },
                { label: 'Total Lost', value: formatCurrency(stats.totalLosses), emoji: '💸', color: '#f87171' },
                { label: 'Biggest Bet', value: formatCurrency(stats.biggestBet), emoji: '🎲' },
            ]
        },
        {
            title: 'Streaks',
            items: [
                { 
                    label: 'Current Streak', 
                    value: stats.currentStreak > 0 ? `${stats.currentStreak} wins` : stats.currentStreak < 0 ? `${Math.abs(stats.currentStreak)} losses` : '-',
                    emoji: stats.currentStreak > 0 ? '🔥' : stats.currentStreak < 0 ? '❄️' : '➖',
                    color: stats.currentStreak > 0 ? '#4ade80' : stats.currentStreak < 0 ? '#f87171' : undefined
                },
                { label: 'Best Win Streak', value: stats.longestWinStreak, emoji: '🏅', color: '#4ade80' },
                { label: 'Worst Lose Streak', value: stats.longestLoseStreak, emoji: '😢', color: '#f87171' },
            ]
        },
        {
            title: 'Net Profit',
            items: [
                { 
                    label: 'Net Profit', 
                    value: `${stats.netProfit >= 0 ? '+' : ''}${formatCurrency(stats.netProfit)}`, 
                    emoji: stats.netProfit >= 0 ? '🤑' : '💸', 
                    color: stats.netProfit >= 0 ? '#4ade80' : '#f87171',
                    large: true
                },
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div
                className="relative z-10 w-full max-w-sm bg-gray-900 border-2 border-yellow-500/30 rounded-3xl p-5 shadow-2xl pop-in max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center mb-4">
                    <div className="text-4xl mb-1">📊</div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Casino Stats</h2>
                    <div className="text-xs text-white/50">Updates in real-time</div>
                </div>

                <div className="space-y-4">
                    {statGroups.map((group, gi) => (
                        <div key={gi}>
                            <div className="text-xs uppercase tracking-wider text-yellow-500/70 font-bold mb-2">{group.title}</div>
                            <div className="space-y-1.5">
                                {group.items.map((item, i) => (
                                    <div 
                                        key={i} 
                                        className={`flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 ${(item as any).large ? 'py-4' : ''}`}
                                    >
                                        <div className="flex items-center gap-2 text-white/70 font-bold">
                                            <span>{item.emoji}</span>
                                            <span className="text-xs">{item.label}</span>
                                        </div>
                                        <div 
                                            className={`font-mono font-black text-white ${(item as any).large ? 'text-xl' : 'text-sm'}`} 
                                            style={item.color ? { color: item.color } : {}}
                                        >
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-5 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};
