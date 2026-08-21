"use strict";

// ==========================================================
// Sgt. Quackers: Burn Another Day
// js/corridor.js
//
// Seamless scrolling corridor environment.
//
// The corridor artwork is rendered proportionally.
// It is NEVER independently stretched to the canvas.
// ==========================================================

class Corridor {

    constructor(ctx) {

        this.ctx =
            ctx;

        this.image =
            new Image();

        this.loaded =
            false;

        this.imageWidth =
            0;

        this.imageHeight =
            0;

        this.image.src =
            "assets/environment/corridor.png";

        this.image.onload =
            () => {

                this.loaded =
                    true;

                this.imageWidth =
                    this.image.naturalWidth;

                this.imageHeight =
                    this.image.naturalHeight;

                this.calculateRenderSize();
            };


        this.scrollX =
            0;

        this.renderWidth =
            0;

        this.renderHeight =
            0;

        this.cropY =
            0;
    }


    // ======================================================
    // RESET
    // ======================================================

    reset() {

        this.scrollX =
            0;
    }


    // ======================================================
    // CALCULATE RENDER SIZE
    // ======================================================

    calculateRenderSize() {

        if (
            !this.loaded ||
            this.imageWidth <= 0 ||
            this.imageHeight <= 0
        ) {

            return;
        }

        // Use the actual canvas drawing surface size so render math
        // matches what is drawn, including devicePixelRatio adjustments.
        const gameWidth =
            (this.ctx && this.ctx.canvas && this.ctx.canvas.width) || Config.GAME.WIDTH;

        const gameHeight =
            (this.ctx && this.ctx.canvas && this.ctx.canvas.height) || Config.GAME.HEIGHT;

        const scale =
            Math.max(
                gameWidth /
                    this.imageWidth,

                gameHeight /
                    this.imageHeight
            );

        this.renderWidth =
            this.imageWidth *
            scale;

        this.renderHeight =
            this.imageHeight *
            scale;

        this.cropY =
            (
                this.renderHeight -
                gameHeight
            ) / 2;
    }


    // ======================================================
    // UPDATE
    // ======================================================

    update(
        deltaTime,
        speed
    ) {

        if (!this.loaded) {
            return;
        }

        this.scrollX -=
            speed *
            deltaTime;

        if (
            this.scrollX <=
            -this.renderWidth
        ) {

            this.scrollX +=
                this.renderWidth;
        }
    }


    // ======================================================
    // DRAW
    // ======================================================

    draw() {

        const ctx =
            this.ctx;

        if (!this.loaded) {

            this.drawLoading(
                ctx
            );

            return;
        }

        if (
            this.renderWidth <= 0 ||
            this.renderHeight <= 0
        ) {

            this.calculateRenderSize();
        }

        // Use actual canvas size for drawing/fill so things line up
        const gameWidth =
            (ctx && ctx.canvas && ctx.canvas.width) || Config.GAME.WIDTH;

        const gameHeight =
            (ctx && ctx.canvas && ctx.canvas.height) || Config.GAME.HEIGHT;

        ctx.fillStyle =
            "#05070a";

        ctx.fillRect(
            0,
            0,
            gameWidth,
            gameHeight
        );


        // --------------------------------------------------
        // FIRST COPY
        // --------------------------------------------------

        ctx.drawImage(

            this.image,

            this.scrollX,
            -this.cropY,

            this.renderWidth,
            this.renderHeight
        );


        // --------------------------------------------------
        // SECOND COPY
        // --------------------------------------------------

        ctx.drawImage(

            this.image,

            this.scrollX +
                this.renderWidth,

            -this.cropY,

            this.renderWidth,
            this.renderHeight
        );


        // --------------------------------------------------
        // THIRD COPY IF NECESSARY
        // --------------------------------------------------

        if (
            this.scrollX +
            this.renderWidth * 2 <
            gameWidth
        ) {

            ctx.drawImage(

                this.image,

                this.scrollX +
                    this.renderWidth * 2,

                -this.cropY,

                this.renderWidth,
                this.renderHeight
            );
        }
    }


    // ======================================================
    // LOADING
    // ======================================================

    drawLoading(ctx) {

        const gameWidth =
            (ctx && ctx.canvas && ctx.canvas.width) || Config.GAME.WIDTH;

        const gameHeight =
            (ctx && ctx.canvas && ctx.canvas.height) || Config.GAME.HEIGHT;

        ctx.fillStyle =
            "#080c12";

        ctx.fillRect(
            0,
            0,
            gameWidth,
            gameHeight
        );

        ctx.fillStyle =
            "#6cecff";

        ctx.font =
            "bold 18px Segoe UI";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(

            "INITIALIZING FLIGHT CORRIDOR",

            gameWidth / 2,

            gameHeight / 2
        );
    }


    // ======================================================
    // COLLISION BOUNDARIES
    // ======================================================

    getBounds() {

        const gameHeight =
            (this.ctx && this.ctx.canvas && this.ctx.canvas.height) || Config.GAME.HEIGHT;

        return {

            ceiling:
                Config.WORLD.CEILING_HEIGHT,

            floor:
                gameHeight -
                Config.WORLD.GROUND_HEIGHT
        };
    }
}