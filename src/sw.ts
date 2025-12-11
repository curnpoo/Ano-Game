/// <reference lib="webworker" />
// Custom Service Worker combining PWA (Workbox) + Firebase Cloud Messaging
// This file is used as the source for vite-plugin-pwa

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;
declare const firebase: any;

// Standard PWA precaching
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache Google fonts
registerRoute(
    /^https:\/\/fonts\.googleapis\.com\/.*/i,
    new CacheFirst({
        cacheName: 'google-fonts-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            })
        ]
    })
);

// Skip waiting and claim clients immediately
self.skipWaiting();
clientsClaim();

// ============================================
// FIREBASE CLOUD MESSAGING
// ============================================

// Import Firebase scripts for messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyBAsWPf3QS-9GNalh_JC2KDW_58IsX3S4U",
    authDomain: "image-annotation-game.firebaseapp.com",
    projectId: "image-annotation-game",
    storageBucket: "image-annotation-game.firebasestorage.app",
    messagingSenderId: "875626942936",
    appId: "1:875626942936:web:7197de17608976e3d762ad"
});

const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage((payload: any) => {
    console.log('[SW] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'ANO Game';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification!',
        icon: '/pwa-icon.png',
        badge: '/pwa-icon.png',
        tag: payload.data?.type || 'game-notification',
        data: payload.data,
        vibrate: [100, 50, 100],
        requireInteraction: true
    } as NotificationOptions;

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    console.log('[SW] Notification clicked:', event);
    event.notification.close();

    // Build URL from notification data
    let urlToOpen = '/';
    if (event.notification.data?.click_action) {
        urlToOpen = event.notification.data.click_action;
    } else if (event.notification.data?.roomCode) {
        urlToOpen = `/?join=${event.notification.data.roomCode}`;
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it and navigate
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    (client as WindowClient).focus();
                    if (urlToOpen !== '/') {
                        (client as WindowClient).navigate(urlToOpen);
                    }
                    return;
                }
            }
            // Otherwise open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});

console.log('[SW] Custom service worker with FCM support loaded');
