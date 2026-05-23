const CACHE = "ratebox-v1";

self.addEventListener("install",e=>{

  e.waitUntil(

    caches.open(CACHE)
    .then(cache=>{

      return cache.addAll([
        "./",
        "./index.html",
        "./styles.css",
        "./app.js",
        "./data/suppliers.json"
      ]);

    })

  );

});