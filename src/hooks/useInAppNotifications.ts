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

export const useInAppNotifications = (
    userId: string | null,
    callbacks: InAppNotificationCallbacks
) => {
    // Track IDs we've already notified about to avoid duplicates
    const notifiedFriendRequests = useRef<Set<string>>(new Set());
    const notifiedGameInvites = useRef<Set<string>>(new Set());

    // Track if this is the initial load (to avoid notifying for existing items on mount)
    const isInitialLoad = useRef({ friendRequests: true, gameInvites: true });

    // Memoize callbacks to prevent unnecessary re-subscriptions
    const stableCallbacks = useMemo(() => callbacks, [callbacks.onFriendRequest, callbacks.onGameInvite]);

    useEffect(() => {
        if (!userId) return;

        // Subscribe to friend requests
        const unsubFriendRequests = FriendsService.subscribeToFriendRequests((requests) => {
            // On initial load, just mark existing items as "seen" without notifying
            if (isInitialLoad.current.friendRequests) {
                requests.forEach(req => notifiedFriendRequests.current.add(req.id));
                isInitialLoad.current.friendRequests = false;
                return;
            }

            // Check for new requests
            for (const req of requests) {
                if (!notifiedFriendRequests.current.has(req.id)) {
                    notifiedFriendRequests.current.add(req.id);
                    stableCallbacks.onFriendRequest(req);
                }
            }
        });

        // Subscribe to game invites
        const unsubGameInvites = FriendsService.subscribeToInvites((invites) => {
            // On initial load, just mark existing items as "seen" without notifying
            if (isInitialLoad.current.gameInvites) {
                invites.forEach(invite => notifiedGameInvites.current.add(invite.id));
                isInitialLoad.current.gameInvites = false;
                return;
            }

            // Check for new invites
            for (const invite of invites) {
                if (!notifiedGameInvites.current.has(invite.id)) {
                    notifiedGameInvites.current.add(invite.id);
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
