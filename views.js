function drawButton(label, x, y, w, h, isActive = true) {
  let radius = isMobile ? 22 : 12; // Increased from 18 to 22
  let fontSize = isMobile ? 28 : 16; // Increased from 26 to 28

  fill(isActive ? color(0, 0, 100) : color(0, 0, 40));
  rect(x, y, w, h, radius);

  fill(0, 0, isActive ? 0 : 80);
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
}

function drawButtonBis(label, x, y, w, h, isActive = true) {
  let radius = isMobile ? 22 : 12;
  let fontSize = isMobile ? 28 : 16;

  // === Fond noir transparent avec effet "verre" ===
  drawingContext.shadowBlur = isActive ? 12 : 0;
  drawingContext.shadowColor = color(255, 255, 255, 40); // lueur douce

  fill(0, 0, 100, isActive ? 10 : 5); // noir quasi transparent (en HSB, 10% opacité)
  stroke(255, 255, 255, isActive ? 30 : 10); // bordure douce si tu veux
  strokeWeight(1);
  rect(x, y, w, h, radius);

  // === Texte blanc ou grisé ===
  noStroke();
  fill(0, 0, isActive ? 100 : 60); // blanc ou gris clair
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
}

function drawButtonCol(label, x, y, w, h, isActive = true) {
  let radius = isMobile ? 22 : 12;
  let fontSize = isMobile ? 28 : 16;

  // === Glow blanc lumineux
  drawingContext.shadowBlur = isActive ? 16 : 0;
  drawingContext.shadowColor = isActive
    ? color(0, 0, 100, 100) // HSB → teinte 0, saturation 0%, luminosité 100% = blanc pur
    : color(0, 0, 100, 0);

  // === Fond gris très foncé et transparent
  //fill(0, 0, 10, isActive ? 10 : 5); // noir doux
  noFill();
  stroke(0, 0, 100, isActive ? 80 : 20); // bordure blanche très visible
  strokeWeight(1.5);
  rect(x, y, w, h, radius);

  // === Texte blanc ou gris clair
  noStroke();
  fill(0, 0, isActive ? 100 : 60);
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
}

function handleMiniGameValidation() {
  justClickedShuffle = false;
  const correct = miniGameAnswer === currentMiniGameTrack.correctAnswer;
  miniGameFeedback = correct ? "correct" : "incorrect";

  if (correct) {
    if (challengeStep > 0) {
      challengeStep++;
      if (challengeStep <= 3) {
        currentMiniGameTrack = pickRandomTrackFromDatabase();
        currentMiniGameType = random(["tempo", "genre"]);
        generateMiniGame(currentMiniGameTrack);
        mode = "minigame";
      } else {
        challengeStep = 0;
        mode = "exploration";
      }
    } else {
      mode = "postMiniGameWin";
    }
  } else {
    // Perdu → retour collection ou autre selon logique
    challengeStep = 0;
    mode = "collection";
  }
}

function drawExplorationView() {
  blobHitZones = [];
  textAlign(CENTER, CENTER);
  textSize(14);
  let btnW = isMobile ? 160 : 130;
  let btnH = isMobile ? 55 : 40;
  let spacing = 25;
  let totalW = maps.length * (btnW + spacing) - spacing;
  let startX = width / 2 - totalW / 2;

  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(28);
  text(`Score : ${playerScore}`, width / 2, 320);

  let unlockedMaps = getUnlockedMaps();
  if (unlockedMaps.length === 0) {
    fill(0, 0, 80);
    textAlign(CENTER);
    textSize(20);
    text(
      "Aucune carte musicale disponible. Gagne des points pour en débloquer !",
      width / 2,
      height / 2
    );
    return;
  }

  if (currentMapIndex >= unlockedMaps.length) {
    currentMapIndex = unlockedMaps.length - 1;
  }

  let currentMap = unlockedMaps[currentMapIndex];

  if (!currentMap._blobPositions) {
    assignScatteredPositions(currentMap.tracks);
    currentMap._blobPositions = currentMap.tracks.map((t) => t.pos);
  }
  /*
  for (let i = 0; i < maps.length; i++) {
    let x = startX + i * (btnW + spacing);
    let y = 20;
    let isUnlocked = playerScore >= maps[i].unlockScore;
    btnW = isMobile ? 160 : 130; // Increased from 130 to 160
    btnH = isMobile ? 55 : 40; // Increased from 40 to 55
    drawButton(
      isUnlocked ? maps[i].name : `🔒 ${maps[i].name}`,
      x,
      y,
      btnW,
      btnH,
      i === currentMapIndex && isUnlocked
    );
    blobHitZones.push({
      type: "mapButton",
      x,
      y,
      w: btnW,
      h: btnH,
      index: i,
      isUnlocked,
    });
  }
*/
  // MAP CAROUSEL HTML
  const mapCarousel = document.getElementById("mapCarousel");

  if (mode === "exploration") {
    mapCarousel.style.display = "block"; // Affiche le carousel
    mapCarousel.innerHTML = ""; // Nettoie les anciens boutons

    maps.forEach((map, i) => {
      const isUnlocked = playerScore >= map.unlockScore;
      const button = document.createElement("button");
      button.className =
        "map-carousel-btn" + (i === currentMapIndex ? " active" : "");
      button.disabled = !isUnlocked;
      button.textContent = isUnlocked ? map.name : "🔒 " + map.name;
      button.onclick = () => {
        currentMapIndex = i;
        redraw();
      };
      mapCarousel.appendChild(button);
    });
  }

  if (unlockedMaps.length > 1) {
    fill(0, 0, 100);
    textSize(16);
    if (currentMapIndex > 0) text("<", 40, height / 2);
    if (currentMapIndex < unlockedMaps.length - 1)
      text(">", width - 40, height / 2);
    text(currentMap.name, width / 2, 40);
  }

  push();
  translate(scrollXOffset, scrollYOffset);
  let visibleTracks = currentMap.tracks;
  let blobSize = isMobile ? 250 : 90;

  for (let i = 0; i < visibleTracks.length; i++) {
    let track = visibleTracks[i];
    if (!track.pos) continue;

    let baseX = track.pos.x;
    let baseY = track.pos.y;

    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      for (let offsetY = -1; offsetY <= 1; offsetY++) {
        let x = baseX + offsetX * scrollRangeX + scrollXOffset;
        let y = baseY + offsetY * scrollRangeY + scrollYOffset;

        if (
          x + blobSize < 0 ||
          x - blobSize > width ||
          y + blobSize < 0 ||
          y - blobSize > height
        )
          continue;
        drawTrackBlob(track, x, y, blobSize, i);
        //drawTrackBlob(blob, blobX, blobY, blobSize, i, false, true, true);

        if (offsetX === 0 && offsetY === 0) {
          blobHitZones.push({
            x,
            y,
            r: blobSize / 2,
            track,
            type: "blob",
          });
        }
      }
    }
  }

  pop();

  let valBtnW = isMobile ? 320 : 250;
  let valBtnH = isMobile ? 85 : 55;
  let valBtnX = width / 2 - valBtnW / 2;
  let valBtnY = height - valBtnH - (isMobile ? 80 : 20);
  drawButton(
    "Valider",
    valBtnX,
    valBtnY,
    valBtnW,
    valBtnH,
    !!selectedPendingTrack
  );
}

function drawOnboardingView() {
  background(260, 40, 10);
  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(28);
  text("Bienvenue !", width / 2, 60);

  if (onboardingStep < onboardingQuestions.length) {
    let q = onboardingQuestions[onboardingStep];
    textSize(20);
    fill(0, 0, 80);
    text(q.question, width / 2, 120);

    for (let i = 0; i < q.options.length; i++) {
      let btnW = isMobile ? width * 0.85 : 350; // Keep as is
      let btnH = isMobile ? 80 : 60; // Increased from 70 to 80
      let spacing = 25;
      let btnX = width / 2 - btnW / 2;
      let btnY = 180 + i * (btnH + spacing);
      drawButton(q.options[i], btnX, btnY, btnW, btnH);
    }
  } else if (!collectionAssigned) {
    assignInitialCollection();
    collectionAssigned = true;
    mode = "avatar";
  }
}

function drawMiniGameView() {
  // Affiche l'image de fond du mini-jeu si elle est chargée, sinon fond uni

  imageMode(CORNER);
  image(minigameBackground, 0, 0, width, height);

  textAlign(CENTER);
  fill(0, 0, 100);

  // ❤️ Affichage des vies
  let heartIcon = "❤️";
  let heartText = heartIcon.repeat(currentLives);
  textAlign(RIGHT, TOP);
  textSize(isMobile ? 30 : 22);
  text(heartText, width - 30, 30);

  let valBtnW = isMobile ? 320 : 250;
  let valBtnH = isMobile ? 75 : 55;
  let valX = width / 2 - valBtnW / 2;
  let valY = height - valBtnH - (isMobile ? 80 : 20);

  // === Consigne du jeu
  fill(0, 0, 80);
  textSize(isMobile ? 42 : 26);
  textAlign(CENTER, CENTER);

  let instruction = "";
  if (currentMiniGameType === "tempo")
    instruction = "Quel est le tempo de cette musique ?";
  else if (currentMiniGameType === "genre")
    instruction = "Quel est le genre de cette musique ?";
  else if (currentMiniGameType === "visual_match")
    instruction = "Quelle musique est la plus mainstream ?";

  text(instruction, width / 2, isMobile ? 300 : 160);

  // === Jeu VISUAL_MATCH ===
  if (currentMiniGameType === "visual_match" && miniGameOptions.length === 2) {
    let blobSize = isMobile ? 240 : 160;
    let spacing = isMobile ? 340 : 260;
    let baseY = height / 2 - spacing / 2;

    for (let i = 0; i < 2; i++) {
      let blob = miniGameOptions[i];
      let blobX = width / 2;
      let blobY = baseY + i * spacing;

      push();
      translate(blobX, blobY);

      // 🤍 Glow uniquement si sélectionné (comme dans exploration)
      selectedTrack = selectedOption === i ? blob : null;

      drawTrackBlob(blob, 0, 0, blobSize, i, false, true);

      selectedTrack = null;
      pop();
    }

    drawButton(
      "Valider",
      valX,
      valY,
      valBtnW,
      valBtnH,
      selectedOption !== null
    );
    return;
  }

  // === Jeux classiques (tempo / genre)
  let titleSize = isMobile ? 34 : 28;
  let labelSize = isMobile ? 16 : 14;
  let blobCenterY = height * 0.35;

  if (currentMiniGameTrack) {
    push();
    translate(width / 2, blobCenterY);
    drawTrackBlob(currentMiniGameTrack, 0, 0, isMobile ? 160 : 100, 0);
    pop();
  }

  let btnW = isMobile ? width * 0.85 : min(450, width * 0.6);
  let btnH = isMobile ? 75 : 60;
  let spacing = isMobile ? 30 : 25;
  let startY = blobCenterY + (isMobile ? 140 : 100);

  for (let i = 0; i < miniGameOptions.length; i++) {
    let option = miniGameOptions[i];
    let x = width / 2 - btnW / 2;
    let y = startY + i * (btnH + spacing);

    drawButtonBis(
      option + (miniGameUnit || ""),
      x,
      y,
      btnW,
      btnH,
      selectedOption === i
    );
  }

  drawButton("Valider", valX, valY, valBtnW, valBtnH, selectedOption !== null);
}

function playMorphVideo(stage) {
  const video = document.getElementById("morphVideo");
  if (!video) return;

  video.src = `totems/${stage}.mp4`;
  video.style.display = "block";
  video.currentTime = 0;
  video.muted = true;
  video.play();

  video.onended = () => {
    video.pause();
    video.currentTime = video.duration;
  };
}

function drawEvolutionView() {
  const morphVideo = document.getElementById("morphVideo");
  if (morphVideo) morphVideo.style.display = "block";

  if (
    !window.lastMorphPlayed ||
    window.lastMorphPlayed !== evolutionTrack.title
  ) {
    playMorphVideo("evolution1");
    window.lastMorphPlayed = evolutionTrack.title;
  }

  if (!evolutionTrack) {
    background(0, 0, 11);
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(isMobile ? 35 : 20);
    text("Erreur : aucune musique en évolution", width / 2, height / 2);
    return;
  }

  imageMode(CORNER);
  image(evolutionBackground, 0, 0, width, height);
  textAlign(CENTER); // ✅ Important !
  textWrap(WORD);
  let maxTextWidth = isMobile ? width * 0.85 : width * 0.6;
  let x = width / 2 - maxTextWidth / 2; // ✅ Décale vers la gauche

  let y = height / 2 - (isMobile ? -10 : -20);
  let spacing = isMobile ? 60 : 40;

  // 🎯 Points
  textSize(isMobile ? 46 : 24);
  fill(evolutionPoints >= 0 ? color(120, 100, 100) : color(0, 100, 100));
  text(
    `${evolutionPoints >= 0 ? "+" : ""}${evolutionPoints} points ${
      evolutionPoints >= 0 ? "🎉" : "😞"
    }`,
    x,
    y,
    maxTextWidth
  );
  y += spacing;

  // 🎵 Titre
  textSize(isMobile ? 36 : 20);
  fill(0, 0, 100);
  text(`Tu as ajouté : ${evolutionTrack.title || "—"}`, x, y, maxTextWidth);
  y += spacing;

  // 🎧 Genre
  if (evolutionTrack.genre) {
    textSize(isMobile ? 32 : 18);
    fill(0, 0, 90);
    text(`🎧 Genre débloqué : ${evolutionTrack.genre}`, x, y, maxTextWidth);
    y += spacing;
  }

  // 💬 Commentaires
  let dominantCluster = getMostCommonCluster(playerCollection);
  let evolutionComments = getEvolutionComment(evolutionTrack, dominantCluster);

  textSize(isMobile ? 26 : 16);
  fill(0, 0, 80);
  for (let comment of evolutionComments) {
    text(comment, x, y, maxTextWidth);
    y += spacing * 0.9;
  }

  // ✅ Bouton
  let btnW = isMobile ? 320 : 250;
  let btnH = isMobile ? 80 : 60;
  let btnX = width / 2 - btnW / 2;
  let btnY = height - (isMobile ? 160 : 120);

  drawButton("Continuer", btnX, btnY, btnW, btnH);

  blobHitZones = [
    {
      type: "continueExploration",
      x: btnX,
      y: btnY,
      w: btnW,
      h: btnH,
    },
  ];
}

/*
function drawCollectionView() {
  background(0, 0, 11);

  // === AVATAR BIEN CENTRÉ & GROS ===
  let avatarSize = isMobile ? 220 : 160;
  let avatarY = 140;
  let avatarImg = document.getElementById("avatar");
  if (avatarImg) {
    avatarImg.classList.add("avatar-collection");
  }
  // === SCORE & PHRASE JUSTE EN DESSOUS ===
  let infoY = avatarY + avatarSize / 2 + 30;

  fill(0, 0, 100);
  textSize(28);
  textAlign(CENTER);
  text(`Score total : ${playerScore}`, width / 2, infoY + 650);

  // === BLOBS & TRACKS EN LISTE VERS LE BAS ===
  let grouped = groupCollectionByCluster();
  let clusters = Object.keys(grouped);
  let y = infoY + 750; // ↘️ On descend le contenu ici
  let blobSize = isMobile ? 200 : 70;
  let lineHeight = isMobile ? 140 : 120;

  textAlign(CENTER);

  for (let cluster of clusters) {
    let tracks = grouped[cluster];

    // CLUSTER LABEL
    fill(220, 80, 100);
    textSize(30);
    text(cluster, width / 2, y);
    y += 45;

    for (let track of tracks) {
      // BLOB centré
      let blobX = width / 2;
      let blobY = y + blobSize / 2;

      push();
      translate(blobX, blobY);
      drawTrackBlob(track, 0, 0, blobSize, 0);
      pop();

      // ZONE CLIQUABLE
      blobHitZones.push({
        x: blobX,
        y: blobY,
        r: blobSize / 2,
        track: track,
        type: "blob",
      });

      // TITRE / ARTISTE en dessous
      fill(0, 0, 100);
      textSize(27);
      text(track.title || "Sans titre", blobX, blobY + blobSize / 2 + 35);

      fill(0, 0, 60);
      textSize(24);
      text(track.artist || "Artiste inconnu", blobX, blobY + blobSize / 2 + 65);

      y += lineHeight + 40;
    }

    y += 40;
  }
}
*/

/*
function drawCollectionView() {
  background(0, 0, 11);

  // === Avatar en grand ===
  let avatarSize = isMobile ? 220 : 160;
  let avatarY = 140;
  let avatarImg = document.getElementById("avatar");
  if (avatarImg) {
    avatarImg.classList.add("avatar-collection");
  }

  // === Titre + score ===
  let infoY = avatarY + avatarSize / 2 + 30;
  fill(0, 0, 100);
  textSize(28);
  textAlign(CENTER);
  text(`Score total : ${playerScore}`, width / 2, infoY);

  // === Blobs + morceaux ===
  let grouped = groupCollectionByCluster();
  let clusters = Object.keys(grouped);
  let y = infoY + 700;

  let blobSize = isMobile ? 70 : 50;
  let lineHeight = blobSize + 40;
  let textOffsetX = blobSize + 40;

  for (let cluster of clusters) {
    let tracks = grouped[cluster];

    // Nom du cluster
    fill(220, 80, 100);
    textSize(20);
    textAlign(LEFT);
    text(cluster, 40, y);
    y += 30;

    for (let track of tracks) {
      let blobX = 40 + blobSize / 2;
      let blobY = y + blobSize / 2;

      // 🎨 Dessin du blob
      push();
      translate(blobX, blobY);
      drawTrackBlob(track, 0, 0, blobSize, 0);
      pop();

      // 🎯 Zone clic
      blobHitZones.push({
        x: blobX,
        y: blobY,
        r: blobSize / 2,
        track: track,
        type: "blob",
      });

      // 🎵 Texte à droite
      fill(0, 0, 100);
      textAlign(LEFT);
      textSize(16);
      text(track.title || "Sans titre", blobX + textOffsetX, y + 20);

      fill(0, 0, 60);
      textSize(14);
      text(track.artist || "Artiste inconnu", blobX + textOffsetX, y + 40);

      y += lineHeight;
    }

    y += 30; // espace entre clusters
  }
}
*/
function drawCollectionView() {
  blobHitZones = [];
  background(0, 0, 11);

  // === Avatar en grand ===
  let avatarSize = isMobile ? 220 : 160;
  let avatarY = 140;
  let avatarImg = document.getElementById("avatar");
  if (avatarImg) {
    avatarImg.classList.add("avatar-collection");
  }

  // === Titre + score ===
  let infoY = avatarY + avatarSize / 2 + 30;
  fill(0, 0, 100);
  textSize(28);
  textAlign(CENTER);
  text(`Score total : ${playerScore}`, width / 2, infoY);

  // === Playlists par map ===
  let allPlaylists = [
    ...new Set(playerCollection.map((t) => t.mapName || "Inconnue")),
  ];

  // Initialise activePlaylist s’il n’existe pas
  if (typeof window.activePlaylist === "undefined") {
    window.activePlaylist = allPlaylists[0];
  }

  // Affichage des boutons de playlist
  let btnW = isMobile ? 160 : 140;
  let btnH = isMobile ? 55 : 40;
  let spacing = 20;
  let startX =
    width / 2 - (allPlaylists.length * (btnW + spacing) - spacing) / 2;
  let btnY = infoY + 60;

  for (let i = 0; i < allPlaylists.length; i++) {
    let label = allPlaylists[i];
    let x = startX + i * (btnW + spacing);
    drawButtonCol(label, x, btnY, btnW, btnH, label === window.activePlaylist);

    blobHitZones.push({
      type: "playlistSelect",
      x,
      y: btnY,
      w: btnW,
      h: btnH,
      playlist: label,
    });
  }

  // === Blobs + morceaux ===
  let filteredTracks = playerCollection.filter(
    (t) => (t.mapName || "Inconnue") === window.activePlaylist
  );
  let grouped = groupByCluster(filteredTracks);
  let clusters = Object.keys(grouped);
  let y = btnY + btnH + 40;

  let blobSize = isMobile ? 70 : 50;
  let lineHeight = blobSize + 40;
  let textOffsetX = blobSize + 40;

  for (let cluster of clusters) {
    let tracks = grouped[cluster];

    // Nom du cluster
    fill(220, 80, 100);
    textSize(20);
    textAlign(LEFT);
    text(cluster, 40, y);
    y += 30;

    for (let track of tracks) {
      let blobX = 40 + blobSize / 2;
      let blobY = y + blobSize / 2;

      // 🎨 Dessin du blob
      push();
      translate(blobX, blobY);
      drawTrackBlob(track, 0, 0, blobSize, 0);
      pop();

      // 🎯 Zone clic
      blobHitZones.push({
        x: blobX,
        y: blobY,
        r: blobSize / 2,
        track: track,
        type: "blob",
      });

      // 🎵 Texte à droite
      fill(0, 0, 100);
      textAlign(LEFT);
      textSize(16);
      text(track.title || "Sans titre", blobX + textOffsetX, y + 20);

      fill(0, 0, 60);
      textSize(14);
      text(track.artist || "Artiste inconnu", blobX + textOffsetX, y + 40);

      y += lineHeight;
    }

    y += 30; // espace entre clusters
  }
}
function groupByCluster(tracks) {
  let grouped = {};
  for (let t of tracks) {
    let cluster = getGenreCluster(t.genre);
    if (!grouped[cluster]) grouped[cluster] = [];
    grouped[cluster].push(t);
  }
  return grouped;
}
function handlePlaylistSelection(mx, my) {
  for (let zone of blobHitZones) {
    if (
      zone.type === "playlistSelect" &&
      mx >= zone.x &&
      mx <= zone.x + zone.w &&
      my >= zone.y &&
      my <= zone.y + zone.h
    ) {
      window.activePlaylist = zone.playlist;
      redraw();
      return true;
    }
  }
  return false;
}

/*
function drawAvatarView() {
  // background(260, 40, 10);
  // interpolation douce
  if (backgroundImages[currentBackgroundCluster]) {
    imageMode(CORNER);
    image(backgroundImages[currentBackgroundCluster], 0, 0, width, height);
  }

  let genreAvgs = getGenreAverages();
  let genreStats = getGenreStats();
  let genreUnlocked = genreStats.map((g) => g.name);
  let genreNames = Object.keys(genreAvgs);

  const hasUnlockedGenres = genreUnlocked.length > 0;
  canScrollAvatar = hasUnlockedGenres;

  // Construire un tableau de blobs de genre SI NON DÉJÀ FAIT
  if (!window.genreBlobs || window.genreBlobs.length !== genreNames.length) {
    // ➕ Regrouper genres par cluster
    const clusterGenreMap = {};
    for (let genre of genreNames) {
      const cluster = getClusterNameForGenre(genre);
      if (!clusterGenreMap[cluster]) clusterGenreMap[cluster] = [];
      clusterGenreMap[cluster].push(genre);
    }

    window.genreBlobs = genreNames.map((genre, i) => {
      const cluster = getClusterNameForGenre(genre);
      const clusterGenres = clusterGenreMap[cluster];
      const localIndex = clusterGenres.indexOf(genre);
      const pos = getPositionForGenre(genre, localIndex, clusterGenres.length);

      const isUnlocked =
        genreUnlocked.includes(genre) ||
        genreUnlocked.includes(genre.toLowerCase());

      return {
        title: genre,
        genre: genre,
        ...genreAvgs[genre],
        pos,
        isUnlocked,
        index: i,
      };
    });
    let focusGenre = scrollToGenre || genreUnlocked[0];

    if (!focusGenre) {
      // Si aucun genre débloqué (ex: premier affichage)
      let centerX = 0;
      let centerY = 0;
      for (let blob of window.genreBlobs) {
        centerX += blob.pos.x;
        centerY += blob.pos.y;
      }
      centerX /= window.genreBlobs.length;
      centerY /= window.genreBlobs.length;
      scrollXOffset = width / 2 - centerX;
      scrollYOffset = height / 2 - centerY;
      console.log("📍 Centrage par défaut (aucun genre débloqué)");
    } else {
      const focusBlob = window.genreBlobs.find((b) => b.title === focusGenre);
      if (focusBlob) {
        const verticalOffset = height * 0.35; // ← Décalage vers le haut pour que le blob soit plus bas à l’écran
        scrollXOffset = width / 2 - focusBlob.pos.x;
        scrollYOffset = height / 2 - focusBlob.pos.y - verticalOffset;
        console.log("📍 Centrage sur :", focusGenre);
      } else {
        console.warn("❌ Genre non trouvé pour recentrage :", focusGenre);
      }
    }

    scrollToGenre = null; // reset après recentrage
  }

  // 🎨 DESSIN
  push();
  translate(scrollXOffset, scrollYOffset);

  let screenMin = min(windowWidth, windowHeight);
  let blobSize = isMobile ? min(screenMin * 0.45, 240) : 80;

  for (let blob of window.genreBlobs) {
    const isUnlocked =
      genreUnlocked.includes(blob.genre) ||
      genreUnlocked.includes(blob.genre.toLowerCase());
    let { pos, index } = blob;

    drawTrackBlob(blob, pos.x, pos.y, blobSize, index, false, isUnlocked);

    if (isUnlocked) {
      fill(0, 0, 100);
      textAlign(CENTER);
      textSize(isMobile ? 32 : 14);
      text(blob.genre, pos.x, pos.y + blobSize / 2 + 24);
    }
  }
  // === BOUTON "Ma collection" ===
  let btnW = isMobile ? 240 : 160;
  let btnH = isMobile ? 65 : 50;
  let btnX = width / 2 - btnW / 2;
  let btnY = height - btnH - (isMobile ? 40 : 20);

  drawButtonBis("🎵 Ma collection", btnX, btnY, btnW, btnH, true);

  // Enregistre la zone cliquable dans blobHitZones
  blobHitZones.push({
    type: "goToCollection",
    x: btnX,
    y: btnY,
    w: btnW,
    h: btnH,
  });

  pop();
}
*/
function drawAvatarView() {
  if (backgroundImages[currentBackgroundCluster]) {
    imageMode(CORNER);
    image(backgroundImages[currentBackgroundCluster], 0, 0, width, height);
  }

  let genreAvgs = getGenreAverages();
  let genreStats = getGenreStats();
  let genreUnlocked = genreStats.map((g) => g.name);
  let genreNames = Object.keys(genreAvgs);

  const hasUnlockedGenres = genreUnlocked.length > 0;
  canScrollAvatar = hasUnlockedGenres;

  // Construction des blobs (inchangé)
  if (!window.genreBlobs || window.genreBlobs.length !== genreNames.length) {
    const clusterGenreMap = {};
    for (let genre of genreNames) {
      const cluster = getClusterNameForGenre(genre);
      if (!clusterGenreMap[cluster]) clusterGenreMap[cluster] = [];
      clusterGenreMap[cluster].push(genre);
    }

    window.genreBlobs = genreNames.map((genre, i) => {
      const cluster = getClusterNameForGenre(genre);
      const clusterGenres = clusterGenreMap[cluster];
      const localIndex = clusterGenres.indexOf(genre);
      const pos = getPositionForGenre(genre, localIndex, clusterGenres.length);

      const isUnlocked =
        genreUnlocked.includes(genre) ||
        genreUnlocked.includes(genre.toLowerCase());

      return {
        title: genre,
        genre: genre,
        ...genreAvgs[genre],
        pos,
        isUnlocked,
        index: i,
      };
    });

    let focusGenre = scrollToGenre || genreUnlocked[0];

    if (!focusGenre) {
      let centerX = 0;
      let centerY = 0;
      for (let blob of window.genreBlobs) {
        centerX += blob.pos.x;
        centerY += blob.pos.y;
      }
      centerX /= window.genreBlobs.length;
      centerY /= window.genreBlobs.length;
      scrollXOffset = width / 2 - centerX;
      scrollYOffset = height / 2 - centerY;
      console.log("📍 Centrage par défaut (aucun genre débloqué)");
    } else {
      const focusBlob = window.genreBlobs.find((b) => b.title === focusGenre);
      if (focusBlob) {
        const verticalOffset = height * 0.35;
        scrollXOffset = width / 2 - focusBlob.pos.x;
        scrollYOffset = height / 2 - focusBlob.pos.y - verticalOffset;
        console.log("📍 Centrage sur :", focusGenre);
      } else {
        console.warn("❌ Genre non trouvé pour recentrage :", focusGenre);
      }
    }

    scrollToGenre = null;
  }

  // 🎨 DESSIN
  push();
  translate(scrollXOffset, scrollYOffset);

  let screenMin = min(windowWidth, windowHeight);
  let blobSize = isMobile ? min(screenMin * 0.45, 240) : 80;

  for (let blob of window.genreBlobs) {
    const isUnlocked =
      genreUnlocked.includes(blob.genre) ||
      genreUnlocked.includes(blob.genre.toLowerCase());
    let { pos, index } = blob;

    drawTrackBlob(
      blob,
      pos.x,
      pos.y,
      blobSize,
      index,
      false,
      !isUnlocked,
      isUnlocked
    );

    /* if (isUnlocked) {
    fill(0, 0, 100);
    textAlign(CENTER);
    textSize(isMobile ? 32 : 14);
    text(blob.genre, pos.x, pos.y + blobSize / 2 + 24);
    }*/
  }

  pop(); // 🔁 important : drawButtonBis doit être en dehors du translate()

  // Position du bouton Shuffle (à adapter à ton code réel)
  let shuffleBtnY = isMobile ? 40 : 30;
  let shuffleBtnH = isMobile ? 65 : 50;
  if (hasUnlockedGenres) {
    // === BOUTON "Ma collection" ===
    let btnW = isMobile ? 240 : 160;
    let btnH = isMobile ? 65 : 50;
    let btnX = width / 2 - btnW / 2;
    let btnY = height / 2 + (isMobile ? 150 : 20); // placé plus bas, proche du bas de l'écran

    drawButtonCol("Ma collection", btnX, btnY, btnW, btnH, true);

    blobHitZones.push({
      type: "goToCollection",
      x: btnX,
      y: btnY,
      w: btnW,
      h: btnH,
    });
  }
}

function drawGameSelectorView() {
  imageMode(CORNER);
  image(minigameBackground, 0, 0, width, height);
  textAlign(CENTER, CENTER);
  fill(0, 0, 100);

  let options = [
    { label: "Feel the Beat", type: "tempo" },
    { label: "GenreGuesser", type: "genre" },
    { label: "Popular or Not", type: "visual_match" },
  ];

  let btnW = isMobile ? width * 0.85 : 300;
  let btnH = isMobile ? 80 : 60;
  let spacing = 30;
  let startY = height / 2 - ((btnH + spacing) * options.length) / 2;

  for (let i = 0; i < options.length; i++) {
    let x = width / 2 - btnW / 2;
    let y = startY + i * (btnH + spacing);
    drawButtonBis(options[i].label, x, y, btnW, btnH);
    blobHitZones.push({
      type: "gameChoice",
      x,
      y,
      w: btnW,
      h: btnH,
      miniGameType: options[i].type,
    });
  }
}

/*
function drawPostMiniGameWinView() {
  background(0, 0, 11);
  textAlign(CENTER, CENTER);
  fill(0, 0, 100);

  textSize(isMobile ? 34 : 28);
  text("🎉 Bravo !", width / 2, height / 2 - 100);

  textSize(isMobile ? 22 : 18);
  text("Tu as réussi ce mini-jeu !", width / 2, height / 2 - 40);

  textSize(isMobile ? 20 : 16);
  fill(0, 0, 80);
  text(
    "💡 Astuce : cherche une musique suisse pour marquer plus de points !",
    width / 2,
    height / 2 + 20
  );

  let btnW = isMobile ? 300 : 240;
  let btnH = isMobile ? 75 : 55;
  let btnX = width / 2 - btnW / 2;
  let btnY = height / 2 + 100;

  drawButton("Continuer", btnX, btnY, btnW, btnH, true);

  // Zone cliquable
  blobHitZones.push({
    type: "continueExploration",
    x: btnX,
    y: btnY,
    w: btnW,
    h: btnH,
  });
}
*/
function drawPostMiniGameWinView() {
  imageMode(CORNER);
  image(winBackground, 0, 0, width, height);
  textAlign(CENTER, CENTER);
  fill(0, 0, 100);

  // 🎉 Titre
  textSize(isMobile ? 34 : 28);
  text("🎉 Bravo !", width / 2, height / 2 - 140);

  // ✅ Confirmation de réussite
  textSize(isMobile ? 22 : 18);
  text("Tu as réussi ce mini-jeu !", width / 2, height / 2 - 100);

  // 🎵 Info sur la musique jouée
  if (lastMiniGameTrack) {
    let title = lastMiniGameTrack.title || "Titre inconnu";
    let artist = lastMiniGameTrack.artist || "Artiste inconnu";
    fill(0, 0, 95);
    textSize(isMobile ? 20 : 16);
    text(`🎵 ${title} – ${artist}`, width / 2, height / 2 - 60);
  }

  // 🧠 Anecdote en fonction du type de mini-jeu
  let anecdote = getMiniGameAnecdote(currentMiniGameType, lastMiniGameTrack);
  fill(0, 0, 85);
  textSize(isMobile ? 18 : 14);
  text(anecdote, width / 2, height / 2 - 20);

  // 💡 Astuce générique
  fill(0, 0, 80);
  textSize(isMobile ? 18 : 14);
  text(
    "💡 Astuce : cherche une musique suisse pour marquer plus de points !",
    width / 2,
    height / 2 + 20
  );

  if (lastMiniGameTrack) {
    // 👁️ Petit effet de pulsation
    let scalePulse = 1 + 0.05 * sin(frameCount * 0.1);
    push();
    translate(width / 2, height / 2 + 160);
    scale(scalePulse);

    drawTrackBlob(
      lastMiniGameTrack,
      0, // position x après translate
      0, // position y après translate
      120, // taille max blob
      0, // index
      false, // fixedWhiteMode
      true // isUnlocked
    );

    pop();
  }

  // 🟦 Bouton continuer
  let btnW = isMobile ? 300 : 240;
  let btnH = isMobile ? 75 : 55;
  let btnX = width / 2 - btnW / 2;
  let btnY = height / 2 + 90;

  drawButton("Continuer", btnX, btnY, btnW, btnH, true);

  blobHitZones.push({
    type: "continueExploration",
    x: btnX,
    y: btnY,
    w: btnW,
    h: btnH,
  });
}

function getMiniGameAnecdote(type, track) {
  if (!track) return "";

  let genre = track.genre || "inconnu";
  let tempo = track.tempo ? Math.round(track.tempo) : "un tempo inconnu";

  switch (type) {
    case "tempo":
      return `⚡ Ce morceau a un tempo de ${tempo} BPM — parfait pour te booster !`;
    case "visual_match":
      return `👁️ Tu as bien matché la vibe visuelle de ce son.`;
    case "genre":
      return `🎧 Tu as identifié le genre "${genre}" avec justesse !`;
    default:
      return `🎶 Une belle découverte musicale !`;
  }
}
function drawChallengeIntroView() {
  background(260, 40, 10);
  textAlign(CENTER);
  fill(0, 0, 100);
  textSize(isMobile ? 36 : 28);
  text("🌟 Défi spécial débloqué !", width / 2, 100);
  textSize(isMobile ? 22 : 18);
  text(
    "Tu dois réussir 3 mini-jeux à la suite pour débloquer une nouvelle musique !",
    width / 2,
    180
  );

  let btnW = isMobile ? 300 : 240;
  let btnH = isMobile ? 70 : 50;
  let btnX = width / 2 - btnW / 2;
  let btnY = height - 120;

  drawButton(
    "Commencer le challenge",
    width / 2 - 100,
    height - 80,
    200,
    50,
    startChallenge
  );

  blobHitZones = [
    {
      type: "startChallenge",
      x: btnX,
      y: btnY,
      w: btnW,
      h: btnH,
    },
  ];
}
