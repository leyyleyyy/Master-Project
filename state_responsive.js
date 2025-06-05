let isMobile = false;
let minMax = {};
let t = 0;
let blobHitZones = [];
let selectedTrack = null;
let selectedPendingTrack = null;
let audioPlayers = {};
let currentAudio = null;
let scrollXOffset = 0;
let scrollYOffset = 0;

// ✅ Ajouter ces variables pour le système de scroll
let scrollRangeX = 2000;
let scrollRangeY = 1500;
let scrollSpeed = 5;
let allBlobs = [];
let playerScore = 0; // ← Cette ligne existe déjà

// Ajouter cette fonction pour charger le score
function loadPlayerScore() {
  try {
    let storedScore = localStorage.getItem("btm_score");
    if (storedScore !== null) {
      playerScore = parseInt(storedScore) || 0;
      console.log("📊 Score chargé depuis localStorage:", playerScore);
    } else {
      console.log("📊 Nouveau joueur, score initialisé à 0");
    }
  } catch (e) {
    console.warn("Erreur lecture localStorage score", e);
    playerScore = 0;
  }
}

let playerCollection = [];
let pointFeedbacks = [];
let miniGameAudioPlayed = false;

let mode = "exploration"; // "exploration", "collection", "minigame", "avatar", "onboarding", "gameSelector", postMiniGameWin, "challengeIntro"
let currentMiniGameTrack = null;
let miniGameOptions = [];
let miniGameAnswer = null;
let miniGameFeedback = "";
let collectionHitZones = [];
let miniGameValidated = false;

let justWonMiniGame = false;
let trackSelectedForValidation = null;
let onboardingStep = 0;
let userAnswers = [];
let collectionAssigned = false;
let currentMapIndex = 0;
let currentMiniGameType = "visual_match"; // par défaut
let showPostMiniGameMessage = false;
let postWinDiv = null;
window.showPostMiniGameMessage = showPostMiniGameMessage; // pour l’exposer au script

let maxLives = 3;
let currentLives = maxLives;

let evolutionTrack = null;
let evolutionPoints = 0;
let canScrollAvatar = false;
let scrollToGenre = null;

// Variables du mini-jeu
let miniGameLabel = "";
let selectedOption = null;
let miniGameUnit = "";
let isDragging = false;
let lastTouch = null;
let lastMiniGameTrack = null;

//Background
let currentBackgroundCluster = "Autres"; // par défaut
/*
function updateBackgroundClusterFromGenre(genre) {
  currentBackgroundCluster = getGenreCluster(genre);
}
*/
const BACKGROUND_BY_GENRE = {
  "rose.jpg": [
    "Urban pop",
    "Social media pop",
    "House mélodique",
    "Métal",
    "Rap arab",
    "New wave",
    "Classique",
    "Raggaeton",
  ],
  "orange.jpg": ["Pop", "Latin pop", "Drill français"],
  "vert.jpg": ["Rap français", "Hip-Hop", "Música popular brasileira", "Metal"],
  "violet.jpg": [
    "Indie",
    "Metal balear",
    "Slowed and reverb",
    "Alternativ pop",
  ],
};

function updateBackgroundClusterFromGenre(genre) {
  for (let bg in BACKGROUND_BY_GENRE) {
    if (BACKGROUND_BY_GENRE[bg].includes(genre)) {
      currentBackgroundCluster = bg;
      return;
    }
  }
  currentBackgroundCluster = "rose.jpg"; // si genre inconnu
}

const DATA_KEYS = [
  "tempo",
  "energy",
  "danceability",
  "key",
  "valence",
  "acousticness",
  "popularity",
];

function cleanTrack(track) {
  return {
    title: track.title,
    tempo: track.tempo,
    energy: track.energy,
    danceability: track.danceability,
    key: track.key,
    valence: track.valence,
    acousticness: track.acousticness,
    popularity: track.popularity,
    camelot: track.camelot,
    audio: track.audio,
    genre: track.genre,
    artist: track.artist,
  };
}

const GENRE_CLUSTERS = {
  "Hip-Hop": ["Hip-Hop", "Rap français", "Rap arab", "Drill français"],
  Pop: ["Pop", "Urban pop", "Latin pop", "Social media pop"],
  Électro: ["House mélodique", "New wave", "Electronica"],
  "Rock/Metal": ["Rock/Metal", "Metal", "Metal balear"],
  Indé: ["Indie", "Alternativ pop", "Folk"],
  Latin: ["Música popular brasileira", "Raggaeton"],
  Classique: ["Classique"],
  Hyperpop: ["Hyperpop français"],
  Autres: ["Slowed and reverb"],
};

function getGenreCluster(genre) {
  for (let cluster in GENRE_CLUSTERS) {
    if (GENRE_CLUSTERS[cluster].includes(genre)) {
      return cluster;
    }
  }
  return "Inconnu";
}

const CLUSTER_POSITIONS = {
  "Hip-Hop": { x: -300, y: 50 },
  Pop: { x: 100, y: 60 },
  Électro: { x: 300, y: -100 },
  "Rock/Metal": { x: 0, y: -250 },
  Indé: { x: -200, y: -180 },
  Latin: { x: -100, y: 220 },
  Classique: { x: 200, y: 250 },
  Hyperpop: { x: 350, y: 180 },
  Autres: { x: 0, y: 300 },
};

/*function getPositionForGenre(genre) {
  const clusterName = getClusterNameForGenre(genre);
  const base = CLUSTER_POSITIONS[clusterName] || { x: 0, y: 0 };

  const scaleFactor = isMobile ? min(windowWidth, windowHeight) / 320 : 1;

  return {
    x: base.x * scaleFactor + random(-60, 60),
    y: base.y * scaleFactor + random(-60, 60),
  };
}*/
function getPositionForGenre(genre, index = 0, total = 1) {
  const clusterName = getClusterNameForGenre(genre);
  const base = CLUSTER_POSITIONS[clusterName] || { x: 0, y: 0 };
  const scaleFactor = isMobile ? min(windowWidth, windowHeight) / 320 : 1;

  // Répartition circulaire si plusieurs genres dans le même cluster
  const angle = (index / total) * TWO_PI;
  const radius = 100 * scaleFactor;

  const x = base.x * scaleFactor + cos(angle) * radius;
  const y = base.y * scaleFactor + sin(angle) * radius;

  return { x, y };
}

function getClusterNameForGenre(genre) {
  for (let clusterName in GENRE_CLUSTERS) {
    if (GENRE_CLUSTERS[clusterName].includes(genre)) {
      return clusterName;
    }
  }
  return "Autres";
}
function getMostCommonCluster(collection) {
  const clusterCounts = {};

  for (let track of collection) {
    if (!track || !track.genre) continue; // ✅ Sécurisation

    let clusterFound = null;
    for (let cluster in GENRE_CLUSTERS) {
      if (GENRE_CLUSTERS[cluster].includes(track.genre)) {
        clusterFound = cluster;
        break;
      }
    }

    if (!clusterFound) continue;
    clusterCounts[clusterFound] = (clusterCounts[clusterFound] || 0) + 1;
  }

  const sorted = Object.entries(clusterCounts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}
/*
function getGenreClusterPoints(track) {
  let cluster = getGenreCluster(track.genre);
  let genreStats = playerCollection.map((t) => getGenreCluster(t.genre));
  let clusterCount = genreStats.filter((c) => c === cluster).length;

  if (clusterCount === 0) return 10;
  if (clusterCount === 1) return 6;
  if (clusterCount === 2) return 3;
  if (clusterCount === 3) return 1;
  return -2;
}
*/
function getGenreClusterPoints(track) {
  let cluster = getGenreCluster(track.genre);
  let genreStats = playerCollection.map((t) => getGenreCluster(t.genre));
  let clusterCount = genreStats.filter((c) => c === cluster).length;
  let totalTracks = playerCollection.length;

  // Étape 1 : stricte en tout début de partie (1-2 morceaux max)
  if (totalTracks < 2) {
    return clusterCount === 0 ? 10 : -5;
  }

  // Étape 2 : en transition (2-5 morceaux)
  if (totalTracks < 6) {
    if (clusterCount === 0) return 10;
    if (clusterCount === 1) return 2;
    return -2;
  }

  // Étape 3 : progression normale
  if (clusterCount === 0) return 10;
  if (clusterCount === 1) return 6;
  if (clusterCount === 2) return 3;
  if (clusterCount === 3) return 1;
  return -2;
}

function getGenreAverages() {
  const genreGroups = {};

  tracksData.forEach((track) => {
    let g = track.genre;
    if (!genreGroups[g]) genreGroups[g] = [];
    genreGroups[g].push(track);
  });

  const genreAverages = {};
  for (let genre in genreGroups) {
    let tracks = genreGroups[genre];
    let avg = {
      tempo: 0,
      energy: 0,
      danceability: 0,
      key: 0,
      valence: 0,
      acousticness: 0,
      count: tracks.length,
    };
    tracks.forEach((t) => {
      avg.tempo += t.tempo;
      avg.energy += t.energy;
      avg.danceability += t.danceability;
      avg.key += t.key;
      avg.valence += t.valence;
      avg.acousticness += t.acousticness;
    });
    for (let k in avg) {
      if (k !== "count") avg[k] /= tracks.length;
    }
    genreAverages[genre] = avg;
  }

  return genreAverages;
}

/*
function getPointsForTrack(track) {
  let pop = track.popularity;
  if (pop <= 3) return 10;
  if (pop <= 9) return 8;
  if (pop <= 15) return 6;
  if (pop <= 25) return 4;
  if (pop <= 35) return 2;
  if (pop <= 50) return 1;
  if (pop <= 60) return -2;
  if (pop <= 70) return -4;
  if (pop <= 80) return -6;
  return -8;
}
*/

function getVisibleTracksCount() {
  const unlocked = playerCollection.length;
  if (unlocked === 0) return 6;
  if (unlocked === 1) return 12;
  if (unlocked === 2) return 24;
  if (unlocked === 3) return 28;
  return 30;
}
function getUnlockedMaps() {
  return maps.filter((map) => playerScore >= map.unlockScore);
}

function goToNextMap() {
  let unlocked = getUnlockedMaps();
  if (currentMapIndex < unlocked.length - 1) {
    currentMapIndex++;
  }
}
function getAvatarStage() {
  let count = playerCollection.length;
  if (count <= 1) return "2";
  if (count <= 2) return "4";
  if (count <= 3) return "6";
  return "1";
}

function getMorphingStage() {
  let count = playerCollection.length;
  if (count <= 2) return "evolution1";
  if (count <= 6) return "evolution1_2";
  if (count <= 12) return "evolution2";
  return "confort"; // ou autre nom si tu veux une morph finale
}

function getGameStage() {
  const count = playerCollection.length;
  if (count <= 3) return "initiation";
  if (count <= 8) return "curiosité";
  if (count <= 15) return "digging";
  return "expert";
}

/*
function updateAvatarGif() {
  let avatar = document.getElementById("avatar");
  if (!avatar || typeof mode === "undefined") return;

  if (mode === "onboarding") {
    avatar.style.display = "none";
    return;
  }

  avatar.style.display = "block";

  // Position dynamique selon le mode
  /* if (mode === "collection") {
    avatar.style.position = "absolute";
    //avatar.style.left = width / 2 - 75 + "px";
    let canvasW = window.innerWidth;
    avatar.style.left = canvasW / 2 - 75 + "px";
    avatar.style.top = "110px";
    avatar.style.width = "150px";
    //avatar.style.top = "110px";
    //avatar.style.width = "150px";
    return;
  } else {
    avatar.style.position = "fixed";
    avatar.style.right = "20px";
    avatar.style.top = "20px";
    avatar.style.left = "auto";
    avatar.style.width = "100px";
  }
*/
/*
  if (mode !== "collection") {
    avatar.classList.remove("avatar-collection");
    avatar.style.position = "fixed";
    avatar.style.right = "20px";
    avatar.style.top = "20px";
    avatar.style.left = "auto";
    avatar.style.width = "100px";
  }

  // Met à jour l’image si nécessaire
  let stage = getAvatarStage();
  if (!avatar.src.includes(stage)) {
    avatar.src = `totems/${stage}.gif`;
  }
}
*/
function updateAvatarGif() {
  const morphVideo = document.getElementById("morphVideo");
  if (!morphVideo) return;

  if (mode === "onboarding") {
    morphVideo.style.display = "none";
    return;
  }

  morphVideo.style.display = ["collection", "evolution"].includes(mode)
    ? "block"
    : "none";

  const stage = getAvatarStage(); // basé sur playerCollection.length

  if (!morphVideo.src.includes(stage)) {
    morphVideo.src = `videos/${stage}.mp4`;
    morphVideo.load();
    morphVideo.play();
  }
}

function getRemainingToNextStage() {
  let count = playerCollection.length;
  if (count <= 3) return 4 - count;
  if (count <= 6) return 7 - count;
  if (count <= 12) return 13 - count;
  return 0;
}

function getCollectionStats() {
  if (playerCollection.length === 0)
    return {
      avgTempo: 0,
      avgValence: 0,
      style: "Inconnu",
    };

  let totalTempo = 0;
  let totalValence = 0;
  let acousticnessSum = 0;

  for (let track of playerCollection) {
    totalTempo += track.tempo;
    totalValence += track.valence;
    acousticnessSum += track.acousticness;
  }

  let avgTempo = totalTempo / playerCollection.length;
  let avgValence = totalValence / playerCollection.length;
  let avgAcousticness = acousticnessSum / playerCollection.length;

  let style = "Équilibré";
  if (avgAcousticness > 0.6) style = "Acoustique 🎻";
  else if (avgAcousticness < 0.4) style = "Électronique 🎧";

  return {
    avgTempo,
    avgValence,
    style,
  };
}

function getMorphingStageForTrack(track) {
  // Exemple simple basé sur titre ou index
  if (!track) return "evolution1";
  if (track.stage === "1") return "evolution1";
  if (track.stage === "1_2") return "evolution1.2";
  // ajoute d’autres logiques selon ton système
  return "evolution1"; // fallback
}

function getDiversityAndUndergroundScore() {
  if (playerCollection.length === 0)
    return {
      diversity: 0,
      underground: 0,
    };

  let tempos = new Set();
  let keys = new Set();
  let styles = new Set();

  let totalPopularity = 0;

  for (let track of playerCollection) {
    tempos.add(round(track.tempo / 10)); // groupé par 10 bpm
    keys.add(track.key);
    styles.add(
      track.acousticness > 0.6
        ? "Acoustique"
        : track.acousticness < 0.4
        ? "Électro"
        : "Mix"
    );
    totalPopularity += track.popularity;
  }

  let diversity =
    (tempos.size + keys.size + styles.size) / (playerCollection.length + 2); // normalisé

  let underground = 100 - totalPopularity / playerCollection.length; // plus c’est bas, mieux c’est

  return {
    diversity: constrain(diversity * 100, 0, 100),
    underground: constrain(underground, 0, 100),
  };
}

function getGenreStats() {
  let genreCount = {};
  for (let track of playerCollection) {
    let genre = track.genre || "Inconnu";
    if (!genreCount[genre]) {
      genreCount[genre] = 0;
    }
    genreCount[genre]++;
  }

  let genres = Object.entries(genreCount).map(([name, count]) => ({
    name,
    count,
  }));

  // Trier du genre le plus présent au moins
  genres.sort((a, b) => b.count - a.count);
  return genres;
}

/*function pickRandomTrackFromCollection() {
  if (playerCollection.length === 0) return null;
  let index = floor(random(playerCollection.length));
  return playerCollection[index];
}
*/
function pickRandomTrackFromCollection() {
  // Pour garder la compatibilité, mais maintenant utilise toutes les musiques
  return pickRandomTrackFromAllTracks();
}

// Ajouter cette nouvelle fonction après pickRandomTrackFromCollection()
function pickRandomTrackFromAllTracks() {
  // Si tracksData existe, l'utiliser directement
  if (typeof tracksData !== "undefined" && tracksData.length > 0) {
    return random(tracksData);
  }

  // Sinon, prendre de toutes les cartes
  let allTracks = [];
  for (let map of maps) {
    allTracks = allTracks.concat(map.tracks);
  }

  if (allTracks.length > 0) {
    return random(allTracks);
  }

  console.warn("⚠️ Aucune musique disponible");
  return null;
}

// Modifier cette fonction (ligne 645)
function launchNextChallengeGame() {
  currentMiniGameTrack = pickRandomTrackFromAllTracks(); // ← Changé ici
  currentMiniGameType = random(["tempo", "genre", "visual_match"]);
  generateMiniGame(currentMiniGameTrack);
  mode = "minigame";
}

// Ajouter ces nouvelles variables après les autres variables du mini-jeu
let miniGameAttempts = 0; // Compteur d'essais pour le mini-jeu actuel

// Remplacer ou ajouter cette fonction
function getMiniGamePoints(attempts) {
  let points = 0;

  // Points basés sur le nombre d'essais
  switch (attempts) {
    case 1:
      points = 3; // Bonne réponse du premier coup
      break;
    case 2:
      points = 1; // Bonne réponse au deuxième essai
      break;
    default:
      points = 0; // 3 essais ou plus = pas de points
      break;
  }

  return points;
}

// Ajouter cette variable après les autres variables
let firstMiniGameWon = false; // Pour tracker si on a gagné au moins un mini-jeu

function assignScatteredPositions(tracks) {
  if (!tracks || tracks.length === 0) return;

  console.log(`📍 Attribution de positions pour ${tracks.length} morceaux`);

  // 🎯 Approche grille avec randomness - ESPACEMENT AUGMENTÉ
  const gridSize = Math.ceil(Math.sqrt(tracks.length));
  const spacing = 400; // ← Augmenté de 300 à 400
  const randomOffset = 120; // ← Augmenté de 80 à 120 pour plus de variation

  for (let i = 0; i < tracks.length; i++) {
    let track = tracks[i];

    // Position de base en grille
    let row = Math.floor(i / gridSize);
    let col = i % gridSize;

    // Centrer la grille
    let startX = (-(gridSize - 1) * spacing) / 2;
    let startY = (-(gridSize - 1) * spacing) / 2;

    let baseX = startX + col * spacing;
    let baseY = startY + row * spacing;

    // Ajouter de la variation aléatoire
    let offsetX = random(-randomOffset, randomOffset);
    let offsetY = random(-randomOffset, randomOffset);

    track.pos = createVector(baseX + offsetX, baseY + offsetY);
  }

  console.log(
    `✅ ${tracks.length} positions assignées en grille dispersée avec espacement ${spacing}px`
  );
}
