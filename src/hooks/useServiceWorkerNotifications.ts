import { useEffect } from 'react';
import type { GameInvite, UserAccount } from '../types';

interface ServiceWorkerNotificationHandlers {
    playerId: string | null | undefined;
    roomCode: string | null;
    hasActiveRoom: boolean;
    currentScreen: string;
    onShowInvite: (invite: GameInvite) => void;
    onShowTurnReminder: (payload: { roomCode?: string }) => void;
    onJoinRoom: (roomCode: string) => void;
    onResumeGame: () => void;
    onFinishCurrentGameNotice: () => void;
    onOpenProfile: (userId: string) => Promise<UserAccount | null>;
}

export const useServiceWorkerNotifications = ({
    playerId,
    roomCode,
    hasActiveRoom,
    currentScreen,
    onShowInvite,
    onShowTurnReminder,
    onJoinRoom,
    onResumeGame,
    onFinishCurrentGameNotice,
    onOpenProfile,
}: ServiceWorkerNotificationHandlers) => {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type !== 'NOTIFICATION_CLICK') return;

            const { notificationType, data } = event.data;
            const clickedRoomCode = data?.roomCode || roomCode;

            if (notificationType === 'game-invite' || notificationType === 'game_invite' || data?.type === 'game_invite') {
                const invite: GameInvite = {
                    id: data?.id || 'unknown',
                    fromUserId: data?.fromUserId || 'unknown',
                    fromUsername: data?.fromUsername || 'Someone',
                    toUserId: playerId || '',
                    roomCode: clickedRoomCode,
                    sentAt: Date.now(),
                    status: 'pending',
                };

                if (clickedRoomCode) {
                    onShowInvite(invite);
                }
                return;
            }

            if (notificationType === 'turn_reminder' || data?.type === 'turn_reminder') {
                onShowTurnReminder({ roomCode: data?.roomCode });
                return;
            }

            if (notificationType === 'game_start' || data?.type === 'game_start') {
                if (hasActiveRoom && clickedRoomCode && roomCode === clickedRoomCode) {
                    onResumeGame();
                } else if (clickedRoomCode) {
                    onJoinRoom(clickedRoomCode);
                }
                return;
            }

            if (notificationType === 'friend-request' || notificationType === 'friend_request' || data?.type === 'friend_request') {
                if (data?.fromUserId) {
                    await onOpenProfile(data.fromUserId);
                }
                return;
            }

            if (clickedRoomCode) {
                const isBusy = !['home', 'welcome', 'room-selection'].includes(currentScreen);
                if (isBusy) {
                    onFinishCurrentGameNotice();
                    return;
                }

                onShowInvite({
                    id: data?.id || 'fallback-invite',
                    fromUserId: data?.fromUserId || 'unknown',
                    fromUsername: data?.fromUsername || 'Game Invitation',
                    toUserId: playerId || '',
                    roomCode: clickedRoomCode,
                    sentAt: Date.now(),
                    status: 'pending',
                });
            }
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);
        return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }, [
        currentScreen,
        hasActiveRoom,
        onFinishCurrentGameNotice,
        onJoinRoom,
        onOpenProfile,
        onResumeGame,
        onShowInvite,
        onShowTurnReminder,
        playerId,
        roomCode,
    ]);
};
