// ==========================================================
// Sgt. Quackers: Burn Another Day
// game.js
// v0.3 Cyber Arcade Landscape Build
// ==========================================================


"use strict";



// ==========================================================
// DOM REFERENCES
// ==========================================================


const canvas =
document.getElementById("game");


const ctx =
canvas.getContext("2d");



const introScreen =
document.getElementById("introScreen");


const introVideo =
document.getElementById("introVideo");


const titleScreen =
document.getElementById("titleScreen");


const playButton =
document.getElementById("play");



const systemStatus =
document.getElementById("systemStatus");


const loadingFill =
document.getElementById("loadingFill");


const loadingPercent =
document.getElementById("loadingPercent");



const gameOverScreen =
document.getElementById("gameOver");


const redeployButton =
document.getElementById("redeploy");



const scoreText =
document.getElementById("score");


const distanceText =
document.getElementById("distance");


const finalScore =
document.getElementById("finalScore");


const finalDistance =
document.getElementById("finalDistance");


const bestScore =
document.getElementById("bestScore");



const healthFill =
document.getElementById("healthFill");


const healthText =
document.getElementById("healthText");



const muteButton =
document.getElementById("muteButton");







// ==========================================================
// FORCE LANDSCAPE
// ==========================================================


async function forceLandscape(){


    try{


        if(
        screen.orientation &&
        screen.orientation.lock
        ){

            await screen.orientation.lock(
                "landscape-primary"
            );

        }


    }

    catch(err){

        console.log(
            "Landscape lock unavailable",
            err
        );

    }


}



window.addEventListener(
"load",
forceLandscape
);








// ==========================================================
// VIRTUAL GAME RESOLUTION
// ==========================================================


const GAME_WIDTH = 1280;

const GAME_HEIGHT = 720;



let scale = 1;

let offsetX = 0;

let offsetY = 0;




function resize(){


    const dpr =
    window.devicePixelRatio || 1;



    canvas.width =
    window.innerWidth * dpr;


    canvas.height =
    window.innerHeight * dpr;



    canvas.style.width =
    window.innerWidth + "px";


    canvas.style.height =
    window.innerHeight + "px";



    ctx.setTransform(

        dpr,

        0,

        0,

        dpr,

        0,

        0

    );



    scale =
    Math.min(

        window.innerWidth / GAME_WIDTH,

        window.innerHeight / GAME_HEIGHT

    );



    offsetX =
    (
        window.innerWidth -
        GAME_WIDTH * scale
    ) / 2;



    offsetY =
    (
        window.innerHeight -
        GAME_HEIGHT * scale
    ) / 2;



}



window.addEventListener(
"resize",
resize
);


resize();









// ==========================================================
// GAME STATES
// ==========================================================


const STATE = {


    BOOT:"BOOT",


    INTRO:"INTRO",


    TITLE:"TITLE",


    PLAYING:"PLAYING",


    GAME_OVER:"GAME_OVER"


};



let gameState =
STATE.BOOT;









// ==========================================================
// INTRO BOOT SYSTEM
// ==========================================================


let loadingProgress = 0;


const bootMessages = [


"BOOTING SYSTEM...",


"LOADING TACTICAL DATABASE...",


"CALIBRATING JETPACK SYSTEM...",


"WEAPON SYSTEMS ONLINE...",


"INITIATING SURVIVAL MODE..."


];



let messageIndex = 0;





function startBootSequence(){


    gameState =
    STATE.TITLE;



    let interval =
    setInterval(()=>{


        loadingProgress++;



        if(loadingFill){

            loadingFill.style.width =
            loadingProgress + "%";

        }



        if(loadingPercent){

            loadingPercent.innerText =
            loadingProgress + "%";

        }




        if(

            loadingProgress % 20 === 0 &&

            messageIndex <
            bootMessages.length

        ){


            if(systemStatus){

                systemStatus.innerText =
                bootMessages[messageIndex];

            }


            messageIndex++;


        }






        if(loadingProgress >= 100){


            clearInterval(interval);



            if(systemStatus){

                systemStatus.innerText =
                "SYSTEM READY";

            }



            if(playButton){

                playButton.disabled =
                false;

            }


        }



    },40);



}







function showTitleScreen(){


    if(introScreen){

        introScreen.style.display =
        "none";

    }



    if(titleScreen){

        titleScreen.style.display =
        "flex";

    }



    startBootSequence();


}







if(introVideo){


introVideo.addEventListener(

"ended",

()=>{

    showTitleScreen();

}

);


}







setTimeout(()=>{


    if(gameState === STATE.BOOT){

        showTitleScreen();

    }


},10000);









// ==========================================================
// SAVE SYSTEM
// ==========================================================


let savedData =


JSON.parse(

localStorage.getItem(
"sgtQuackersSave"
)

)

||


{


highScore:0,


bestDistance:0,


runs:0


};






function saveData(){


localStorage.setItem(

"sgtQuackersSave",

JSON.stringify(savedData)

);


}









// ==========================================================
// ASSETS
// ==========================================================


const sprites = {};





function loadSprite(name,path){


    const img =
    new Image();



    img.src =
    path;



    sprites[name] =
    img;


}





loadSprite(

"hover",

"assets/characters/quackers/hover_01.png"

);



loadSprite(

"up",

"assets/characters/quackers/flap_up.png"

);



loadSprite(

"down",

"assets/characters/quackers/flap_down.png"

);







const corridor =
new Image();



corridor.src =
"assets/corridor.png";









// ==========================================================
// WORLD
// ==========================================================


let corridorX = 0;


const corridorSpeed = 220;









// ==========================================================
// PLAYER
// ==========================================================


const player = {


    x:
    GAME_WIDTH * 0.22,


    y:
    GAME_HEIGHT / 2,



    velocity:0,


    gravity:1200,


    flap:-420,


    rotation:0,


    sprite:"hover"


};









// ==========================================================
// GAME DATA
// ==========================================================


let score = 0;


let distance = 0;


let health = 100;


let muted = false;



let last = 0;



let particles = [];


let shake = 0;
// ==========================================================
// INPUT
// ==========================================================


function flap(){


    if(gameState !== STATE.PLAYING)

        return;



    player.velocity =
    player.flap;



    player.sprite =
    "up";



    boostParticles();


}







window.addEventListener(

"keydown",

(e)=>{


    if(e.code === "Space"){

        flap();

    }



    if(e.code === "KeyM"){

        toggleMute();

    }


});





canvas.addEventListener(

"pointerdown",

()=>{

    flap();

}

);









// ==========================================================
// START GAME
// ==========================================================


playButton.onclick = ()=>{


    if(titleScreen){

        titleScreen.style.display =
        "none";

    }



    gameState =
    STATE.PLAYING;



    resetGame();



    last =
    performance.now();



    requestAnimationFrame(loop);


};






redeployButton.onclick = ()=>{


    gameOverScreen.style.display =
    "none";



    resetGame();



    gameState =
    STATE.PLAYING;



    last =
    performance.now();



    requestAnimationFrame(loop);


};









function resetGame(){


    score = 0;


    distance = 0;


    health = 100;



    player.y =
    GAME_HEIGHT / 2;



    player.velocity = 0;


    player.rotation = 0;



    corridorX = 0;



}









// ==========================================================
// MUTE
// ==========================================================


function toggleMute(){


    muted =
    !muted;



    if(muteButton){

        muteButton.innerText =

        muted

        ?

        "🔇"

        :

        "🔊";


    }


}



if(muteButton){

    muteButton.onclick =
    toggleMute;

}









// ==========================================================
// GAME LOOP
// ==========================================================


function loop(time){



    if(gameState !== STATE.PLAYING)

        return;





    let dt =

    (time-last) / 1000;



    last =
    time;



    update(dt);



    draw();



    requestAnimationFrame(loop);


}









// ==========================================================
// UPDATE
// ==========================================================


function update(dt){



    corridorX -=

    corridorSpeed * dt;



    if(

    corridorX <= -GAME_WIDTH

    ){

        corridorX = 0;

    }







    distance +=

    corridorSpeed * dt / 10;



    score =

    Math.floor(distance * 5);








    player.velocity +=

    player.gravity * dt;



    player.y +=

    player.velocity * dt;







    player.rotation =

    Math.max(

        -.5,

        Math.min(

            .8,

            player.velocity / 700

        )

    );








    if(player.velocity < 0){


        player.sprite =

        "up";


    }

    else{


        player.sprite =

        "down";


    }








    if(

        player.y <= 0 ||

        player.y >= GAME_HEIGHT

    ){


        triggerGameOver();


    }







    updateParticles(dt);


    updateHUD();






    if(shake > 0){


        shake -=

        dt * 40;


    }



}









// ==========================================================
// HUD
// ==========================================================


function updateHUD(){



    if(scoreText){

        scoreText.innerText =

        formatNumber(score);

    }





    if(distanceText){

        distanceText.innerText =

        formatNumber(

            Math.floor(distance)

        )

        +

        " M";

    }






    if(healthFill){

        healthFill.style.width =

        health + "%";

    }





    if(healthText){

        healthText.innerText =

        health + "%";

    }



}








function formatNumber(num){



    return String(

        Math.floor(num)

    )

    .padStart(

        6,

        "0"

    );


}









// ==========================================================
// GAME OVER
// ==========================================================


function triggerGameOver(){



    if(

    gameState === STATE.GAME_OVER

    )

    return;





    gameState =

    STATE.GAME_OVER;







    savedData.runs++;







    if(score > savedData.highScore){


        savedData.highScore =

        score;


    }







    if(distance > savedData.bestDistance){


        savedData.bestDistance =

        distance;


    }







    saveData();








    if(finalScore){

        finalScore.innerText =

        formatNumber(score);

    }







    if(finalDistance){

        finalDistance.innerText =

        formatNumber(

            Math.floor(distance)

        )

        +

        " M";


    }







    if(bestScore){

        bestScore.innerText =

        formatNumber(

            savedData.highScore

        );


    }







    gameOverScreen.style.display =

    "flex";



}









// ==========================================================
// PARTICLES
// ==========================================================


function boostParticles(){



    for(let i=0;i<15;i++){



        particles.push({



            x:

            player.x - 45,



            y:

            player.y + 15,



            vx:

            -Math.random()*250-50,



            vy:

            (Math.random()-0.5)*180,



            size:

            Math.random()*6+3,



            life:1



        });



    }



    shake = 8;



}









function updateParticles(dt){



    for(

    let i = particles.length - 1;

    i >= 0;

    i--

    ){



        const p =

        particles[i];





        p.x +=

        p.vx * dt;



        p.y +=

        p.vy * dt;



        p.life -=

        dt * 2;






        if(p.life <= 0){


            particles.splice(

            i,

            1

            );


        }



    }



}









function drawParticles(){



    for(const p of particles){



        ctx.globalAlpha =

        p.life;





        ctx.fillStyle =


        p.life > .5


        ?


        "#00f0ff"


        :


        "#ff5500";







        ctx.beginPath();



        ctx.arc(

            p.x,

            p.y,

            p.size,

            0,

            Math.PI * 2

        );



        ctx.fill();



    }





    ctx.globalAlpha = 1;



}









// ==========================================================
// DRAW
// ==========================================================


function draw(){



    ctx.save();





    ctx.translate(

        offsetX,

        offsetY

    );





    ctx.scale(

        scale,

        scale

    );








    if(shake > 0){



        ctx.translate(

            (Math.random()-.5)*shake,

            (Math.random()-.5)*shake

        );


    }







    drawCorridor();



    drawParticles();



    drawPlayer();







    ctx.restore();



}









// ==========================================================
// CORRIDOR
// ==========================================================


function drawCorridor(){



    ctx.fillStyle =

    "#0b0f19";



    ctx.fillRect(

        0,

        0,

        GAME_WIDTH,

        GAME_HEIGHT

    );








    if(!corridor.complete)

        return;








    ctx.drawImage(

        corridor,

        corridorX,

        0,

        GAME_WIDTH,

        GAME_HEIGHT

    );







    ctx.drawImage(

        corridor,

        corridorX + GAME_WIDTH,

        0,

        GAME_WIDTH,

        GAME_HEIGHT

    );



}









// ==========================================================
// PLAYER DRAW
// ==========================================================


function drawPlayer(){



    const img =

    sprites[player.sprite];





    if(!img || !img.complete)

        return;







    ctx.save();







    ctx.translate(

        player.x,

        player.y

    );







    ctx.rotate(

        player.rotation

    );







    // smaller arcade-scale duck

    const size = 125;








    ctx.drawImage(

        img,

        -size/2,

        -size/2,

        size,

        size

    );







    ctx.restore();



}









// ==========================================================
// START
// ==========================================================


startBootSequence();