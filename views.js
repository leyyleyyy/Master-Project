function drawButton(label, x, y, w, h, isActive = true) {
  let radius = isMobile ? 50 : 12; // Increased from 18 to 22
  let fontSize = isMobile ? 95 : 16; // Increased from 26 to 28

  fill(0, 0, isActive ? 100 : 100, isActive ? 100 : 10);
  rect(x, y, w, h, radius);
  textFont(bananaFont);

  fill(0, 0, isActive ? 0 : 80);
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
}
function drawButtonGame(label, x, y, w, h, isActive = true) {
  let radius = isMobile ? 40 : 12;
  let fontSize = isMobile ? 75 : 16;
  textFont("sans-serif");

  // === Fond noir transparent avec effet "verre" ===
  drawingContext.shadowBlur = isActive ? 12 : 0;
  drawingContext.shadowColor = color(255, 255, 255, 40);

  fill(0, 0, 100, isActive ? 10 : 5);
  stroke(255, 255, 255, isActive ? 30 : 10);
  strokeWeight(1);
  rect(x, y, w, h, radius);

  fill(0, 0, 100);

  noStroke();
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
}
function drawButtonBis(
  label,
  x,
  y,
  w,
  h,
  isActive = true,
  isStreamUnlocked = false
) {
  let radius = isMobile ? 50 : 12;
  let fontSize = isMobile ? 80 : 16;

  // === Gestion spéciale pour le Stream débloqué ===
  if (isStreamUnlocked && !label.includes("🔒")) {
    // ✨ BOUTON BLANC POUR STREAM DÉBLOQUÉ
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = color(0, 0, 100, 60); // Ombre blanche

    fill(0, 0, 100); // Fond blanc pur
    noStroke();
    rect(x, y, w, h, radius);

    // Texte noir
    fill(0, 0, 0); // Noir pur
    textSize(fontSize);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textFont(bananaFont);
    text(label, x + w / 2, y + h / 2);
    textStyle(NORMAL);

    drawingContext.shadowBlur = 0;
    return; // Sortir de la fonction
  }

  // === Fond noir transparent avec effet "verre" (boutons normaux) ===
  drawingContext.shadowBlur = isActive ? 12 : 0;
  drawingContext.shadowColor = color(255, 255, 255, 40);

  fill(0, 0, 100, isActive ? 10 : 5);
  stroke(255, 255, 255, isActive ? 30 : 10);
  strokeWeight(1);
  rect(x, y, w, h, radius);

  // === Texte (double police si 🔒 présent)
  noStroke();
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(0, 0, 100);

  if (label.includes("🔒")) {
    let parts = label.split("🔒");
    let icon = "🔒";
    let textOnly = parts[1].trim();

    textSize(fontSize);

    // Mesurer les largeurs
    textFont("sans-serif");
    let iconWidth = textWidth(icon);

    textFont(bananaFont);
    let textWidthOnly = textWidth(textOnly);

    let spacing = 20;
    let totalWidth = iconWidth + spacing + textWidthOnly;

    // Point de départ pour centrer tout
    let startX = x + w / 2 - totalWidth / 2;

    // Dessin
    textFont("sans-serif");
    fill(0, 0, 100);
    text(icon, startX + iconWidth / 2, y + h / 2);

    textFont(bananaFont);
    fill(0, 0, 60);
    text(textOnly, startX + iconWidth + spacing + textWidthOnly / 2, y + h / 2);
  } else {
    // === Texte normal
    textFont(bananaFont);
    text(label, x + w / 2, y + h / 2);
  }

  textStyle(NORMAL);
}

function drawButtonSelector(label, x, y, w, h, isActive = true) {
  let radius = isMobile ? 50 : 12;
  let fontSize = isMobile ? 80 : 16;

  // === Fond noir transparent avec effet "verre" ===
  drawingContext.shadowBlur = isActive ? 12 : 0;
  drawingContext.shadowColor = color(255, 255, 255, 40);

  fill(0, 0, 100, isActive ? 10 : 5);
  //stroke(255, 255, 255, isActive ? 30 : 10);
  //strokeWeight(1);
  //rect(x, y, w, h, radius);

  // === Texte (double police si 🔒 présent)
  noStroke();
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(0, 0, 100);
  if (label.includes("🔒")) {
    let parts = label.split("🔒");
    let icon = "🔒";
    let textOnly = parts[1].trim();

    textSize(fontSize); // assure la bonne taille pour le calcul

    // Mesurer les largeurs
    textFont("sans-serif");
    let iconWidth = textWidth(icon);

    textFont(bananaFont);
    let textWidthOnly = textWidth(textOnly);

    let spacing = 20; // ← espace entre le cadenas et le texte
    let totalWidth = iconWidth + spacing + textWidthOnly;

    // Point de départ pour centrer tout
    let startX = x + w / 2 - totalWidth / 2;

    // Dessin
    textFont("sans-serif");
    fill(0, 0, 100);
    text(icon, startX + iconWidth / 2, y + h / 2);

    textFont(bananaFont);
    fill(0, 0, 60);
    text(textOnly, startX + iconWidth + spacing + textWidthOnly / 2, y + h / 2);
  } else {
    // === Texte normal
    textFont(bananaFont);
    text(label, x + w / 2, y + h / 2);
  }

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
        currentMiniGameType = random(["tempo", "genre", "visual_match"]);
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

  // ✅ MODIFIER : Utiliser la même position que gameSelector
  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(isMobile ? 28 : 20);
  textFont(manropeFont);
  //text(`Score : ${playerScore}`, width / 2, isMobile ? 320 : 100);

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

  let valBtnW = isMobile ? 820 : 250;
  let valBtnH = isMobile ? 185 : 55;
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
  imageMode(CORNER);
  image(minigameBackground, 0, 0, width, height);

  // === ÉCRAN DE DÉMARRAGE ===
  if (!window.miniGameStarted) {
    fill(0, 0, 0, 150); // Overlay sombre
    rect(0, 0, width, height);

    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(isMobile ? 48 : 32);
    text(" Appuie pour commencer", width / 2, height / 2);

    textSize(isMobile ? 24 : 18);
    text("(La musique va se lancer)", width / 2, height / 2 + 60);
    drawCloseButton();

    return; // Stoppe l'affichage du jeu
  }
  drawCloseButton();

  // ❤️ Affichage des vies
  textFont("sans-serif");

  let heartIcon = "❤️";
  let heartText = heartIcon.repeat(currentLives);
  textAlign(RIGHT, TOP);
  textSize(isMobile ? 60 : 22);
  text(heartText, width / 2 + 150, 100);

  let valBtnW = isMobile ? 820 : 250;
  let valBtnH = isMobile ? 170 : 55;
  let valX = width / 2 - valBtnW / 2;
  let valY = height - valBtnH - (isMobile ? 80 : 20);

  // === Consigne du jeu
  fill(0, 0, 80);
  textSize(isMobile ? 52 : 26);
  textAlign(CENTER, CENTER);
  textWrap(WORD);

  let instruction = "";
  if (currentMiniGameType === "tempo")
    instruction = "Écoute bien… c’est rapide ou lent ? Trouve le BPM";
  else if (currentMiniGameType === "genre")
    instruction = "Tu reconnais le style ? Trouve le genre de cette musique";
  else if (currentMiniGameType === "visual_match")
    instruction = "Deux sons. Lequel est le plus streamé ?";

  //text(instruction, width / 2, isMobile ? 300 : 160);
  let maxTextWidth = width * 0.85; // 👈 largeur max
  let textY = isMobile ? 300 : 160;
  let textX = width / 2 - maxTextWidth / 2;

  text(instruction, textX, textY, maxTextWidth);
  // === Jeu VISUAL_MATCH ===
  if (currentMiniGameType === "visual_match" && miniGameOptions.length === 2) {
    let blobSize = isMobile ? 240 : 160;
    let spacing = isMobile ? 200 : 260;
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

  let btnW = isMobile ? width * 0.9 : min(500, width * 0.65);
  let btnH = isMobile ? 150 : 75; // ← plus haut
  let spacing = isMobile ? 50 : 35; // ← plus espacé

  let startY = blobCenterY + (isMobile ? 140 : 100);

  for (let i = 0; i < miniGameOptions.length; i++) {
    let option = miniGameOptions[i];
    let x = width / 2 - btnW / 2;
    let y = startY + i * (btnH + spacing);

    drawButtonGame(
      option + (miniGameUnit || ""),
      x,
      y,
      btnW,
      btnH,
      selectedOption === i
    );
  }
  //drawCloseButton();

  drawButton("Valider", valX, valY, valBtnW, valBtnH, selectedOption !== null); // ✅ valBtnH existe bien
}

function playMorphVideo(stage) {
  const video = document.getElementById("morphVideo");
  if (!video) return;

  video.src = `videos/${stage}.mp4`;
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

  if (!evolutionTrack) {
    background(0, 0, 11);
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(isMobile ? 35 : 20);
    text("Erreur : aucune musique en évolution", width / 2, height / 2);
    return;
  }

  if (morphVideo) {
    morphVideo.style.display = "block";

    if (
      !window.lastMorphPlayed ||
      window.lastMorphPlayed !== evolutionTrack.title
    ) {
      const stage = getAvatarStage();
      playMorphVideo(stage);
      window.lastMorphPlayed = evolutionTrack.title;
    }
  }

  background(10, 8, 11);

  push();

  colorMode(HSB, 360, 100, 100, 100);
  textSize(isMobile ? 26 : 20);
  textFont("sans-serif");
  textAlign(CENTER, CENTER); // ✅ CHANGER : CENTER pour vraiment centrer
  textWrap(WORD);
  noStroke();

  let x = width / 2; // ✅ Position X centrée
  let y = height / 2 - (isMobile ? -10 : 150);
  let spacing = isMobile ? 90 : 50;

  if (typeof evolutionPoints === "undefined") {
    evolutionPoints = 0;
  }

  // 🎯 Points
  textSize(isMobile ? 46 : 24);
  if (evolutionPoints >= 0) {
    fill(120, 100, 100);
  } else {
    fill(0, 100, 100);
  }

  // ✅ CORRIGER : Enlever la largeur pour un vrai centrage
  text(
    `${evolutionPoints >= 0 ? "+" : ""}${evolutionPoints} points ${
      evolutionPoints >= 0 ? "🎉" : "😞"
    }`,
    x,
    y
  );
  y += spacing;

  // 🎵 Titre
  textSize(isMobile ? 36 : 20);
  fill(0, 0, 100);
  text(`Tu as ajouté : ${evolutionTrack.title || "—"}`, x, y);
  y += spacing;

  // 🎧 Genre
  if (evolutionTrack.genre) {
    textSize(isMobile ? 32 : 18);
    fill(0, 0, 90);
    text(`🎧 Genre débloqué : ${evolutionTrack.genre}`, x, y);
    y += spacing;
  }

  // 💬 Commentaires - ✅ CORRIGER : Si texte long, utiliser LEFT + calcul manuel
  if (
    typeof getMostCommonCluster === "function" &&
    typeof getEvolutionComment === "function"
  ) {
    let dominantCluster = getMostCommonCluster(playerCollection);
    let evolutionComments = getEvolutionComment(
      evolutionTrack,
      dominantCluster
    );

    textSize(isMobile ? 36 : 16);
    fill(0, 0, 80);

    if (evolutionComments && evolutionComments.length > 0) {
      for (let comment of evolutionComments) {
        // ✅ SOLUTION : Si le commentaire est court, centrer. Si long, utiliser LEFT
        if (comment.length < 50) {
          textAlign(CENTER, CENTER);
          text(comment, x, y);
        } else {
          textAlign(LEFT, CENTER);
          let maxTextWidth = isMobile ? width * 0.85 : width * 0.6;
          let textX = width / 2 - maxTextWidth / 2;
          text(comment, textX, y, maxTextWidth);
        }
        y += spacing;
      }
    }
  }

  pop();

  // ✅ Bouton
  let btnW = isMobile ? 320 : 250;
  let btnH = isMobile ? 80 : 60;
  let btnX = width / 2 - btnW / 2;
  let btnY = height - (isMobile ? 160 : 120);

  drawButton("Continuer", btnX, btnY, btnW, btnH);

  if (!blobHitZones) blobHitZones = [];
  blobHitZones.push({
    type: "continueExploration",
    x: btnX,
    y: btnY,
    w: btnW,
    h: btnH,
  });
}
function drawCollectionView() {
  blobHitZones = [];
  background(10, 0, 0);
  textFont(manropeFont);

  // === Applique le scroll à TOUT le contenu ===
  push();
  translate(0, window.collectionScrollY || 0);

  // === Avatar en grand ===
  let avatarSize = isMobile ? 220 : 160;
  let avatarY = 140;
  let avatarImg = document.getElementById("avatar");
  if (avatarImg) {
    avatarImg.classList.add("avatar-collection");
  }

  // === Titre + score ===
  let infoY = height / 2 - 30;
  fill(0, 0, 100);
  textSize(28);
  textAlign(CENTER);
  text(`Score total : ${playerScore}`, width / 2, infoY);

  // === Playlists par map ===
  let allPlaylists = [
    ...new Set(playerCollection.map((t) => t.mapName || "Inconnue")),
  ];

  // Initialise activePlaylist s'il n'existe pas
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

  // === Zone des blobs + morceaux ===
  let filteredTracks = playerCollection.filter(
    (t) => (t.mapName || "Inconnue") === window.activePlaylist
  );
  let grouped = groupByCluster(filteredTracks);
  let clusters = Object.keys(grouped);
  let y = btnY + btnH + 60; // Position de départ

  // 🎨 Tailles améliorées - PLUS GROS
  let blobSize = isMobile ? 200 : 120;
  let lineHeight = blobSize + 100;
  let textOffsetX = blobSize + 100;
  let leftMargin = isMobile ? 100 : 80;

  for (let cluster of clusters) {
    let tracks = grouped[cluster];

    // Nom du cluster
    fill(220, 80, 100);
    textSize(isMobile ? 36 : 28);
    textAlign(LEFT);
    text(cluster, leftMargin, y);
    y += 80;

    for (let track of tracks) {
      let blobX = leftMargin + blobSize / 2;
      let blobY = y + blobSize / 2;

      // 🎨 Dessin du blob avec illumination si sélectionné
      push();
      translate(blobX, blobY);

      // ✅ CORRIGER : Garder la forme originale, juste changer l'illumination
      let isSelectedTrack =
        selectedTrack && selectedTrack.title === track.title;

      // ✅ MODIFICATION : Utiliser un paramètre pour contrôler seulement l'illumination
      drawTrackBlob(track, 0, 0, blobSize, 0, false, true, false); // ✅ Dernier paramètre à false

      // ✅ AJOUTER : Effet d'illumination personnalisé si sélectionné

      pop();

      // 🎯 Zone clic
      blobHitZones.push({
        x: blobX,
        y: blobY,
        r: blobSize / 2,
        track: track,
        type: "collectionPlay",
      });

      // 🎵 Texte à droite
      fill(0, 0, 100);
      textAlign(LEFT);
      textSize(isMobile ? 28 : 20);
      text(track.title || "Sans titre", blobX + textOffsetX, y + 35);

      fill(0, 0, 60);
      textSize(isMobile ? 24 : 18);
      text(track.artist || "Artiste inconnu", blobX + textOffsetX, y + 70);

      y += lineHeight;
    }

    y += 80;
  }

  // 🔧 Calcul de la hauteur totale du contenu
  window.collectionContentHeight = y + 100; // +100 pour une marge en bas

  pop(); // Fin du translate global

  // 📏 DEBUG
  console.log("📏 Hauteur totale:", {
    contentHeight: window.collectionContentHeight,
    screenHeight: height,
    maxScroll: max(0, window.collectionContentHeight - height + 100),
  });
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

function drawAvatarView() {
  background(10, 0, 0);

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

    drawTrackBlob(blob, pos.x, pos.y, blobSize, index, false, isUnlocked);

    if (isUnlocked) {
      fill(0, 0, 100);
      textAlign(CENTER);
      textFont(manropeFont); // ✅ CHANGER : utiliser Manrope au lieu de la police par défaut
      textSize(isMobile ? 42 : 18); // ✅ AGRANDIR : de 32→42 (mobile) et 14→18 (desktop)
      textStyle(BOLD); // ✅ AJOUTER : mettre en gras pour plus de visibilité
      text(blob.genre, pos.x, pos.y + blobSize / 2 + 20);
      textStyle(NORMAL); // ✅ REMETTRE : style normal après
    }
  }

  pop(); // 🔁 important : drawButtonBis doit être en dehors du translate()/*
}

function drawGameSelectorView() {
  imageMode(CORNER);
  image(minigameBackground, 0, 0, width, height);

  // ✅ Affichage du score en haut
  fill(0, 0, 100);
  textFont(manropeFont);
  textSize(isMobile ? 42 : 20);
  textAlign(CENTER, CENTER);
  text(`Score : ${playerScore} points`, width / 2, isMobile ? 280 : 50);

  // Reste du code existant...
  textAlign(CENTER, CENTER);
  fill(0, 0, 100);
  textFont(bananaFont);

  let options = [
    { label: "Feel the Beat", type: "tempo" },
    { label: "GenreGuesser", type: "genre" },
    { label: "Pop’ Or Not", type: "visual_match" },
  ];

  let btnW = isMobile ? width * 0.85 : 300;
  let btnH = isMobile ? 160 : 70;
  let spacing = isMobile ? 80 : 40;
  let startY = height / 2 - ((btnH + spacing) * options.length - spacing) / 2;

  for (let i = 0; i < options.length; i++) {
    let x = width / 2 - btnW / 2;
    let y = startY + i * (btnH + spacing);
    drawButtonSelector(options[i].label, x, y, btnW, btnH);
    blobHitZones.push({
      type: "gameChoice",
      x,
      y,
      w: btnW,
      h: btnH,
      miniGameType: options[i].type,
    });
  }

  let lockBtnW = btnW;
  let lockBtnH = btnH;
  let lockBtnX = width / 2 - lockBtnW / 2;
  let lockBtnY = height - lockBtnH - (isMobile ? 60 : 40);

  // 🔓 Vérifier si le joueur a assez de points pour débloquer
  const isUnlocked = playerScore >= 5;
  //const buttonLabel = isUnlocked ? "Digin' the Stream" : "🔒 Digin' the Stream";

  // ✅ SIMPLIFIER : Pulse si vient d'être débloqué ET pas encore vu
  //let shouldHighlightStream = justUnlockedStream && !hasSeenStreamIllumination;

  // ✅ DEBUG : Afficher les valeurs dans la console
  /*console.log("🔍 DEBUG Illumination Stream:", {
    isUnlocked,
    justUnlockedStream,
    hasSeenStreamIllumination,
    shouldHighlightStream,
    playerScore
  });*/
  /*
  if (shouldHighlightStream) {
    push();

    // ✨ Effet de glow pulsant DORÉ
    let glowIntensity = 1 + 0.4 * sin(frameCount * 0.1);
    drawingContext.shadowBlur = 40 * glowIntensity;
    drawingContext.shadowColor = "rgba(255, 215, 0, 0.8)"; // Or pur

    // Cercle d'illumination derrière le bouton
    fill(60, 100, 100, 30 * glowIntensity); // Doré semi-transparent
    ellipse(
      lockBtnX + lockBtnW / 2,
      lockBtnY + lockBtnH / 2,
      lockBtnW + 60,
      lockBtnH + 60
    );

    // Particules scintillantes autour du bouton
    for (let i = 0; i < 8; i++) {
      let angle = frameCount * 0.02 + (i * TWO_PI) / 8;
      let radius = 180 + 20 * sin(frameCount * 0.05 + i);
      let px = lockBtnX + lockBtnW / 2 + cos(angle) * radius;
      let py = lockBtnY + lockBtnH / 2 + sin(angle) * radius * 0.6;

      fill(60, 100, 100, 60 + 40 * sin(frameCount * 0.08 + i)); // Doré scintillant
      ellipse(px, py, 8, 8);
    }

    drawingContext.shadowBlur = 0;
    pop();

    console.log("✨ Illumination Digin' the Stream ACTIVE !");
  }
*/
  /*
  // Dessiner le bouton (blanc si débloqué, transparent sinon)
  drawButtonBis(
    buttonLabel,
    lockBtnX,
    lockBtnY,
    lockBtnW,
    lockBtnH,
    isUnlocked,
    isUnlocked
  );

  // Zone cliquable seulement si débloqué
  if (isUnlocked) {
    blobHitZones.push({
      type: "streamMode",
      x: lockBtnX,
      y: lockBtnY,
      w: lockBtnW,
      h: lockBtnH,
    });
  }*/
}

function drawPostMiniGameWinView() {
  //imageMode(CORNER);
  //image(winBackground, 0, 0, width, height);
  background(0, 0, 10); // Fond uni pour simplifier
  textAlign(LEFT, CENTER); // ← important : LEFT + largeur fixée
  textWrap(WORD);
  fill(0, 0, 100);
  textFont("sans-serif");
  let baseY = height / 2 - 140;
  let spacing = isMobile ? 94 : 30;
  let maxTextWidth = width * 0.85;
  let textX = width / 2 - maxTextWidth / 2; // ← centre visuel

  // 🎉 Titre
  textAlign(CENTER, CENTER);
  textSize(isMobile ? 64 : 28);
  text("🎉 Bravo !", width / 2, baseY);

  // ✅ Confirmation
  textSize(isMobile ? 50 : 18);
  text("Tu as gagné la musique : ", width / 2, baseY + spacing);

  // 🎵 Musique
  if (lastMiniGameTrack) {
    let title = lastMiniGameTrack.title || "Titre inconnu";
    let artist = lastMiniGameTrack.artist || "Artiste inconnu";
    fill(0, 0, 95);
    textSize(isMobile ? 60 : 16);
    textAlign(CENTER, CENTER);

    text(`${title} – ${artist}`, width / 2, baseY + spacing * 2); // 👈 pas de largeur
  }

  // 🧠 Anecdote
  let anecdote = getMiniGameAnecdote(currentMiniGameType, lastMiniGameTrack);
  fill(0, 0, 85);
  textSize(isMobile ? 38 : 14);
  text(anecdote, textX, baseY + spacing * 3, maxTextWidth);

  // 💡 Astuce
  /*fill(0, 0, 80);
  textSize(isMobile ? 28 : 14);
  text(
    "💡 Astuce : cherche une musique suisse pour marquer plus de points !",
    textX,
    baseY + spacing * 4,
    maxTextWidth
  );*/

  // 💠 Blob musique

  if (lastMiniGameTrack) {
    let scalePulse = 1 + 0.05 * sin(frameCount * 0.1);
    push();
    translate(width / 2, baseY + spacing * 6 - 800);
    scale(scalePulse);
    drawTrackBlob(lastMiniGameTrack, 0, 0, 120, 0, false, true);
    pop();
  }

  // 🟦 Bouton continuer
  let btnW = isMobile ? 820 : 240;
  let btnH = isMobile ? 130 : 55;
  let btnX = width / 2 - btnW / 2;
  let btnY = baseY + spacing * 7 + 30;

  // ✨ Changer le texte du bouton si on vient de débloquer
  //let justUnlocked = localStorage.getItem("btm_justUnlockedStream") === "true";
  //let buttonText = justUnlocked ? "Découvrir la surprise !" : "Continuer";

  drawButton("Continuer", btnX, btnY, btnW, btnH, true);

  blobHitZones.push({
    type: "continueExploration",
    x: btnX,
    y: btnY,
    w: btnW,
    h: btnH,
  });
  drawCloseButton();
}

function getMiniGameAnecdote(type, track) {
  if (!track) return "";

  let genre = track.genre || "inconnu";
  let tempo = track.tempo ? Math.round(track.tempo) : "un tempo inconnu";

  // Messages motivants basés sur les points
  let motivationalMessage = "";
  let pointsToNextGoal = 0;

  if (playerScore < 5) {
    pointsToNextGoal = 5 - playerScore;
    motivationalMessage = `💪 Plus que ${pointsToNextGoal} point${
      pointsToNextGoal > 1 ? "s" : ""
    } avant de pouvoir digger ! Continue comme ça !`;
  } else if (playerScore < 10) {
    pointsToNextGoal = 10 - playerScore;
    motivationalMessage = `🔥 Tu peux maintenant digger ! Plus que ${pointsToNextGoal} point${
      pointsToNextGoal > 1 ? "s" : ""
    } pour débloquer quelque chose d'encore plus cool...`;
  } else if (playerScore < 25) {
    pointsToNextGoal = 25 - playerScore;
    motivationalMessage = `🚀 Tu es sur la bonne voie ! Plus que ${pointsToNextGoal} point${
      pointsToNextGoal > 1 ? "s" : ""
    } pour devenir un vrai expert musical !`;
  } else if (playerScore < 50) {
    pointsToNextGoal = 50 - playerScore;
    motivationalMessage = `⭐ Impressionnant ! Plus que ${pointsToNextGoal} point${
      pointsToNextGoal > 1 ? "s" : ""
    } pour atteindre le niveau maître !`;
  } else {
    motivationalMessage = `👑 Tu es devenu un maître de la musique ! Continue d'explorer pour enrichir ta collection !`;
  }

  let baseMessage = "";
  switch (type) {
    case "tempo":
      baseMessage = `⚡ Ce morceau a un tempo de ${tempo} BPM — parfait pour te booster !`;
      break;
    case "visual_match":
      baseMessage = `Tu as bien matché la vibe visuelle de ce son.`;
      break;
    case "genre":
      baseMessage = `Tu as identifié le genre "${genre}" avec justesse !`;
      break;
    default:
      baseMessage = `Une belle découverte musicale !`;
  }

  return `${baseMessage}\n\n${motivationalMessage}`;
}

function drawCloseButton() {
  // Position en haut à droite
  let closeSize = isMobile ? 60 : 40;
  let margin = isMobile ? 30 : 20;
  let closeX = width - closeSize - margin - 40;
  let closeY = margin + 40; // ✅ AJOUTER +50 pour descendre le bouton

  // Fond semi-transparent
  push();
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = "rgba(0, 0, 0, 0.4)";

  /*fill(0, 0, 0, 150);
  stroke(0, 0, 100);
  strokeWeight(2);
  ellipse(closeX + closeSize / 2, closeY + closeSize / 2, closeSize, closeSize);

  drawingContext.shadowBlur = 0;*/
  pop();

  // Croix blanche
  stroke(0, 0, 100);
  strokeWeight(isMobile ? 6 : 3);
  strokeCap(ROUND);

  let crossSize = closeSize * 0.4;
  let centerX = closeX + closeSize / 2;
  let centerY = closeY + closeSize / 2;

  // Lignes de la croix
  line(
    centerX - crossSize / 2,
    centerY - crossSize / 2,
    centerX + crossSize / 2,
    centerY + crossSize / 2
  );
  line(
    centerX + crossSize / 2,
    centerY - crossSize / 2,
    centerX - crossSize / 2,
    centerY + crossSize / 2
  );

  noStroke();

  // Zone cliquable
  blobHitZones.push({
    type: "closeButton",
    x: closeX,
    y: closeY,
    w: closeSize,
    h: closeSize,
  });
}

// Variables globales pour le scroll de la collection
if (typeof window.collectionScrollY === "undefined") {
  window.collectionScrollY = 0;
}
if (typeof window.collectionContentHeight === "undefined") {
  window.collectionContentHeight = 0;
}

function handleCollectionScroll(deltaY) {
  if (mode !== "collection") return false;

  let maxScroll = max(0, window.collectionContentHeight - height + 100);
  let scrollSpeed = isMobile ? 15 : 8;

  window.collectionScrollY -= deltaY * scrollSpeed;
  window.collectionScrollY = constrain(window.collectionScrollY, -maxScroll, 0);

  redraw();
  return true;
}
