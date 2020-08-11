self.addEventListener('install', function (event) {
    event.waitUntil(updateStaticCache());
});

function updateStaticCache() {
    return caches.open(version)
        .then(function (cache) {
            return cache.addAll(assets);
        });
}


if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/serviceworker.js')
        .then(function (registration) {
            console.log('Service Worker Registered');
            return registration.sync.register('sendFormData');
            console.log('sync event registered')
        });
}


self.addEventListener('activate', function (event) {
    console.log('Activated', event);
    event.waitUntil(
        caches.keys()
            .then(function (keys) {
                // Remove caches whose name is no longer valid
                return Promise.all(keys
                    .filter(function (key) {
                        return key.indexOf(version) !== 0;
                    })
                    .map(function (key) {
                        return caches.delete(key);
                    })
                );
            })
    );
});



self.addEventListener('fetch', e => {
    console.log('Service Worker : Fetching');
    e.respondWith(
        fetch(e.request)
            .then(res => {
                // Make Copy/clone of response
                const resClone = res.clone();
                // Open cache
                caches
                    .open(version)
                    .then(cache => {
                        // add response to cache
                        cache.put(e.request, resClone);
                    });
                return res;
            }).catch(err => caches.match(e.request).then(res => res))
    );
});
