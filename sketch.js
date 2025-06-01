let activeFilters = {
  genre: "All",
  energy: null,
  dance: null,
};

let previousMode = null;
let bananaFont;
let backgroundImages = {};

function preload() {
  // Charge les sons uniquement si autorisé (évite crash Safari)
  /* tracksData.forEach((track) => {
    try {
      audioPlayers[track.title] = loadSound(track.audio);
    } catch (e) {
      console.warn("Erreur de preload audio :", track.title, e);
    }
  });*/

  // Image morphing préchargée
  bananaFont = loadFont("fonts/bananasp.ttf");

  //Background
  backgroundImages = {
    Pop: loadImage("assets/background1.png"),
    "Hip-Hop": loadImage("assets/background1.png"),
    Électro: loadImage("assets/background1.png"),
    "Rock/Metal": loadImage("assets/background1.png"),
    Indé: loadImage("assets/background1.png"),
    Latin: loadImage("assets/background1.png"),
    Classique: loadImage("assets/background1.png"),
    Hyperpop: loadImage("assets/background1.png"),
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight, P2D); // jamais plus grand que l'écran
  isMobile = /Mobi|Android/i.test(navigator.userAgent) || windowWidth < 768;
  console.log("📱 isMobile =", isMobile);
  textFont(bananaFont);

  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  textAlign(CENTER);
  textFont("sans-serif");
  noiseSeed(83);

  // Sécurité localStorage
  /*try {
    let stored = localStorage.getItem("btm_collection");
    if (stored) {
      playerCollection = JSON.parse(stored);
    } else {
      playerCollection = [cleanTrack(tracksData[0])];
      localStorage.setItem("btm_collection", JSON.stringify(playerCollection));
    }
  } catch (e) {
    playerCollection = [cleanTrack(tracksData[0])];
  }*/

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
function updatePageTitle() {
  const title = document.getElementById("pageTitle");
  const subtitle = document.getElementById("pageSubtitle");
  if (!title || !subtitle) return;

  if (mode === "collection") {
    title.innerText = "Ma Collection";
    subtitle.innerText = "Tu peux rejouer les sons ou en débloquer !";
    title.style.display = "block";
    subtitle.style.display = "block";
  } else if (mode === "avatar") {
    title.innerText = "The Digging Map";
    subtitle.innerText = "Navigate styles. Discover gems.";
    title.style.display = "block";
    subtitle.style.display = "none";
  } else if (mode === "minigame") {
    title.innerText = "Mini-jeu";
    subtitle.innerText = "Ecoute la musique et répond à la question !";
    title.style.display = "block";
    subtitle.style.display = "none";
  } else if (mode === "gameSelector") {
    title.innerText = "Mini-jeu";
    subtitle.innerText = "Choisis ton jeu !";
    title.style.display = "block";
    subtitle.style.display = "none";
  } else if (mode === "exploration") {
    title.innerText = mapNames[currentMapIndex] || "Map inconnue";
    subtitle.innerText = "Clique sur une forme pour écouter un son";
    title.style.display = "block";
    subtitle.style.display = "block";
  } else {
    title.style.display = "none";
    subtitle.style.display = "none";
  }
}

function draw() {
  background(0, 0, 11);
  const morphVideo = document.getElementById("morphVideo");
  if (morphVideo) morphVideo.style.display = "none";

  let mapCarousel = document.getElementById("mapCarousel");
  if (mapCarousel) {
    mapCarousel.style.display = mode === "exploration" ? "block" : "none";
  }

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
  } else if (mode === "onboarding") {
    drawOnboardingView();
  } else if (mode === "gameSelector") {
    drawGameSelectorView();
  } else if (mode === "postMiniGameWin") {
    drawPostMiniGameWinView();
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
    shuffleEl.style.display = mode === "avatar" ? "block" : "none";
    if (mode === "avatar") {
      shuffleEl.style.left = width / 2 - 100 + "px";
      shuffleEl.style.top = height / 2 - 280 + "px";
    }
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
    previousMode = mode;
  }

  updatePageTitle();
}
function renderMapCarousel() {
  const mapCarousel = document.getElementById("mapCarousel");
  mapCarousel.innerHTML = "";

  maps.forEach((map, i) => {
    const isUnlocked = playerScore >= map.unlockScore;
    const button = document.createElement("button");
    button.className =
      "map-carousel-btn" + (i === currentMapIndex ? " active" : "");
    button.disabled = !isUnlocked;
    button.textContent = isUnlocked ? map.name : "🔒 " + map.name;
    button.onclick = () => {
      currentMapIndex = i;
      redraw(); // Forcer le redessin
    };
    mapCarousel.appendChild(button);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  //const avatarEl = document.getElementById("avatar");
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
  /*if (avatarEl) {
    function goToAvatar(e) {
      e.preventDefault();
      if (mode !== "onboarding") mode = "avatar";
    }
    avatarEl.addEventListener("click", goToAvatar);
    avatarEl.addEventListener("touchstart", goToAvatar);
  }*/

  /* function handleShuffle(e) {
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
  }*/
  function handleShuffle(e) {
    e.preventDefault();
    mode = "gameSelector";

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
window.addEventListener("touchstart", () => {}, { passive: true });
