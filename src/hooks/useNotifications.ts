import { useState, useCallback } from 'react';
import type { ToastState } from '../types';

export const useNotifications = () => {
    const [toast, setToast] = useState<ToastState | null>(null);
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

    const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'error') => {
        setToast({ message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return {
        toast,
        // setToast is usually internal, but if needed we can export it or just use show/hide
        showToast,
        hideToast,
        showNotificationPrompt,
        setShowNotificationPrompt
    };
};
