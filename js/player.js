"use strict";

class Player {

    constructor() {

        // ==================================================
        // POSITION / PHYSICS
        // ==================================================

        this.x = Config.PLAYER.START_X;
        this.y = Config.PLAYER.START_Y;

        this.width =
            Config.PLAYER.WIDTH;

        this.height =
            Config.PLAYER.HEIGHT;

        this.velocityY = 0;
        this.rotation = 0;

        this.animationTime = 0;
        this.exhaustTime = 0;

        this.isFlapping = false;
        this.isDamaged = false;


        // ==================================================
        // PLAYER SPRITES
        // ==================================================

        this.images = {

            start:
                new Image(),

            hover:
                new Image(),

            flapUp:
                new Image(),

            flapDown:
                new Image()
        };

        this.images.start.src =
            "assets/player/quackers_master.png";

        this.images.hover.src =
            "assets/player/hover_01.png";

        this.images.flapUp.src =
            "assets/player/flap_up.png";

        this.images.flapDown.src =
            "assets/player/flap_down.png";

        this.currentImage =
            this.images.start;


        // ==================================================
        // JETPACK
        // ==================================================

        this.exhaustParticles = [];

        this.boostTimer = 0;
    }

    // helper for jet offsets relative to the player's drawn size
    getJetOffsets() {
        // place the jet roughly at rear-lower area of the sprite
        const jetX = -Math.max(16, this.width * 0.42);
        const jetY = Math.max(-6, this.height * 0.12);
        return { x: jetX, y: jetY };
    }

    // ======================================================
    // RESET
    // ======================================================

    reset() {

        this.x =
            Config.PLAYER.START_X;

        this.y =
            Config.PLAYER.START_Y;

        this.velocityY = 0;
        this.rotation = 0;

        this.animationTime = 0;
        this.exhaustTime = 0;

        this.boostTimer = 0;

        this.isFlapping = false;
        this.isDamaged = false;

        this.currentImage =
            this.images.start;

        this.exhaustParticles.length = 0;
    }

    // ======================================================
    // FLAP
    // ======================================================

    flap() {

        this.velocityY =
            Config.PLAYER.FLAP_FORCE;

        this.isFlapping = true;

        this.exhaustTime = 0;
        this.boostTimer = 0.22;

        this.currentImage =
            this.images.flapUp;

        this.createBoostParticles();
    }

    // ======================================================
    // UPDATE
    // ======================================================

    update(deltaTime) {

        this.animationTime +=
            deltaTime;

        this.exhaustTime +=
            deltaTime;

        this.boostTimer =
            Math.max(
                0,
                this.boostTimer -
                deltaTime
            );

        // GRAVITY
        this.velocityY +=
            Config.PLAYER.GRAVITY *
            deltaTime;

        // VELOCITY LIMITS
        this.velocityY =
            Math.min(
                this.velocityY,
                Config.PLAYER.MAX_FALL_SPEED
            );

        this.velocityY =
            Math.max(
                this.velocityY,
                Config.PLAYER.MAX_RISE_SPEED
            );

        // MOVEMENT
        this.y +=
            this.velocityY *
            deltaTime;

        // ROTATION
        this.rotation =
            Math.max(
                Config.PLAYER.ROTATION_UP,
                Math.min(
                    Config.PLAYER.ROTATION_DOWN,
                    this.velocityY / 700
                )
            );

        // SPRITE STATE
        if (
            this.velocityY < 0
        ) {
            this.currentImage =
                this.images.flapUp;
            this.isFlapping = true;
        } else {
            this.currentImage =
                this.images.flapDown;
            this.isFlapping = false;
        }

        // EXHAUST
        this.updateExhaust(
            deltaTime
        );
    }

    // ======================================================
    // DRAW
    // ======================================================

    draw(ctx) {

        ctx.save();

        ctx.translate(
            this.x,
            this.y
        );

        ctx.rotate(
            this.rotation
        );

        this.drawExhaust(ctx);

        this.drawSprite(ctx);

        ctx.restore();
    }

    // ======================================================
    // DRAW SPRITE
    // ======================================================

    drawSprite(ctx) {

        const img =
            this.currentImage;

        if (
            !img ||
            !img.complete ||
            img.naturalWidth === 0
        ) {
            return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // MASTER / START IMAGE
        if (
            img ===
            this.images.start
        ) {
            const sourceWidth =
                img.naturalWidth;
            const sourceHeight =
                img.naturalHeight;
            const maxWidth = 225;
            const maxHeight = 125;
            const scale =
                Math.min(
                    maxWidth /
                        sourceWidth,
                    maxHeight /
                        sourceHeight
                );
            const drawWidth =
                sourceWidth *
                scale;
            const drawHeight =
                sourceHeight *
                scale;
            ctx.drawImage(
                img,
                -drawWidth / 2,
                -drawHeight / 2,
                drawWidth,
                drawHeight
            );
            return;
        }

        // ANIMATION SPRITES
        const size = 125;
        ctx.drawImage(
            img,
            -size / 2,
            -size / 2,
            size,
            size
        );
    }

    // ======================================================
    // CREATE BOOST PARTICLES
    // ======================================================

    createBoostParticles() {

        const jet = this.getJetOffsets();

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const life =
                0.20 +
                Math.random() * 0.14;

            this.exhaustParticles.push({

                x: jet.x,

                y:
                    jet.y +
                    (
                        Math.random() -
                        0.5
                    ) * 6,

                vx:
                    -90 -
                    Math.random() * 140,

                vy:
                    (
                        Math.random() -
                        0.5
                    ) * 55,

                life: life,

                maxLife: life,

                size: 2.5 +
                    Math.random() * 3.5
            });
        }
    }

    // ======================================================
    // UPDATE EXHAUST PARTICLES
    // ======================================================

    updateExhaust(deltaTime) {

        const isBoosting =
            this.boostTimer > 0;

        const targetCount =
            isBoosting ? 14 : 6;

        const jet = this.getJetOffsets();

        if (
            this.exhaustParticles.length <
            targetCount
        ) {

            const life =
                isBoosting
                    ? 0.18 +
                      Math.random() * 0.12
                    : 0.14 +
                      Math.random() * 0.10;

            this.exhaustParticles.push({

                x: jet.x,

                y: jet.y +
                    (
                        Math.random() -
                        0.5
                    ) * 6,

                vx: isBoosting
                    ? -80 - Math.random() * 150
                    : -30 - Math.random() * 50,

                vy: isBoosting
                    ? (Math.random() - 0.5) * 65
                    : (Math.random() - 0.5) * 25,

                life: life,

                maxLife: life,

                size: isBoosting
                    ? 2.5 + Math.random() * 3.5
                    : 2 + Math.random() * 2.5
            });
        }

        // MOVE PARTICLES
        for (
            let i = this.exhaustParticles.length - 1;
            i >= 0;
            i--
        ) {

            const particle = this.exhaustParticles[i];

            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;

            particle.life -= deltaTime;

            if (particle.life <= 0) {
                this.exhaustParticles.splice(i, 1);
            }
        }
    }

    // ======================================================
    // DRAW EXHAUST
    // ======================================================

    drawExhaust(ctx) {

        const jet = this.getJetOffsets();
        const jetX = jet.x;
        const jetY = jet.y;

        const boosting = this.boostTimer > 0;

        const flicker = Math.sin(this.exhaustTime * 38);

        const flameLength = boosting ? 52 + flicker * 5 : 20 + flicker * 2;
        const flameRadius = boosting ? 7 : 4.5;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // SOFT GLOW
        const glowRadius = boosting ? 27 : 15;
        const glow = ctx.createRadialGradient(jetX - flameLength * 0.38, jetY, 1, jetX - flameLength * 0.38, jetY, glowRadius);
        glow.addColorStop(0, boosting ? "rgba(180, 210, 255, 0.8)" : "rgba(140, 194, 255, 0.65)");
        glow.addColorStop(0.35, "rgba(45, 143, 255, 0.45)");
        glow.addColorStop(0.7, "rgba(51, 15, 255, 0.18)");
        glow.addColorStop(1, "rgba(255,30,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(jetX - flameLength * 0.38, jetY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // MAIN ROUNDED FLAME
        const flameGradient = ctx.createLinearGradient(jetX, jetY, jetX - flameLength, jetY);
        flameGradient.addColorStop(0, "rgba(255,255,245,1)");
        flameGradient.addColorStop(0.18, "rgba(125, 240, 255, 0.98)");
        flameGradient.addColorStop(0.48, "rgba(35, 112, 255, 0.88)");
        flameGradient.addColorStop(0.78, "rgba(36, 12, 255, 0.48)");
        flameGradient.addColorStop(1, "rgba(255,30,0,0)");
        ctx.fillStyle = flameGradient;
        ctx.beginPath();
        ctx.moveTo(jetX, jetY - flameRadius);
        ctx.quadraticCurveTo(jetX - flameLength * 0.22, jetY - flameRadius * 1.15, jetX - flameLength * 0.55, jetY - flameRadius * 0.65);
        ctx.quadraticCurveTo(jetX - flameLength * 0.82, jetY - flameRadius * 0.30, jetX - flameLength, jetY);
        ctx.quadraticCurveTo(jetX - flameLength * 0.82, jetY + flameRadius * 0.30, jetX - flameLength * 0.55, jetY + flameRadius * 0.65);
        ctx.quadraticCurveTo(jetX - flameLength * 0.22, jetY + flameRadius * 1.15, jetX, jetY + flameRadius);
        ctx.quadraticCurveTo(jetX + 2, jetY, jetX, jetY - flameRadius);
        ctx.closePath();
        ctx.fill();

        // BOOST CORE
        if (boosting) {
            const coreLength = flameLength * 0.62;
            const coreRadius = flameRadius * 0.48;
            const coreGradient = ctx.createLinearGradient(jetX, jetY, jetX - coreLength, jetY);
            coreGradient.addColorStop(0, "rgba(255,255,255,1)");
            coreGradient.addColorStop(0.30, "rgba(200, 242, 255, 0.98)");
            coreGradient.addColorStop(0.70, "rgba(90, 217, 255, 0.72)");
            coreGradient.addColorStop(1, "rgba(25, 29, 255, 0)");
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.moveTo(jetX, jetY - coreRadius);
            ctx.quadraticCurveTo(jetX - coreLength * 0.45, jetY - coreRadius, jetX - coreLength, jetY);
            ctx.quadraticCurveTo(jetX - coreLength * 0.45, jetY + coreRadius, jetX, jetY + coreRadius);
            ctx.closePath();
            ctx.fill();
        }

        // HOT NOZZLE CORE
        const coreWidth = boosting ? 8 : 5;
        const coreHeight = boosting ? 3.5 : 2.5;
        ctx.fillStyle = "rgba(255,255,240,0.95)";
        ctx.beginPath();
        ctx.ellipse(jetX - 3, jetY, coreWidth, coreHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // PARTICLES
        for (const particle of this.exhaustParticles) {
            const alpha = Math.max(0, particle.life / particle.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.life > particle.maxLife * 0.5 ? "#ffd95a" : "#ff6525";
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    // ======================================================
    // COLLISION BOUNDS
    // ======================================================

    getBounds() {
        return {
            left: this.x - this.width * 0.30,
            right: this.x + this.width * 0.30,
            top: this.y - this.height * 0.30,
            bottom: this.y + this.height * 0.30
        };
    }
}
