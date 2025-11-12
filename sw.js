// service-worker.js

// ধাপ ১: ক্যাশের একটি নতুন এবং স্বতন্ত্র নাম দিন।
// **গুরুত্বপূর্ণ: আপনি যেহেতু অনেক কিছু যুক্ত করছেন, তাই ক্যাশ নামটি পরিবর্তন করুন (যেমন v5)।**
const CACHE_NAME = 'talika-cache-v6'; // <--- ক্যাশের নাম পরিবর্তন করা হয়েছে!

// ধাপ ২: যে ফাইলগুলো অফলাইনে ব্যবহারের জন্য একেবারে শুরুতে ক্যাশ করতে চান।
const URLS_TO_CACHE = [
  '/', // অ্যাপের মূল পাতা (index.html)
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/manifest.json',

  // সার্ভিস ওয়ার্কার ফাইলটিকেও ক্যাশ করা হয়েছে
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/sw.js',

  // Firebase SDK লিঙ্কগুলো (এগুলো স্ট্যাটিক কোড, তাই ক্যাশ করা উচিত)
  // আপনার HTML-এ ব্যবহৃত Firebase ভার্সন 10.12.2 অনুযায়ী যুক্ত করা হলো:
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js', 
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js', // App Check SDK

  // অন্যান্য প্রয়োজনীয় লাইব্রেরি
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&display=swap',
  // আইকন ও ফন্ট ফাইলগুলো আপনার বিদ্যমান অ্যারে থেকে কপি করা হয়েছে:
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-72x72.png',
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-96x96.png',
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-128x128.png',
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-144x144.png',
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-152x152.png',
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-192x192.png',
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-384x384.png',
  'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-512x512.png',
  'https://fonts.gstatic.com/s/notosansbengali/v21/Cn-jHle31yEujzJ7YWH0p5HeGjgJoG-7s-0.woff2' 
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
        // সব ফাইল ক্যাশ না হলেও যেন সার্ভিস ওয়ার্কারটি চালু হয়, তার জন্য ক্যাশ ফেইল করলেও Promise.all দিয়ে ক্যাশ করার চেষ্টা করা হয়েছে।
        return Promise.all(
            URLS_TO_CACHE.map(url => {
                return cache.add(url).catch(error => {
                    console.warn(`[PWA WARN] Failed to cache: ${url}`, error);
                    // ক্যাশ ব্যর্থ হলেও Promise.resolve() দিয়ে চালিয়ে যাওয়া হচ্ছে
                    return Promise.resolve();
                });
            })
        );
      })
      .catch(error => {
        console.error('[PWA ERROR] Failed to open cache during install:', error);
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
            console.log('[PWA ACTIVATE] Deleting old cache:', cacheName);
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
  const url = event.request.url;

  // ফায়ারবেস/ফায়ারস্টোর API কল এবং App Check টোকেন লোডিং-কে সরাসরি নেটওয়ার্কে পাঠানো হচ্ছে
  // কারণ এগুলি ডাইনামিক ডেটা।
  if (url.includes('firestore.googleapis.com') || url.includes('identitytoolkit.googleapis.com') || url.includes('recaptcha/api')) {
    return;
  }
  
  // App Check টোকেন লোডিং URL: https://firebasestorage.googleapis.com/v0/b/fireappcheck.storage...
  if (url.includes('firebasestorage.googleapis.com')) {
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

        // যদি ক্যাশে না পাওয়া যায়, তবে নেটওয়ার্ক থেকে আনা হবে (নেটওয়ার্ক-ফলব্যাক-টু-ক্যাশ নয়, সরাসরি ক্যাশ-ফার্স্ট)।
        return fetch(event.request).then(networkResponse => {
            // যদি সফলভাবে নেটওয়ার্ক থেকে আনা যায়...
            if (networkResponse && networkResponse.status === 200) {
              // ...এবং এটি একটি বৈধ অনুরোধ হয় (যেমন ডেটা API কল নয়, বরং কোনো রিসোর্স), তবে ক্যাশ করা হবে।
              // এখানে একটি অতিরিক্ত নিরাপত্তা যোগ করা হয়েছে, যাতে ভুল করে অন্য ডাইনামিক ডেটাও ক্যাশ না হয়ে যায়।
               if (event.request.method === 'GET' && !url.includes('/v1/')) { // Firestore API v1 কলগুলোকে ক্যাশ করা হচ্ছে না
                  const responseToCache = networkResponse.clone();
                  caches.open(CACHE_NAME)
                    .then(cache => {
                      cache.put(event.request, responseToCache).catch(error => {
                        console.warn('[PWA WARN] Cache.put failed:', error);
                      });
                    });
                }
            }
            // এবং আসল রেসপন্সটি ব্রাউজারকে পাঠানো হবে।
            return networkResponse;
          }).catch(error => {
             // নেটওয়ার্ক ফেইল হলে, এবং অফলাইনে থাকার কারণে ফেইল হলে, এটি কোনো রেসপন্স দেবে না।
             console.error('[PWA FETCH ERROR] Fetch failed:', error);
             // এখানে আমরা অফলাইন পেজ রিটার্ন করতে পারি, কিন্তু আপনার ক্ষেত্রে সেটি সেট করা নেই।
             // তাই ডিফল্ট আচরণই থাকবে।
             throw error; 
          });
      })
  );
});