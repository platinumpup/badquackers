// ==========================================================
// Sgt. Quackers: Burn Another Day
// service-worker.js
// PWA Offline Cache
// ==========================================================


"use strict";



const CACHE_NAME =
"sgt-quackers-burn-another-day-v1";





const ASSETS = [


    "./",

    "./index.html",

    "./style.css",

    "./game.js",

    "./manifest.json",



    "./assets/splash.mp4",

    "./assets/splash.gif",

    "./assets/corridor.png",



    "./assets/characters/quackers/hover_01.png",

    "./assets/characters/quackers/flap_up.png",

    "./assets/characters/quackers/flap_down.png",



    "./assets/icons/icon-192.png",

    "./assets/icons/icon-512.png"


];







// ==========================================================
// INSTALL
// ==========================================================


self.addEventListener(

"install",

event=>{


    event.waitUntil(


        caches.open(CACHE_NAME)

        .then(cache=>{


            return cache.addAll(ASSETS);


        })


    );


    self.skipWaiting();


}

);








// ==========================================================
// ACTIVATE
// ==========================================================


self.addEventListener(

"activate",

event=>{


    event.waitUntil(


        caches.keys()

        .then(keys=>{


            return Promise.all(


                keys.map(key=>{


                    if(
                    key !== CACHE_NAME
                    ){

                        return caches.delete(key);

                    }


                })


            );


        })


    );


    self.clients.claim();


}

);








// ==========================================================
// FETCH
// ==========================================================


self.addEventListener(

"fetch",

event=>{


    event.respondWith(


        caches.match(
            event.request
        )

        .then(response=>{


            return response ||

            fetch(event.request)

            .then(networkResponse=>{


                return caches.open(

                    CACHE_NAME

                )

                .then(cache=>{


                    cache.put(

                        event.request,

                        networkResponse.clone()

                    );


                    return networkResponse;


                });


            });


        })


    );


}

);