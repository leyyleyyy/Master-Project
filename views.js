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

  if (!currentMap._blobPositions) {
    assignScatteredPositions(currentMap.tracks);
    currentMap._blobPositions = currentMap.tracks.map((t) => t.pos);
  }

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

  if (unlockedMaps.length > 1) {
    fill(0, 0, 100);
    textSize(16);
    if (currentMapIndex > 0) text("<", 40, height / 2);
    if (currentMapIndex < unlockedMaps.length - 1)
      text(">", width - 40, height / 2);
    text(currentMap.name, width / 2, 40);
  }

  fill(0, 0, 80);
  text("Clique sur une forme pour écouter.", width / 2, 80);
  text("Puis valide pour l'ajouter à ta collection.", width / 2, 100);

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
  background(0, 0, 11);
  textAlign(CENTER);
  fill(0, 0, 100);

  let topOffset = isMobile ? 40 : 60;
  let btnW = isMobile ? width * 0.85 : min(450, width * 0.6);
  let btnH = isMobile ? 75 : 60;
  let spacing = isMobile ? 30 : 25;
  let radius = isMobile ? 20 : 12;
  let titleSize = isMobile ? 34 : 28;
  let questionSize = isMobile ? 22 : 18;
  let labelSize = isMobile ? 16 : 14;
  let questionY = topOffset + 40;

  // ❤️ Affichage des vies
  let heartIcon = "❤️";
  let heartText = heartIcon.repeat(currentLives);
  textAlign(RIGHT, TOP);
  textSize(isMobile ? 30 : 22);
  fill(0, 0, 100);
  text(heartText, width - 30, 30);

  /* fill(0, 0, 80);
  textSize(questionSize);
  text(miniGameLabel || "", width / 2, questionY);
 
  fill(0, 0, 60);
  textSize(labelSize);
  text("Écoute la musique et choisis :", width / 2, questionY + 30);
*/
  if (currentMiniGameType === "visual_match" && miniGameOptions.length === 2) {
    for (let i = 0; i < 2; i++) {
      let blob = miniGameOptions[i];
      let blobX = width / 2 + (i === 0 ? -120 : 120);
      let blobY = height * 0.4;
      let blobR = isMobile ? 80 : 60;

      push();
      translate(blobX, blobY);
      drawTrackBlob(blob, 0, 0, blobR, 0);
      pop();

      let btnW = isMobile ? 180 : 150; // Increased from 150 to 180
      let btnH = isMobile ? 65 : 50; // Increased from 50 to 65
      let btnX = blobX - btnW / 2;
      let btnY = blobY + blobR + 10;

      drawButton(
        `Réponse ${i + 1}`,
        btnX,
        btnY,
        btnW,
        btnH,
        selectedOption === i
      );
    }
  } else {
    let blobCenterY = height * 0.35;
    if (currentMiniGameTrack) {
      push();
      translate(width / 2, blobCenterY);
      drawTrackBlob(currentMiniGameTrack, 0, 0, isMobile ? 160 : 100, 0);
      pop();
    }

    let startY = blobCenterY + (isMobile ? 160 : 120);
    for (let i = 0; i < miniGameOptions.length; i++) {
      let option = miniGameOptions[i];
      let x = width / 2 - btnW / 2;
      let y = startY + i * (btnH + spacing);
      drawButton(
        option + (miniGameUnit || ""),
        x,
        y,
        btnW,
        btnH,
        selectedOption === option
      );
    }
  }

  let valBtnW = isMobile ? 320 : 250;
  let valBtnH = isMobile ? 75 : 55;
  let valX = width / 2 - valBtnW / 2;
  let valY = height - valBtnH - (isMobile ? 80 : 20);
  drawButton("Valider", valX, valY, valBtnW, valBtnH, selectedOption !== null);
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

  imageMode(CENTER);
  let gifSize = isMobile ? min(width * 0.65, 280) : 200;
  image(morphingGif, width / 2, height / 2 - 130, gifSize, gifSize);

  textSize(isMobile ? 32 : 24);
  fill(evolutionPoints >= 0 ? color(120, 100, 100) : color(0, 100, 100));
  text(
    `${evolutionPoints >= 0 ? "+" : ""}${evolutionPoints} points ${
      evolutionPoints >= 0 ? "🎉" : "😞"
    }`,
    width / 2,
    height / 2 + (isMobile ? 20 : 10)
  );

  fill(0, 0, 80);
  textSize(isMobile ? 20 : 16);
  text(
    `Tu as ajouté : ${evolutionTrack?.title || "—"}`,
    width / 2,
    height / 2 + (isMobile ? 60 : 40)
  );

  if (evolutionTrack?.genre) {
    fill(0, 0, 100);
    textSize(isMobile ? 20 : 16);
    text(
      `🎧 Tu as débloqué le genre : ${evolutionTrack.genre}`,
      width / 2,
      height / 2 + (isMobile ? 100 : 70)
    );
  }

  let dominantCluster = getMostCommonCluster(playerCollection);
  let evolutionComments = getEvolutionComment(evolutionTrack, dominantCluster);

  fill(0, 0, 80);
  textSize(isMobile ? 16 : 14);
  let baseY = height / 2 + (isMobile ? 140 : 100);
  for (let i = 0; i < evolutionComments.length; i++) {
    text(evolutionComments[i], width / 2, baseY + i * 26);
  }

  let btnW = isMobile ? 320 : 250;
  let btnH = isMobile ? 80 : 60;
  let btnX = width / 2 - btnW / 2;
  let btnY = height - (isMobile ? 100 : 100); // ✅ déjà correct, mais tu peux mettre 120 si tu veux encore plus haut
  drawButton("Continuer", btnX, btnY, btnW, btnH);
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

function drawCollectionView() {
  background(0, 0, 11);

  // === AVATAR BIEN CENTRÉ & GROS ===
  let avatarSize = isMobile ? 220 : 160;
  let avatarY = 140;
  /*let avatarImg = document.getElementById("avatar");
  if (avatarImg) {
    avatarImg.style.left = width / 2 - avatarSize / 2 + "px";
    avatarImg.style.top = avatarY - avatarSize / 2 + "px";
    avatarImg.style.width = avatarSize + "px";
    avatarImg.style.position = "absolute";
    avatarImg.style.display = "block";
  }
*/
  let avatarImg = document.getElementById("avatar");
  if (avatarImg) {
    avatarImg.classList.add("avatar-collection");
  }
  // === SCORE & PHRASE JUSTE EN DESSOUS ===
  let infoY = avatarY + avatarSize / 2 + 30;

  fill(0, 0, 100);
  textSize(28);
  text(`Score total : ${playerScore}`, width / 2, infoY + 280);

  fill(0, 0, 80);
  textSize(38);
  text(
    "Tu peux rejouer les sons découverts ou en débloquer de nouveaux !",
    width / 2,
    infoY + 300
  );

  // === BLOBS & TRACKS EN LISTE VERS LE BAS ===
  let grouped = groupCollectionByCluster();
  let clusters = Object.keys(grouped);
  let y = infoY + 90;
  let blobSize = isMobile ? 90 : 70;
  let lineHeight = isMobile ? 120 : 100;
  let paddingX = isMobile ? 40 : 100;

  textAlign(LEFT);

  for (let cluster of clusters) {
    let tracks = grouped[cluster];

    // CLUSTER LABEL
    fill(220, 80, 100);
    textSize(20);
    text(cluster, paddingX, y);
    y += 35;

    for (let track of tracks) {
      // BLOB
      let blobX = paddingX + blobSize / 2;
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

      // TITRE / ARTISTE
      fill(0, 0, 100);
      textSize(17);
      text(track.title || "Sans titre", blobX + blobSize + 25, y + 25);

      fill(0, 0, 60);
      textSize(14);
      text(track.artist || "Artiste inconnu", blobX + blobSize + 25, y + 50);

      y += lineHeight;
    }

    y += 40;
  }
}

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
function drawGameSelectorView() {
  background(0, 0, 11);
  textAlign(CENTER, CENTER);
  fill(0, 0, 100);
  textSize(isMobile ? 32 : 24);
  text("Choisis ton mini-jeu :", width / 2, 80);

  let options = [
    { label: "🎵 Quiz tempo", type: "tempo" },
    { label: "🎧 Genre", type: "genre" },
    { label: "👀 Reconnaissance", type: "visual_match" },
  ];

  let btnW = isMobile ? width * 0.85 : 300;
  let btnH = isMobile ? 80 : 60;
  let spacing = 30;
  let startY = height / 2 - ((btnH + spacing) * options.length) / 2;

  for (let i = 0; i < options.length; i++) {
    let x = width / 2 - btnW / 2;
    let y = startY + i * (btnH + spacing);
    drawButton(options[i].label, x, y, btnW, btnH);
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
