let activeFilters = {
  genre: "All",
  energy: null,
  dance: null,
};

let previousMode = null;

function preload() {
  tracksData.forEach((track) => {
    audioPlayers[track.title] = loadSound(track.audio);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  textAlign(CENTER);
  textSize(10);
  textFont("sans-serif");
  noiseSeed(83);

  /*
  playerCollection = [cleanTrack(tracksData[0])];
  localStorage.setItem("btm_collection", JSON.stringify(playerCollection));
*/
  DATA_KEYS.forEach((key) => {
    minMax[key] = {
      min: min(tracksData.map((d) => d[key])),
      max: max(tracksData.map((d) => d[key])),
    };
  });

  for (let i = 0; i < 10; i++) {
    tracksData.forEach((track) => {
      allBlobs.push({
        ...track,
        pos: createVector(random(-2000, 2000), random(-2000, 2000)),
      });
    });
  }
  if (miniGameFeedback === "correct") {
    mode = "exploration"; // retour à la map
    selectedPendingTrack = null;
    selectedTrack = null;
  }
}

function draw() {
  background(0, 0, 11);
  t += 0.01;

  if (mode === "exploration") {
    drawExplorationView();
  } else if (mode === "collection") {
    drawCollectionView();
  } else if (mode === "minigame") {
    drawMiniGameView();
  } else if (mode === "avatar") {
    drawAvatarView();
  }
  if (mode === "onboarding") {
    drawOnboardingView();
  }

  updateAvatarGif(); // avatar évolue dynamiquement
  let avatarEl = document.getElementById("avatar");

  if (avatarEl) {
    if (mode === "avatar") {
      avatarEl.style.display = "block";
    } else {
      avatarEl.style.display = "none";
    }
  }

  let shuffleEl = document.getElementById("shuffleBtn");
  if (shuffleEl) {
    if (mode === "avatar") {
      shuffleEl.style.display = "block";
      shuffleEl.style.left = width / 2 - 40 + "px";
      shuffleEl.style.top = height / 2 - 40 + "px";
    } else {
      shuffleEl.style.display = "none";
    }
  }

  let avatarTitleGroup = document.getElementById("avatarTitleGroup");
  if (avatarTitleGroup) {
    if (mode === "avatar") {
      avatarTitleGroup.style.display = "block";
    } else {
      avatarTitleGroup.style.display = "none";
    }
  }

  // ✅ Barre de progression

  let progressGroup = document.getElementById("genreProgress");
  if (progressGroup) {
    if (mode === "avatar") {
      progressGroup.style.display = "block";

      let genreStats =
        typeof getGenreStats === "function" ? getGenreStats() : [];
      let genreAverages =
        typeof getGenreAverages === "function" ? getGenreAverages() : {};

      let unlockedGenres = genreStats.length;
      let totalGenres = Object.keys(genreAverages).length;

      let percent = (unlockedGenres / totalGenres) * 100;

      document.getElementById("progressBar").style.width = percent + "%";
      document.getElementById(
        "progressText"
      ).textContent = `${unlockedGenres} / ${totalGenres} genres débloqués`;
    } else {
      progressGroup.style.display = "none";
    }
  }

  let shuffleTooltip = document.getElementById("shuffleTooltip");
  if (shuffleTooltip) {
    if (mode === "avatar") {
      shuffleTooltip.style.display = "block";
      shuffleTooltip.style.left = width / 2 + "px";
      shuffleTooltip.style.top = height / 2 + 70 + "px";
      shuffleTooltip.style.opacity = "1";
    } else {
      shuffleTooltip.style.display = "none";
      shuffleTooltip.style.opacity = "0";
    }
  }

  let collectionFiltersEl = document.getElementById("collectionFilters");
  playerCollection = [cleanTrack(tracksData[0])];
  localStorage.setItem("btm_collection", JSON.stringify(playerCollection));
  if (collectionFiltersEl) {
    if (mode === "collection") {
      collectionFiltersEl.style.display = "flex";
    } else {
      collectionFiltersEl.style.display = "none";
    }
  }
  if (mode !== previousMode) {
    if (mode === "minigame") {
      currentMiniGameTrack = pickRandomTrackFromCollection();
      const gameTypes = ["tempo", "valence", "genre"];
      currentMiniGameType = random(gameTypes);
      generateMiniGame(currentMiniGameTrack);
    }

    previousMode = mode;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const avatarEl = document.getElementById("avatar");
  // Toggle burger menu
  document.getElementById("burgerMenuToggle").addEventListener("click", () => {
    const menu = document.getElementById("burgerMenu");
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  });

  // Navigation
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;

      // Referme le menu automatiquement
      document.getElementById("burgerMenu").style.display = "none";
    });
  });

  if (avatarEl) {
    avatarEl.addEventListener("click", () => {
      if (mode !== "onboarding") {
        mode = "avatar";
      }
    });
  }

  document.getElementById("shuffleBtn").addEventListener("click", () => {
    if (mode === "avatar") {
      mode = "collection";

      // 👇 effet visuel au clic
      let btn = document.getElementById("shuffleBtn");
      btn.style.boxShadow = "0 0 20px rgba(255,255,255,0.8)";
      btn.style.transform = "scale(1.15)";
      setTimeout(() => {
        btn.style.boxShadow = "";
        btn.style.transform = "scale(1)";
      }, 200);
    }
  });

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.genre) {
        activeFilters.genre = btn.dataset.genre;
      }
      if (btn.dataset.energy) {
        activeFilters.energy = btn.dataset.energy;
      }
      if (btn.dataset.dance) {
        activeFilters.dance = btn.dataset.dance;
      }
    });
  });
});
