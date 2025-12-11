// Push Notification Service using Firebase Cloud Messaging
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import app from '../firebase';
import { ref, set, get, remove } from 'firebase/database';
import { database } from '../firebase';

// IMPORTANT: Replace this with your VAPID key from Firebase Console
// Go to: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = 'BISsXWENaYG2XVc-Nb0mNJrqCewD5KZJBjOdNKG5DrQm7pixRBNBRwik-z-nLxWaM-sYYnPlYkqsZwTdW9c39QU';

let messaging: ReturnType<typeof getMessaging> | null = null;

// Initialize messaging (only in browser, not service worker)
const getMessagingInstance = () => {
    if (!messaging && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
            messaging = getMessaging(app);
        } catch (error) {
            console.warn('Firebase Messaging not supported:', error);
        }
    }
    return messaging;
};

// Request permission and get FCM token
export const requestPushPermission = async (): Promise<string | null> => {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return null;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);

        const messagingInstance = getMessagingInstance();
        if (!messagingInstance) {
            console.warn('Messaging not available');
            return null;
        }

        // Get FCM token
        const token = await getToken(messagingInstance, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        console.log('FCM Token:', token);
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

// Store FCM token for a player
export const storePushToken = async (playerId: string, token: string): Promise<void> => {
    try {
        const tokenRef = ref(database, `pushTokens/${playerId}`);
        await set(tokenRef, {
            token,
            updatedAt: Date.now()
        });
        console.log('Push token stored for player:', playerId);
    } catch (error) {
        console.error('Error storing push token:', error);
    }
};

// Delete FCM token for a player (when disabling notifications)
export const deletePushToken = async (playerId: string): Promise<void> => {
    try {
        // Delete from Firebase database
        const tokenRef = ref(database, `pushTokens/${playerId}`);
        await remove(tokenRef);
        console.log('Push token deleted for player:', playerId);

        // Also unregister the token from FCM
        const messagingInstance = getMessagingInstance();
        if (messagingInstance) {
            await deleteToken(messagingInstance);
            console.log('FCM token unregistered');
        }
    } catch (error) {
        console.error('Error deleting push token:', error);
    }
};

// Refresh FCM token (delete and re-register)
export const refreshPushToken = async (playerId: string): Promise<string | null> => {
    try {
        // Delete old token
        await deletePushToken(playerId);
        
        // Get new token
        const newToken = await requestPushPermission();
        if (newToken) {
            await storePushToken(playerId, newToken);
            console.log('Push token refreshed for player:', playerId);
        }
        return newToken;
    } catch (error) {
        console.error('Error refreshing push token:', error);
        return null;
    }
};

// Get all push tokens (for broadcasting)
export const getAllPushTokens = async (): Promise<string[]> => {
    try {
        const tokensRef = ref(database, 'pushTokens');
        const snapshot = await get(tokensRef);
        if (!snapshot.exists()) return [];

        const tokens: string[] = [];
        snapshot.forEach((child) => {
            const data = child.val();
            if (data?.token) {
                tokens.push(data.token);
            }
        });
        return tokens;
    } catch (error) {
        console.error('Error getting push tokens:', error);
        return [];
    }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) return () => { };

    return onMessage(messagingInstance, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
    });
};

// Check if push notifications are supported
export const isPushSupported = (): boolean => {
    return 'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
};

