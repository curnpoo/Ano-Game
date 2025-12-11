# Push Notifications Guide

## How It Works

1. **Service Worker** (`src/sw.ts`) - Combined PWA + Firebase messaging
2. **Client** (`src/services/pushNotifications.ts`) - Token management
3. **Cloud Functions** (`functions/src/index.ts`) - Sends notifications

---

## Adding a New Push Notification

### 1. Create the Cloud Function (in `functions/src/index.ts`)

```typescript
export const onMyEventCreated = functions.database
    .ref("/myEvents/{eventId}")
    .onCreate(async (snapshot, context) => {
        const event = snapshot.val();

        // Get recipient's push token
        const tokenSnapshot = await db.ref(`/pushTokens/${event.toUserId}`)
            .once("value");
        if (!tokenSnapshot.exists()) return null;

        const tokenData = tokenSnapshot.val();

        // Send notification
        await messaging.send({
            token: tokenData.token,
            notification: {
                title: "🎉 My Event Title",
                body: `${event.fromUsername} did something!`,
            },
            data: {
                type: "my_event", // Used for routing
                eventId: context.params.eventId,
            },
        });

        return null;
    });
```

### 2. Handle in Service Worker (already set up in `src/sw.ts`)

The service worker automatically shows notifications. The `data.type` field
helps with click routing.

### 3. Handle Foreground (in `App.tsx`)

```typescript
// In the onForegroundMessage useEffect
if (type === "my_event") {
    showToast("My event happened!", "info");
}
```

### 4. Deploy Cloud Functions

```bash
cd functions && npm run deploy
```

---

## Existing Notification Types

| Type              | Trigger                 | Cloud Function                 |
| ----------------- | ----------------------- | ------------------------------ |
| `game_invite`     | Game invite sent        | `onInviteCreated`              |
| `friend_request`  | Friend request sent     | `onFriendRequestCreated`       |
| `friend_accepted` | Friend request accepted | `onFriendRequestStatusChanged` |
