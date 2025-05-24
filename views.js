function drawExplorationView() {
  blobHitZones = [];
  fill(0, 0, 100);
  textAlign(LEFT);
  textSize(18);
  text(`Score : ${playerScore}`, 20, 38);

  let unlockedMaps = getUnlockedMaps();

  // Si aucune map n’est disponible, on affiche un message et on stoppe le rendu
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

  // Sécurité pour éviter les crashs si l’index est trop élevé
  if (currentMapIndex >= unlockedMaps.length) {
    currentMapIndex = unlockedMaps.length - 1;
  }

  let currentMap = unlockedMaps[currentMapIndex];
  // Dessiner les boutons de navigation par map
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

    // Fond du bouton
    if (i === currentMapIndex) {
      fill(60, 100, 60); // surlignage map active
    } else if (isUnlocked) {
      fill(0, 0, 30);
    } else {
      fill(0, 0, 10); // grisé pour verrouillé
    }
    rect(x, y, btnW, btnH, 6);

    // Texte
    fill(isUnlocked ? 100 : 50);
    let label = isUnlocked ? maps[i].name : `🔒 ${maps[i].name}`;
    text(label, x + btnW / 2, y + btnH / 2);

    // Zone cliquable stockée
    blobHitZones.push({
      type: "mapButton",
      index: i,
      x: x,
      y: y,
      w: btnW,
      h: btnH,
      isUnlocked: isUnlocked,
    });
  }

  // Flèches de navigation
  if (unlockedMaps.length > 1) {
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(16);
    if (currentMapIndex > 0) {
      text("<", 40, height / 2);
    }
    if (currentMapIndex < unlockedMaps.length - 1) {
      text(">", width - 40, height / 2);
    }

    text(currentMap.name, width / 2, 40);
  }

  if (justWonMiniGame && remainingSelections > 0) {
    fill(0, 0, 100);
    textSize(16);
    textAlign(CENTER);
    text(
      "Encore " + remainingSelections + " musique(s) à ajouter",
      width / 2,
      80
    );
  }

  // Bouton "Ma collection"
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
  let cellSize = (width - padding * (cols + 1)) / cols;

  // Répartition aléatoire des blobs sur la map
  // Génère et mémorise la position des blobs pour chaque map, pour qu'ils restent stables
  if (
    !currentMap._blobPositions ||
    currentMap._blobPositions.length !== currentMap.tracks.length
  ) {
    let margin = 100;
    currentMap._blobPositions = currentMap.tracks.map(() => ({
      x: random(margin, width - margin),
      y: random(height / 2, height - margin),
    }));
  }

  allBlobs = currentMap.tracks.map((track, idx) => ({
    ...track,
    pos: { ...currentMap._blobPositions[idx] },
  }));

  let visibleCount = getVisibleTracksCount();
  for (let i = 0; i < visibleCount && i < allBlobs.length; i++) {
    let track = allBlobs[i];
    let x = track.pos.x + scrollXOffset;
    let y = track.pos.y + scrollYOffset;

    if (x < -300 || x > width + 300 || y < -300 || y > height + 300) continue;

    drawTrackBlob(track, x, y, cellSize, i);
  }

  if (selectedPendingTrack) {
    let panelWidth = 280;
    let panelX = width - panelWidth;
    let btnW = panelWidth - 40;
    let btnH = 45;
    let btnX = panelX + 20;
    let baseY = height / 2 - 20;
    let validerY = baseY;

    fill(0, 0, 15);
    rect(panelX, 0, panelWidth, height);

    fill(0, 0, 100); // White button
    rect(btnX, validerY, btnW, btnH, 10);
    fill(0, 0, 0); // Black text
    textAlign(CENTER, CENTER);
    textSize(16);
    text(
      "Ajouter ce son à ma collection",
      panelX + panelWidth / 2,
      validerY + btnH / 2
    );
  }

  // Feedbacks points
  for (let i = pointFeedbacks.length - 1; i >= 0; i--) {
    let f = pointFeedbacks[i];
    fill(
      f.points > 0 ? color(120, 80, 100, f.alpha) : color(0, 80, 100, f.alpha)
    );
    textSize(f.size);
    textAlign(LEFT);
    text(`${f.points > 0 ? "+" : ""}${f.points}`, f.x, f.y);
    f.y -= 1;
    f.alpha -= 5;
    f.size *= 0.97;
    if (f.alpha <= 0) {
      pointFeedbacks.splice(i, 1);
    }
  }
}

function drawCollectionView() {
  background(0, 0, 11);

  // === TITRE & INTRO ===
  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(28);
  text("Ma Collection", width / 2, 50);

  textSize(14);
  fill(0, 0, 80);
  text(
    "Tu peux rejouer les sons découverts ou en débloquer de nouveaux !",
    width / 2,
    80
  );

  // === SCORE ===
  fill(0, 0, 100);
  textSize(14);
  textAlign(CENTER);
  text(`Score total : ${playerScore}`, width / 2, 110);

  // === ESPACE POUR LES FILTRES ===
  // le HTML/CSS les gère, donc ici on laisse juste de la place visuelle
  let filtersOffset = 70;

  // === FILTRAGE ===
  let filteredCollection = playerCollection.filter((track) => {
    let genreOK =
      activeFilters.genre === "All" ||
      (track.genre && track.genre.includes(activeFilters.genre));
    let energyOK = true;
    let danceOK = true;

    if (activeFilters.energy) {
      let e = track.energy;
      if (activeFilters.energy === "low") energyOK = e < 0.15;
      if (activeFilters.energy === "mid") energyOK = e >= 0.15 && e <= 0.23;
      if (activeFilters.energy === "high") energyOK = e > 0.23;
    }

    if (activeFilters.dance) {
      let d = track.danceability;
      if (activeFilters.dance === "low") danceOK = d < 1.4;
      if (activeFilters.dance === "mid") danceOK = d >= 1.4 && d <= 1.8;
      if (activeFilters.dance === "high") danceOK = d > 1.8;
    }

    return genreOK && energyOK && danceOK;
  });

  collectionHitZones = [];

  if (filteredCollection.length === 0) {
    fill(0, 0, 70);
    textAlign(CENTER);
    textSize(16);
    text(
      "Aucun morceau ne correspond à ces filtres pour l’instant.",
      width / 2,
      height / 2
    );
  } else {
    // === GRILLE CENTRÉE ET RESPIRANTE ===
    let cols = floor((width - 80) / 180);
    cols = max(cols, 2);
    let cellSize = min(140, (width - 80) / cols - 20);
    let spacing = cellSize + 40;
    let startY = 180 + filtersOffset;

    for (let i = 0; i < filteredCollection.length; i++) {
      let track = filteredCollection[i];
      let row = floor(i / cols);
      let col = i % cols;
      let totalWidth = (cols - 1) * spacing;
      let x = width / 2 - totalWidth / 2 + col * spacing;
      let y = startY + row * spacing;

      drawTrackBlob(track, x, y, cellSize, i);
      collectionHitZones.push({ x, y, r: cellSize / 2, track });

      fill(0, 0, 100);
      textAlign(CENTER);
      textSize(12);
      text(track.title, x, y + cellSize / 2 + 16);
    }
  }

  // === BOUTON MAP CENTRÉ EN BAS ===
  let btnW = 100;
  let btnH = 30;
  let mapBtnX = width / 2 - btnW / 2;
  let mapBtnY = height - 60;

  fill(0, 0, 20);
  rect(mapBtnX, mapBtnY, btnW, btnH, 6);
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("🗺️ Maps", mapBtnX + btnW / 2, mapBtnY + btnH / 2);
}

function drawMiniGameView() {
  background(0, 0, 11);
  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(20);
  text(`Mini-jeu 🎮`, width / 2, 50);

  let question = "";
  let unit = "";

  if (currentMiniGameType === "tempo") {
    question = "Quel est le tempo de cette musique ?";
    unit = " BPM";
  } else if (currentMiniGameType === "valence") {
    question = "Quel est le mood général de cette musique ?";
    unit = "";
  } else if (currentMiniGameType === "genre") {
    question = "Quel est le genre de cette musique ?";
    unit = "";
  }

  textSize(16);
  fill(0, 0, 100);
  text(question, width / 2, 100);

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
    text(`${option}${unit}`, width / 2, btnY + btnH / 2);
  }

  // === Feedback ===
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

  // === Bouton retour ===
  fill(0, 0, 20);
  rect(40, height - 60, 100, 35, 8);
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("↩ Retour", 90, height - 42);
}

/*
function drawAvatarView() {
  background(260, 40, 10); // fond coloré (violet foncé)

  // === TITRE ===
  textAlign(CENTER);
  fill(0, 0, 100);
  textSize(28);
  text("Ton Avatar", width / 2, 60);

  let stage = getAvatarStage();
  let remaining = getRemainingToNextStage();
  let stats = getCollectionStats();

  // === Stade actuel ===
  fill(0, 0, 100);
  textSize(20);
  text(`Stade actuel : ${stage.toUpperCase()}`, width / 2, 280);

  fill(0, 0, 80);
  textSize(16);
  if (remaining > 0) {
    text(
      `🎯 Il te reste ${remaining} morceau(x) pour évoluer !`,
      width / 2,
      310
    );
  } else {
    text(`🌟 Ton avatar est au stade final !`, width / 2, 310);
  }

  // === Astuce ou encouragement ===
  fill(0, 0, 70);
  textSize(12);
  text(
    "Astuce : explore des sons variés pour faire évoluer ton compagnon 🎶",
    width / 2,
    height - 100
  );
  let evo = getDiversityAndUndergroundScore();
  let genreStats = getGenreStats();
  textAlign(CENTER);
  textSize(16);
  fill(0, 0, 90);
  text("Genres explorés :", width / 2, 350);

  textSize(14);
  fill(0, 0, 70);
  let genresToShow = genreStats.slice(0, 6); // max 6 genres
  for (let i = 0; i < genresToShow.length; i++) {
    let g = genresToShow[i];
    text(`${g.name} (${g.count})`, width / 2, 510 + i * 20);
  }

  drawStatBar(
    "Out of the confort zone",
    evo.diversity,
    width / 2 - 100,
    400,
    0,
    100
  );

  // Feedback textuel
  textAlign(CENTER);
  fill(0, 0, 80);
  textSize(12);
  if (evo.underground > 80 && evo.diversity > 70) {
    text(
      "🔥 Tu explores hors des sentiers battus, ton avatar est en pleine évolution !",
      width / 2,
      height - 130
    );
  } else if (evo.underground < 40) {
    text(
      "💤 Tu restes encore trop proche du mainstream... essaie des sons moins connus !",
      width / 2,
      height - 130
    );
  } else {
    text("🌱 Continue d'explorer, tu progresses !", width / 2, height - 130);
  }
  // === Bouton "Continuer" ===
  let btnW = 200;
  let btnH = 40;
  let btnX = width / 2 - btnW / 2;
  // Place le bouton juste sous la dernière barre de progression (y = 440 + 10 + 20)
  let btnY = 440 + 10 + 20;

  fill(0, 0, 20);
  rect(btnX, btnY, btnW, btnH, 10);
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("Continuer l’exploration", btnX + btnW / 2, btnY + btnH / 2);

  // === Bouton retour ===
  fill(0, 0, 20);
  rect(40, height - 60, 100, 35, 8);
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("↩ Retour", 90, height - 42);
}
*/
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
          cx = random(100, width - 100);
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
      drawTrackBlob(fakeTrack, pos.x, pos.y, 80, i);
    } else {
      drawTrackBlob(fakeTrack, pos.x, pos.y, 80, i, true); // blanc immobile
    }
    pop();

    if (isUnlocked) {
      fill(0, 0, 100);
      textAlign(CENTER);
      textSize(12);
      text(name, pos.x, pos.y + 50);
    }
  }

  // === Bouton retour
  fill(0, 0, 20);
  rect(40, height - 60, 100, 35, 8);
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("↩ Retour", 90, height - 42);
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
