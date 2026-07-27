// ==========================================================
// Sgt. Quackers: Burn Another Day
// game.js
// v0.1 Cyber Boot Integration
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
// CANVAS
// ==========================================================


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
// INTRO SYSTEM
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
    STATE.INTRO;


    let interval =
    setInterval(()=>{


        loadingProgress += 1;



        loadingFill.style.width =
        loadingProgress + "%";


        loadingPercent.innerText =
        loadingProgress + "%";



        if(
        loadingProgress % 20 === 0 &&
        messageIndex < bootMessages.length
        ){

            systemStatus.innerText =
            bootMessages[messageIndex];


            messageIndex++;

        }



        if(loadingProgress >= 100){


            clearInterval(interval);


            systemStatus.innerText =
            "SYSTEM READY";


            playButton.disabled =
            false;



        }


    },40);



}





function showTitleScreen(){


    introScreen.style.display =
    "none";


    titleScreen.style.display =
    "flex";


    startBootSequence();



}





introVideo.addEventListener(
"ended",
()=>{

    showTitleScreen();

});




// fallback if video missing

setTimeout(()=>{


if(gameState===STATE.BOOT){

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


x:window.innerWidth * 0.25,


y:400,


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

});







// ==========================================================
// START GAME
// ==========================================================


playButton.onclick = ()=>{


    titleScreen.style.display =
    "none";


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
    canvas.height / 2;


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


    muteButton.innerText =
    muted
    ?
    "🔇"
    :
    "🔊";


}



muteButton.onclick =
toggleMute;








// ==========================================================
// GAME LOOP
// ==========================================================


function loop(time){


    if(gameState !== STATE.PLAYING)
        return;



    let dt =
    (time-last)/1000;



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



    // corridor movement

    corridorX -=
    corridorSpeed * dt;



    if(
    corridorX <= -corridor.width
    ){

        corridorX = 0;

    }






    // distance and score


    distance +=
    corridorSpeed * dt / 10;



    score =
    Math.floor(distance * 5);







    // player physics


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







    // death zones


    if(
    player.y <= 0 ||
    player.y >= canvas.height
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


    scoreText.innerText =
    formatNumber(score);



    distanceText.innerText =
    formatNumber(
        Math.floor(distance)
    )
    + " M";



    healthFill.style.width =
    health + "%";



    healthText.innerText =
    health + "%";


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





    finalScore.innerText =
    formatNumber(score);



    finalDistance.innerText =
    formatNumber(
        Math.floor(distance)
    )
    + " M";



    bestScore.innerText =
    formatNumber(
        savedData.highScore
    );





    gameOverScreen.style.display =
    "flex";



}







// ==========================================================
// PARTICLES
// ==========================================================


function boostParticles(){


    for(
    let i=0;
    i<15;
    i++
    ){


        particles.push({


            x:
            player.x - 60,


            y:
            player.y + 20,


            vx:
            -Math.random()*250-50,


            vy:
            (Math.random()-0.5)*180,


            size:
            Math.random()*8+4,


            life:1


        });


    }



    shake = 8;


}






function updateParticles(dt){



    for(
    let i=particles.length-1;
    i>=0;
    i--
    ){


        let p =
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



    for(
    const p of particles
    ){


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

            Math.PI*2

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







function drawCorridor(){



    ctx.fillStyle =
    "#0b0f19";



    ctx.fillRect(

        0,

        0,

        canvas.width,

        canvas.height

    );






    if(!corridor.complete)
        return;







    ctx.drawImage(

        corridor,

        corridorX,

        0,

        corridor.width,

        canvas.height

    );







    ctx.drawImage(

        corridor,

        corridorX + corridor.width,

        0,

        corridor.width,

        canvas.height

    );



}







function drawPlayer(){



    const img =
    sprites[player.sprite];



    if(!img.complete)
        return;





    ctx.save();





    ctx.translate(

        player.x,

        player.y

    );





    ctx.rotate(

        player.rotation

    );





    const size =
Math.min(
canvas.width,
canvas.height
) * 0.22;


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
// BOOT
// ==========================================================


startBootSequence();