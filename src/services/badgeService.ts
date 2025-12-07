// Badge Service - Handles badge awards and checks

import { BADGES } from '../constants/cosmetics';
import { XPService } from './xp';
import { AuthService } from './auth';

const BADGES_KEY = 'player_badges';

export const BadgeService = {
    // Get all earned badges
    getUnlockedBadges(): string[] {
        const user = AuthService.getCurrentUser();
        if (user) {
            return user.cosmetics?.badges || [];
        }
        // Fallback to localStorage for guests
        const stored = localStorage.getItem(BADGES_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    // Check if a specific badge is unlocked
    hasBadge(badgeId: string): boolean {
        return this.getUnlockedBadges().includes(badgeId);
    },

    // Award a badge if not already owned
    async awardBadge(badgeId: string): Promise<boolean> {
        if (this.hasBadge(badgeId)) {
            return false; // Already has badge
        }

        const user = AuthService.getCurrentUser();
        if (user) {
            // Update Firebase user
            const currentBadges = user.cosmetics?.badges || [];
            const newBadges = [...currentBadges, badgeId];
            await AuthService.updateUser(user.id, {
                cosmetics: { ...user.cosmetics, badges: newBadges }
            });
        } else {
            // Update localStorage for guests
            const badges = this.getUnlockedBadges();
            badges.push(badgeId);
            localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
        }

        console.log(`🏅 Badge awarded: ${badgeId}`);
        return true;
    },

    // Check and award level-based badges
    async checkAndAwardLevelBadges(currentLevel: number): Promise<string[]> {
        const awardedBadges: string[] = [];

        // Find all level-based badges
        const levelBadges = BADGES.filter(b => 'levelRequired' in b && b.levelRequired);

        for (const badge of levelBadges) {
            const levelRequired = (badge as any).levelRequired as number;
            if (currentLevel >= levelRequired && !this.hasBadge(badge.id)) {
                const awarded = await this.awardBadge(badge.id);
                if (awarded) {
                    awardedBadges.push(badge.id);
                }
            }
        }

        return awardedBadges;
    },

    // Get badge info by ID
    getBadgeInfo(badgeId: string) {
        return BADGES.find(b => b.id === badgeId);
    },

    // Get all level badges (for display purposes)
    getLevelBadges() {
        return BADGES.filter(b => 'levelRequired' in b);
    }
};
