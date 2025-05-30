/*
function drawTrackBlob(track, cx, cy, maxSize, index, fixedWhiteMode = false) {
  let { tempo, energy, danceability, key, valence } = track;
  let isSelected = selectedTrack && selectedTrack.title === track.title;

  if (isSelected) {
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = color(270, 30, 100, 60);
  } else {
    drawingContext.shadowBlur = 0;
  }

  let numBlobs = int(map(energy, minMax.energy.min, minMax.energy.max, 1, 3));
  let deformation = map(
    danceability,
    minMax.danceability.min,
    minMax.danceability.max,
    0.2,
    2
  );

  // ✅ Taille amplifiée
  let baseSize =
    map(key, minMax.key.min, minMax.key.max, 0.9, 1.6) * (maxSize / 1.3);
  let alphaFalloff = 100;

  let hue = 0,
    color1,
    color2;
  if (fixedWhiteMode) {
    color1 = color(0, 0, 100);
    color2 = color(0, 0, 100);
  } else {
    let tempoNorm = map(tempo, minMax.tempo.min, minMax.tempo.max, 0, 1);
    let valenceNorm = map(
      valence,
      minMax.valence.min,
      minMax.valence.max,
      0,
      1
    );
    hue = (tempoNorm * 280 + valenceNorm * 80) % 360;
    color1 = color((hue + 20) % 360, 100, 100);
    color2 = color((hue + 180) % 360, 100, 100);
  }

  let detail = int(map(energy, minMax.energy.min, minMax.energy.max, 30, 100));
  let freqX = map(key, minMax.key.min, minMax.key.max, 0.1, 1.5);
  let freqY = map(key, minMax.key.min, minMax.key.max, 0.1, 1.5);

  for (let b = 0; b < numBlobs; b++) {
    let angleOffset = (TWO_PI * b) / numBlobs;
    let bx = cx + (cos(angleOffset) * maxSize) / 4;
    let by = cy + (sin(angleOffset) * maxSize) / 4;

    for (let r = baseSize; r > 5; r -= 2) {
      let tRadius = map(r, 5, baseSize, 0, 1);
      let col = lerpColor(color1, color2, tRadius);
      col.setAlpha(map(r, baseSize, 5, alphaFalloff, 0));
      fill(col);

      beginShape();
      for (let i = 0; i < detail; i++) {
        let angle = map(i, 0, detail, 0, TWO_PI);
        let nx = cos(angle) * freqX + index * 0.1;
        let ny = sin(angle) * freqY + b * 0.1;
        let noiseVal = noise(nx, ny, fixedWhiteMode ? 0 : t);
        let deform = map(noiseVal, 0, 1, 1 - deformation, 1 + deformation);
        let finalR = r * deform;

        if (!fixedWhiteMode) {
          let pulseStrength = map(
            energy,
            minMax.energy.min,
            minMax.energy.max,
            0.02,
            0.12
          );
          finalR *= 1 + pulseStrength * sin(t + index * 0.3 + b * 0.5);
        }

        let x = bx + cos(angle) * finalR;
        let y = by + sin(angle) * finalR;
        vertex(x, y);
      }
      endShape(CLOSE);
    }
  }

  blobHitZones.push({ x: cx, y: cy, r: maxSize / 2, track, type: "blob" });
}
*/
/*function drawTrackBlob(track, cx, cy, maxSize, index) {
  let isSelected = selectedTrack && selectedTrack.title === track.title;
  let { tempo, energy, danceability, key, valence } = track;

  let numBlobs = int(map(energy, minMax.energy.min, minMax.energy.max, 1, 3));
  let deformation = map(
    danceability,
    minMax.danceability.min,
    minMax.danceability.max,
    0.2,
    2
  );
  let baseSize =
    map(key, minMax.key.min, minMax.key.max, 0.4, 1.2) * (maxSize / 2.5);
  let alphaFalloff = map(
    valence,
    minMax.valence.min,
    minMax.valence.max,
    100,
    10
  );

  let tempoNorm = map(tempo, minMax.tempo.min, minMax.tempo.max, 0, 1);
  let valenceNorm = map(valence, minMax.valence.min, minMax.valence.max, 0, 1);
  let hue = (tempoNorm * 280 + valenceNorm * 80) % 360;

  let color1 = color((hue + 20) % 360, 100, 100);
  let color2 = color((hue + 180) % 360, 100, 100);

  let detail = int(map(energy, minMax.energy.min, minMax.energy.max, 30, 100));
  let freqX = map(key, minMax.key.min, minMax.key.max, 0.1, 1.5);
  let freqY = map(key, minMax.key.min, minMax.key.max, 0.1, 1.5);

  for (let b = 0; b < numBlobs; b++) {
    let angleOffset = (TWO_PI * b) / numBlobs;
    let bx = cx + (cos(angleOffset) * maxSize) / 4;
    let by = cy + (sin(angleOffset) * maxSize) / 4;

    for (let r = baseSize; r > 5; r -= 2) {
      let tRadius = map(r, 5, baseSize, 0, 1);
      let col = lerpColor(color1, color2, tRadius);
      col.setAlpha(map(r, baseSize, 5, alphaFalloff, 0));
      fill(col);

      if (isSelected) {
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = color(270, 30, 100, 60);
      } else {
        drawingContext.shadowBlur = 0;
      }

      beginShape();
      for (let i = 0; i < detail; i++) {
        let angle = map(i, 0, detail, 0, TWO_PI);
        let nx = cos(angle) * freqX + index * 0.1;
        let ny = sin(angle) * freqY + b * 0.1;
        let noiseVal = noise(nx, ny, t);
        let deform = map(noiseVal, 0, 1, 1 - deformation, 1 + deformation);
        let finalR = r * deform;

        let pulseStrength = map(
          energy,
          minMax.energy.min,
          minMax.energy.max,
          0.02,
          0.12
        );
        finalR *= 1 + pulseStrength * sin(t + index * 0.3 + b * 0.5);

        let x = bx + cos(angle) * finalR;
        let y = by + sin(angle) * finalR;
        vertex(x, y);
      }
      endShape(CLOSE);
      drawingContext.shadowBlur = 0;
    }
  }

  blobHitZones.push({ x: cx, y: cy, r: maxSize / 2, track });
}
*/
/*
function drawTrackBlob(track, cx, cy, maxSize, index, fixedWhiteMode = false) {
  let { tempo, energy, danceability, key, valence } = track;
  let isSelected = selectedTrack && selectedTrack.title === track.title;

  if (isSelected) {
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = color(270, 30, 100, 60);
  } else {
    drawingContext.shadowBlur = 0;
  }
  let numBlobs = int(map(energy, minMax.energy.min, minMax.energy.max, 1, 3));
  let deformation = map(
    danceability,
    minMax.danceability.min,
    minMax.danceability.max,
    0.2,
    2
  );
  let baseSize =
    map(key, minMax.key.min, minMax.key.max, 0.4, 1.2) * (maxSize / 2.5);
  let alphaFalloff = 100;

  let hue = 0,
    color1,
    color2;
  if (fixedWhiteMode) {
    color1 = color(0, 0, 100);
    color2 = color(0, 0, 100);
  } else {
    let tempoNorm = map(tempo, minMax.tempo.min, minMax.tempo.max, 0, 1);
    let valenceNorm = map(
      valence,
      minMax.valence.min,
      minMax.valence.max,
      0,
      1
    );
    hue = (tempoNorm * 280 + valenceNorm * 80) % 360;
    color1 = color((hue + 20) % 360, 100, 100);
    color2 = color((hue + 180) % 360, 100, 100);
  }

  let detail = int(map(energy, minMax.energy.min, minMax.energy.max, 30, 100));
  let freqX = map(key, minMax.key.min, minMax.key.max, 0.1, 1.5);
  let freqY = map(key, minMax.key.min, minMax.key.max, 0.1, 1.5);

  for (let b = 0; b < numBlobs; b++) {
    let angleOffset = (TWO_PI * b) / numBlobs;
    let bx = cx + (cos(angleOffset) * maxSize) / 4;
    let by = cy + (sin(angleOffset) * maxSize) / 4;

    for (let r = baseSize; r > 5; r -= 2) {
      let tRadius = map(r, 5, baseSize, 0, 1);
      let col = lerpColor(color1, color2, tRadius);
      col.setAlpha(map(r, baseSize, 5, alphaFalloff, 0));
      fill(col);

      beginShape();
      for (let i = 0; i < detail; i++) {
        let angle = map(i, 0, detail, 0, TWO_PI);
        let nx = cos(angle) * freqX + index * 0.1;
        let ny = sin(angle) * freqY + b * 0.1;
        let noiseVal = noise(nx, ny, fixedWhiteMode ? 0 : t); // plus de mouvement
        let deform = map(noiseVal, 0, 1, 1 - deformation, 1 + deformation);
        let finalR = r * deform;

        if (!fixedWhiteMode) {
          let pulseStrength = map(
            energy,
            minMax.energy.min,
            minMax.energy.max,
            0.02,
            0.12
          );
          finalR *= 1 + pulseStrength * sin(t + index * 0.3 + b * 0.5);
        }

        let x = bx + cos(angle) * finalR;
        let y = by + sin(angle) * finalR;
        vertex(x, y);
      }
      endShape(CLOSE);
    }
  }

  blobHitZones.push({ x: cx, y: cy, r: maxSize / 2, track, type: "blob" });
}*/
/*
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

  // UI fixe : boutons de map
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
        ? color(60, 100, 60)
        : isUnlocked
        ? color(0, 0, 30)
        : color(0, 0, 10)
    );
    rect(x, y, btnW, btnH, 6);
    fill(isUnlocked ? 100 : 50);
    let label = isUnlocked ? maps[i].name : `🔒 ${maps[i].name}`;
    text(label, x + btnW / 2, y + btnH / 2);

    blobHitZones.push({
      type: "mapButton",
      index: i,
      x,
      y,
      w: btnW,
      h: btnH,
      isUnlocked,
    });
  }

  // UI fixe : flèches navigation
  if (unlockedMaps.length > 1) {
    fill(0, 0, 100);
    textSize(16);
    if (currentMapIndex > 0) text("<", 40, height / 2);
    if (currentMapIndex < unlockedMaps.length - 1)
      text(">", width - 40, height / 2);
    text(currentMap.name, width / 2, 40);
  }

  // UI fixe : instructions et bouton collection
  fill(0, 0, 20);
  rect(150, 20, 140, 35, 8);
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("Ma collection", 150 + 70, 38);

  textSize(14);
  fill(0, 0, 80);
  text("Clique sur une forme pour écouter.", width / 2, 80);
  text("Puis valide pour l’ajouter à ta collection.", width / 2, 100);

  let padding = 20;
  let cols = floor(width / 180);
  cols = max(cols, 2);
  let baseCellSize = (width - padding * (cols + 1)) / cols;
  let cellSize = isMobile ? baseCellSize * 3 : baseCellSize;

  // Scrollable zone : blobs + textes
  push();
  translate(scrollXOffset, scrollYOffset);

  let visibleCount = getVisibleTracksCount();
  for (let i = 0; i < visibleCount && i < allBlobs.length; i++) {
    let track = allBlobs[i];
    drawTrackBlob(track, track.pos.x, track.pos.y, cellSize, i);
  }

  pop();
}
*/
/*
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

  // ✅ Génère les positions une fois par carte
  if (!currentMap._blobPositions) {
    currentMap._blobPositions = [];
    for (let track of currentMap.tracks) {
      track.pos = getPositionForGenre(track.genre);
      currentMap._blobPositions.push(track.pos);
    }
  }

  // === UI fixe : boutons de map
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
        ? color(60, 100, 60)
        : isUnlocked
        ? color(0, 0, 30)
        : color(0, 0, 10)
    );
    rect(x, y, btnW, btnH, 6);
    fill(isUnlocked ? 100 : 50);
    let label = isUnlocked ? maps[i].name : `🔒 ${maps[i].name}`;
    text(label, x + btnW / 2, y + btnH / 2);

    blobHitZones.push({
      type: "mapButton",
      index: i,
      x,
      y,
      w: btnW,
      h: btnH,
      isUnlocked,
    });
  }

  // === UI fixe : flèches navigation
  if (unlockedMaps.length > 1) {
    fill(0, 0, 100);
    textSize(16);
    if (currentMapIndex > 0) text("<", 40, height / 2);
    if (currentMapIndex < unlockedMaps.length - 1)
      text(">", width - 40, height / 2);
    text(currentMap.name, width / 2, 40);
  }

  // === UI fixe : instructions et bouton collection
  fill(0, 0, 20);
  rect(150, 20, 140, 35, 8);
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("Ma collection", 150 + 70, 38);

  textSize(14);
  fill(0, 0, 80);
  text("Clique sur une forme pour écouter.", width / 2, 80);
  text("Puis valide pour l’ajouter à ta collection.", width / 2, 100);

  let padding = 20;
  let cols = floor(width / 180);
  cols = max(cols, 2);
  let baseCellSize = (width - padding * (cols + 1)) / cols;
  let cellSize = isMobile ? baseCellSize * 3 : baseCellSize;

  // === Scrollable zone : blobs + textes
  push();
  translate(scrollXOffset, scrollYOffset);

  let visibleCount = getVisibleTracksCount();
  for (let i = 0; i < visibleCount && i < allBlobs.length; i++) {
    let track = allBlobs[i];

    // Sécurité si track.pos n’existe pas encore
    if (!track.pos) {
      track.pos = getPositionForGenre(track.genre);
    }

    drawTrackBlob(track, track.pos.x, track.pos.y, cellSize, i);
  }

  pop();
}
*/

/*
function drawMiniGameView() {
  background(0, 0, 11);

  // Sécurité : rien à afficher si options absentes
  if (!miniGameOptions || miniGameOptions.length === 0 || !miniGameLabel) {
    fill(0, 0, 80);
    textAlign(CENTER);
    textSize(16);
    text("Chargement du mini-jeu...", width / 2, height / 2);
    return;
  }

  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(20);
  text(`Mini-jeu 🎮`, width / 2, 50);

  fill(0, 0, 100);
  textSize(16);
  text(miniGameLabel || "Question ?", width / 2, 100);

  fill(0, 0, 80);
  textSize(14);
  text("Écoute et choisis la bonne réponse.", width / 2, 80);

  for (let i = 0; i < miniGameOptions.length; i++) {
    let option = miniGameOptions[i];
    let btnX = width / 2 - 100;
    let btnY = 150 + i * 60;
    let btnW = 200;
    let btnH = 40;

    fill(0, 0, 20);
    rect(btnX, btnY, btnW, btnH, 8);
    fill(0, 0, 100);
    textSize(14);
    text(`${option}${miniGameUnit || ""}`, width / 2, btnY + btnH / 2);
  }

  if (miniGameFeedback) {
    fill(
      miniGameFeedback === "correct" ? color(120, 80, 100) : color(0, 80, 100)
    );
    textSize(18);
    text(
      miniGameFeedback === "correct" ? "✔️ Bravo !" : "❌ Mauvaise réponse",
      width / 2,
      height - 120
    );

    fill(0, 0, 20);
    rect(width / 2 - 100, height - 80, 200, 45, 10);
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Valider la réponse", width / 2, height - 57);
  }

  fill(0, 0, 20);
  rect(40, height - 60, 100, 35, 8);
  fill(0, 0, 100);
  textSize(14);
  text("↩ Retour", 90, height - 42);
}
  */

/*
function drawAvatarView() {
  background(260, 40, 10);

  let genreAvgs = getGenreAverages();
  let genreStats = getGenreStats();
  let genreUnlocked = genreStats.map((g) => g.name);
  let genreNames = Object.keys(genreAvgs);

  // === Avatar centré haut
  let avatarY = 120;
  let avatarImg = document.getElementById("avatar");
  if (avatarImg) {
    avatarImg.style.left = width / 2 - 75 + "px";
    avatarImg.style.top = avatarY - 75 + "px";
    avatarImg.style.width = "150px";
    avatarImg.style.position = "absolute";
    avatarImg.style.display = "block";
  }

  // === Génération aléatoire des positions des genres (fixe une fois)
  if (
    !window._genreBlobPositions ||
    window._genreBlobPositions.length !== genreNames.length
  ) {
    window._genreBlobPositions = [];

    if (
      !window._genreBlobPositions ||
      window._genreBlobPositions.length !== genreNames.length
    ) {
      window._genreBlobPositions = [];

      for (let i = 0; i < genreNames.length; i++) {
        let cx, cy;
        let tries = 0;
        let overlap = false;
        let distanceFromCenter = 0;
        let distanceFromAvatar = 0;

        do {
          let mapW = isMobile ? width * 3 : width;
        let mapH = isMobile ? height * 3 : height;
        cx = random(100, mapW - 100);
          cy = random(160, height - 140);

          distanceFromCenter = dist(cx, cy, width / 2, height / 2);
          distanceFromAvatar = dist(cx, cy, width / 2, 120);
          overlap = window._genreBlobPositions.some(
            (pos) => dist(pos.x, pos.y, cx, cy) < 110
          );
          tries++;
        } while (
          (distanceFromCenter < 130 || distanceFromAvatar < 130 || overlap) &&
          tries < 100
        );

        window._genreBlobPositions.push({ x: cx, y: cy });
      }
    }
  }

  // === Affichage des blobs de genre
  for (let i = 0; i < genreNames.length; i++) {
    let name = genreNames[i];
    let visual = genreAvgs[name];
    let isUnlocked = genreUnlocked.includes(name);
    let pos = window._genreBlobPositions[i];
    let fakeTrack = { title: name, ...visual };

    push();
    if (isUnlocked) {
      let blobSize = isMobile ? 160 : 80;
      let x = pos.x + scrollXOffset;
      let y = pos.y + scrollYOffset;
      drawTrackBlob(fakeTrack, x, y, blobSize, i);
    } else {
      let blobSize = isMobile ? 160 : 80;
      let x = pos.x + scrollXOffset;
      let y = pos.y + scrollYOffset;
      drawTrackBlob(fakeTrack, x, y, blobSize, i, true); // blanc immobile
    }
    pop();

    if (isUnlocked) {
      fill(0, 0, 100);
      textAlign(CENTER);
      textSize(12);
      text(name, pos.x, pos.y + 50);
    }
  }
}
*/

/*function drawAvatarView() {
  background(260, 40, 10);

  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(isMobile ? 64 : 48);
  text("The Digging Map", width / 2, 80);

  fill(0, 0, 80);
  textSize(isMobile ? 38 : 28);
  text("Navigate styles. Discover gems.", width / 2, 150);

  let genreAvgs = getGenreAverages();
  let genreStats = getGenreStats();
  let genreUnlocked = genreStats.map((g) => g.name);
  let genreNames = Object.keys(genreAvgs);

  if (
    !window._genreBlobPositions ||
    window._genreBlobPositions.length !== genreNames.length
  ) {
    window._genreBlobPositions = [];
    let mapW = isMobile ? width * 5 : width * 2;
    let mapH = isMobile ? height * 5 : height * 2;

    for (let i = 0; i < genreNames.length; i++) {
      let cx, cy;
      let tries = 0;
      let overlap = false;

      do {
        cx = random(-mapW / 2, mapW / 2);
        cy = random(-mapH / 2, mapH / 2);
        overlap = window._genreBlobPositions.some(
          (pos) => dist(pos.x, pos.y, cx, cy) < 180
        );
        tries++;
      } while (overlap && tries < 100);

      window._genreBlobPositions.push({ x: cx, y: cy });
    }
  }

  push();
  translate(scrollXOffset, scrollYOffset);

  for (let i = 0; i < genreNames.length; i++) {
    let name = genreNames[i];
    let visual = genreAvgs[name];
    let isUnlocked = genreUnlocked.includes(name);
    let pos = window._genreBlobPositions[i];
    let fakeTrack = { title: name, ...visual };
    let screenMin = min(windowWidth, windowHeight);
    let blobSize = isMobile ? min(screenMin * 0.45, 240) : 80;
    let x = pos.x;
    let y = pos.y;

    if (isUnlocked) {
      drawTrackBlob(fakeTrack, x, y, blobSize, i);
      fill(0, 0, 100);
      textAlign(CENTER);
      textSize(isMobile ? 18 : 12);
      text(name, x, y + blobSize / 2 + 20);
    } else {
      drawTrackBlob(fakeTrack, x, y, blobSize, i, true);
    }
  }

  pop();
}
*/

/*
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

  // Génération des positions + centrage sur premier genre débloqué
  if (
    !window._genreBlobPositions ||
    window._genreBlobPositions.length !== genreNames.length
  ) {
    window._genreBlobPositions = genreNames.map((genre) =>
      getPositionForGenre(genre)
    );

    // ✅ centrer la vue sur le premier genre débloqué
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
  translate(scrollXOffset, scrollYOffset); // ✅ scroll activé

  for (let i = 0; i < genreNames.length; i++) {
    let name = genreNames[i];
    let visual = genreAvgs[name];
    let pos = window._genreBlobPositions[i];
    let isUnlocked =
      genreUnlocked.includes(name) ||
      genreUnlocked.includes(name.toLowerCase());
    let fakeTrack = {
      title: name,
      genre: name,
      ...visual,
    };

    let screenMin = min(windowWidth, windowHeight);
    let blobSize = isMobile ? min(screenMin * 0.45, 240) : 80;

    push();
    if (!isUnlocked) {
      // Appliquer un filtre gris si le genre est verrouillé
      tint(0, 0, 70); // gris pâle
    }

    drawTrackBlob(fakeTrack, pos.x, pos.y, blobSize, i);
    pop();

    if (isUnlocked) {
      fill(0, 0, 100);
      textAlign(CENTER);
      textSize(isMobile ? 22 : 14);
      text(name, pos.x, pos.y + blobSize / 2 + 24);
    }
  }

  pop();
}
*/
/*
window.addEventListener("DOMContentLoaded", () => {
  const avatarEl = document.getElementById("avatar");
  // Toggle burger menu
  document.getElementById("burgerMenuToggle").addEventListener("click", () => {
    const menu = document.getElementById("burgerMenu");
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  });

  // Navigation
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;

      // Referme le menu automatiquement
      document.getElementById("burgerMenu").style.display = "none";
    });
  });

  if (avatarEl) {
    avatarEl.addEventListener("click", () => {
      if (mode !== "onboarding") {
        mode = "avatar";
      }
    });
  }

  document.getElementById("shuffleBtn").addEventListener("click", () => {
    if (mode === "avatar") {
      mode = "collection";

      // 👇 effet visuel au clic
      let btn = document.getElementById("shuffleBtn");
      btn.style.boxShadow = "0 0 20px rgba(255,255,255,0.8)";
      btn.style.transform = "scale(1.15)";
      setTimeout(() => {
        btn.style.boxShadow = "";
        btn.style.transform = "scale(1)";
      }, 200);
    }
  });

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.genre) {
        activeFilters.genre = btn.dataset.genre;
      }
      if (btn.dataset.energy) {
        activeFilters.energy = btn.dataset.energy;
      }
      if (btn.dataset.dance) {
        activeFilters.dance = btn.dataset.dance;
      }
    });
  });
});

*/
/*
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

  //VISUAL MATCH
  if (currentMiniGameType === "visual_match") {
    for (let blob of miniGameBlobs) {
      push();
      translate(blob.x, blob.y);
      drawTrackBlob(blob.track, 0, 0, blob.r, 0);
      pop();
    }
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
*/

/*
function drawAvatarView() {
  background(260, 40, 10);
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
*/
