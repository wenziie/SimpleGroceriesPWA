/* eslint-disable no-restricted-globals */

console.log("[SW] Service Worker registered!");

self.addEventListener('push', function(event) {
  console.log('[SW] Push Received.');
  console.log(`[SW] Push data: "${event.data.text()}"`);

  let data = { title: 'Simple Groceries', body: 'You have a reminder!' }; // Default
  try {
    // Attempt to parse the incoming data as JSON
    data = event.data.json();
  } catch (e) {
    console.warn('[SW] Push data was not JSON, using default notification.');
    // If it's just text, use it as the body
    data.body = event.data.text(); 
  }

  const title = data.title || 'Simple Groceries Påminnelse';
  const options = {
    body: data.body || 'Dags att kolla din inköpslista!',
    icon: '/icon.png', // Path to your app icon
    badge: '/icon.png' // Path to a smaller badge icon (optional)
    // You can add more options here: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification#options
  };

  // Ensure the notification is shown even if the promise chain isn't waited upon
  const notificationPromise = self.registration.showNotification(title, options);
  event.waitUntil(notificationPromise);
});

// Optional: Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification click Received.');

  event.notification.close();

  // Example: Focus the PWA window if it's open, otherwise open it
  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true // Important for matching clients not controlled by this SW version
    }).then(function(clientList) {
      // Check if there's a window/tab already open
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        // Use includes() for flexible URL matching (e.g., handles query params)
        if (client.url && client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab found, open a new one
      if (clients.openWindow) {
        // Use '/' to open the base URL of the PWA
        return clients.openWindow('/');
      }
    })
  );
});

// Add a basic fetch listener to make it installable on some platforms
self.addEventListener('fetch', (event) => {
  // Basic fetch handler - you might want a more sophisticated strategy 
  // (e.g., cache-first) depending on your offline needs.
  // This basic handler doesn't provide offline functionality.
  // event.respondWith(fetch(event.request)); 
  // For now, let the browser handle fetch, to avoid interfering with vite-plugin-pwa's default caching
  return; 
}); 