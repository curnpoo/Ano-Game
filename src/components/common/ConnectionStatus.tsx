import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';

export const ConnectionStatus = () => {
    const [connected, setConnected] = useState(true);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const connectedRef = ref(database, '.info/connected');
        const unsubscribe = onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                setConnected(true);
                // Delay hiding the banner slightly so it doesn't flicker
                setTimeout(() => setShowBanner(false), 2000);
            } else {
                setConnected(false);
                setShowBanner(true);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!showBanner) return null;

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${connected ? '-translate-y-full' : 'translate-y-0'}`}>
            <div className={`${connected ? 'bg-green-500' : 'bg-red-500'} text-white text-xs font-bold py-1 px-4 text-center shadow-md flex justify-center items-center gap-2`}>
                {!connected && (
                    <svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                    </svg>
                )}
                {connected ? 'Connection Restored' : 'You are offline. Reconnecting...'}
            </div>
        </div>
    );
};
