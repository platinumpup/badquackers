"use strict";

// ==========================================================
// SGT. QUACKERS - AUDIO
// ==========================================================
//
// Only requires:
// assets/audio/background.mp3
//
// Music begins after the player's first interaction because
// browsers require user interaction before allowing audio.
// ==========================================================

const AudioSystem = {

    music: null,

    initialized: false,

    init() {

        if (this.initialized) {
            return;
        }

        this.music = new Audio(
            "assets/audio/background.mp3"
        );

        this.music.loop = true;

        this.music.preload = "auto";

        this.music.volume = 0.45;

        this.initialized = true;
    },


    startMusic() {

        if (!this.initialized) {
            this.init();
        }

        if (!this.music) {
            return;
        }

        const playPromise =
            this.music.play();

        if (
            playPromise &&
            typeof playPromise.catch === "function"
        ) {

            playPromise.catch(() => {
                // Browser blocked autoplay.
                // It will be attempted again on
                // the next user interaction.
            });
        }
    },


    stopMusic() {

        if (!this.music) {
            return;
        }

        this.music.pause();

        this.music.currentTime = 0;
    },


    setVolume(volume) {

        if (!this.music) {
            return;
        }

        this.music.volume =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(volume) || 0
                )
            );
    }
};


// Initialize immediately so the audio element is ready.
AudioSystem.init();


// ==========================================================
// START MUSIC ON FIRST USER INTERACTION
// ==========================================================

function startBackgroundMusic() {

    AudioSystem.startMusic();

    window.removeEventListener(
        "pointerdown",
        startBackgroundMusic
    );

    window.removeEventListener(
        "keydown",
        startBackgroundMusic
    );

    window.removeEventListener(
        "touchstart",
        startBackgroundMusic
    );
}


window.addEventListener(
    "pointerdown",
    startBackgroundMusic,
    {
        passive: true
    }
);


window.addEventListener(
    "keydown",
    startBackgroundMusic
);


window.addEventListener(
    "touchstart",
    startBackgroundMusic,
    {
        passive: true
    }
);