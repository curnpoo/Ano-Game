import React, { useState } from 'react';
import { CurrencyService, formatCurrency } from '../../services/currency';
import { AuthService } from '../../services/auth';
import { UNLOCKABLE_BRUSHES, POWERUPS, CARD_THEMES } from '../../constants/cosmetics';
import { vibrate, HapticPatterns } from '../../utils/haptics';

interface StoreScreenProps {
    onBack: () => void;
    onEquip?: (themeId: string) => void;
}

type Tab = 'brushes' | 'powerups' | 'themes';

export const StoreScreen: React.FC<StoreScreenProps> = ({ onBack, onEquip }) => {
    const [balance, setBalance] = useState(CurrencyService.getCurrency());
    const [activeTab, setActiveTab] = useState<Tab>('brushes');
    const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
    const purchasedItems = CurrencyService.getPurchasedItems();

    const isOwned = (itemId: string, price: number) =>
        price === 0 || purchasedItems.includes(itemId);

    const handleAction = (item: any) => {
        const owned = isOwned(item.id, item.price);

        if (activeTab === 'themes' && owned) {
            // Equip Logic
            const currentUser = AuthService.getCurrentUser();
            if (currentUser) {
                const newCosmetics = { ...currentUser.cosmetics, activeTheme: item.id };
                AuthService.updateUser(currentUser.id, { cosmetics: newCosmetics });

                try {
                    vibrate(HapticPatterns.light);
                } catch (err) {
                    console.error('Haptic feedback failed:', err);
                }

                setPurchaseMessage(`🎨 Equipped ${item.name}!`);
                setTimeout(() => setPurchaseMessage(null), 1500);

                // Trigger transition if handler provided, passing the new theme ID
                onEquip?.(item.id);
            }
            return;
        }

        // Purchase Logic
        if (item.price === 0) return;

        if (CurrencyService.purchaseItem(item.id, item.price)) {
            vibrate(HapticPatterns.success);
            setBalance(CurrencyService.getCurrency());
            setPurchaseMessage(`✅ Purchased ${item.name}!`);
            setTimeout(() => setPurchaseMessage(null), 2000);
        } else {
            vibrate(HapticPatterns.error);
            setPurchaseMessage(`❌ Not enough money!`);
            setTimeout(() => setPurchaseMessage(null), 2000);
        }
    };

    const isEquipped = (itemId: string) => {
        const currentUser = AuthService.getCurrentUser();
        return currentUser?.cosmetics?.activeTheme === itemId;
    };

    const tabs = [
        { id: 'brushes' as Tab, label: '🖌️ Brushes', items: UNLOCKABLE_BRUSHES.filter(b => b.price > 0) },
        { id: 'powerups' as Tab, label: '⚡ Powerups', items: POWERUPS },
        { id: 'themes' as Tab, label: '🎨 Themes', items: CARD_THEMES }
    ];

    const currentItems = tabs.find(t => t.id === activeTab)?.items || [];

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                paddingTop: 'max(1.5rem, env(safe-area-inset-top) + 1rem)',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                backgroundColor: 'var(--theme-bg-primary)'
            }}
        >
            {/* Home Button Card */}
            <button
                onClick={onBack}
                className="mx-4 mb-4 rounded-[2rem] p-4 border-2 flex items-center gap-4 hover:brightness-110 active:scale-95 transition-all shadow-lg"
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

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 mb-2">
                <h1 className="text-2xl font-black drop-shadow-lg" style={{ color: 'var(--theme-text)' }}>🛒 STORE</h1>
                <div className="text-white px-4 py-2 rounded-xl font-bold font-mono shadow-md"
                    style={{ backgroundColor: 'var(--theme-accent)' }}>
                    {formatCurrency(balance)}
                </div>
            </div>

            {/* Purchase message */}
            {purchaseMessage && (
                <div className="mx-4 mb-2 rounded-xl p-3 text-center font-bold pop-in shadow-lg border-2 border-green-400 bg-green-100 text-green-800">
                    {purchaseMessage}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 px-4 mb-4 overflow-x-auto no-scrollbar py-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border-2 ${activeTab === tab.id
                            ? 'shadow-lg scale-105'
                            : 'hover:brightness-110 grayscale opacity-80'
                            }`}
                        style={{
                            backgroundColor: activeTab === tab.id ? 'var(--theme-accent)' : 'var(--theme-bg-secondary)',
                            color: activeTab === tab.id ? '#fff' : 'var(--theme-text)',
                            borderColor: 'var(--theme-border)'
                        }}
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
                        const equipped = activeTab === 'themes' && isEquipped(item.id);

                        return (
                            <div
                                key={item.id}
                                className={`rounded-[2rem] p-4 shadow-lg flex flex-col items-center justify-between relative overflow-hidden transition-all ${equipped ? 'ring-4 ring-green-400 scale-[1.02]' : ''}`}
                                style={{
                                    backgroundColor: 'var(--theme-card-bg)',
                                    border: '2px solid var(--theme-border)'
                                }}
                            >
                                {equipped && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg z-10">
                                        ACTIVE
                                    </div>
                                )}

                                <div className="text-5xl mb-3 mt-1 hover:scale-110 transition-transform cursor-default">
                                    {item.emoji || item.preview || '🎁'}
                                </div>

                                <div className="text-center w-full mb-3">
                                    <div className="font-bold text-lg leading-tight mb-1" style={{ color: 'var(--theme-text)' }}>
                                        {item.name}
                                    </div>
                                    {item.description && (
                                        <div className="text-xs line-clamp-2 min-h-[2.5em]" style={{ color: 'var(--theme-text-secondary)' }}>
                                            {item.description}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleAction(item)}
                                    disabled={activeTab === 'themes' ? false : owned} // Themes can be clicked to equip even if owned
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md border-2`}
                                    style={{
                                        backgroundColor: activeTab === 'themes' && owned
                                            ? equipped ? 'var(--theme-bg-secondary)' : 'var(--theme-accent)'
                                            : owned ? 'var(--theme-bg-secondary)' : (balance >= item.price ? 'var(--theme-accent)' : 'red'),
                                        color: (activeTab === 'themes' && owned && !equipped) || (!owned && balance >= item.price) ? '#fff' : 'var(--theme-text)',
                                        borderColor: 'var(--theme-border)',
                                        opacity: (!owned && balance < item.price) ? 0.5 : 1
                                    }}
                                >
                                    {activeTab === 'themes' && owned
                                        ? equipped ? '✓ Equipped' : 'Equip'
                                        : owned
                                            ? '✓ Owned'
                                            : formatCurrency(item.price)
                                    }
                                </button>
                            </div>
                        );
                    })}
                </div>

                {currentItems.length === 0 && (
                    <div className="text-center py-12 flex flex-col items-center" style={{ color: 'var(--theme-text-secondary)' }}>
                        <div className="text-4xl mb-4">📭</div>
                        Nothing available in this category yet!
                    </div>
                )}
            </div>
        </div>
    );
};
