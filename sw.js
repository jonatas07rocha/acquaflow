// Define o nome do cache
const CACHE_NAME = 'acqua-flow-cache-v1';
// Lista de arquivos para armazenar em cache
const urlsToCache = [
  '/',
  'index.html'
];

// Evento de instalação: é acionado quando o service worker é instalado
self.addEventListener('install', event => {
  // Espera até que o cache seja aberto e os arquivos sejam adicionados
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch: é acionado para cada requisição feita pela página
self.addEventListener('fetch', event => {
  event.respondWith(
    // Procura por uma resposta correspondente no cache
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna a resposta do cache
        if (response) {
          return response;
        }
        // Se não encontrar, faz a requisição à rede
        return fetch(event.request);
      }
    )
  );
});

// Evento de ativação: limpa caches antigos
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
