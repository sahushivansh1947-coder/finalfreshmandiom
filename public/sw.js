// Galimandi Service Worker - Push Notification Handler
const CACHE_NAME = 'galimandi-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push event - handles incoming push notifications from server
self.addEventListener('push', (event) => {
  let data = {
    title: '🌿 Galimandi',
    body: 'Fresh farm produce delivered in 30 minutes!',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'galimandi-notification',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/logo.png',
      badge: data.badge || '/logo.png',
      tag: data.tag || 'galimandi-notification',
      renotify: true,
      data: data.data || { url: '/' },
      actions: [
        { action: 'shop', title: '🛒 Shop Now' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.action === 'shop'
    ? '/'
    : (event.notification.data?.url || '/');

  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing tab
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new tab
      return self.clients.openWindow(url);
    })
  );
});

// Background sync (optional future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'galimandi-sync') {
    console.log('[SW] Background sync triggered');
  }
});
