// Lightweight Scoreboard wrapper using Firebase Firestore (client).
// Steps: create a Firebase project, enable Firestore, copy your firebaseConfig object into js/scoreboard-config.js:
//   window.SCOREBOARD_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", ... };
//
// This module dynamically imports the Firebase v9 modular SDK (CDN) and exposes:
//   window.Scoreboard.init(config)     // initialize with firebase config
//   window.Scoreboard.submitScore(user, score)  // submit a score
//   window.Scoreboard.getTopScores(limit)       // fetch top N scores

(async () => {
    // Use a versioned CDN path; update if you want a different Firebase version.
    const firebaseBase = "https://www.gstatic.com/firebasejs/9.22.0";
    // Dynamically import minimal modules we need
    const appModule = await import(firebaseBase + "/firebase-app.js");
    const firestoreModule = await import(firebaseBase + "/firebase-firestore.js");

    const { initializeApp } = appModule;
    const { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } = firestoreModule;

    const Scoreboard = {
        db: null,
        initialized: false,

        init: function (config) {
            if (!config || !config.projectId) {
                console.warn("Scoreboard.init: missing firebase config. Please provide window.SCOREBOARD_CONFIG or pass config to init().");
                return;
            }
            try {
                const app = initializeApp(config);
                this.db = getFirestore(app);
                this.initialized = true;
            } catch (err) {
                console.error("Scoreboard.init error:", err);
            }
        },

        submitScore: async function (username, score) {
            if (!this.initialized) {
                console.warn("Scoreboard not initialized.");
                return;
            }
            try {
                const usernameClean = String(username || "Player").substring(0, 24);
                const numericScore = Number(score) || 0;
                await addDoc(collection(this.db, "scores"), {
                    username: usernameClean,
                    score: numericScore,
                    createdAt: serverTimestamp()
                });
            } catch (err) {
                console.error("submitScore error:", err);
            }
        },

        getTopScores: async function (limitCount = 10) {
            if (!this.initialized) {
                console.warn("Scoreboard not initialized.");
                return [];
            }
            try {
                const q = query(collection(this.db, "scores"), orderBy("score", "desc"), orderBy("createdAt", "asc"), limit(limitCount));
                const snap = await getDocs(q);
                const out = snap.docs.map(d => {
                    const data = d.data();
                    return {
                        id: d.id,
                        username: data.username || "Player",
                        score: data.score || 0,
                        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : null
                    };
                });
                return out;
            } catch (err) {
                console.error("getTopScores error:", err);
                return [];
            }
        }
    };

    window.Scoreboard = Scoreboard;

    // Auto-init if scoreboard config is present
    const config = window.SCOREBOARD_CONFIG;
    if (config) {
        Scoreboard.init(config);
    }
})();