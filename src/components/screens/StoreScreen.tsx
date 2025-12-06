import React, { useState } from 'react';
import { CurrencyService, formatCurrency } from '../../services/currency';
import { UNLOCKABLE_BRUSHES, POWERUPS, CARD_THEMES } from '../../constants/cosmetics';
import { vibrate, HapticPatterns } from '../../utils/haptics';

interface StoreScreenProps {
    onBack: () => void;
}

type Tab = 'brushes' | 'powerups' | 'themes';

export const StoreScreen: React.FC<StoreScreenProps> = ({ onBack }) => {
    const [balance, setBalance] = useState(CurrencyService.getCurrency());
    const [activeTab, setActiveTab] = useState<Tab>('brushes');
    const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
    const purchasedItems = CurrencyService.getPurchasedItems();

    const handlePurchase = (itemId: string, price: number, itemName: string) => {
        if (price === 0) return; // Free items

        if (CurrencyService.purchaseItem(itemId, price)) {
            vibrate(HapticPatterns.success);
            setBalance(CurrencyService.getCurrency());
            setPurchaseMessage(`✅ Purchased ${itemName}!`);
            setTimeout(() => setPurchaseMessage(null), 2000);
        } else {
            vibrate(HapticPatterns.error);
            setPurchaseMessage(`❌ Not enough money!`);
            setTimeout(() => setPurchaseMessage(null), 2000);
        }
    };

    const isOwned = (itemId: string, price: number) =>
        price === 0 || purchasedItems.includes(itemId);

    const tabs = [
        { id: 'brushes' as Tab, label: '🖌️ Brushes', items: UNLOCKABLE_BRUSHES.filter(b => b.price > 0) },
        { id: 'powerups' as Tab, label: '⚡ Powerups', items: POWERUPS },
        { id: 'themes' as Tab, label: '🎨 Themes', items: CARD_THEMES.filter(t => t.price > 0) }
    ];

    const currentItems = tabs.find(t => t.id === activeTab)?.items || [];

    return (
        <div
            className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900 flex flex-col"
            style={{
                paddingTop: 'max(1.5rem, env(safe-area-inset-top) + 1rem)',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
            }}
        >
            {/* Home Button Card */}
            <button
                onClick={onBack}
                className="mx-4 mb-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/20 flex items-center gap-4 hover:bg-white/20 active:scale-95 transition-all"
            >
                <div className="text-3xl">🏠</div>
                <div className="flex-1 text-left">
                    <div className="text-lg font-bold text-white">Back to Home</div>
                    <div className="text-white/60 text-sm">Return to main menu</div>
                </div>
                <div className="text-2xl text-white/60">←</div>
            </button>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 mb-2">
                <h1 className="text-2xl font-black text-white drop-shadow-lg">🛒 STORE</h1>
                <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold">
                    {formatCurrency(balance)}
                </div>
            </div>

            {/* Purchase message */}
            {purchaseMessage && (
                <div className="mx-4 mb-2 bg-white rounded-xl p-3 text-center font-bold pop-in">
                    {purchaseMessage}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 px-4 mb-4 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-white text-purple-600 shadow-lg scale-105'
                            : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="grid grid-cols-2 gap-3">
                    {currentItems.map((item: any) => {
                        const owned = isOwned(item.id, item.price);
                        return (
                            <div
                                key={item.id}
                                className={`bg-white rounded-2xl p-4 shadow-lg ${owned ? 'opacity-70' : ''}`}
                            >
                                <div className="text-4xl text-center mb-2">
                                    {item.emoji || item.preview || '🎁'}
                                </div>
                                <div className="text-center font-bold text-gray-800 mb-1">
                                    {item.name}
                                </div>
                                {item.description && (
                                    <div className="text-center text-xs text-gray-500 mb-2">
                                        {item.description}
                                    </div>
                                )}
                                <button
                                    onClick={() => handlePurchase(item.id, item.price, item.name)}
                                    disabled={owned}
                                    className={`w-full py-2 rounded-xl font-bold text-sm transition-all ${owned
                                        ? 'bg-gray-200 text-gray-500'
                                        : balance >= item.price
                                            ? 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:scale-105'
                                            : 'bg-red-100 text-red-500'
                                        }`}
                                >
                                    {owned ? '✓ Owned' : formatCurrency(item.price)}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {currentItems.length === 0 && (
                    <div className="text-center text-white/70 py-8">
                        Nothing available in this category yet!
                    </div>
                )}
            </div>
        </div>
    );
};
