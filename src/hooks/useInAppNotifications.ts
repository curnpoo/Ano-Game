// In-App Notification Hook
// Subscribes to friend requests and game invites in real-time
// Triggers callbacks when NEW items are detected (not already notified)

import { useEffect, useRef, useMemo } from 'react';
import { FriendsService } from '../services/friendsService';
import type { FriendRequest, GameInvite } from '../types';

interface InAppNotificationCallbacks {
    onFriendRequest: (request: FriendRequest) => void;
    onGameInvite: (invite: GameInvite) => void;
}

// Persist notified IDs to localStorage to survive page reloads
const STORAGE_KEY_FRIEND_REQUESTS = 'notified_friend_requests';
const STORAGE_KEY_GAME_INVITES = 'notified_game_invites';

const loadNotifiedIds = (key: string): Set<string> => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Clean up old entries (older than 1 hour)
            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            const filtered = parsed.filter((item: { id: string; ts: number }) => item.ts > oneHourAgo);
            return new Set(filtered.map((item: { id: string }) => item.id));
        }
    } catch (e) {
        console.warn('Failed to load notified IDs:', e);
    }
    return new Set();
};

const saveNotifiedId = (key: string, id: string) => {
    try {
        const stored = localStorage.getItem(key);
        const parsed = stored ? JSON.parse(stored) : [];
        // Clean up old entries and add new one
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const filtered = parsed.filter((item: { id: string; ts: number }) => item.ts > oneHourAgo);
        filtered.push({ id, ts: Date.now() });
        localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {
        console.warn('Failed to save notified ID:', e);
    }
};

// Check if user is joining via URL (came from push notification click)
const isJoiningViaUrl = (): boolean => {
    const params = new URLSearchParams(window.location.search);
    return params.has('join');
};

export const useInAppNotifications = (
    userId: string | null,
    callbacks: InAppNotificationCallbacks
) => {
    // Track IDs we've already notified about to avoid duplicates
    const notifiedFriendRequests = useRef<Set<string>>(loadNotifiedIds(STORAGE_KEY_FRIEND_REQUESTS));
    const notifiedGameInvites = useRef<Set<string>>(loadNotifiedIds(STORAGE_KEY_GAME_INVITES));

    // Track if this is the initial load (to avoid notifying for existing items on mount)
    const isInitialLoad = useRef({ friendRequests: true, gameInvites: true });
    
    // Check if user came from push notification
    const cameFromPush = useRef(isJoiningViaUrl());

    // Memoize callbacks to prevent unnecessary re-subscriptions
    const stableCallbacks = useMemo(() => callbacks, [callbacks.onFriendRequest, callbacks.onGameInvite]);

    useEffect(() => {
        if (!userId) return;

        // Subscribe to friend requests
        const unsubFriendRequests = FriendsService.subscribeToFriendRequests((requests) => {
            // On initial load, just mark existing items as "seen" without notifying
            if (isInitialLoad.current.friendRequests) {
                requests.forEach(req => {
                    notifiedFriendRequests.current.add(req.id);
                    saveNotifiedId(STORAGE_KEY_FRIEND_REQUESTS, req.id);
                });
                isInitialLoad.current.friendRequests = false;
                return;
            }

            // Check for new requests
            for (const req of requests) {
                if (!notifiedFriendRequests.current.has(req.id)) {
                    notifiedFriendRequests.current.add(req.id);
                    saveNotifiedId(STORAGE_KEY_FRIEND_REQUESTS, req.id);
                    stableCallbacks.onFriendRequest(req);
                }
            }
        });

        // Subscribe to game invites
        const unsubGameInvites = FriendsService.subscribeToInvites((invites) => {
            // On initial load, just mark existing items as "seen" without notifying
            if (isInitialLoad.current.gameInvites) {
                invites.forEach(invite => {
                    notifiedGameInvites.current.add(invite.id);
                    saveNotifiedId(STORAGE_KEY_GAME_INVITES, invite.id);
                });
                isInitialLoad.current.gameInvites = false;
                return;
            }

            // Skip notifications if user came from push notification click
            if (cameFromPush.current) {
                invites.forEach(invite => {
                    notifiedGameInvites.current.add(invite.id);
                    saveNotifiedId(STORAGE_KEY_GAME_INVITES, invite.id);
                });
                cameFromPush.current = false; // Reset after first subscription update
                return;
            }

            // Check for new invites
            for (const invite of invites) {
                if (!notifiedGameInvites.current.has(invite.id)) {
                    notifiedGameInvites.current.add(invite.id);
                    saveNotifiedId(STORAGE_KEY_GAME_INVITES, invite.id);
                    stableCallbacks.onGameInvite(invite);
                }
            }
        });

        return () => {
            unsubFriendRequests();
            unsubGameInvites();
        };
    }, [userId, stableCallbacks]);
};
