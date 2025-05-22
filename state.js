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

let mode = "avatar"; // "exploration", "collection", "minigame", "avatar"
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
  };
}

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
