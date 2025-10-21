const CACHE_NAME = 'talika-cache-v2';
const URLS_TO_CACHE = [
  '/', // অ্যাপের মূল পাতা
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/style.css',
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/script.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&display=swap'
];

// Install event: অ্যাপের শেল (মূল ফাইলগুলো) ক্যাশ করা
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Activate event: পুরোনো ক্যাশ পরিষ্কার করা
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: নেটওয়ার্ক অনুরোধ পরিচালনা করা (অফলাইন কার্যকারিতার মূল অংশ)
self.addEventListener('fetch', event => {
  // Firebase বা অন্যান্য API অনুরোধগুলোকে বাইপাস করুন, এগুলো যেন সরাসরি নেটওয়ার্কে যায়
  if (event.request.url.includes('firebase') || event.request.url.includes('firestore.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // যদি ক্যাশে পাওয়া যায়, তবে ক্যাশ থেকে রিটার্ন করো
        if (response) {
          return response;
        }
        
        // যদি ক্যাশে না পাওয়া যায়, তবে নেটওয়ার্ক থেকে আনো
        return fetch(event.request).then(
          networkResponse => {
            // যদি সফলভাবে আনা যায়, তবে ভবিষ্যতে ব্যবহারের জন্য ক্যাশে সেভ করে রাখো
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

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