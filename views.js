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
  fill(0, 0, 100);
  textAlign(LEFT);
  textSize(20);
  text("Ma Collection", 40, 40);

  // ✅ Affiche le score ici aussi
  textSize(16);
  text(`Score : ${playerScore}`, 40, 70);
  fill(0, 0, 80);
  textSize(14);
  text("Clique sur un son de ta collection pour jouer avec.", 40, 100);

  let spacing = 200;
  collectionHitZones = [];

  for (let i = 0; i < playerCollection.length; i++) {
    let track = playerCollection[i];
    let x = 150 + (i % 4) * spacing;
    let y = 120 + floor(i / 4) * spacing;

    drawTrackBlob(track, x, y, 120, i);
    collectionHitZones.push({ x, y, r: 60, track });

    fill(0, 0, 100);
    textAlign(CENTER);
    textSize(12);
    text(track.title, x, y + 70);
  }

  // Bouton retour
  /*fill(0, 0, 20);
  rect(40, height - 60, 100, 35, 8);
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("↩ Retour", 90, height - 42);
  */
}

function drawMiniGameView() {
  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(20);
  text(`Mini-jeu 🎮`, width / 2, 50);

  textSize(16);
  text(`Quel est le tempo de cette musique ?`, width / 2, 100);
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
    text(`${option} BPM`, width / 2, btnY + btnH / 2);
  }

  // Feedback
  if (miniGameFeedback) {
    fill(0, 0, 20);
    rect(width / 2 - 100, height - 80, 200, 45, 10);
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Valider la réponse", width / 2, height - 57);
  }

  // Bouton retour
  fill(0, 0, 20);
  rect(40, height - 60, 100, 35, 8);
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("↩ Retour", 90, height - 42);
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

    // Bouton "Valider la réponse"
    if (miniGameFeedback) {
      fill(0, 0, 20);
      rect(width / 2 - 100, height - 80, 200, 45, 10);
      fill(0, 0, 100);
      textAlign(CENTER, CENTER);
      textSize(16);
      text("Valider la réponse", width / 2, height - 57);
    }
  }
}

function drawAvatarView() {
  background(260, 40, 10); // fond coloré (violet foncé)

  // === TITRE ===
  textAlign(CENTER);
  fill(0, 0, 100);
  textSize(28);
  text("Ton Avatar", width / 2, 60);

  // === Avatar centré ===
  /*let avatarImg = document.getElementById("avatar");
  if (avatarImg) {
    avatarImg.style.left = width / 2 - 75 + "px";
    avatarImg.style.top = "110px";
    avatarImg.style.position = "absolute";
    avatarImg.style.width = "150px";
    avatarImg.style.display = "block";
  }
*/
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

  drawStatBar(
    "Out of the confort zone",
    evo.diversity,
    width / 2 - 100,
    400,
    0,
    100
  );
  drawStatBar(
    "No more mainstream",
    evo.underground,
    width / 2 - 100,
    440,
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
