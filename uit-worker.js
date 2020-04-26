var cacheName = 'UIT-Cachev6';
var filesToCache = [  
  './scripts/db.js',
  //'./scripts/app.js',
  //'./styles/mystyle.css',
  './assets/BoxingBell1.wav',
  './assets/BoxingBell3.wav',
  './images/add_white_24px.svg',
  './images/settings_white_24px.svg',
  './images/refresh_white_24px.svg'      
  //'./',
  //'./index.html',
];

self.addEventListener('install', function(e) {
  console.log('[UIT Service Worker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[UIT Service Worker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[UIT Service Worker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
      if (key !== cacheName && key !== dataCacheName) {
          console.log('[UIT Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});


self.addEventListener('fetch', function(e) {
     /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
  console.log('[UIT Service Worker] Fetch from cache', e.request.url);
  e.respondWith(      
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );    
});



/*****************************************************************************
 *
 * Notifications management
 *
 ****************************************************************************/

function closeNotification(msg, evt){
  console.log(msg, evt.notification.data);
  evt.notification.close();
}

self.addEventListener('notificationclose', function(evt){
  closeNotification('Notification closed', evt);
});

self.addEventListener('notificationclick', function(evt){
  console.log('Before Navigating');
  if(evt.action != 'close'){
    evt.waitUntil(
      self.clients.matchAll({type: 'window', includeUncontrolled: 'true'})
        .then(function(allClients){
            console.log(allClients);
            var matchingClient = null;
            for(var i = 0; i < allClients.length; i++){
              if(allClients[i].visibilityState == 'visible'){
                matchingClient = allClients[i];
                console.log('Navigating');
                matchingClient.navigate(evt.notification.data.loc);
                break;
              }
            }
            //PWA is not active
            if(matchingClient == null){
              console.log('Opening');
              self.clients.openWindow(evt.notification.data.loc);
            }
          })
    );
  }
  closeNotification('Notification clicked', evt);
});

self.addEventListener('push', function(evt){
  console.log('Push message received');
  //retrieve data from message
  var loc;
  if(evt.data){
    console.log('Data Received');
    console.log(evt.data.text());
    loc = evt.data.text();
  }
  else{
    loc = 'index.html'
  }
  var options = {
    body: 'See what\s new',
    icon: 'images/icons/icon-192x192.png',
    data: {
      timestamp: Date.now(),
      loc: loc
    },
    actions: [
      {action: 'go', title: 'Go Now' }
    ]
  };
  evt.waitUntil(
    self.registration.showNotification('Hello UIT!', options)
  );

});



/*
self.addEventListener('fetch', function(e) {
    console.log('[UIT Service Worker] Fetch', e.request.url);
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  
    if (e.request.url.indexOf(dataUrl) > -1) {
      /*
       * When the request URL contains dataUrl, the app is asking for fresh
       * weather data. In this case, the service worker always goes to the
       * network and then caches the response. This is called the "Cache then
       * network" strategy:
       * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
       *//*
      e.respondWith(
        caches.open(dataCacheName).then(function(cache) {
          return fetch(e.request).then(function(response){
            cache.put(e.request.url, response.clone());
            return response;
          });
        })
      );
    } else {
      /*
       * The app is asking for app shell files. In this scenario the app uses the
       * "Cache, falling back to the network" offline strategy:
       * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
       */
      /*console.log('[UIT Service Worker] Fetch from cache', e.request.url);
      e.respondWith(      
        caches.match(e.request).then(function(response) {
          return response || fetch(e.request);
        })
      );
    }
  });*/