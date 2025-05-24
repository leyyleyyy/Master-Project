let minMax = {};
let t = 0;
let blobHitZones = [];
let selectedTrack = null;
let selectedPendingTrack = null;
let audioPlayers = {};
let currentAudio = null;
let scrollXOffset = 0;
let scrollYOffset = 0;
let allBlobs = [];
let playerScore = 0;
let playerCollection = [];
let pointFeedbacks = [];

let mode = "collection"; // "exploration", "collection", "minigame", "avatar"
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
let currentMiniGameType = "tempo"; // par défaut

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
  if (count <= 3) return "avatar_0";
  if (count <= 6) return "avatar_1";
  if (count <= 12) return "avatar_0";
  return "avatar_1";
}

function updateAvatarGif() {
  let avatar = document.getElementById("avatar");
  if (!avatar || typeof mode === "undefined") return;

  if (mode === "onboarding") {
    avatar.style.display = "none";
    return;
  }

  avatar.style.display = "block";

  // Position dynamique selon le mode
  if (mode === "avatar") {
    avatar.style.position = "absolute";
    avatar.style.left = width / 2 - 75 + "px";
    avatar.style.top = "110px";
    avatar.style.width = "150px";
  } else {
    avatar.style.position = "fixed";
    avatar.style.right = "20px";
    avatar.style.top = "20px";
    avatar.style.left = "auto";
    avatar.style.width = "100px";
  }

  // Met à jour l’image si nécessaire
  let stage = getAvatarStage();
  if (!avatar.src.includes(stage)) {
    avatar.src = `avatars/${stage}.gif`;
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

function pickRandomTrackFromCollection() {
  if (playerCollection.length === 0) return null;
  let index = floor(random(playerCollection.length));
  return playerCollection[index];
}

function generateMiniGame(track) {
  if (!track) return;

  if (currentMiniGameType === "tempo") {
    miniGameAnswer = round(track.tempo);
    let options = new Set([miniGameAnswer]);
    while (options.size < 3) {
      options.add(round(track.tempo + random(-20, 20)));
    }
    miniGameOptions = shuffle([...options]);
  } else if (currentMiniGameType === "valence") {
    miniGameAnswer = track.valence > 50 ? "joyeux" : "triste";
    miniGameOptions = shuffle(["joyeux", "triste", "neutre"]);
  } else if (currentMiniGameType === "genre") {
    miniGameAnswer = track.genre;
    let genres = [...new Set(playerCollection.map((t) => t.genre))];
    genres = genres.filter((g) => g !== track.genre);
    shuffle(genres);
    let wrong = genres.slice(0, 2);
    miniGameOptions = shuffle([track.genre, ...wrong]);
  }

  selectedOption = null;
  miniGameFeedback = "";
}
