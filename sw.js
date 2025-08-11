// jonatas07rocha/acquaflow/acquaflow-4adf3ba6a047c14f9c16629e39fadb26cd705eb7/sw.js

const CACHE_NAME = 'acqua-cache-v4'; // Versão do cache incrementada
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
  'progress.js', // <-- NOVO ARQUIVO ADICIONADO AO CACHE
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
        // Adiciona todos os arquivos de uma vez, ignorando falhas individuais
        // para aumentar a robustez da instalação offline.
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Falha ao adicionar alguns arquivos ao cache durante a instalação:', err);
        });
      })
  );
});

self.addEventListener('fetch', event => {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrar
        if (response) {
          return response;
        }

        // Se não encontrar no cache, busca na rede
        return fetch(event.request).then(networkResponse => {
          // Clona a resposta para poder guardá-la no cache e retorná-la
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return networkResponse;
        }).catch(err => {
            console.error('Fetch falhou; retornando fallback offline se disponível', err);
            // Aqui você poderia retornar uma página offline genérica se quisesse
        });
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
            // Deleta caches antigos para liberar espaço
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
