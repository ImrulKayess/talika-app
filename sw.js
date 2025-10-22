const CACHE_NAME = 'talika-app-cache-v1';

// যে ফাইলগুলো অফলাইনে ব্যবহারের জন্য ক্যাশ করা হবে তার তালিকা
const URLS_TO_CACHE = [
  // যেহেতু আপনার মূল কোডটি ব্লগারে থাকবে, তাই অ্যাপের মূল পেজকে ক্যাশ করার জন্য '.' ব্যবহার করা হচ্ছে।
  '.', 
  // Manifest ফাইল
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/manifest.json',
  // প্রধান আইকনগুলো
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-192x192.png',
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-512x512.png',
  // 외부 라이브러리
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  // ফন্ট (Fetch event এ এগুলো ডায়নামিকভাবে ক্যাশ হবে)
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&display=swap'
];

// Service Worker ইন্সটল করার সময়
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Service Worker সক্রিয় (Activate) করার সময়
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // পুরোনো সংস্করণের ক্যাশ মুছে ফেলা হচ্ছে
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// নেটওয়ার্ক থেকে ডেটা Fetch করার সময়
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // যদি ক্যাশে ডেটা পাওয়া যায়, তবে সেটি দেখানো হবে
        if (response) {
          return response;
        }

        // যদি ক্যাশে না পাওয়া যায়, তবে নেটওয়ার্ক থেকে আনা হবে
        return fetch(event.request).then(
          networkResponse => {
            // যদি fetch সফল হয়
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // রেসপন্সটি ক্লোন করে একটি ক্যাশে এবং অন্যটি ব্রাউজারে পাঠানো হচ্ছে
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});