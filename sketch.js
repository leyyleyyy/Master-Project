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

  playerCollection = [cleanTrack(tracksData[0])];
  localStorage.setItem("btm_collection", JSON.stringify(playerCollection));

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
  }
}
