let activeFilters = {
  genre: "All",
  energy: null,
  dance: null,
};

let previousMode = null;
let morphingGif;

function preload() {
  // Charge les sons uniquement si autorisé (évite crash Safari)
  tracksData.forEach((track) => {
    try {
      audioPlayers[track.title] = loadSound(track.audio);
    } catch (e) {
      console.warn("Erreur de preload audio :", track.title, e);
    }
  });

  // Image morphing préchargée
  morphingGif = loadImage("avatars/morphing.gif");
}

function setup() {
  createCanvas(windowWidth, windowHeight, P2D); // jamais plus grand que l'écran
  isMobile = /Mobi|Android/i.test(navigator.userAgent) || windowWidth < 768;
  console.log("📱 isMobile =", isMobile);

  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  textAlign(CENTER);
  textFont("sans-serif");
  noiseSeed(83);

  // Sécurité localStorage
  try {
    let stored = localStorage.getItem("btm_collection");
    if (stored) {
      playerCollection = JSON.parse(stored);
    } else {
      playerCollection = [cleanTrack(tracksData[0])];
      localStorage.setItem("btm_collection", JSON.stringify(playerCollection));
    }
  } catch (e) {
    playerCollection = [cleanTrack(tracksData[0])];
  }

  // Min/max init
  DATA_KEYS.forEach((key) => {
    minMax[key] = {
      min: min(tracksData.map((d) => d[key])),
      max: max(tracksData.map((d) => d[key])),
    };
  });

  // Génération blobs initiaux (pour exploration)
  for (let i = 0; i < 10; i++) {
    tracksData.forEach((track) => {
      allBlobs.push({
        ...track,
        pos: createVector(random(-2000, 2000), random(-2000, 2000)),
      });
    });
  }

  if (miniGameFeedback === "correct") {
    mode = "exploration";
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
  } else if (mode === "evolution") {
    drawEvolutionView();
  }
  if (mode === "onboarding") {
    drawOnboardingView();
  }

  updateAvatarGif(); // avatar évolue dynamiquement
  let avatarEl = document.getElementById("avatar");

  if (avatarEl) {
    if (mode === "collection") {
      avatarEl.style.display = "block";
    } else {
      avatarEl.style.display = "none";
    }
  }

  let shuffleEl = document.getElementById("shuffleBtn");
  if (shuffleEl) {
    /*if (mode === "avatar") {
      shuffleEl.style.display = "block";
      shuffleEl.style.left = width / 2 - 100 + "px";
      shuffleEl.style.top = height / 2 - 280 + "px"; // ⬅️ bas de l'écran
    } else {
      shuffleEl.style.display = "none";
    }*/

    shuffleEl.style.display = mode === "avatar" ? "block" : "none";
    if (mode === "avatar") {
      shuffleEl.style.left = width / 2 - 100 + "px";
      shuffleEl.style.top = height / 2 - 280 + "px";
    }

    /*
    if (mode === "avatar") {
      shuffleEl.style.display = "block";
      shuffleEl.style.left = width / 2 - 40 + "px";
      shuffleEl.style.top = height / 2 - 40 + "px";
    } else {
      shuffleEl.style.display = "none";
    }*/
  }

  let avatarTitleGroup = document.getElementById("avatarTitleGroup");
  if (avatarTitleGroup) {
    if (mode === "collection") {
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
      shuffleTooltip.style.top = height / 2 + "px";
      shuffleTooltip.style.opacity = "1";
    } else {
      shuffleTooltip.style.display = "none";
      shuffleTooltip.style.opacity = "0";
    }
  }

  if (mode !== previousMode) {
    if (mode === "minigame") {
      currentMiniGameTrack = pickRandomTrackFromCollection();
      const gameTypes = ["tempo", "valence", "genre"];
      currentMiniGameType = random(gameTypes);
      generateMiniGame(currentMiniGameTrack);
    }

    // 👇 Ajoute ce bloc pour activer shuffle uniquement en mode "avatar"
    let shuffleEl = document.getElementById("shuffleBtn");
    if (shuffleEl) {
      if (mode === "avatar") {
        shuffleEl.onclick = () => {
          currentMiniGameTrack = pickRandomTrackFromCollection();
          const gameTypes = ["tempo", "valence", "genre"];
          currentMiniGameType = random(gameTypes);
          generateMiniGame(currentMiniGameTrack);
          mode = "minigame";
        };
      } else {
        shuffleEl.onclick = null;
      }
    }

    previousMode = mode;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const avatarEl = document.getElementById("avatar");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const burgerToggle = document.getElementById("burgerMenuToggle");
  const burgerMenu = document.getElementById("burgerMenu");

  // === Gestion du bouton burger ===
  function toggleBurgerMenu(e) {
    e.preventDefault();
    burgerMenu.style.display =
      burgerMenu.style.display === "flex" ? "none" : "flex";
  }
  burgerToggle.addEventListener("click", toggleBurgerMenu);
  burgerToggle.addEventListener("touchstart", toggleBurgerMenu);

  // === Navigation via boutons de menu ===
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    function handleMenuClick(e) {
      e.preventDefault();
      const selectedMode = e.currentTarget.dataset.mode;

      if (selectedMode === "minigame") {
        launchMiniGameFromCollection();
      } else {
        mode = selectedMode;
      }

      burgerMenu.style.display = "none";
    }
    btn.addEventListener("click", handleMenuClick);
    btn.addEventListener("touchstart", handleMenuClick);
  });

  // === Avatar cliquable
  if (avatarEl) {
    function goToAvatar(e) {
      e.preventDefault();
      if (mode !== "onboarding") mode = "avatar";
    }
    avatarEl.addEventListener("click", goToAvatar);
    avatarEl.addEventListener("touchstart", goToAvatar);
  }

  // === Shuffle (vers collection)
  /*
  function handleShuffle(e) {
    e.preventDefault();

    if (mode !== "minigame") {
      currentMiniGameTrack = pickRandomTrackFromCollection();
      currentMiniGameType = random(["tempo", "genre"]);
      mode = "minigame";
      miniGameOptions = []; // pour forcer la régénération dans drawMiniGameView
    }

    // animations visuelles du bouton
    shuffleBtn.style.boxShadow = "0 0 20px rgba(255,255,255,0.8)";
    shuffleBtn.style.transform = "scale(1.15)";
    setTimeout(() => {
      shuffleBtn.style.boxShadow = "";
      shuffleBtn.style.transform = "scale(1)";
    }, 200);
  }
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", handleShuffle);
    shuffleBtn.addEventListener("touchstart", handleShuffle);
  }*/
  function handleShuffle(e) {
    e.preventDefault();
    launchMiniGameFromCollection();

    shuffleBtn.style.boxShadow = "0 0 20px rgba(255,255,255,0.8)";
    shuffleBtn.style.transform = "scale(1.15)";
    setTimeout(() => {
      shuffleBtn.style.boxShadow = "";
      shuffleBtn.style.transform = "scale(1)";
    }, 200);
  }
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", handleShuffle);
    shuffleBtn.addEventListener("touchstart", handleShuffle);
  }
});
