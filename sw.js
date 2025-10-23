// service-worker.js

// ধাপ ১: ক্যাশের একটি নতুন এবং স্বতন্ত্র নাম দিন।
// প্রতিবার অ্যাপের কোনো ফাইল (HTML, CSS, JS) আপডেট করার পর এই নামটি পরিবর্তন করুন (যেমন: v4, v5)।
const CACHE_NAME = 'talika-cache-v6';

// ধাপ ২: যে ফাইলগুলো অফলাইনে ব্যবহারের জন্য একেবারে শুরুতে ক্যাশ করতে চান।
// আপনার HTML ফাইলে ব্যবহৃত সকল গুরুত্বপূর্ণ CDN লিঙ্ক এখানে যোগ করা হয়েছে।
const URLS_TO_CACHE = [
  '/', // অ্যাপের মূল পাতা (index.html)
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/manifest.json',
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-192x192.png',
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&display=swap',
  'https://fonts.gstatic.com/s/notosansbengali/v21/Cn-jHle31yEujzJ7YWH0p5HeGjgJoG-7s-0.woff2' // গুগল ফন্টের একটি কোর ফাইল
];

// Install Event: সার্ভিস ওয়ার্কার ইনস্টল হওয়ার সময় ফাইলগুলো ক্যাশ করা হয়।
self.addEventListener('install', event => {
  // নতুন সার্ভিস ওয়ার্কারটিকে পুরনোটির জন্য অপেক্ষা না করে সরাসরি সক্রিয় হতে বলা হচ্ছে।
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened successfully.');
        // URLS_TO_CACHE-এ থাকা সকল ফাইল ক্যাশে যোগ করা হচ্ছে।
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(error => {
        console.error('Failed to cache files during install:', error);
      })
  );
});

// Activate Event: নতুন সার্ভিস ওয়ার্কার চালু হলে পুরোনো এবং অপ্রয়োজনীয় ক্যাশ মুছে ফেলা হয়।
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // শুধুমাত্র বর্তমান ক্যাশটি রাখা হবে।
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // যদি কোনো ক্যাশের নাম cacheWhitelist-এ না থাকে, তবে সেটি মুছে ফেলা হবে।
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        // সকল খোলা ক্লায়েন্টকে (ট্যাব) নতুন সার্ভিস ওয়ার্কারের নিয়ন্ত্রণে আনা হচ্ছে।
        return self.clients.claim();
    })
  );
});

// Fetch Event: নেটওয়ার্ক থেকে যেকোনো অনুরোধ এলে এই ইভেন্টটি কাজ করে।
self.addEventListener('fetch', event => {
  // Firebase এবং Google API সংক্রান্ত অনুরোধগুলোকে সার্ভিস ওয়ার্কার দিয়ে নিয়ন্ত্রণ করা হবে না।
  // এগুলো সবসময় সরাসরি নেটওয়ার্কে যাবে, কারণ এগুলো ডাইনামিক ডেটা আদান-প্রদান করে।
  if (event.request.url.includes('firebase') || event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('google.com/recaptcha')) {
    return;
  }

  // ক্যাশ-ফার্স্ট কৌশল প্রয়োগ করা হচ্ছে।
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // যদি অনুরোধ করা ফাইলটি ক্যাশে পাওয়া যায়, তবে সরাসরি ক্যাশ থেকে দেওয়া হবে।
        if (cachedResponse) {
          return cachedResponse;
        }

        // যদি ক্যাশে না পাওয়া যায়, তবে নেটওয়ার্ক থেকে আনা হবে।
        return fetch(event.request).then(networkResponse => {
            // যদি সফলভাবে নেটওয়ার্ক থেকে আনা যায়...
            if (networkResponse && networkResponse.status === 200) {
              // ...তাহলে সেটির একটি কপি ভবিষ্যতের জন্য ক্যাশে সেভ করে রাখা হবে।
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            // এবং আসল রেসপন্সটি ব্রাউজারকে পাঠানো হবে।
            return networkResponse;
          });
      })
  );
});