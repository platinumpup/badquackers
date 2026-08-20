"use strict";

// ==========================================================
// Sgt. Quackers: Burn Another Day
// js/main.js
//
// MASTER GAME LOOP
//
// CURRENT GAME SYSTEM
//      MOVING SEAMLESS CORRIDOR
//      FIRE OBSTACLES
//      BLUE STAMINA PICKUPS
//      STAMINA SHIELD
//      SCREEN-SPACE TUTORIALS
//
// DEATH BEHAVIOR
//      FIRE HIT
//          - World freezes
//          - Fire animation continues
//          - Player remains at impact position
//          - Player darkens toward charcoal
//          - Player fades away
//
//      CEILING / FLOOR HIT
//          - World freezes
//          - Fire animation continues
//          - Player remains at impact position
//          - Player simply fades away
//
// GAME OVER
//      Corridor and obstacle POSITIONS remain frozen.
//      Fire animation continues behind the game-over screen.
// ==========================================================


// ==========================================================
// DOM REFERENCES
// ==========================================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

const corridor =
    new Corridor(ctx);

const readyScreen =
    document.getElementById("ready-screen");

const gameOverScreen =
    document.getElementById("game-over-screen");

const redeployButton =
    document.getElementById("redeploy-button");

const scoreElement =
    document.getElementById("score");

const distanceElement =
    document.getElementById("distance");

const finalScoreElement =
    document.getElementById("final-score");

const finalDistanceElement =
    document.getElementById("final-distance");

const bestScoreElement =
    document.getElementById("best-score");

const staminaElement =
    document.getElementById("stamina") ||
    document.getElementById("stamina-count");

// New: username and leaderboard elements (these exist in index.html additions)
const usernameInput =
    document.getElementById("username-input");

const usernameSaveButton =
    document.getElementById("username-save");

const usernameDisplay =
    document.getElementById("username-display");

const leaderboardElement =
    document.getElementById("leaderboard");

// ==========================================================
// CANVAS
// ==========================================================

canvas.width =
    Config.GAME.WIDTH;

canvas.height =
    Config.GAME.HEIGHT;

ctx.imageSmoothingEnabled =
    true;

ctx.imageSmoothingQuality =
    "high";


// ==========================================================
// TITLE IMAGE
// ==========================================================

function setupTitleImage() {

    if (!readyScreen) {
        return;
    }

    if (
        readyScreen.querySelector(
            ".title-quackers"
        )
    ) {
        return;
    }

    const titleImage =
        document.createElement("img");

    titleImage.src =
        "assets/player/quackers_master.png";

    titleImage.className =
        "title-quackers";

    titleImage.alt =
        "Sgt. Quackers";

    titleImage.style.display =
        "block";

    titleImage.style.width =
        "min(280px, 35vw)";

    titleImage.style.height =
        "auto";

    titleImage.style.objectFit =
        "contain";

    titleImage.style.margin =
        "0 auto 10px auto";

    const title =
        readyScreen.querySelector(
            ".title"
        );

    if (title) {

        title.parentNode.insertBefore(
            titleImage,
            title
        );

    } else {

        readyScreen.prepend(
            titleImage
        );
    }
}

setupTitleImage();


// ==========================================================
// GAME OVER IMAGE
// ==========================================================

const FUTURE_GAME_OVER_IMAGE =
    "";

function setupGameOverImage() {

    if (!gameOverScreen) {
        return;
    }

    if (!FUTURE_GAME_OVER_IMAGE) {
        return;
    }

    if (
        gameOverScreen.querySelector(
            ".game-over-quackers"
        )
    ) {
        return;
    }

    const gameOverImage =
        document.createElement("img");

    gameOverImage.src =
        FUTURE_GAME_OVER_IMAGE;

    gameOverImage.className =
        "game-over-quackers";

    gameOverImage.alt =
        "Mission Failed";

    gameOverImage.style.display =
        "block";

    gameOverImage.style.width =
        "min(300px, 40vw)";

    gameOverImage.style.height =
        "auto";

    gameOverImage.style.objectFit =
        "contain";

    gameOverImage.style.margin =
        "0 auto 10px auto";

    const title =
        gameOverScreen.querySelector(
            ".game-over-title"
        );

    if (title) {

        title.parentNode.insertBefore(
            gameOverImage,
            title
        );

    } else {

        gameOverScreen.prepend(
            gameOverImage
        );
    }
}

setupGameOverImage();


// ==========================================================
// GAME STATE
// ==========================================================

const GameState = {

    READY:
        "ready",

    PLAYING:
        "playing",

    GAME_OVER:
        "game_over"
};

let gameState =
    GameState.READY;

let lastTime =
    0;

let score =
    0;

let distance =
    0;

let worldSpeed =
    Config.WORLD.START_SPEED;

let playerVisible =
    false;


// ==========================================================
// DEATH ANIMATION
// ==========================================================
//
// The world does NOT move during this animation.
//
// fireTime DOES continue advancing, so all fire obstacles
// continue flickering and moving their flame tongues.
//
// The player remains at the exact position of impact.
// 

const DeathType = {

    NONE:
        "none",

    FIRE:
        "fire",

    CEILING:
        "ceiling",

    FLOOR:
        "floor"
};

let deathType =
    DeathType.NONE;

let deathTimer =
    0;

const DEATH_DURATION =
    1.15;

const FIRE_CHARCOAL_START =
    100;

const FIRE_CHARCOAL_END =
    100;


// ==========================================================
// PLAYER
// ==========================================================

const player =
    new Player();


// ==========================================================
// FIRE OBSTACLES
// ==========================================================

const obstacles =
    [];

let obstacleTimer =
    0;


// ==========================================================
// FIRE DIMENSIONS
// ==========================================================

const FIRE_HORIZONTAL_WIDTH_MIN =
    145;

const FIRE_HORIZONTAL_WIDTH_MAX =
    225;

const FIRE_HORIZONTAL_HEIGHT =
    12;

const FIRE_VERTICAL_WIDTH =
    FIRE_HORIZONTAL_HEIGHT;

const FIRE_VERTICAL_HEIGHT_MIN =
    135;

const FIRE_VERTICAL_HEIGHT_MAX =
    205;


// ==========================================================
// FIRE SAFETY
// ==========================================================

const FIRE_HORIZONTAL_SAFE_MARGIN =
    80;

const FIRE_VERTICAL_SAFE_MARGIN =
    80;


// ==========================================================
// OBSTACLE SPAWN
// ==========================================================

const OBSTACLE_SPAWN_OFFSET =
    180;

const MIN_OBSTACLE_DISTANCE =
    470;

const START_OBSTACLE_DISTANCE =
    650;

const DISTANCE_DECREASE_PER_SCORE =
    8;


// ==========================================================
// FIRE ANIMATION
// ==========================================================

let fireTime =
    0;


// ==========================================================
// TUTORIAL SYSTEM
// ==========================================================

const TutorialStage = {

    NONE:
        "none",

    TAP:
        "tap",

    FIRE:
        "fire",

    STAMINA:
        "stamina",

    SURVIVE:
        "survive"
};

let tutorialStage =
    TutorialStage.NONE;

let tutorialTimer =
    0;

const TAP_TUTORIAL_DURATION =
    3.4;

const FIRE_TUTORIAL_DURATION =
    4.4;

const STAMINA_TUTORIAL_DURATION =
    4.2;

const SURVIVE_TUTORIAL_DURATION =
    4.2;

let fireTutorialShown =
    false;

let staminaTutorialShown =
    false;

let surviveTutorialShown =
    false;


// ==========================================================
// STAMINA SYSTEM
// ==========================================================

let stamina =
    0;

const MAX_STAMINA =
    3;


// ==========================================================
// STAMINA PICKUPS
// ==========================================================

const staminaPickups =
    [];

let staminaPickupTimer =
    0;

const STAMINA_SPAWN_DISTANCE =
    2500;

const STAMINA_SPAWN_OFFSET =
    300;

const STAMINA_PICKUP_RADIUS =
    11;

const STAMINA_PICKUP_SAFE_MARGIN =
    70;


// ==========================================================
// PICKUP FEEDBACK
// ==========================================================

const pickupFeedbacks =
    [];


// ==========================================================
// RANDOM RANGE
// ==========================================================

function randomRange(
    min,
    max
) {

    return (
        min +
        Math.random() *
        (
            max -
            min
        )
    );
}


// ==========================================================
// TUTORIAL CONTROL
// ==========================================================

function showTutorial(
    stage
) {

    tutorialStage =
        stage;

    tutorialTimer =
        0;
}


function hideTutorial() {

    tutorialStage =
        TutorialStage.NONE;

    tutorialTimer =
        0;
}


function updateTutorial(
    deltaTime
) {

    if (
        tutorialStage ===
        TutorialStage.NONE
    ) {
        return;
    }

    tutorialTimer +=
        deltaTime;

    let duration =
        0;

    switch (
        tutorialStage
    ) {

        case TutorialStage.TAP:
            duration =
                TAP_TUTORIAL_DURATION;
            break;

        case TutorialStage.FIRE:
            duration =
                FIRE_TUTORIAL_DURATION;
            break;

        case TutorialStage.STAMINA:
            duration =
                STAMINA_TUTORIAL_DURATION;
            break;

        case TutorialStage.SURVIVE:
            duration =
                SURVIVE_TUTORIAL_DURATION;
            break;
    }

    if (
        tutorialTimer >=
        duration
    ) {

        hideTutorial();
    }
}


// ==========================================================
// RESET OBSTACLES
// ==========================================================

function resetObstacles() {

    obstacles.length =
        0;

    obstacleTimer =
        0;

    fireTutorialShown =
        false;
}


// ==========================================================
// RESET STAMINA
// ==========================================================

function resetStamina() {

    stamina =
        0;

    staminaPickups.length =
        0;

    staminaPickupTimer =
        0;

    pickupFeedbacks.length =
        0;

    staminaTutorialShown =
        false;

    surviveTutorialShown =
        false;
}


// ==========================================================
// RESET DEATH
// ==========================================================

function resetDeath() {

    deathType =
        DeathType.NONE;

    deathTimer =
        0;
}


// ==========================================================
// CREATE HORIZONTAL FIRE
// ==========================================================

function createFireHorizontal() {

    const worldTop =
        Config.WORLD.CEILING_HEIGHT;

    const worldBottom =
        Config.GAME.HEIGHT -
        Config.WORLD.GROUND_HEIGHT;

    const width =
        randomRange(
            FIRE_HORIZONTAL_WIDTH_MIN,
            FIRE_HORIZONTAL_WIDTH_MAX
        );

    const minY =
        worldTop +
        FIRE_HORIZONTAL_SAFE_MARGIN;

    const maxY =
        worldBottom -
        FIRE_HORIZONTAL_SAFE_MARGIN;

    const y =
        randomRange(
            minY,
            maxY
        );

    obstacles.push({

        type:
            "horizontal",

        x:
            Config.GAME.WIDTH +
            OBSTACLE_SPAWN_OFFSET,

        y:
            y,

        width:
            width,

        height:
            FIRE_HORIZONTAL_HEIGHT,

        passed:
            false,

        hit:
            false,

        seed:
            Math.random() *
            Math.PI *
            2
    });
}


// ==========================================================
// CREATE VERTICAL FIRE
// ==========================================================

function createFireVertical() {

    const worldTop =
        Config.WORLD.CEILING_HEIGHT;

    const worldBottom =
        Config.GAME.HEIGHT -
        Config.WORLD.GROUND_HEIGHT;

    const height =
        randomRange(
            FIRE_VERTICAL_HEIGHT_MIN,
            FIRE_VERTICAL_HEIGHT_MAX
        );

    const minCenter =
        worldTop +
        FIRE_VERTICAL_SAFE_MARGIN +
        height / 2;

    const maxCenter =
        worldBottom -
        FIRE_VERTICAL_SAFE_MARGIN -
        height / 2;

    let centerY;

    if (
        maxCenter >
        minCenter
    ) {

        centerY =
            randomRange(
                minCenter,
                maxCenter
            );

    } else {

        centerY =
            (
                worldTop +
                worldBottom
            ) / 2;
    }

    obstacles.push({

        type:
            "vertical",

        x:
            Config.GAME.WIDTH +
            OBSTACLE_SPAWN_OFFSET,

        y:
            centerY,

        width:
            FIRE_VERTICAL_WIDTH,

        height:
            height,

        passed:
            false,

        hit:
            false,

        seed:
            Math.random() *
            Math.PI *
            2
    });
}


// ==========================================================
// CREATE FIRE OBSTACLE
// ==========================================================

function createObstacle() {

    if (
        Math.random() <
        0.45
    ) {

        createFireVertical();

    } else {

        createFireHorizontal();
    }
}


// ==========================================================
// UPDATE FIRE OBSTACLES
// ==========================================================

function updateObstacles(
    deltaTime
) {

    obstacleTimer +=
        deltaTime;

    const distanceBetween =
        Math.max(
            MIN_OBSTACLE_DISTANCE,
            START_OBSTACLE_DISTANCE -
            score *
            DISTANCE_DECREASE_PER_SCORE
        );

    const spawnInterval =
        distanceBetween /
        worldSpeed;

    if (
        obstacleTimer >=
        spawnInterval
    ) {

        obstacleTimer =
            0;

        createObstacle();
    }


    for (
        let i =
            obstacles.length - 1;

        i >= 0;

        i--
    ) {

        const obstacle =
            obstacles[i];

        obstacle.x -=
            worldSpeed *
            deltaTime;


        if (
            !fireTutorialShown &&
            obstacle.x <
                Config.GAME.WIDTH * 0.82
        ) {

            fireTutorialShown =
                true;

            showTutorial(
                TutorialStage.FIRE
            );
        }


        const obstacleRight =
            obstacle.x +
            obstacle.width;

        if (
            !obstacle.passed &&
            obstacleRight <
                player.x
        ) {

            obstacle.passed =
                true;

            score +=
                Config.SCORE.POINTS_PER_OBSTACLE;
        }


        if (
            obstacleRight <
            -150
        ) {

            obstacles.splice(
                i,
                1
            );
        }
    }
}


// ==========================================================
// DRAW OBSTACLES
// ==========================================================

function drawObstacles() {

    for (
        const obstacle
        of obstacles
    ) {

        drawFire(
            obstacle
        );
    }
}


// ==========================================================
// DRAW FIRE
// ==========================================================

function drawFire(
    obstacle
) {

    ctx.save();

    const pulse =
        (
            Math.sin(
                fireTime * 8 +
                obstacle.seed
            ) + 1
        ) / 2;

    const turbulence =
        Math.sin(
            fireTime * 15 +
            obstacle.seed
        );


    let left;
    let top;
    let width;
    let height;


    if (
        obstacle.type ===
        "horizontal"
    ) {

        left =
            obstacle.x;

        top =
            obstacle.y -
            obstacle.height / 2;

        width =
            obstacle.width;

        height =
            obstacle.height;

    } else {

        left =
            obstacle.x -
            obstacle.width / 2;

        top =
            obstacle.y -
            obstacle.height / 2;

        width =
            obstacle.width;

        height =
            obstacle.height;
    }


    const radius =
        Math.min(
            Math.min(
                width,
                height
            ) / 2,
            8
        );


    // ------------------------------------------------------
    // OUTER GLOW
    // ------------------------------------------------------

    ctx.shadowColor =
        "rgba(255,75,10,0.9)";

    ctx.shadowBlur =
        14 +
        pulse * 8;

    const glowGradient =
        ctx.createLinearGradient(
            left,
            top,
            left + width,
            top + height
        );

    glowGradient.addColorStop(
        0,
        "rgba(255,40,5,0.55)"
    );

    glowGradient.addColorStop(
        0.5,
        "rgba(255,135,20,0.75)"
    );

    glowGradient.addColorStop(
        1,
        "rgba(255,40,5,0.55)"
    );

    ctx.fillStyle =
        glowGradient;

    ctx.beginPath();

    ctx.roundRect(
        left,
        top,
        width,
        height,
        radius
    );

    ctx.fill();


    // ------------------------------------------------------
    // MAIN FIRE BODY
    // ------------------------------------------------------

    ctx.shadowBlur =
        5;

    const fireGradient =
        ctx.createLinearGradient(
            left,
            top,
            left + width,
            top + height
        );

    fireGradient.addColorStop(
        0,
        "#ff3210"
    );

    fireGradient.addColorStop(
        0.25,
        "#ff7a18"
    );

    fireGradient.addColorStop(
        0.5,
        "#ffb52c"
    );

    fireGradient.addColorStop(
        0.75,
        "#ff6712"
    );

    fireGradient.addColorStop(
        1,
        "#e92308"
    );

    ctx.fillStyle =
        fireGradient;

    ctx.beginPath();

    ctx.roundRect(
        left,
        top,
        width,
        height,
        radius
    );

    ctx.fill();


    // ------------------------------------------------------
    // HOT CORE
    // ------------------------------------------------------

    ctx.shadowBlur =
        2;

    ctx.fillStyle =
        "rgba(255,245,185,0.92)";


    if (
        obstacle.type ===
        "horizontal"
    ) {

        const coreHeight =
            Math.max(
                2,
                height * 0.30
            );

        ctx.beginPath();

        ctx.roundRect(
            left,

            obstacle.y -
                coreHeight / 2 +
                turbulence * 0.5,

            width,

            coreHeight,

            coreHeight / 2
        );

        ctx.fill();

    } else {

        const coreWidth =
            Math.max(
                2,
                width * 0.30
            );

        ctx.beginPath();

        ctx.roundRect(
            obstacle.x -
                coreWidth / 2 +
                turbulence * 0.5,

            top,

            coreWidth,

            height,

            coreWidth / 2
        );

        ctx.fill();
    }


    // ------------------------------------------------------
    // FLAME TONGUES
    // ------------------------------------------------------

    ctx.shadowBlur =
        10;

    ctx.fillStyle =
        "rgba(255,100,15,0.75)";


    if (
        obstacle.type ===
        "horizontal"
    ) {

        const tongueCount =
            Math.max(
                4,
                Math.floor(
                    width / 32
                )
            );

        const tongueWidth =
            width /
            tongueCount;

        for (
            let i = 0;
            i < tongueCount;
            i++
        ) {

            const tongueX =
                left +
                i *
                tongueWidth;

            const wave =
                Math.sin(
                    fireTime * 13 +
                    obstacle.seed +
                    i * 1.7
                );

            const tongueHeight =
                height *
                (
                    0.55 +
                    (
                        wave + 1
                    ) * 0.25
                );

            ctx.beginPath();

            ctx.moveTo(
                tongueX,
                obstacle.y +
                height / 2
            );

            ctx.quadraticCurveTo(
                tongueX +
                tongueWidth * 0.45,

                obstacle.y +
                height / 2 +
                tongueHeight * 0.75,

                tongueX +
                tongueWidth * 0.7,

                obstacle.y +
                height / 2 -
                tongueHeight * 0.15
            );

            ctx.quadraticCurveTo(
                tongueX +
                tongueWidth * 0.85,

                obstacle.y +
                height / 2 +
                tongueHeight * 0.35,

                tongueX +
                tongueWidth,

                obstacle.y +
                height / 2
            );

            ctx.closePath();

            ctx.fill();
        }

    } else {

        const tongueCount =
            Math.max(
                4,
                Math.floor(
                    height / 32
                )
            );

        const tongueHeight =
            height /
            tongueCount;

        for (
            let i = 0;
            i < tongueCount;
            i++
        ) {

            const tongueY =
                top +
                i *
                tongueHeight;

            const wave =
                Math.sin(
                    fireTime * 13 +
                    obstacle.seed +
                    i * 1.7
                );

            const tongueWidth =
                width *
                (
                    0.55 +
                    (
                        wave + 1
                    ) * 0.25
                );

            ctx.beginPath();

            ctx.moveTo(
                obstacle.x +
                width / 2,
                tongueY
            );

            ctx.quadraticCurveTo(
                obstacle.x +
                width / 2 +
                tongueWidth * 0.75,

                tongueY +
                tongueHeight * 0.45,

                obstacle.x +
                width / 2 -
                tongueWidth * 0.15,

                tongueY +
                tongueHeight * 0.7
            );

            ctx.quadraticCurveTo(
                obstacle.x +
                width / 2 +
                tongueWidth * 0.35,

                tongueY +
                tongueHeight * 0.85,

                obstacle.x +
                width / 2,

                tongueY +
                tongueHeight
            );

            ctx.closePath();

            ctx.fill();
        }
    }

    ctx.restore();
}


// ==========================================================
// STAMINA PICKUP CREATION
// ==========================================================

function createStaminaPickup() {

    const worldTop =
        Config.WORLD.CEILING_HEIGHT;

    const worldBottom =
        Config.GAME.HEIGHT -
        Config.WORLD.GROUND_HEIGHT;

    const minY =
        worldTop +
        STAMINA_PICKUP_SAFE_MARGIN;

    const maxY =
        worldBottom -
        STAMINA_PICKUP_SAFE_MARGIN;

    const y =
        randomRange(
            minY,
            maxY
        );

    staminaPickups.push({

        x:
            Config.GAME.WIDTH +
            STAMINA_SPAWN_OFFSET,

        y:
            y,

        radius:
            STAMINA_PICKUP_RADIUS,

        seed:
            Math.random() *
            Math.PI *
            2
    });
}


// ==========================================================
// UPDATE STAMINA PICKUPS
// ==========================================================

function updateStaminaPickups(
    deltaTime
) {

    staminaPickupTimer +=
        deltaTime;

    const spawnInterval =
        STAMINA_SPAWN_DISTANCE /
        worldSpeed;


    if (
        staminaPickupTimer >=
        spawnInterval
    ) {

        staminaPickupTimer =
            0;

        if (
            stamina <
                MAX_STAMINA &&
            staminaPickups.length ===
                0
        ) {

            createStaminaPickup();

            if (
                !staminaTutorialShown
            ) {

                staminaTutorialShown =
                    true;

                showTutorial(
                    TutorialStage.STAMINA
                );
            }
        }
    }


    for (
        let i =
            staminaPickups.length - 1;

        i >= 0;

        i--
    ) {

        const pickup =
            staminaPickups[i];

        pickup.x -=
            worldSpeed *
            deltaTime;


        if (
            checkStaminaPickupCollision(
                pickup
            )
        ) {

            if (
                stamina <
                MAX_STAMINA
            ) {

                stamina +=
                    1;

                createPickupFeedback(
                    pickup.x,
                    pickup.y
                );

                staminaPickups.splice(
                    i,
                    1
                );


                if (
                    !surviveTutorialShown
                ) {

                    surviveTutorialShown =
                        true;

                    showTutorial(
                        TutorialStage.SURVIVE
                    );
                }

                continue;
            }
        }


        if (
            pickup.x +
            pickup.radius <
            -100
        ) {

            staminaPickups.splice(
                i,
                1
            );
        }
    }
}


// ==========================================================
// STAMINA COLLISION
// ==========================================================

function checkStaminaPickupCollision(
    pickup
) {

    const bounds =
        player.getBounds();

    const closestX =
        Math.max(
            bounds.left,

            Math.min(
                pickup.x,
                bounds.right
            )
        );

    const closestY =
        Math.max(
            bounds.top,

            Math.min(
                pickup.y,
                bounds.bottom
            )
        );

    const dx =
        pickup.x -
        closestX;

    const dy =
        pickup.y -
        closestY;

    return (
        dx * dx +
        dy * dy
    ) <=
        pickup.radius *
        pickup.radius;
}


// ==========================================================
// PICKUP FEEDBACK
// ==========================================================

function createPickupFeedback(
    x,
    y
) {

    pickupFeedbacks.push({

        x:
            x,

        y:
            y,

        life:
            0,

        duration:
            0.9
    });
}


function updatePickupFeedback(
    deltaTime
) {

    for (
        let i =
            pickupFeedbacks.length - 1;

        i >= 0;

        i--
    ) {

        const feedback =
            pickupFeedbacks[i];

        feedback.life +=
            deltaTime;

        if (
            feedback.life >=
            feedback.duration
        ) {

            pickupFeedbacks.splice(
                i,
                1
            );
        }
    }
}


// ==========================================================
// DRAW STAMINA PICKUPS
// ==========================================================

function drawStaminaPickups() {

    for (
        const pickup
        of staminaPickups
    ) {

        drawStaminaPickup(
            pickup
        );
    }
}


// ==========================================================
// DRAW STAMINA PICKUP
// ==========================================================

function drawStaminaPickup(
    pickup
) {

    ctx.save();

    const bounce =
        Math.sin(
            fireTime * 3 +
            pickup.seed
        ) * 3;

    const y =
        pickup.y +
        bounce;

    const pulse =
        (
            Math.sin(
                fireTime * 5 +
                pickup.seed
            ) + 1
        ) / 2;


    ctx.shadowColor =
        "rgba(80,190,255,0.95)";

    ctx.shadowBlur =
        14 +
        pulse * 8;

    const glow =
        ctx.createRadialGradient(
            pickup.x,
            y,
            0,
            pickup.x,
            y,
            pickup.radius * 2.2
        );

    glow.addColorStop(
        0,
        "rgba(160,235,255,0.95)"
    );

    glow.addColorStop(
        0.35,
        "rgba(65,180,255,0.80)"
    );

    glow.addColorStop(
        1,
        "rgba(20,100,255,0)"
    );

    ctx.fillStyle =
        glow;

    ctx.beginPath();

    ctx.arc(
        pickup.x,
        y,
        pickup.radius * 2.2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.shadowBlur =
        8;

    const core =
        ctx.createRadialGradient(
            pickup.x - 3,
            y - 3,
            1,
            pickup.x,
            y,
            pickup.radius
        );

    core.addColorStop(
        0,
        "#ffffff"
    );

    core.addColorStop(
        0.35,
        "#b8f4ff"
    );

    core.addColorStop(
        0.7,
        "#4fc8ff"
    );

    core.addColorStop(
        1,
        "#1976ff"
    );

    ctx.fillStyle =
        core;

    ctx.beginPath();

    ctx.arc(
        pickup.x,
        y,
        pickup.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.shadowBlur =
        0;

    ctx.fillStyle =
        "rgba(255,255,255,0.90)";

    ctx.beginPath();

    ctx.arc(
        pickup.x - 3,
        y - 3,
        pickup.radius * 0.25,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}


// ==========================================================
// DRAW PICKUP FEEDBACK
// ==========================================================

function drawPickupFeedback() {

    for (
        const feedback
        of pickupFeedbacks
    ) {

        const progress =
            feedback.life /
            feedback.duration;

        const fade =
            1 -
            progress;

        const rise =
            progress *
            28;

        const bounce =
            Math.sin(
                progress *
                Math.PI
            ) *
            4;

        ctx.save();

        ctx.globalAlpha =
            fade;

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.shadowColor =
            "rgba(80,190,255,0.85)";

        ctx.shadowBlur =
            10;

        ctx.fillStyle =
            "rgba(225,250,255,0.98)";

        ctx.font =
            "700 18px 'Segoe UI', Arial, sans-serif";

        ctx.fillText(
            "+1",
            feedback.x,
            feedback.y -
            rise -
            bounce
        );

        ctx.restore();
    }
}


// ==========================================================
// FIRE COLLISION
// ==========================================================

function checkFireCollision() {

    const bounds =
        player.getBounds();

    for (
        const obstacle
        of obstacles
    ) {

        let obstacleLeft;
        let obstacleRight;
        let obstacleTop;
        let obstacleBottom;


        if (
            obstacle.type ===
            "horizontal"
        ) {

            obstacleLeft =
                obstacle.x;

            obstacleRight =
                obstacle.x +
                obstacle.width;

            obstacleTop =
                obstacle.y -
                obstacle.height / 2;

            obstacleBottom =
                obstacle.y +
                obstacle.height / 2;

        } else {

            obstacleLeft =
                obstacle.x -
                obstacle.width / 2;

            obstacleRight =
                obstacle.x +
                obstacle.width / 2;

            obstacleTop =
                obstacle.y -
                obstacle.height / 2;

            obstacleBottom =
                obstacle.y +
                obstacle.height / 2;
        }


        const collision =
            bounds.right >
                obstacleLeft &&
            bounds.left <
                obstacleRight &&
            bounds.bottom >
                obstacleTop &&
            bounds.top <
                obstacleBottom;


        if (
            collision
        ) {

            return obstacle;
        }
    }

    return null;
}


// ==========================================================
// FIRE DAMAGE
// ==========================================================

function handleFireCollision() {

    const obstacle =
        checkFireCollision();

    if (!obstacle) {
        return false;
    }

    if (
        obstacle.hit
    ) {
        return false;
    }

    obstacle.hit =
        true;


    // ------------------------------------------------------
    // STAMINA ABSORBS FIRE
    // ------------------------------------------------------

    if (
        stamina > 0
    ) {

        stamina -=
            1;

        updateHUD();

        return false;
    }


    // ------------------------------------------------------
    // NO STAMINA
    // ------------------------------------------------------

    return true;
}


// ==========================================================
// COLLISION
// ==========================================================

function getCollisionType() {

    const bounds =
        player.getBounds();


    if (
        bounds.top <=
        Config.WORLD.CEILING_HEIGHT
    ) {

        return DeathType.CEILING;
    }


    if (
        bounds.bottom >=
        Config.GAME.HEIGHT -
        Config.WORLD.GROUND_HEIGHT
    ) {

        return DeathType.FLOOR;
    }


    if (
        handleFireCollision()
    ) {

        return DeathType.FIRE;
    }


    return DeathType.NONE;
}


function checkCollision() {

    return (
        getCollisionType() !==
        DeathType.NONE
    );
}


// ==========================================================
// WORLD UPDATE
// ==========================================================

function updateWorld(
    deltaTime
) {

    distance +=
        worldSpeed *
        deltaTime;

    worldSpeed =
        Math.min(
            Config.WORLD.MAX_SPEED,

            Config.WORLD.START_SPEED +
            score *
            Config.WORLD.SPEED_INCREASE
        );


    if (
        corridor &&
        typeof corridor.update ===
        "function"
    ) {

        corridor.update(
            deltaTime,
            worldSpeed
        );
    }
}


// ==========================================================
// TUTORIAL ANIMATION
// ==========================================================

function getTutorialAnimation(
    elapsed,
    duration
) {

    const fadeInDuration =
        0.65;

    const fadeOutDuration =
        1.0;

    let alpha =
        1;


    if (
        elapsed <
        fadeInDuration
    ) {

        const t =
            elapsed /
            fadeInDuration;

        alpha =
            t *
            t *
            (
                3 -
                2 * t
            );
    }


    const fadeOutStart =
        duration -
        fadeOutDuration;

    if (
        elapsed >
        fadeOutStart
    ) {

        const t =
            Math.max(
                0,
                Math.min(
                    1,

                    (
                        duration -
                        elapsed
                    ) /
                    fadeOutDuration
                )
            );

        alpha *=
            t *
            t *
            (
                3 -
                2 * t
            );
    }


    const bounceStart =
        0.8;

    const bounceEnd =
        duration -
        fadeOutDuration;

    let offsetY =
        0;

    if (
        elapsed >
        bounceStart &&
        elapsed <
        bounceEnd
    ) {

        const bounceElapsed =
            elapsed -
            bounceStart;

        const bounceDuration =
            0.78;

        const bounceIndex =
            Math.floor(
                bounceElapsed /
                bounceDuration
            );

        if (
            bounceIndex <
            3
        ) {

            const local =
                (
                    bounceElapsed % 
                    bounceDuration
                ) / 
                bounceDuration;

            const eased =
                Math.sin(
                    local *
                    Math.PI
                );

            offsetY =
                -5 *
                eased;
        }
    }


    return {

        alpha:
            alpha,

        offsetY:
            offsetY
    };
}


// ==========================================================
// DRAW CURRENT TUTORIAL
// ==========================================================

function drawTutorials() {

    if (
        tutorialStage ===
        TutorialStage.NONE
    ) {
        return;
    }


    let text =
        "";

    let duration =
        0;


    switch (
        tutorialStage
    ) {

        case TutorialStage.TAP:
            text =
                "TAP SCREEN";
            duration =
                TAP_TUTORIAL_DURATION;
            break;

        case TutorialStage.FIRE:
            text =
                "AVOID FIRE";
            duration =
                FIRE_TUTORIAL_DURATION;
            break;

        case TutorialStage.STAMINA:
            text =
                "COLLECT STAMINA";
            duration =
                STAMINA_TUTORIAL_DURATION;
            break;

        case TutorialStage.SURVIVE:
            text =
                "SURVIVE THE LONGEST";
            duration =
                SURVIVE_TUTORIAL_DURATION;
            break;

        default:
            return;
    }


    const animation =
        getTutorialAnimation(
            tutorialTimer,
            duration
        );


    ctx.save();

    ctx.globalAlpha =
        animation.alpha;

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    const x =
        Config.GAME.WIDTH / 2;

    const y =
        Config.GAME.HEIGHT *
        0.48 +
        animation.offsetY;


    ctx.shadowColor =
        "rgba(255,255,255,0.28)";

    ctx.shadowBlur =
        12;

    ctx.fillStyle =
        "rgba(255,255,255,0.94)";

    ctx.font =
        "600 24px 'Segoe UI', Arial, sans-serif";

    ctx.fillText(
        text,
        x,
        y
    );

    ctx.restore();
}


// ==========================================================
// START GAME
// ==========================================================

function startGame() {

    score =
        0;

    distance =
        0;

    worldSpeed =
        Config.WORLD.START_SPEED;

    resetObstacles();

    resetStamina();

    resetDeath();

    player.reset();

    corridor.reset();

    playerVisible =
        true;

    gameState =
        GameState.PLAYING;


    readyScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );


    showTutorial(
        TutorialStage.TAP
    );


    player.flap();

    updateHUD();
}


// ==========================================================
// BEGIN DEATH
// ==========================================================

function beginDeath(
    type
) {

    if (
        gameState !==
        GameState.PLAYING
    ) {

        return;
    }

    deathType =
        type;

    deathTimer =
        0;

    gameState =
        GameState.GAME_OVER;

    // IMPORTANT:
    //
    // Do NOT hide the player here.
    // He remains frozen at the exact impact location while
    // the death animation plays.

    playerVisible =
        true;

    hideTutorial();


    // ------------------------------------------------------
    // RESULTS
    // ------------------------------------------------------

    finalScoreElement.textContent =
        score;

    finalDistanceElement.textContent =
        `${Math.floor(distance)}m`;


    // ------------------------------------------------------
    // BEST SCORE
    // ------------------------------------------------------

    const storedBest =
        Number(
            localStorage.getItem(
                Config.STORAGE.HIGH_SCORE
            ) || 0
        );

    if (
        score >
        storedBest
    ) {

        localStorage.setItem(
            Config.STORAGE.HIGH_SCORE,
            score
        );
    }

    const newBest =
        Math.max(
            score,
            storedBest
        );

    bestScoreElement.textContent =
        newBest;


    // ------------------------------------------------------
    // BEST DISTANCE
    // ------------------------------------------------------

    const storedBestDistance =
        Number(
            localStorage.getItem(
                Config.STORAGE.BEST_DISTANCE
            ) || 0
        );

    if (
        distance >
        storedBestDistance
    ) {

        localStorage.setItem(
            Config.STORAGE.BEST_DISTANCE,
            Math.floor(distance)
        );
    }


    // ------------------------------------------------------
    // TOTAL RUNS
    // ------------------------------------------------------

    const totalRuns =
        Number(
            localStorage.getItem(
                Config.STORAGE.TOTAL_RUNS
            ) || 0
        ) + 1;

    localStorage.setItem(
        Config.STORAGE.TOTAL_RUNS,
        totalRuns
    );


    readyScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.remove(
        "hidden"
    );


    // ------------------------------------------------------
    // SUBMIT TO GLOBAL SCOREBOARD (non-blocking)
    // ------------------------------------------------------
    try {
        // window.Scoreboard is provided by js/scoreboard.js (if included in index.html)
        if (window.Scoreboard && window.Scoreboard.initialized) {
            window.Scoreboard.submitScore(username || "Player", score)
                .then(() => window.Scoreboard.getTopScores(10))
                .then(entries => {
                    renderLeaderboard(entries);
                })
                .catch(err => {
                    console.warn("Scoreboard submit/get error:", err);
                });
        } else if (window.Scoreboard && window.SCOREBOARD_CONFIG) {
            // Try to initialize if config exists but scoreboard wasn't initialized yet
            try {
                window.Scoreboard.init(window.SCOREBOARD_CONFIG);
                window.Scoreboard.submitScore(username || "Player", score)
                    .then(() => window.Scoreboard.getTopScores(10))
                    .then(entries => renderLeaderboard(entries))
                    .catch(err => console.warn("Scoreboard submit/get error:", err));
            } catch (err) {
                console.warn("Scoreboard init/submit failed:", err);
                if (leaderboardElement) leaderboardElement.innerHTML = '<div style="opacity:0.6;">No global scoreboard configured.</div>';
            }
        } else {
            if (leaderboardElement) leaderboardElement.innerHTML = '<div style="opacity:0.6;">No global scoreboard configured.</div>';
        }
    } catch (err) {
        console.warn("Score submission failed", err);
    }
}


// ==========================================================
// GAME OVER
// ==========================================================

function gameOver() {

    beginDeath(
        DeathType.FIRE
    );
}


// ==========================================================
// UPDATE DEATH
// ==========================================================
//
// NOTHING in the world moves here.
//
// Only the death timer advances.
//
// fireTime is handled globally by gameLoop(), which means
// drawFire() continues animating even though obstacle.x and
// corridor.scrollX are completely frozen.
// 

function updateDeath(
    deltaTime
) {

    deathTimer +=
        deltaTime;

    if (
        deathTimer >=
        DEATH_DURATION
    ) {

        deathTimer =
            DEATH_DURATION;

        playerVisible =
            false;
    }
}


// ==========================================================
// DRAW PLAYER
// ==========================================================
//
// Fire death:
//
// 0%     = normal sprite
// ~15%   = begins darkening
// ~70%   = almost charcoal
// 100%   = gone
//
// Ceiling / floor:
//
// normal sprite -> fade directly out
//
// The charcoal effect is intentionally subtle. There are no
// flames or artificial effects drawn over Quackers.
// 

function drawPlayer() {

    if (
        !playerVisible
    ) {

        return;
    }


    if (
        gameState !==
        GameState.GAME_OVER
    ) {

        player.draw(ctx);

        return;
    }


    const progress =
        Math.max(
            0,
            Math.min(
                1,
                deathTimer /
                DEATH_DURATION
            )
        );


    let alpha =
        1;

    let charcoal =
        0;


    if (
        deathType ===
        DeathType.FIRE
    ) {

        // Stay fully visible long enough to read as an impact.
        alpha =
            1 -
            Math.pow(
                progress,
                2.1
            ) *
            0.78;


        if (
            progress >
            FIRE_CHARCOAL_START
        ) {

            const t =
                Math.max(
                    0,
                    Math.min(
                        1,

                        (
                            progress -
                            FIRE_CHARCOAL_START
                        ) /
                        (
                            FIRE_CHARCOAL_END -
                            FIRE_CHARCOAL_START
                        )
                    )
                );

            // Smooth charcoal transition.
            charcoal =
                t *
                t *
                (
                    3 - 
                    2 * t
                );
        }

    } else {

        // Arcade-style clean fade for ceiling/floor.
        alpha =
            1 -
            Math.pow(
                progress,
                1.35
            );
    }


    ctx.save();

    ctx.globalAlpha =
        Math.max(
            0,
            alpha
        );


    // ------------------------------------------------------
    // NORMAL PLAYER
    // ------------------------------------------------------

    player.draw(ctx);


    // ------------------------------------------------------
    // CHARCOAL TINT
    //
    // We use the player's collision bounds as a clipping
    // region and draw the tint only over the player's sprite
    // area. The tint is deliberately transparent so it reads
    // like the sprite has been burned dark rather than having
    // a black rectangle placed over it.
    // ------------------------------------------------------

    if (
        charcoal > 0
    ) {

        const bounds =
            player.getBounds();

        ctx.save();

        ctx.beginPath();

        ctx.rect(
            bounds.left,
            bounds.top,
            bounds.right -
                bounds.left,
            bounds.bottom -
                bounds.top
        );

        ctx.clip();

        ctx.globalAlpha =
            charcoal *
            0.88;

        ctx.globalCompositeOperation =
            "multiply";

        ctx.fillStyle =
            "rgba(22,22,22,1)";

        ctx.fillRect(
            bounds.left -
                10,
            bounds.top -
                10,
            (
                bounds.right -
                bounds.left
            ) + 20,
            (
                bounds.bottom -
                bounds.top
            ) + 20
        );

        ctx.restore();
    }


    ctx.restore();
}


// ==========================================================
// HUD
// ==========================================================

function updateHUD() {

    if (scoreElement) {

        scoreElement.textContent =
            score;
    }

    if (distanceElement) {

        distanceElement.textContent =
            `${Math.floor(distance)}m`;
    }

    if (staminaElement) {

        staminaElement.textContent =
            stamina;
    }
}


// ==========================================================
// INPUT
// ==========================================================

function flap() {

    if (
        gameState ===
        GameState.READY
    ) {

        startGame();

        return;
    }

    if (
        gameState ===
        GameState.PLAYING
    ) {

        player.flap();
    }
}


// ==========================================================
// KEYBOARD
// ==========================================================

window.addEventListener(
    "keydown",
    event => {

        if (
            event.code ===
            "Space" ||
            event.code ===
            "ArrowUp"
        ) {

            event.preventDefault();

            flap();
        }
    }
);


// ==========================================================
// POINTER / TOUCH
// ==========================================================

canvas.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        flap();
    },
    {
        passive: false
    }
);


// ==========================================================
// REDEPLOY
// ==========================================================

if (
    redeployButton
) {

    redeployButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            startGame();
        }
    );
}


// ==========================================================
// UPDATE
// ==========================================================

function update(
    deltaTime
) {

    // ------------------------------------------------------
    // GAME OVER
    //
    // The world is intentionally NOT updated.
    // Corridor and obstacle positions therefore freeze.
    //
    // Death animation itself still advances.
    // ------------------------------------------------------

    if (
        gameState ===
        GameState.GAME_OVER
    ) {

        updateDeath(
            deltaTime
        );

        return;
    }


    if (
        gameState !==
        GameState.PLAYING
    ) {

        return;
    }


    // ------------------------------------------------------
    // PLAYER
    // ------------------------------------------------------

    player.update(
        deltaTime
    );


    // ------------------------------------------------------
    // WORLD
    // ------------------------------------------------------

    updateWorld(
        deltaTime
    );


    // ------------------------------------------------------
    // FIRE
    // ------------------------------------------------------

    updateObstacles(
        deltaTime
    );


    // ------------------------------------------------------
    // STAMINA
    // ------------------------------------------------------

    updateStaminaPickups(
        deltaTime
    );


    // ------------------------------------------------------
    // PICKUP FEEDBACK
    // ------------------------------------------------------

    updatePickupFeedback(
        deltaTime
    );


    // ------------------------------------------------------
    // TUTORIAL
    // ------------------------------------------------------

    updateTutorial(
        deltaTime
    );


    // ------------------------------------------------------
    // COLLISION
    // ------------------------------------------------------

    const collisionType =
        getCollisionType();

    if (
        collisionType !==
        DeathType.NONE
    ) {

        beginDeath(
            collisionType
        );

        return;
    }


    updateHUD();
}


// ==========================================================
// RENDER
// ==========================================================

function render() {

    ctx.clearRect(
        0,
        0,
        Config.GAME.WIDTH,
        Config.GAME.HEIGHT
    );


    // ------------------------------------------------------
    // CORRIDOR
    // ------------------------------------------------------

    corridor.draw();


    // ------------------------------------------------------
    // FIRE
    //
    // These obstacles remain at their frozen positions
    // during game over, but their flame animation continues
    // because fireTime continues advancing.
    // ------------------------------------------------------

    drawObstacles();


    // ------------------------------------------------------
    // STAMINA
    // ------------------------------------------------------

    drawStaminaPickups();


    // ------------------------------------------------------
    // PLAYER
    // ------------------------------------------------------

    drawPlayer();


    // ------------------------------------------------------
    // PICKUP FEEDBACK
    // ------------------------------------------------------

    drawPickupFeedback();


    // ------------------------------------------------------
    // TUTORIAL
    // ------------------------------------------------------

    drawTutorials();
}


// ==========================================================
// GAME LOOP
// ==========================================================

function gameLoop(
    timestamp
) {

    if (!lastTime) {

        lastTime =
            timestamp;
    }

    let deltaTime =
        (
            timestamp -
            lastTime
        ) / 1000;

    lastTime =
        timestamp;


    // ------------------------------------------------------
    // DELTA TIME SAFETY
    // ------------------------------------------------------

    deltaTime =
        Math.min(
            deltaTime,
            0.033
        );


    // ------------------------------------------------------
    // FIRE ANIMATION CLOCK
    //
    // THIS ALWAYS RUNS.
    //
    // This is the important part that keeps the flames alive
    // on the frozen game-over scene.
    // ------------------------------------------------------

    fireTime +=
        deltaTime;


    // ------------------------------------------------------
    // UPDATE
    // ------------------------------------------------------

    update(
        deltaTime
    );


    // ------------------------------------------------------
    // RENDER
    // ------------------------------------------------------

    render();


    requestAnimationFrame(
        gameLoop
    );
}


// ==========================================================
// USERNAME & LEADERBOARD SUPPORT
// ==========================================================

// local username stored on-device only
let username =
    localStorage.getItem("sq_username") || "";

// Helper: set username (persist locally)
function setUsername(name) {
    name = String(name || "").trim().substring(0, 24);
    if (!name) name = "Player";
    username = name;
    localStorage.setItem("sq_username", username);
    if (usernameDisplay) usernameDisplay.textContent = `PLAYER ID: ${username}`;
    if (usernameInput) usernameInput.value = username;
}

// Render leaderboard entries (simple list)
function renderLeaderboard(entries) {
    if (!leaderboardElement) return;
    if (!entries || entries.length === 0) {
        leaderboardElement.innerHTML = '<div style="opacity:0.6;">No scores yet.</div>';
        return;
    }
    leaderboardElement.innerHTML = ""; // clear
    const list = document.createElement("ol");
    list.style = "padding-left:18px; margin:0;";
    for (const e of entries) {
        const li = document.createElement("li");
        li.style = "margin-bottom:6px; font-size:14px; display:flex; justify-content:space-between;";
        const leftSpan = document.createElement("span");
        leftSpan.style = "font-weight:700; margin-right:8px;";
        leftSpan.textContent = e.username || "Player";
        const rightSpan = document.createElement("span");
        rightSpan.style = "opacity:0.95;";
        rightSpan.textContent = e.score ?? 0;
        li.appendChild(leftSpan);
        li.appendChild(rightSpan);
        list.appendChild(li);
    }
    leaderboardElement.appendChild(list);
}

// Wire up username UI if present
if (username) {
    setUsername(username);
} else {
    if (usernameDisplay) usernameDisplay.textContent = "";
}

if (usernameSaveButton && usernameInput) {
    usernameSaveButton.addEventListener("click", () => {
        const val = (usernameInput.value || "").trim();
        setUsername(val);
    });
    usernameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            setUsername(usernameInput.value);
        }
    });
}

// Initialize Scoreboard if config provided and Scoreboard script present
if (window.Scoreboard && !window.Scoreboard.initialized && window.SCOREBOARD_CONFIG) {
    try {
        window.Scoreboard.init(window.SCOREBOARD_CONFIG);
    } catch (err) {
        console.warn("Scoreboard init failed:", err);
    }
}

// Try to fetch an initial leaderboard (non-blocking)
(async () => {
    try {
        if (window.Scoreboard) {
            if (!window.Scoreboard.initialized && window.SCOREBOARD_CONFIG) {
                try { window.Scoreboard.init(window.SCOREBOARD_CONFIG); } catch (e) { /* ignore */ }
            }
            if (window.Scoreboard.initialized) {
                const entries = await window.Scoreboard.getTopScores(10);
                renderLeaderboard(entries);
            }
        }
    } catch (err) {
        console.warn("Could not load initial leaderboard", err);
    }
})();


// ==========================================================
// INITIAL STATE
// ==========================================================

gameState =
    GameState.READY;

playerVisible =
    false;

resetDeath();

tutorialStage =
    TutorialStage.NONE;

tutorialTimer =
    0;

fireTutorialShown =
    false;

staminaTutorialShown =
    false;

surviveTutorialShown =
    false;

score =
    0;

distance =
    0;

worldSpeed =
    Config.WORLD.START_SPEED;

stamina =
    0;

obstacles.length =
    0;

staminaPickups.length =
    0;

pickupFeedbacks.length =
    0;

corridor.reset();


readyScreen.classList.remove(
    "hidden"
);

gameOverScreen.classList.add(
    "hidden"
);

updateHUD();


if (
    bestScoreElement
) {

    bestScoreElement.textContent =
        localStorage.getItem(
            Config.STORAGE.HIGH_SCORE
        ) || 0;
}


// ==========================================================
// START GAME LOOP
// ==========================================================

requestAnimationFrame(
    gameLoop
);