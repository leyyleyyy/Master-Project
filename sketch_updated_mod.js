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
  digBackground = loadImage("assets/dig_background.jpg");

  // Image morphing préchargée
  bananaFont = loadFont("fonts/bananasp.ttf");
  manropeFont = loadFont("fonts/manrope-regular.otf");
  manropeMedium = loadFont("fonts/manrope-medium.otf");
  manropeSemiBold = loadFont("fonts/manrope-SemiBold.otf");

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
  // ✅ CORRIGER : Ajuster la taille du canvas pour mobile
  let canvasWidth = windowWidth;
  let canvasHeight = windowHeight;

  // Sur mobile, prendre en compte la hauteur réelle disponible
  if (isMobile) {
    canvasHeight = window.innerHeight; // Plus précis que windowHeight sur mobile
    canvasWidth = window.innerWidth; // Plus précis que windowWidth sur mobile
  }

  createCanvas(canvasWidth, canvasHeight, P2D);
  isMobile = /Mobi|Android/i.test(navigator.userAgent) || windowWidth < 768;
  console.log(
    "📱 isMobile =",
    isMobile,
    "Canvas:",
    canvasWidth,
    "x",
    canvasHeight
  );

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

  /*
  if (miniGameFeedback === "correct") {
    mode = "exploration";
    selectedPendingTrack = null;
    selectedTrack = null;
  }
*/
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

  // Initialiser le bouton Dig
  const streamButton = document.getElementById("streamButton");
  if (streamButton) {
    streamButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // ✅ IMPORTANT : Empêcher p5.js d'intercepter
      const isUnlocked = discsEarned >= 3;

      //const isUnlocked = discsEarned >= 3;
      console.log(" HTML Stream button clicked, score:", playerScore);

      if (isUnlocked) {
        // Arrêter l'illumination
        localStorage.setItem("btm_streamIlluminationSeen", "true");
        localStorage.removeItem("btm_justUnlockedStream");

        // Lancer le mode Stream (exploration)
        mode = "preDig";
        //updateActiveNav();
        redraw();

        console.log("🎉 Mode Dig lancé → Exploration !");
      } else {
        console.log("🔒 Stream verrouillé, score:", playerScore);
      }
    });

    console.log("✅ Event listener Stream ajouté");
  } else {
    console.error("❌ Bouton Stream introuvable");
  }
  window.addEventListener("load", () => {
    const streamButton = document.getElementById("streamButton");
    if (!streamButton) return;

    streamButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isUnlocked = discsEarned >= 3;
      console.log("💡 Stream button clicked. Score:", playerScore);

      if (isUnlocked) {
        mode = "preDig";
        redraw();
        console.log("🚀 Mode set to preDig");
      } else {
        console.log("🔒 Accès non autorisé à preDig");
      }
    });
  });
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
  document.querySelectorAll(".stream-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Ajouter la classe active selon le mode actuel
  let activeButton = null;

  switch (mode) {
    case "collection":
      activeButton = document.querySelector(
        '.stream-btn[data-mode="collection"]'
      );
      break;
    case "avatar":
      activeButton = document.querySelector('.stream-btn[data-mode="avatar"]');
      break;
    case "exploration":
      activeButton = document.querySelector(
        '.stream-btn[data-mode="exploration"]'
      );
      break;
    case "gameSelector":
      activeButton = document.querySelector(
        '.stream-btn[data-mode="gameSelector"]'
      );
      break;
    case "preDig":
      activeButton = document.querySelector('.stream-btn[data-mode="preDig"]');
      break;
  }

  if (activeButton) {
    activeButton.classList.add("active");
  }
}

function draw() {
  background(10, 8, 11);
  t += 0.01;

  // ✅ Gestion des vidéos selon le mode
  const morphVideo = document.getElementById("morphVideo");
  const morphWrapper = document.getElementById("videoWrapper");
  const evolutionWrapper = document.getElementById("evolutionVideoWrapper");

  // ✅ MASQUER le totem par défaut sur TOUTES les vues
  if (morphVideo) morphVideo.style.display = "none";
  if (morphWrapper) morphWrapper.style.display = "none";

  // Masquer evolutionWrapper par défaut
  if (evolutionWrapper) evolutionWrapper.style.display = "none";

  // ✅ Afficher le bouton close avec votre fonction existante (sauf en mode totem)
  if (mode !== "totem") {
    drawCloseButton();
  }

  // ✅ AJOUTER TOUS LES MODES de votre ancien sketch
  if (mode === "avatar") {
    drawAvatarView();
    updateDiscVisibilityAndPosition(mode);
  } else if (mode === "collection") {
    drawCollectionView();
    updateDiscVisibilityAndPosition(mode);
  } else if (mode === "totem") {
    drawTotemView();
    // ✅ Afficher morphVideo UNIQUEMENT en mode totem
    if (morphVideo && morphWrapper) {
      morphVideo.style.display = "block";
      morphWrapper.style.display = "block";
      morphVideo.classList.add("totem-mode");
      morphVideo.classList.remove("totem-evolution-mode");
      updateAvatarGif();
    }
    updateDiscVisibilityAndPosition(mode);
    updateDiscsFromScore(mode);
  } else if (mode === "exploration") {
    drawExplorationView();
    updateDiscVisibilityAndPosition(mode);
  } else if (mode === "totemEvolution") {
    drawEvolutionTotemView();
    showEvolutionVideo();
  } else if (mode === "evolution") {
    // ✅ AJOUTER : Mode evolution manquant
    drawEvolutionView();
    updateDiscVisibilityAndPosition(mode);
  } else if (mode === "minigame") {
    drawMiniGameView();
    updateDiscVisibilityAndPosition(mode);
  } else if (mode === "postMiniGameWin") {
    drawPostMiniGameWinView();
    updateDiscVisibilityAndPosition(mode);
  } else if (mode === "postMiniGameLose") {
    // ✅ AJOUTER : Mode postMiniGameLose manquant
    drawPostMiniGameLoseView();
  } else if (mode === "gameSelector") {
    drawGameSelectorView();
    updateDiscVisibilityAndPosition(mode);
    updateDiscsFromScore(mode);
  } else if (mode === "preDig") {
    drawPreDigExplanationView();
    updateDiscVisibilityAndPosition(mode); // ← Ajoutez cette ligne
  } else if (mode === "challengeIntro") {
    // ✅ AJOUTER : Mode challengeIntro manquant (référencé dans votre ancien code)
    drawChallengeIntroView();
  }

  // ✅ Masquer evolutionVideo si pas en mode totemEvolution
  if (mode !== "totemEvolution") {
    hideEvolutionVideo();
  }

  // ✅ Gestion de la vidéo morphVideo selon le mode (logique de votre ancien code)
  if (morphVideo) {
    if (mode === "totem") {
      // Déjà géré ci-dessus
    } else if (mode === "totemEvolution") {
      // La classe sera ajoutée dans drawEvolutionTotemView()
    } else {
      // Retirer toutes les classes et cacher la vidéo dans les autres modes
      morphVideo.classList.remove("totem-mode", "totem-evolution-mode");
      morphVideo.style.display = "none";
    }
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

      const unlockedGenres = getGenreStats().length;

      // CHANGER IMAGE
      if (unlockedGenres >= 10) {
        shuffleEl.style.backgroundImage = "url('assets/shuffle_bis.png')";
      } else {
        shuffleEl.style.backgroundImage = "url('assets/shuffle.png')";
      }

      // FORCER ONCLICK ICI
      shuffleEl.onclick = () => {
        justClickedShuffle = true;
        if (unlockedGenres >= 10) {
          console.log("🎯 Passage en mode challengeIntro");
          mode = "challengeIntro";
        } else {
          console.log("🎮 Passage en mode gameSelector");
          currentMiniGameTrack = pickRandomTrackFromCollection();
          currentMiniGameType = random(["tempo", "genre"]);
          generateMiniGame(currentMiniGameTrack);
          mode = "gameSelector";
        }
      };
    }
  }

  // ✅ Gestion du bouton Stream - UNIQUEMENT en mode totem
  const streamButton = document.getElementById("streamButton");
  if (streamButton) {
    if (mode === "totem") {
      streamButton.style.display = "block";
      updateStreamButtonLock(streamButton, isStreamUnlocked());
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

  // ✅ Gestion de la visibilité du carousel de maps
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
  const isUnlocked = discsEarned >= 3;
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

/*
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
*/
window.addEventListener("DOMContentLoaded", () => {
  const streamButton = document.getElementById("streamButton");
  if (streamButton) {
    streamButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isStreamUnlocked()) {
        markStreamAsUsed(); // ✅ Marquer comme utilisé
        mode = "preDig";
        redraw();
        console.log("🌊 Stream utilisé ! Mode preDig activé");
      } else {
        console.log("🔒 Stream verrouillé");
      }
    });
    console.log("✅ Event listener StreamButton bien attaché après DOM ready");
  } else {
    console.error(
      "❌ Bouton Stream introuvable (DOM non prêt au moment du binding)"
    );
  }
});

// ✅ Navigation en haut de l'écran (comme le burger menu)

document.querySelectorAll(".stream-btn").forEach((btn) => {
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

function handleTotemClick(mx, my) {
  for (let zone of blobHitZones) {
    if (
      mx >= zone.x &&
      mx <= zone.x + zone.w &&
      my >= zone.y &&
      my <= zone.y + zone.h
    ) {
      if (zone.type === "jouerButton") {
        // ✅ Emmener vers gameSelector
        mode = "gameSelector";
        console.log("🎮 Transition vers Game Selector depuis Totem !");
        return;
      }

      /*if (zone.type === "streamMode") {
        mode = "preDig";
        console.log("🎉 Dig lancé depuis la vue Totem !");
        return;
      }*/
    }
  }
}

// ✅ AJOUTER : Fonction pour gérer le redimensionnement
function windowResized() {
  let canvasWidth = windowWidth;
  let canvasHeight = windowHeight;

  if (isMobile) {
    canvasHeight = window.innerHeight;
    canvasWidth = window.innerWidth;
  }

  resizeCanvas(canvasWidth, canvasHeight);
  console.log("🔄 Canvas redimensionné:", canvasWidth, "x", canvasHeight);
}
