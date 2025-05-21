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

let mode = "onboarding"; // "exploration", "collection", "minigame"
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
