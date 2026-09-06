/**
 * NeuroNova Service Worker
 * Enables PWA installation on Android & PC with offline caching
 */

const CACHE_NAME = 'neuro-nova-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/engine/voiceAssistant.js',
  './js/engine/voiceService.js',
  './js/engine/patientDataService.js',
  './js/engine/caregiverAuthService.js',
  './js/engine/baselineService.js',
  './js/engine/levelService.js',
  './js/engine/gameDifficultyService.js',
  './js/engine/adaptiveEngine.js',
  './js/games/memoryMatch.js',
  './js/games/sequenceRecall.js',
  './js/games/pictureRecall.js',
  './js/games/patternMemory.js',
  './js/games/whatChanged.js',
  './js/patient/patientDashboard.js',
  './js/patient/gameMenu.js',
  './js/patient/memoriesView.js',
  './js/patient/remindersView.js',
  './js/patient/routineView.js',
  './js/caregiver/chartRenderer.js',
  './js/caregiver/caregiverDashboard.js',
  './js/caregiver/memoryManager.js',
  './js/caregiver/reminderManager.js',
  './js/caregiver/settingsManager.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Return offline fallback if network fails
        return caches.match('./index.html');
      });
    })
  );
});
