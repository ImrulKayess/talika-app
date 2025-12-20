importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// আপনার অ্যাপের কনফিগারেশন দিয়ে ফায়ারবেস ইনিশিয়ালাইজ করা হচ্ছে
firebase.initializeApp({
    apiKey: "AIzaSyDz94B6gpJPZFMGsgdKirGneJcZs48unAg",
    authDomain: "talika-eaa65.firebaseapp.com",
    projectId: "talika-eaa65",
    storageBucket: "talika-eaa65.firebasestorage.app",
    messagingSenderId: "836287630941",
    appId: "1:836287630941:web:d37b4b3efaf9a02c5d07b4"
});

const messaging = firebase.messaging();

// ব্যাকগ্রাউন্ডে নোটিফিকেশন হ্যান্ডেল করার লজিক
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-192x192.png', // আপনার অ্যাপ আইকন
    badge: 'https://cdn.jsdelivr.net/gh/ImrulKayess/talika-app/icons/icon-96x96.png' // ছোট আইকন (স্ট্যাটাস বার)
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});