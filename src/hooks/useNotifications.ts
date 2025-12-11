import { useState, useCallback, useRef, useEffect } from 'react';
import type { ToastState, ToastMessage } from '../types';
import { formatErrorMessage } from '../utils/errorHandler';

// Batching configuration
const BATCH_WINDOW_MS = 400; // Group notifications within this window
const MAX_GROUP_SIZE = 4; // Maximum notifications per group
const BASE_DURATION_MS = 3000;
const EXTRA_DURATION_PER_MESSAGE_MS = 500;
const MAX_DURATION_MS = 5000;

export const useNotifications = () => {
    const [toast, setToast] = useState<ToastState | null>(null);
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

    // Queue and batching refs
    const queueRef = useRef<ToastMessage[]>([]);
    const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isDisplayingRef = useRef(false);

    // Flush the queue and display grouped toast
    const flushQueue = useCallback(() => {
        if (queueRef.current.length === 0) return;

        // Take up to MAX_GROUP_SIZE messages from queue
        const messagesToShow = queueRef.current.splice(0, MAX_GROUP_SIZE);
        
        // Calculate duration based on number of messages
        const duration = Math.min(
            BASE_DURATION_MS + (messagesToShow.length - 1) * EXTRA_DURATION_PER_MESSAGE_MS,
            MAX_DURATION_MS
        );

        setToast({ messages: messagesToShow });
        isDisplayingRef.current = true;

        // Clear timer
        if (batchTimerRef.current) {
            clearTimeout(batchTimerRef.current);
            batchTimerRef.current = null;
        }

        // Auto-hide after duration, then check for more in queue
        setTimeout(() => {
            isDisplayingRef.current = false;
            // If there are more messages queued, show them
            if (queueRef.current.length > 0) {
                setTimeout(flushQueue, 150); // Brief pause between groups
            }
        }, duration);
    }, []);

    const showToast = useCallback((
        message: string, 
        type: 'error' | 'success' | 'info' = 'error', 
        action?: { label: string; onClick: () => void }
    ) => {
        const newMessage: ToastMessage = {
            id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
            message,
            type,
            action
        };

        // Errors should display immediately (interrupt the queue)
        if (type === 'error') {
            // Clear existing queue of non-errors
            queueRef.current = queueRef.current.filter(m => m.type === 'error');
            queueRef.current.push(newMessage);
            
            // Clear batch timer and flush immediately
            if (batchTimerRef.current) {
                clearTimeout(batchTimerRef.current);
                batchTimerRef.current = null;
            }
            flushQueue();
            return;
        }

        // Add to queue
        queueRef.current.push(newMessage);

        // If currently displaying, the queue will be processed after
        if (isDisplayingRef.current) {
            return;
        }

        // Start or reset batch timer
        if (batchTimerRef.current) {
            clearTimeout(batchTimerRef.current);
        }
        batchTimerRef.current = setTimeout(flushQueue, BATCH_WINDOW_MS);
    }, [flushQueue]);

    const showError = useCallback((error: any) => {
        const message = formatErrorMessage(error);
        showToast(message, 'error');
    }, [showToast]);

    const hideToast = useCallback(() => {
        setToast(null);
        isDisplayingRef.current = false;
        
        // Check if there are more queued messages
        if (queueRef.current.length > 0) {
            setTimeout(flushQueue, 150);
        }
    }, [flushQueue]);

    // Get computed duration based on current toast (for Toast component)
    const getToastDuration = useCallback(() => {
        if (!toast) return BASE_DURATION_MS;
        return Math.min(
            BASE_DURATION_MS + (toast.messages.length - 1) * EXTRA_DURATION_PER_MESSAGE_MS,
            MAX_DURATION_MS
        );
    }, [toast]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (batchTimerRef.current) {
                clearTimeout(batchTimerRef.current);
            }
        };
    }, []);

    return {
        toast,
        toastDuration: getToastDuration(),
        showToast,
        showError,
        hideToast,
        showNotificationPrompt,
        setShowNotificationPrompt
    };
};
