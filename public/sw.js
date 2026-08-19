const CACHE_NAME = "immo-pro-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/logo-favor.jpeg",
  "/file.svg",
  "/globe.svg",
  "/window.svg",
  "/next.svg",
  "/vercel.svg"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching App Shell");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing Old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Cache-first pour les fichiers statiques uniquement)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);
  const isPageOrApi = !url.pathname.includes(".") || url.pathname.startsWith("/api/");
  
  if (isPageOrApi) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
      });
    })
  );
});

// Push Event for Notifications
self.addEventListener("push", function (event) {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (err) {
    payload = { title: "Immo Pro", body: event.data.text() };
  }

  const title = payload.title || "Immo Pro — Plateforme Immobilière";
  const options = {
    body: payload.body || "Nouvelle alerte immobilière",
    icon: "/logo-favor.jpeg",
    badge: "/logo-favor.jpeg",
    image: payload.image || undefined,
    vibrate: [200, 100, 200, 100, 300],
    tag: payload.tag || "immopro-notification",
    renotify: true,
    requireInteraction: true,
    data: {
      url: payload.url || "/admin/dashboard"
    },
    actions: [
      { action: "open", title: "Consulter" },
      { action: "close", title: "Fermer" }
    ]
  };

  try {
    if (self.Audio) {
      const playAudio = () => {
        const sound = new self.Audio("/sounds/notification.wav");
        sound.play().catch(() => {});
      };
      playAudio();
      setTimeout(playAudio, 3000);
    }
  } catch (e) {
    console.log("Audio non supporté en tâche de fond.");
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Event
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      const urlToOpen = event.notification.data.url;
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
