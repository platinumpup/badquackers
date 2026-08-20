"use strict";

/* ==========================================================
   Sgt. Quackers: Burn Another Day
   js/config.js
   ========================================================== */

const Config = {

    /* ======================================================
       GAME
       ====================================================== */

    GAME: {

        /*
         * EXACTLY matches corridor.png
         *
         * 1376 × 768
         */

        WIDTH: 1376,

        HEIGHT: 768,

        TARGET_FPS: 60
    },


    /* ======================================================
       PLAYER
       ====================================================== */

    PLAYER: {

        START_X:
            1376 * 0.22,

        START_Y:
            768 * 0.50,

        WIDTH: 125,

        HEIGHT: 125,

        GRAVITY: 1200,

        FLAP_FORCE: -420,

        MAX_FALL_SPEED: 850,

        MAX_RISE_SPEED: -650,

        ROTATION_UP: -0.55,

        ROTATION_DOWN: 0.80,

        JET_OFFSET_X: -48,

        JET_OFFSET_Y: 16
    },


    /* ======================================================
       WORLD
       ====================================================== */

    WORLD: {

        START_SPEED: 220,

        MAX_SPEED: 430,

        SPEED_INCREASE: 5,

        /*
         * Higher ceiling = more room above the player.
         *
         * Collision boundary is intentionally above the
         * previous 115px value.
         */

        CEILING_HEIGHT: 20,

        GROUND_HEIGHT: 70
    },


    /* ======================================================
       OBSTACLES
       ====================================================== */

    OBSTACLES: {

        START_DISTANCE: 430,

        MIN_DISTANCE: 270,

        DISTANCE_DECREASE: 4
    },


    /* ======================================================
       SCORE
       ====================================================== */

    SCORE: {

        POINTS_PER_OBSTACLE: 1
    },


    /* ======================================================
       STORAGE
       ====================================================== */

    STORAGE: {

        HIGH_SCORE:
            "sgtQuackersHighScore",

        BEST_DISTANCE:
            "sgtQuackersBestDistance",

        TOTAL_RUNS:
            "sgtQuackersTotalRuns"
    }

};