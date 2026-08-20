// ==========================================================
// Sgt. Quackers: Burn Another Day
// service-worker.js
// v0.4 Cyber Cache System (Updated for refactored structure)
// ==========================================================


"use strict";



const CACHE_NAME =
"sgt-quackers-v4";




const ASSETS = [


"./",


"./index.html",


"./css/style.css",


"./manifest.json",


"./firebase.json",




// JavaScript - Core Game

"./js/config.js",

"./js/player.js",

"./js/corridor.js",

"./js/obstacles.js",

"./js/main.js",




// JavaScript - Optional Modules

"./js/audio.js",

"./js/collision.js",

"./js/particles.js",

"./js/storage.js",

"./js/hud.js",

"./js/game.js",




// Firebase & Scoreboard

"./js/scoreboard-config.js",

"./js/scoreboard-compat.js",

"./js/scoreboard.js",




// Player Assets

"./assets/player/quackers_master.PNG",

"./assets/player/hover_01.png",

"./assets/player/flap_up.png",

"./assets/player/flap_down.png",

"./assets/player/analyze_sprites.py",




// Environment Assets

"./assets/environment/corridor.png",




// External CDN Resources (Firebase - optional, can fail gracefully)

"https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js",

"https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"


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

        .catch(error=>{

            console.error(

                "Cache install failed:",

                error

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


                        console.log(

                            "Deleting old cache:",

                            key

                        );


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


                // Cache successful responses

                if(

                    response &&

                    response.status === 200

                ){


                    const responseClone =

                        response.clone();


                    caches.open(

                        CACHE_NAME

                    )

                    .then(cache=>{


                        cache.put(

                            event.request,

                            responseClone

                        );


                    });


                }


                return response;


            })

            .catch(error=>{


                console.error(

                    "Fetch failed for:",

                    event.request.url,

                    error

                );


                // Optionally return fallback

                return new Response(

                    "Offline",

                    {

                        status: 503,

                        statusText: "Service Unavailable"

                    }

                );


            });



        })

        .catch(error=>{


            console.error(

                "Cache match failed:",

                error

            );



        })



    );



});
