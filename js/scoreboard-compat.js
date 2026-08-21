// js/scoreboard-compat.js
// Uses firebase-compat (easiest to get running in browsers).
(function () {
  if (!window.SCOREBOARD_CONFIG) {
    console.warn("No SCOREBOARD_CONFIG found. Create js/scoreboard-config.js with window.SCOREBOARD_CONFIG = { ... }");
    window.Scoreboard = {
      initialized: false,
      init: function () {},
      submitScore: async function () { return; },
      getTopScores: async function () { return []; }
    };
    return;
  }

  try {
    // Initialize firebase
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(window.SCOREBOARD_CONFIG);
    }
    const db = firebase.firestore();

    window.Scoreboard = {
      initialized: true,
      init: function () { /* already init */ },
      submitScore: async function (username, score) {
        try {
          const usernameClean = String(username || "Player").substring(0, 24);
          const numericScore = Number(score) || 0;
          await db.collection("scores").add({
            username: usernameClean,
            score: numericScore,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          return true;
        } catch (err) {
          console.error("Score submit error", err);
          throw err;
        }
      },
      getTopScores: async function (limitCount = 10) {
        try {
          const q = db.collection("scores")
            .orderBy("score", "desc")
            .orderBy("createdAt", "asc")
            .limit(limitCount);
          const snap = await q.get();
          return snap.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              username: data.username || "Player",
              score: data.score || 0,
              createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : null
            };
          });
        } catch (err) {
          console.error("Get top scores error", err);
          return [];
        }
      }
    };

    console.log("Scoreboard (compat) initialized");
  } catch (err) {
    console.error("Scoreboard compat init failed", err);
    window.Scoreboard = {
      initialized: false,
      init: function () {},
      submitScore: async function () {},
      getTopScores: async function () { return []; }
    };
  }
})();