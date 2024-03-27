'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"version.json": "dcd07114b284398951bbfd367224794e",
"index.html": "bcd413530d82ebbe38c2c768abd5f663",
"/": "bcd413530d82ebbe38c2c768abd5f663",
"main.dart.js": "91940a21626b207fdf9fe6a15fd44ddc",
"Icon-192.jpg": "4746be07fbe4cb252e2ea9ffa5c647eb",
"Icon-maskable-192.jpg": "4746be07fbe4cb252e2ea9ffa5c647eb",
"flutter.js": "7d69e653079438abfbb24b82a655b0a4",
"favicon.png": "3df33670072e6ab819defd36cb1b0969",
"icons/Icon-192.jpg": "4746be07fbe4cb252e2ea9ffa5c647eb",
"icons/Icon-maskable-192.jpg": "4746be07fbe4cb252e2ea9ffa5c647eb",
"icons/Icon-maskable-512.png": "a50c0fa7748e454a63b99a2c7b71bae4",
"icons/Icon-512.png": "a50c0fa7748e454a63b99a2c7b71bae4",
"manifest.json": "cfcfa576a8aefade5e278b3030646391",
"Icon-maskable-512.png": "a50c0fa7748e454a63b99a2c7b71bae4",
"assets/AssetManifest.json": "e8b9e43f9dcf5578ebb6921e7ede1531",
"assets/NOTICES": "7ab80b0ed5ae2164671c796cdbf24f0d",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.bin.json": "9cf72edf4bb797f5afaf6b731049860f",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89ed8f4e49bcdfc0b5bfc9b24591e347",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"assets/AssetManifest.bin": "d857e227b54a114b3d98392675f2afcf",
"assets/fonts/MaterialIcons-Regular.otf": "44e6beaf6ecfb72accb9a355f576aa99",
"assets/assets/me.png": "ed41b8ed6f3cdb3c7e2f280cf4b34812",
"assets/assets/figma.svg": "3b0fb69f67df8e1c5665644cc8f7a983",
"assets/assets/firebase.svg": "10b0719343408095f5a9b369e0787115",
"assets/assets/java.svg": "45f6ff15dcfe17b99a87bcbd6f9d7582",
"assets/assets/github.svg": "edd2906685e30d7b5ea8febe2a4bcec0",
"assets/assets/cpp.svg": "5be9bde46141498a7cfd4902b92133b1",
"assets/assets/flutter.svg": "fdb46fc7657324f79bd97928651e8274",
"assets/assets/git.svg": "f7287ff316e284af16ce082c870c478f",
"assets/assets/jira.svg": "a397460c103a310f9ac429fdee79cf9c",
"assets/assets/kotlin.svg": "73c815b94511db676068d478c1e80875",
"assets/assets/dart.svg": "ef26b12cc0b34cc83dfcde04e8bb1ea1",
"assets/assets/c.svg": "3eeaad17a17654e9ee1cfdc724eedc7c",
"assets/assets/linkedin.svg": "d83aa12847d09e15c16414acf8c14371",
"assets/assets/jetpackCompose.svg": "5f4709b74bb37a3dd3857743691ed8d2",
"assets/assets/swift.svg": "a52c32035bb9f8cc14d28b891bfdb9c9",
"Icon-512.png": "a50c0fa7748e454a63b99a2c7b71bae4",
"canvaskit/skwasm.js": "87063acf45c5e1ab9565dcf06b0c18b8",
"canvaskit/skwasm.wasm": "2fc47c0a0c3c7af8542b601634fe9674",
"canvaskit/chromium/canvaskit.js": "0ae8bbcc58155679458a0f7a00f66873",
"canvaskit/chromium/canvaskit.wasm": "143af6ff368f9cd21c863bfa4274c406",
"canvaskit/canvaskit.js": "eb8797020acdbdf96a12fb0405582c1b",
"canvaskit/canvaskit.wasm": "73584c1a3367e3eaf757647a8f5c5989",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
