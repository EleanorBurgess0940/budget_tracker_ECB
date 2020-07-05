//list of local resources we want to be cached
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "icons/icon-192x192.png",
  "icons/icon-512x512.png",
];

const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

//install
//the install handler will take care of precaching resources
//when the site is open this event will happen
self.addEventListener("install", (event) => {
  //will not install until the code is finished
  event.waitUntil(
    caches
      //precache is created
      .open(PRECACHE)
      //precache is created and all files are added
      //can be seen on the application page of the console
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      //calls on the activate event
      .then(self.skipWaiting())
  );
});

//activate
// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", (event) => {
  const currentCaches = [PRECACHE, RUNTIME];
  //will not activate until the code is finished
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        //return cacheNames.filter
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

//fetch
//This fetch handler will respond for same-origin resources from the cache
//it will populate the run time cache with the response from the network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return caches.open(RUNTIME).then((cache) => {
          return fetch(event.request).then((response) => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request.url, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
