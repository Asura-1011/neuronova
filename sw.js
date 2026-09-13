/**
 * NeuroNova Service Worker
 * PWA support with automatic updates.
 */

const CACHE_NAME = 'neuro-nova-cache-v3';

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


// INSTALL
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});


// ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});


// FETCH
self.addEventListener('fetch', (event) => {

  // Never cache API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For HTML/JS/CSS: try network first
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {

        // Save latest successful GET responses
        if (
          event.request.method === 'GET' &&
          networkResponse.ok
        ) {
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return networkResponse;
      })
      .catch(() => {
        // If offline, use cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            return cachedResponse || caches.match('./index.html');
          });
      })
  );
});
