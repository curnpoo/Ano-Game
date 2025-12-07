// Casino Service - Track casino/gambling statistics
import { ref, update, get } from 'firebase/database';
import { database } from '../firebase';
import { AuthService } from './auth';
import type { CasinoStats, UserAccount } from '../types';

const LOCAL_CASINO_STATS_KEY = 'casino_stats';
const LOCAL_USER_KEY = 'logged_in_user';
const USERS_PATH = 'users';

// Default empty stats
const defaultCasinoStats: CasinoStats = {
    totalSpins: 0,
    wins: 0,
    losses: 0,
    jackpotWins: 0,
    twoOfAKindWins: 0,
    totalBetAmount: 0,
    totalWinnings: 0,
    totalLosses: 0,
    biggestWin: 0,
    biggestBet: 0,
    currentStreak: 0,
    longestWinStreak: 0,
    longestLoseStreak: 0,
    netProfit: 0
};

export type SpinResult = 'jackpot' | 'two_of_a_kind' | 'loss';

export const CasinoService = {
    // Get current casino stats (from logged in user or local storage)
    getStats(): CasinoStats {
        const user = AuthService.getCurrentUser();
        if (user?.stats?.casinoStats) {
            return user.stats.casinoStats;
        }

        // Fallback to local storage for guests
        const stored = localStorage.getItem(LOCAL_CASINO_STATS_KEY);
        return stored ? JSON.parse(stored) : { ...defaultCasinoStats };
    },

    // Record a spin result
    async recordSpin(
        betAmount: number,
        winAmount: number,
        result: SpinResult
    ): Promise<void> {
        const stats = this.getStats();
        const isWin = result !== 'loss';

        // Update stats
        stats.totalSpins++;
        stats.totalBetAmount += betAmount;

        if (isWin) {
            stats.wins++;
            stats.totalWinnings += winAmount;

            if (result === 'jackpot') {
                stats.jackpotWins++;
            } else if (result === 'two_of_a_kind') {
                stats.twoOfAKindWins++;
            }

            // Track biggest win
            if (winAmount > stats.biggestWin) {
                stats.biggestWin = winAmount;
            }

            // Update streak
            if (stats.currentStreak >= 0) {
                stats.currentStreak++;
            } else {
                stats.currentStreak = 1;
            }

            // Track longest win streak
            if (stats.currentStreak > stats.longestWinStreak) {
                stats.longestWinStreak = stats.currentStreak;
            }
        } else {
            stats.losses++;
            stats.totalLosses += betAmount;

            // Update streak
            if (stats.currentStreak <= 0) {
                stats.currentStreak--;
            } else {
                stats.currentStreak = -1;
            }

            // Track longest lose streak
            if (Math.abs(stats.currentStreak) > stats.longestLoseStreak) {
                stats.longestLoseStreak = Math.abs(stats.currentStreak);
            }
        }

        // Track biggest bet
        if (betAmount > stats.biggestBet) {
            stats.biggestBet = betAmount;
        }

        // Calculate net profit
        stats.netProfit = stats.totalWinnings - stats.totalBetAmount;

        // Save stats
        await this.saveStats(stats);
    },

    // Save stats to Firebase or local storage
    async saveStats(stats: CasinoStats): Promise<void> {
        const user = AuthService.getCurrentUser();

        if (user) {
            try {
                // Update local cached user
                const updatedStats = {
                    ...user.stats,
                    casinoStats: stats
                };
                user.stats = updatedStats;
                localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));

                // Update Firebase
                await update(ref(database, `${USERS_PATH}/${user.id}`), {
                    'stats.casinoStats': stats
                });
            } catch (error) {
                console.error('Failed to sync casino stats to server:', error);
                // Still save locally as fallback
                localStorage.setItem(LOCAL_CASINO_STATS_KEY, JSON.stringify(stats));
            }
        } else {
            // Guest: save to local storage
            localStorage.setItem(LOCAL_CASINO_STATS_KEY, JSON.stringify(stats));
        }
    },

    // Sync stats from Firebase (call on login)
    async syncStats(): Promise<CasinoStats> {
        const user = AuthService.getCurrentUser();
        if (!user) {
            return this.getStats();
        }

        try {
            const userRef = ref(database, `${USERS_PATH}/${user.id}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val() as UserAccount;
                if (userData.stats?.casinoStats) {
                    // Update local cache
                    user.stats.casinoStats = userData.stats.casinoStats;
                    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
                    return userData.stats.casinoStats;
                }
            }
        } catch (error) {
            console.error('Failed to sync casino stats:', error);
        }

        return this.getStats();
    },

    // Get win rate as percentage
    getWinRate(): number {
        const stats = this.getStats();
        if (stats.totalSpins === 0) return 0;
        return Math.round((stats.wins / stats.totalSpins) * 100);
    },

    // Get return on investment (ROI) as percentage
    getROI(): number {
        const stats = this.getStats();
        if (stats.totalBetAmount === 0) return 0;
        return Math.round((stats.netProfit / stats.totalBetAmount) * 100);
    },

    // Reset stats (for testing or account deletion)
    async resetStats(): Promise<void> {
        localStorage.removeItem(LOCAL_CASINO_STATS_KEY);

        const user = AuthService.getCurrentUser();
        if (user) {
            try {
                await update(ref(database, `${USERS_PATH}/${user.id}`), {
                    'stats.casinoStats': defaultCasinoStats
                });
            } catch (error) {
                console.error('Failed to reset casino stats on server:', error);
            }
        }
    }
};
