// Notification utility for sending push notifications

// Check if notifications are supported and granted
export const canSendNotifications = (): boolean => {
    return 'Notification' in window && Notification.permission === 'granted';
};

// Send a notification
export const sendNotification = (title: string, options?: NotificationOptions): void => {
    if (!canSendNotifications()) return;

    // Don't send if app is in foreground/visible
    if (document.visibilityState === 'visible') return;

    try {
        new Notification(title, {
            icon: '/logo_icon.png',
            badge: '/logo_icon.png',
            ...options
        });
    } catch (e) {
        console.warn('Failed to send notification:', e);
    }
};

// Game-specific notification helpers
export const notifyYourTurnToUpload = () => {
    sendNotification("🖼️ Your turn to upload!", {
        body: "Pick an image for everyone to draw on!",
        tag: 'game-turn'
    });
};

export const notifyDrawingPhaseStarted = () => {
    sendNotification("🎨 Drawing time!", {
        body: "The image is ready - start drawing!",
        tag: 'game-drawing'
    });
};

export const notifyVotingStarted = () => {
    sendNotification("🗳️ Time to vote!", {
        body: "Everyone's done drawing - pick your favorite!",
        tag: 'game-voting'
    });
};

export const notifyResultsReady = () => {
    sendNotification("🏆 Results are in!", {
        body: "See who won this round!",
        tag: 'game-results'
    });
};

export const notifyGameStarted = () => {
    sendNotification("🎮 Game is starting!", {
        body: "Get ready to play!",
        tag: 'game-start'
    });
};

export const notifyFinalResults = () => {
    sendNotification("🎊 Game Over!", {
        body: "Final results are in - see who won!",
        tag: 'game-final'
    });
};
