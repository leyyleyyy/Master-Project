function drawExplorationView() {
  blobHitZones = [];

  fill(0, 0, 100);
  textAlign(LEFT);
  textSize(18);
  text(`Score : ${playerScore}`, 20, 38);

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

  // Génère les positions une seule fois
  if (!currentMap._blobPositions) {
    assignScatteredPositions(currentMap.tracks);
    currentMap._blobPositions = currentMap.tracks.map((t) => t.pos);
  }

  // === UI fixe : boutons map
  textAlign(CENTER, CENTER);
  textSize(14);
  let btnW = 100;
  let btnH = 30;
  let spacing = 20;
  let totalW = maps.length * (btnW + spacing) - spacing;
  let startX = width / 2 - totalW / 2;

  for (let i = 0; i < maps.length; i++) {
    let x = startX + i * (btnW + spacing);
    let y = 20;
    let isUnlocked = playerScore >= maps[i].unlockScore;

    fill(
      i === currentMapIndex
        ? isUnlocked
          ? color(120, 100, 100)
          : color(0, 0, 40)
        : color(0, 0, 20)
    );
    rect(x, y, btnW, btnH, 10);
    fill(0, 0, 100);
    let label = isUnlocked ? maps[i].name : `🔒 ${maps[i].name}`;
    text(label, x + btnW / 2, y + btnH / 2);

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

  // === UI fixe : navigation et instructions
  if (unlockedMaps.length > 1) {
    fill(0, 0, 100);
    textSize(16);
    if (currentMapIndex > 0) text("<", 40, height / 2);
    if (currentMapIndex < unlockedMaps.length - 1)
      text(">", width - 40, height / 2);
    text(currentMap.name, width / 2, 40);
  }

  // === UI fixe : bouton collection
  fill(0, 0, 20);
  rect(150, 20, 140, 35, 8);
  fill(0, 0, 100);
  textSize(14);
  text("Ma collection", 150 + 70, 38);

  // === UI fixe : instructions
  fill(0, 0, 80);
  text("Clique sur une forme pour écouter.", width / 2, 80);
  text("Puis valide pour l’ajouter à ta collection.", width / 2, 100);

  // === Zone scrollable avec blobs
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

        // Viewport culling
        if (
          x + blobSize < 0 ||
          x - blobSize > width ||
          y + blobSize < 0 ||
          y - blobSize > height
        )
          continue;

        drawTrackBlob(track, x, y, blobSize, i);

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
  // === BOUTON VALIDER TOUJOURS VISIBLE EN BAS
  let valBtnW = isMobile ? 240 : 200;
  let valBtnH = isMobile ? 55 : 45;
  let valBtnX = width / 2 - valBtnW / 2;
  let valBtnY = height - valBtnH - 20;

  if (selectedPendingTrack) {
    fill(0, 0, 100); // Blanc
  } else {
    fill(0, 0, 60); // Gris clair si inactif
  }
  rect(valBtnX, valBtnY, valBtnW, valBtnH, 8);

  fill(0, 0, 0); // Texte noir
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Valider", valBtnX + valBtnW / 2, valBtnY + valBtnH / 2);
}

function drawCollectionView() {
  background(0, 0, 11);

  // === TITRE & INTRO ===
  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(28);
  text("Ma Collection", width / 2, 50);
  let avatarY = 120;
  let avatarImg = document.getElementById("avatar");
  if (avatarImg) {
    avatarImg.style.left = width / 2 - 75 + "px";
    avatarImg.style.top = avatarY - 75 + "px";
    avatarImg.style.width = "150px";
    avatarImg.style.position = "absolute";
    avatarImg.style.display = "block";
  }
  textSize(14);
  fill(0, 0, 80);
  text(
    "Tu peux rejouer les sons découverts ou en débloquer de nouveaux !",
    width / 2,
    260
  );

  // === SCORE ===
  fill(0, 0, 100);
  textSize(14);
  textAlign(CENTER);
  text(`Score total : ${playerScore}`, width / 2, 290);

  // === ESPACE POUR LES FILTRES ===
  // le HTML/CSS les gère, donc ici on laisse juste de la place visuelle
}

function drawAvatarView() {
  background(260, 40, 10);

  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(isMobile ? 36 : 26);
  text("The Digging Map", width / 2, 80);

  fill(0, 0, 80);
  textSize(isMobile ? 22 : 18);
  text("Navigate styles. Discover gems.", width / 2, 140);

  let genreAvgs = getGenreAverages();
  let genreStats = getGenreStats();
  let genreUnlocked = genreStats.map((g) => g.name);
  let genreNames = Object.keys(genreAvgs);

  if (
    !window._genreBlobPositions ||
    window._genreBlobPositions.length !== genreNames.length
  ) {
    window._genreBlobPositions = genreNames.map((genre) =>
      getPositionForGenre(genre)
    );

    const firstUnlocked = genreUnlocked[0];
    if (firstUnlocked) {
      const index = genreNames.indexOf(firstUnlocked);
      const focusPos = window._genreBlobPositions[index];
      if (focusPos) {
        scrollXOffset = width / 2 - focusPos.x;
        scrollYOffset = height / 2 - focusPos.y;
      }
    }
  }

  push();
  translate(scrollXOffset, scrollYOffset);

  for (let i = 0; i < genreNames.length; i++) {
    let name = genreNames[i];
    let visual = genreAvgs[name];
    let pos = window._genreBlobPositions[i];
    let isUnlocked =
      genreUnlocked.includes(name) ||
      genreUnlocked.includes(name.toLowerCase());

    let blobVisual = { ...visual };

    // 🎨 Si non débloqué : désature et assombrit

    let fakeTrack = {
      title: name,
      genre: name,
      ...blobVisual,
    };

    let screenMin = min(windowWidth, windowHeight);
    let blobSize = isMobile ? min(screenMin * 0.45, 240) : 80;

    //drawTrackBlob(fakeTrack, pos.x, pos.y, blobSize, i);
    drawTrackBlob(fakeTrack, pos.x, pos.y, blobSize, i, false, isUnlocked);

    if (isUnlocked) {
      fill(0, 0, 100);
      textAlign(CENTER);
      textSize(isMobile ? 22 : 14);
      text(name, pos.x, pos.y + blobSize / 2 + 24);
    }
  }

  pop();
}

function drawStatBar(label, value, x, y, min, max) {
  let barW = 200;
  let pct = map(value, min, max, 0, barW);

  fill(0, 0, 80);
  textSize(14);
  textAlign(LEFT);
  text(`${label} : ${nf(value, 1, 1)}`, x, y - 8);

  fill(0, 0, 30);
  rect(x, y, barW, 10, 5);

  fill(200, 80, 100); // couleur dynamique
  rect(x, y, pct, 10, 5);
}

function drawMiniGameView() {
  background(0, 0, 11);
  textAlign(CENTER);
  fill(0, 0, 100);

  // === RESPONSIVE VARS
  let topOffset = isMobile ? 40 : 60;
  let btnW = isMobile ? width * 0.85 : min(400, width * 0.5);
  let btnH = isMobile ? 65 : 50;
  let spacing = isMobile ? 25 : 20;
  let radius = isMobile ? 20 : 12;
  let titleSize = isMobile ? 34 : 28;
  let questionSize = isMobile ? 22 : 18;
  let labelSize = isMobile ? 16 : 14;

  // === TITRE
  textSize(titleSize);
  text("🎮 MINI-JEU", width / 2, topOffset);

  // === QUESTION
  let questionY = topOffset + 40;
  fill(0, 0, 80);
  textSize(questionSize);
  text(miniGameLabel || "Quel est le tempo ?", width / 2, questionY);

  fill(0, 0, 60);
  textSize(labelSize);
  text("Écoute la musique et choisis :", width / 2, questionY + 30);

  // === BLOB CENTRAL
  let blobCenterY = height * 0.35;
  if (currentMiniGameTrack) {
    push();
    translate(width / 2, blobCenterY);
    drawTrackBlob(currentMiniGameTrack, 0, 0, isMobile ? 160 : 100, 0);
    pop();
  }

  // === RÉPONSES
  let startY = blobCenterY + (isMobile ? 160 : 120);
  for (let i = 0; i < miniGameOptions.length; i++) {
    let option = miniGameOptions[i];
    let x = width / 2 - btnW / 2;
    let y = startY + i * (btnH + spacing);
    let isSelected = selectedOption === option;

    fill(0, 0, isSelected ? 85 : 20);
    rect(x, y, btnW, btnH, radius);

    fill(0, 0, 100);
    textSize(isMobile ? 20 : 16);
    text(option + (miniGameUnit || ""), width / 2, y + btnH / 2 + 6);
  }

  // === BOUTON VALIDER TOUJOURS VISIBLE après sélection
  if (selectedOption) {
    let valBtnW = isMobile ? 240 : 200;
    let valBtnH = isMobile ? 55 : 45;
    let valX = width / 2 - valBtnW / 2;
    let valY = height - valBtnH - 20;

    fill(0, 0, 100);
    rect(valX, valY, valBtnW, valBtnH, radius);
    fill(0, 0, 0);
    textSize(isMobile ? 18 : 14);
    textAlign(CENTER, CENTER);
    text("Valider", width / 2, valY + valBtnH / 2);
  }

  // === FEEDBACK
  if (miniGameFeedback) {
    fill(
      miniGameFeedback === "correct" ? color(120, 80, 100) : color(0, 80, 100)
    );
    textSize(isMobile ? 20 : 16);
    text(
      miniGameFeedback === "correct"
        ? "✔️ Bonne réponse !"
        : "❌ Mauvaise réponse",
      width / 2,
      height - 130
    );
  }

  // === BOUTON RETOUR
  let backX = 20;
  let backY = height - 55;
  let backW = 100;
  let backH = 35;

  fill(0, 0, 20);
  rect(backX, backY, backW, backH, 8);
  fill(0, 0, 100);
  textSize(13);
  text("↩ Retour", backX + backW / 2, backY + backH / 2 + 5);
}

function drawEvolutionView() {
  if (!evolutionTrack) {
    background(0, 0, 11);
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Erreur : aucune musique en évolution", width / 2, height / 2);
    return;
  }

  background(0, 0, 11);
  textAlign(CENTER, CENTER);
  fill(0, 0, 100);

  // === Avatar morphing GIF ===
  imageMode(CENTER);
  let gifSize = isMobile ? min(width * 0.65, 280) : 200;
  image(morphingGif, width / 2, height / 2 - 130, gifSize, gifSize);

  // === Points gagnés/perdus ===
  textSize(isMobile ? 32 : 24);
  fill(evolutionPoints >= 0 ? color(120, 100, 100) : color(0, 100, 100));
  text(
    `${evolutionPoints >= 0 ? "+" : ""}${evolutionPoints} points ${
      evolutionPoints >= 0 ? "🎉" : "😞"
    }`,
    width / 2,
    height / 2 + (isMobile ? 20 : 10)
  );

  // === Musique ajoutée ===
  fill(0, 0, 80);
  textSize(isMobile ? 20 : 16);
  text(
    `Tu as ajouté : ${evolutionTrack?.title || "—"}`,
    width / 2,
    height / 2 + (isMobile ? 60 : 40)
  );

  // === Genre débloqué ===
  if (evolutionTrack?.genre) {
    fill(0, 0, 100);
    textSize(isMobile ? 20 : 16);
    text(
      `🎧 Tu as débloqué le genre : ${evolutionTrack.genre}`,
      width / 2,
      height / 2 + (isMobile ? 100 : 70)
    );
  }

  // === Analyse de style dominant ===
  /*let dominantCluster = getMostCommonCluster(playerCollection);
  let currentCluster = getMostCommonCluster([evolutionTrack]);
  let comment =
    dominantCluster === currentCluster
      ? "👀 Tu restes dans ta zone de confort..."
      : "🌍 Tu explores de nouveaux horizons, nice !";*/

  let dominantCluster = getMostCommonCluster(playerCollection);
  let evolutionComments = getEvolutionComment(evolutionTrack, dominantCluster);

  // Affichage des commentaires
  fill(0, 0, 80);
  textSize(isMobile ? 16 : 14);
  let baseY = height / 2 + (isMobile ? 140 : 100);

  for (let i = 0; i < evolutionComments.length; i++) {
    text(evolutionComments[i], width / 2, baseY + i * 26); // espacement vertical
  }

  /*
  fill(0, 0, 80);
  textSize(isMobile ? 18 : 14);
  text(comment, width / 2, height / 2 + (isMobile ? 140 : 100));
*/
  // === Bouton continuer ===
  let btnW = isMobile ? 240 : 200;
  let btnH = isMobile ? 60 : 50;
  let btnX = width / 2 - btnW / 2;
  let btnY = height - (isMobile ? 80 : 100);

  fill(0, 0, 100);
  rect(btnX, btnY, btnW, btnH, 12);
  fill(0, 0, 0);
  textSize(isMobile ? 20 : 18);
  text("Continuer", width / 2, btnY + btnH / 2);
}
