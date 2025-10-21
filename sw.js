// ১. ক্যাশের নতুন নাম দিন। প্রতিবার আপডেটের পর এই নামটি পরিবর্তন করবেন (যেমন: v3, v4)।
const CACHE_NAME = 'talika-cache-v3';

// ২. যে ফাইলগুলো অফলাইনে ব্যবহারের জন্য সেভ করতে চান।
const URLS_TO_CACHE = [
  '/', // অ্যাপের মূল পাতা
  // নিচের CDN লিঙ্কগুলো আপনার অ্যাপ ব্যবহার করে, তাই এগুলোও ক্যাশ করা জরুরি
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&display=swap'
];

// Install Event: সার্ভিস ওয়ার্কার ইনস্টল হওয়ার সময় ফাইলগুলো ক্যাশ করা হয়।
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened. Caching essential files.');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Activate Event: নতুন সার্ভিস ওয়ার্কার চালু হলে পুরোনো ক্যাশ মুছে ফেলা হয়।
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: নেটওয়ার্ক অনুরোধ পরিচালনা করা হয়।
self.addEventListener('fetch', event => {
  // Firebase API অনুরোধগুলোকে বাইপাস করুন, এগুলো সরাসরি নেটওয়ার্কে যাবে
  if (event.request.url.includes('firebase') || event.request.url.includes('firestore.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // যদি ক্যাশে পাওয়া যায়, তবে ক্যাশ থেকে দেখানো হয়।
        if (response) {
          return response;
        }
        // অন্যথায়, নেটওয়ার্ক থেকে আনা হয় এবং ভবিষ্যতে ব্যবহারের জন্য ক্যাশে সেভ করা হয়।
        return fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
                let responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
            }
            return networkResponse;
        });
      })
  );
});