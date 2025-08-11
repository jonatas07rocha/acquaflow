const CACHE_NAME = 'acqua-cache-v5'; // Versão do cache incrementada
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'main.js',
  'ui.js',
  'state.js',
  'themes.js',
  'tips.js',
  'audio.js',
  'achievements.js',
  'calendar.js',
  'reminders.js', // Novo arquivo adicionado ao cache
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js',
  'https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto e arquivos adicionados');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

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

// NOVO OUVINTE DE MENSAGENS PARA EXIBIR NOTIFICAÇÕES
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'show-reminder') {
        self.registration.showNotification('💧 Hora de se hidratar!', {
            body: 'Um copo de água agora pode fazer toda a diferença. Vamos lá!',
            icon: 'icons/icon-192x192.png',
            badge: 'icons/icon-192x192.png' // Ícone para a barra de notificações no Android
        });
    }
});
