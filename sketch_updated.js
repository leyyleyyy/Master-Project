let activeFilters = {
  genre: "All",
  energy: null,
  dance: null,
};

let previousMode = null;
let bananaFont;
let backgroundImages = {};
let totem;
let minigameBackground;
let winBackground;
let evolutionBackground;
function preload() {
  // Charge les sons uniquement si autorisé (évite crash Safari)
  tracksData.forEach((track) => {
    try {
      audioPlayers[track.title] = loadSound(track.audio);
    } catch (e) {
      console.warn("Erreur de preload audio :", track.title, e);
    }
  });
  minigameBackground = loadImage("assets/minigame_background.jpg");
  winBackground = loadImage("assets/winBackground.jpg");
  evolutionBackground = loadImage("assets/evolution_background.png");
  // Image morphing préchargée
  bananaFont = loadFont("fonts/bananasp.ttf");
  manropeFont = loadFont("fonts/manrope-regular.otf");
  manropeMedium = loadFont("fonts/manrope-medium.otf");

  //Background
  backgroundImages = {
    "rose.jpg": loadImage("assets/rose.jpg"),
    "orange.jpg": loadImage("assets/orange.jpg"),
    "vert.jpg": loadImage("assets/vert.jpg"),
    "violet.jpg": loadImage("assets/violet.jpg"),
    //"default.jpg": loadImage("assets/default.jpg"), // au cas où
  };
  /*
  backgroundImages = {
    Pop: loadImage("assets/evolution_background.png"),
    "Hip-Hop": loadImage("assets/yellow_green.png"),
    "Rap arab": loadImage("assets/evolution_background.png"),
    "Música popular brasileira": loadImage("assets/green.jpg"),
    Électro: loadImage("assets/evolution_background.png"),
    "Rock/Metal": loadImage("assets/rose.png"),
    Indé: loadImage("assets/evolution_background.png"),
    Latin: loadImage("assets/rose.png"),
    Classique: loadImage("assets/rose.png"),
    Hyperpop: loadImage("assets/green.jpg"),
    "Música popular brasileira": loadImage("assets/rose.png"),
  };*/
}

function setup() {
  createCanvas(windowWidth, windowHeight, P2D);
  isMobile = /Mobi|Android/i.test(navigator.userAgent) || windowWidth < 768;
  console.log("📱 isMobile =", isMobile);

  // Créer les feedbacks
  for (let i = 0; i < 10; i++) {
    pointFeedbacks.push({
      points: 0,
      x: 0,
      y: 0,
      alpha: 0,
      size: 24,
    });
  }

  // 📊 CHARGER LE SCORE EN PREMIER
  loadPlayerScore();

  // Charger la collection
  try {
    let storedCollection = localStorage.getItem("btm_collection");
    if (storedCollection) {
      playerCollection = JSON.parse(storedCollection);
      console.log(
        "📚 Collection chargée:",
        playerCollection.length,
        "morceaux"
      );
    }
  } catch (e) {
    console.warn("Erreur lecture localStorage collection", e);
  }

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

  // 🔄 RESET pour test - COMMENTER CETTE LIGNE MAINTENANT
  // localStorage.removeItem("btm_firstWin");
  // firstMiniGameWon = false;
  // console.log("🆕 Reset du statut firstMiniGameWon");

  // Charger l'état du premier gain depuis localStorage
  try {
    let storedFirstWin = localStorage.getItem("btm_firstWin");
    if (storedFirstWin === "true") {
      firstMiniGameWon = true;
      console.log("✅ Premier mini-jeu déjà gagné précédemment");
    } else {
      firstMiniGameWon = false;
      console.log("🆕 Aucun mini-jeu gagné pour l'instant");
    }
  } catch (e) {
    console.warn("Erreur lecture localStorage firstWin", e);
    firstMiniGameWon = false;
  }

  // Initialiser le bouton Stream
  const streamButton = document.getElementById("streamButton");
  if (streamButton) {
    streamButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // ✅ IMPORTANT : Empêcher p5.js d'intercepter

      const isUnlocked = playerScore >= 5;
      console.log("🌊 HTML Stream button clicked, score:", playerScore);

      if (isUnlocked) {
        // Arrêter l'illumination
        localStorage.setItem("btm_streamIlluminationSeen", "true");
        localStorage.removeItem("btm_justUnlockedStream");

        // Lancer le mode Stream (exploration)
        mode = "exploration";
        //updateActiveNav();
        redraw();

        console.log("🎉 Mode Stream lancé → Exploration !");
      } else {
        console.log("🔒 Stream verrouillé, score:", playerScore);
      }
    });

    console.log("✅ Event listener Stream ajouté");
  } else {
    console.error("❌ Bouton Stream introuvable");
  }
}
function updatePageTitle() {
  const title = document.getElementById("pageTitle");
  const subtitle = document.getElementById("pageSubtitle");
  if (!title || !subtitle) return;

  if (mode === "collection") {
    title.innerText = "Ma Collection";
    subtitle.innerText = "Ta collection de son !";
    title.style.display = "block";
    subtitle.style.display = "block";
  } else if (mode === "avatar") {
    title.innerText = "The Genre Map";
    subtitle.innerText = "Navigate styles. Discover gems.";
    title.style.display = "block";
    subtitle.style.display = "none";
  } else if (mode === "minigame") {
    //title.innerText = "Mini-jeu";
    subtitle.innerText = "Ecoute la musique et répond à la question !";
    title.style.display = "block";
    subtitle.style.display = "none";
  } else if (mode === "gameSelector") {
    title.innerText = "";
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

function updateActiveNav() {
  // Retirer toutes les classes active
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Ajouter la classe active selon le mode actuel
  let activeButton = null;

  switch (mode) {
    case "collection":
      activeButton = document.querySelector('.nav-btn[data-mode="collection"]');
      break;
    case "avatar":
      activeButton = document.querySelector('.nav-btn[data-mode="avatar"]');
      break;
    case "exploration":
      activeButton = document.querySelector(
        '.nav-btn[data-mode="exploration"]'
      );
      break;
    case "gameSelector":
      activeButton = document.querySelector(
        '.nav-btn[data-mode="gameSelector"]'
      );
      break;
  }

  if (activeButton) {
    activeButton.classList.add("active");
  }
}

function draw() {
  background(10, 8, 11);

  if (mode === "onboarding") {
    drawOnboardingView();
  } else if (mode === "avatar") {
    drawAvatarView();
  } else if (mode === "collection") {
    drawCollectionView();
  } else if (mode === "exploration") {
    drawExplorationView();
  } else if (mode === "evolution") {
    drawEvolutionView();
  } else if (mode === "minigame") {
    drawMiniGameView();
  } else if (mode === "postMiniGameWin") {
    drawPostMiniGameWinView();
  } else if (mode === "gameSelector") {
    drawGameSelectorView();
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
  /*if (shuffleEl) {
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
  }*/
  if (shuffleEl) {
    shuffleEl.style.display = mode === "avatar" ? "block" : "none";

    if (mode === "avatar") {
      shuffleEl.style.left = width / 2 - 100 + "px";
      shuffleEl.style.top = height / 2 - 280 + "px";

      const unlockedGenres = getGenreStats().length;

      // CHANGER IMAGE
      if (unlockedGenres >= 10) {
        shuffleEl.style.backgroundImage = "url('assets/shuffle_bis.png')";
      } else {
        shuffleEl.style.backgroundImage = "url('assets/shuffle.png')";
      }

      // FORCER ONCLICK ICI
      shuffleEl.onclick = () => {
        justClickedShuffle = true; // ✅ protège contre double-clic / mousePressed

        if (unlockedGenres >= 10) {
          console.log("🎯 Passage en mode challengeIntro");
          mode = "challengeIntro";
        } else {
          console.log("🎮 Passage en mode minigame");
          currentMiniGameTrack = pickRandomTrackFromCollection();
          currentMiniGameType = random(["tempo", "genre"]);
          generateMiniGame(currentMiniGameTrack);
          mode = "minigame";
        }
      };
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
    updateActiveNav(); // ✅ Décommenter cette ligne
  }

  // ✅ Gestion de la visibilité du bouton Stream
  const streamButton = document.getElementById("streamButton");
  if (streamButton) {
    if (mode === "gameSelector") {
      streamButton.style.display = "block";
      // ✅ AJOUTER : Gestion du cadenas dynamique
      updateStreamButtonLock(streamButton);
    } else {
      streamButton.style.display = "none";
    }
  }

  // ✅ Gestion de la visibilité des boutons de navigation
  const topNav = document.getElementById("topNav");
  if (topNav) {
    if (mode === "minigame" || mode === "postMiniGameWin") {
      topNav.style.display = "none";
    } else {
      topNav.style.display = "flex";
    }
  }

  // ✅ AJOUTER : Gestion de la visibilité du carousel de maps
  const mapCarousel = document.getElementById("mapCarousel");
  if (mapCarousel) {
    if (mode === "exploration") {
      mapCarousel.style.display = "flex";
    } else {
      mapCarousel.style.display = "none";
    }
  }

  updatePageTitle();
}

// ✅ AJOUTER : Fonction pour gérer le cadenas du bouton Stream
function updateStreamButtonLock(streamButton) {
  const isUnlocked = playerScore >= 5;
  const lockIcon = streamButton.querySelector(".lock-icon");

  if (isUnlocked) {
    // Enlever le cadenas
    if (lockIcon) {
      lockIcon.style.display = "none";
    }
    streamButton.classList.add("unlocked");
    streamButton.classList.remove("locked");
    streamButton.textContent = "Digin’ the Stream"; // Sans cadenas
  } else {
    // Afficher le cadenas
    if (lockIcon) {
      lockIcon.style.display = "inline";
    }
    streamButton.classList.add("locked");
    streamButton.classList.remove("unlocked");
    // Le HTML contient déjà le cadenas, pas besoin de le remettre
  }
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
  let evoOverlay = document.getElementById("evolutionOverlay");
  if (evoOverlay) {
    evoOverlay.style.display = mode === "evolution" ? "block" : "none";
  }
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
  //burgerToggle.addEventListener("click", toggleBurgerMenu);
  //burgerToggle.addEventListener("touchstart", toggleBurgerMenu);

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
    justClickedShuffle = true;

    const unlockedGenres = getGenreStats().length;

    if (mode === "avatar") {
      if (unlockedGenres >= 10) {
        console.log("🎯 Passage en mode challengeIntro");
        mode = "challengeIntro";
      } else {
        console.log("🎮 Passage en mode minigame");
        currentMiniGameTrack = pickRandomTrackFromCollection();
        generateMiniGame(currentMiniGameTrack);
        mode = "gameSelector";
      }

      // Feedback visuel (si tu veux garder l'effet)
      const shuffleBtn = document.getElementById("shuffleBtn");
      shuffleBtn.style.boxShadow = "0 0 20px rgba(255,255,255,0.8)";
      shuffleBtn.style.transform = "scale(1.15)";
      setTimeout(() => {
        shuffleBtn.style.boxShadow = "";
        shuffleBtn.style.transform = "scale(1)";
      }, 200);
    }
  }

  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", handleShuffle);
    shuffleBtn.addEventListener("touchstart", handleShuffle);
  }
});
// ✅ Navigation en haut de l'écran (comme le burger menu)
document.querySelectorAll(".nav-btn").forEach((btn) => {
  function handleNavClick(e) {
    e.preventDefault();
    const targetMode = btn.dataset.mode;

    // ✅ AJOUTER : Marquer l'illumination Genre Map comme vue
    if (targetMode === "avatar") {
      localStorage.setItem("btm_genreMapIlluminationSeen", "true");
      console.log("✨ Genre Map illumination marquée comme vue");
    }

    // ✅ OPTIONNEL : Garder l'ancienne logique Collection
    if (targetMode === "collection") {
      localStorage.setItem("btm_collectionIlluminationSeen", "true");
    }

    // Changer le mode
    mode = targetMode;
    updateActiveNav(); // ✅ AJOUTER : Mise à jour immédiate
    redraw();
  }

  btn.addEventListener("click", handleNavClick);
  btn.addEventListener("touchstart", handleNavClick);
});

// Assurez-vous que cette section exclut bien le bouton Stream :
document.querySelectorAll(".nav-btn").forEach((btn) => {
  function handleNavClick(e) {
    e.preventDefault();
    const targetMode = btn.dataset.mode;

    // Changer le mode
    mode = targetMode;
    redraw();
  }

  btn.addEventListener("click", handleNavClick);
});

// Et que l'event listener du Stream est bien séparé :
const streamButton = document.getElementById("streamButton");
if (streamButton) {
  streamButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isUnlocked = playerScore >= 5;
    console.log("🌊 HTML Stream button clicked, score:", playerScore);

    if (isUnlocked) {
      localStorage.setItem("btm_streamIlluminationSeen", "true");
      localStorage.removeItem("btm_justUnlockedStream");

      mode = "exploration";
      //updateActiveNav();
      redraw();

      console.log("🎉 Mode Stream lancé → Exploration !");
    } else {
      console.log("🔒 Stream verrouillé, score:", playerScore);
    }
  });
}

// ✅ CORRIGER : Mettre cette logique dans une fonction ou dans un event listener
function handleCollectionTrackClick(clickedTrack) {
  // ✅ SÉLECTIONNER : Marquer comme track sélectionnée pour l'illumination
  selectedTrack = clickedTrack;

  // ✅ JOUER : Arrêter l'audio précédent et jouer le nouveau
  if (currentAudio) {
    currentAudio.stop();
  }

  // Charger et jouer l'audio si disponible
  if (clickedTrack.audio && typeof loadSound === "function") {
    try {
      if (!audioPlayers[clickedTrack.title]) {
        audioPlayers[clickedTrack.title] = loadSound(clickedTrack.audio, () => {
          console.log("🎵 Audio chargé:", clickedTrack.title);
        });
      }

      currentAudio = audioPlayers[clickedTrack.title];
      if (currentAudio && currentAudio.isLoaded()) {
        currentAudio.play();
        console.log("🎵 Lecture:", clickedTrack.title);
      }
    } catch (e) {
      console.warn("❌ Erreur lecture audio:", e);
    }
  }

  redraw(); // Redessiner pour afficher l'illumination
}
