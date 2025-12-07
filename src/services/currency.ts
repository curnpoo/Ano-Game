// Currency Service - Handles player currency persistence and transactions
import { ref, update } from 'firebase/database';
import { database } from '../firebase';
import type { UserAccount } from '../types';

const CURRENCY_KEY = 'player_currency';
const PURCHASED_ITEMS_KEY = 'player_purchased_items';
const LOCAL_USER_KEY = 'logged_in_user';

import { XPService } from './xp';

// Format currency with $ and commas (e.g., $1,999)
export const formatCurrency = (amount: number): string => {
    return '$' + Math.floor(amount).toLocaleString('en-US');
};

export const CurrencyService = {
    // Get player's current currency balance
    getCurrency(): number {
        const stored = localStorage.getItem(CURRENCY_KEY);
        return stored ? parseInt(stored, 10) : 0;
    },

    // Set player's currency balance
    setCurrency(amount: number): void {
        const value = Math.max(0, amount);
        localStorage.setItem(CURRENCY_KEY, value.toString());
        window.dispatchEvent(new Event('currency-updated'));

        // Sync to Firebase if logged in
        try {
            const storedUser = localStorage.getItem(LOCAL_USER_KEY);
            if (storedUser) {
                const user = JSON.parse(storedUser) as UserAccount;
                // Update local cached user object too so it stays in sync
                user.currency = value;
                localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));

                // Fire and forget update to Firebase
                const userRef = ref(database, `users/${user.id}`);
                update(userRef, { currency: value }).catch(err =>
                    console.error('Failed to sync currency to server:', err)
                );
            }
        } catch (e) {
            console.error('Error syncing currency:', e);
        }
    },

    // Add currency (returns new balance)
    addCurrency(amount: number): number {
        // Apply Tier Bonus
        const finalAmount = XPService.applyCurrencyBonus(amount);

        const current = this.getCurrency();
        const newBalance = current + finalAmount;
        this.setCurrency(newBalance);
        return newBalance;
    },

    // Spend currency (returns true if successful, false if insufficient funds)
    spendCurrency(amount: number): boolean {
        const current = this.getCurrency();
        if (current < amount) return false;
        this.setCurrency(current - amount);
        return true;
    },

    // Get list of purchased items
    getPurchasedItems(): string[] {
        const stored = localStorage.getItem(PURCHASED_ITEMS_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    // Add an item to purchased list
    addPurchasedItem(itemId: string): void {
        const items = this.getPurchasedItems();
        if (!items.includes(itemId)) {
            items.push(itemId);
            localStorage.setItem(PURCHASED_ITEMS_KEY, JSON.stringify(items));

            // Sync to Firebase if logged in
            try {
                const storedUser = localStorage.getItem(LOCAL_USER_KEY);
                if (storedUser) {
                    const user = JSON.parse(storedUser) as UserAccount;
                    // Update local cached user
                    user.purchasedItems = [...(user.purchasedItems || []), itemId];
                    // Dedupe just in case
                    user.purchasedItems = [...new Set(user.purchasedItems)];
                    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));

                    // Fire and forget update
                    const userRef = ref(database, `users/${user.id}`);
                    update(userRef, { purchasedItems: user.purchasedItems }).catch(err =>
                        console.error('Failed to sync purchased item to server:', err)
                    );
                }
            } catch (e) {
                console.error('Error syncing purchased item:', e);
            }
        }
    },

    // Check if item is purchased
    isItemPurchased(itemId: string): boolean {
        return this.getPurchasedItems().includes(itemId);
    },

    // Purchase an item (checks balance and deducts)
    purchaseItem(itemId: string, price: number): boolean {
        if (this.isItemPurchased(itemId)) return true; // Already owned
        if (!this.spendCurrency(price)) return false;
        this.addPurchasedItem(itemId);
        return true;
    },

    // Reset all currency data (for testing)
    reset(): void {
        localStorage.removeItem(CURRENCY_KEY);
        localStorage.removeItem(PURCHASED_ITEMS_KEY);
    }
};
