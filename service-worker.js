// ==========================================================
// Sgt. Quackers: Burn Another Day
// service-worker.js
// v0.3 Cyber Cache System
// ==========================================================


"use strict";



const CACHE_NAME =
"sgt-quackers-v3";





const ASSETS = [


"./",


"./index.html",


"./style.css",


"./game.js",


"./manifest.json",




// splash assets

"./assets/splash.gif",

"./assets/splash.mp4",




// corridor

"./assets/corridor.png",




// character sprites

"./assets/characters/quackers/hover_01.png",

"./assets/characters/quackers/flap_up.png",

"./assets/characters/quackers/flap_down.png",




// icons

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


        caches.open(

            CACHE_NAME

        )

        .then(cache=>{


            return cache.addAll(

                ASSETS

            );


        })



    );



    self.skipWaiting();



});









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


                        return caches.delete(

                            key

                        );


                    }


                })


            );


        })


    );



    self.clients.claim();



});









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

        .then(cached=>{


            if(cached){


                return cached;


            }




            return fetch(

                event.request

            )

            .then(response=>{


                return response;


            });



        })



    );



});