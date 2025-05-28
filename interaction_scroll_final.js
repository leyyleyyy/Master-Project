function isInsideClickableZone(zone, mx, my) {
  if (!zone) return false;

  let correctedX = mx;
  let correctedY = my;

  // On corrige les coordonnées uniquement pour les blobs dans exploration
  if (mode === "exploration" && zone.type === "blob") {
    correctedX = mx - scrollXOffset;
    correctedY = my - scrollYOffset;
  }

  if (zone.r) {
    // C’est un cercle (ex: blob ou cercle de collection)
    return dist(correctedX, correctedY, zone.x, zone.y) < zone.r;
  } else if (zone.w && zone.h) {
    // C’est un rectangle (ex: bouton)
    return (
      correctedX > zone.x &&
      correctedX < zone.x + zone.w &&
      correctedY > zone.y &&
      correctedY < zone.y + zone.h
    );
  }

  return false;
}

function mousePressed() {
  // === EVOLUTION ===
  if (mode === "evolution") {
    let btnW = 200;
    let btnH = 50;
    let btnX = width / 2 - btnW / 2;
    let btnY = height - 100;

    if (
      mouseX > btnX &&
      mouseX < btnX + btnW &&
      mouseY > btnY &&
      mouseY < btnY + btnH
    ) {
      mode = "avatar";
      evolutionTrack = null;
      evolutionPoints = 0;
      return;
    }
  }

  // === MINI-JEU ===
  if (mode === "minigame") {
    // === Bouton retour
    if (
      mouseX > 40 &&
      mouseX < 140 &&
      mouseY > height - 60 &&
      mouseY < height - 25
    ) {
      mode = "collection";
      currentMiniGameTrack = null;
      miniGameOptions = [];
      miniGameAnswer = null;
      miniGameFeedback = "";
      selectedOption = null;
      return;
    }

    // === Sélection d'une réponse
    let btnW = isMobile ? width * 0.85 : min(400, width * 0.5);
    let btnH = isMobile ? 65 : 50;
    let spacing = isMobile ? 25 : 20;
    let startY = height * 0.35 + (isMobile ? 160 : 120);

    for (let i = 0; i < miniGameOptions.length; i++) {
      let x = width / 2 - btnW / 2;
      let y = startY + i * (btnH + spacing);

      if (mouseX > x && mouseX < x + btnW && mouseY > y && mouseY < y + btnH) {
        selectedOption = miniGameOptions[i];
        miniGameFeedback =
          selectedOption === miniGameAnswer ? "correct" : "wrong";
        return;
      }
    }

    // === Clic sur bouton "Valider"
    if (selectedOption) {
      let valBtnW = isMobile ? 240 : 200;
      let valBtnH = isMobile ? 55 : 45;
      let valX = width / 2 - valBtnW / 2;
      let valY = height - valBtnH - 20;

      if (
        mouseX > valX &&
        mouseX < valX + valBtnW &&
        mouseY > valY &&
        mouseY < valY + valBtnH
      ) {
        // 🔁 TOUJOURS aller vers exploration
        mode = "exploration";

        currentMiniGameTrack = null;
        miniGameOptions = [];
        miniGameAnswer = null;
        miniGameFeedback = "";
        selectedOption = null;
        return;
      }
    }

    return;
  }

  // === COLLECTION ===
  if (mode === "collection") {
    // Bouton carte (même alignement que les maps)
    let btnW = 100;
    let btnH = 30;
    let spacing = 20;
    let totalW = maps.length * (btnW + spacing) - spacing;
    let startX = width / 2 - totalW / 2;
    let mapBtnX = startX + currentMapIndex * (btnW + spacing);
    let mapBtnY = 20;

    if (
      mouseX > mapBtnX &&
      mouseX < mapBtnX + btnW &&
      mouseY > mapBtnY &&
      mouseY < mapBtnY + btnH
    ) {
      mode = "exploration";
      return;
    }

    // Clic sur une musique (utilise isInsideClickableZone)
    for (let zone of blobHitZones) {
      if (isInsideClickableZone(zone, mouseX, mouseY)) {
        selectedTrack = zone.track;
        selectedPendingTrack = zone.track;

        if (currentAudio && currentAudio.isPlaying()) currentAudio.stop();

        let newAudio = audioPlayers[selectedTrack.title];
        if (newAudio && newAudio.isLoaded()) {
          newAudio.play();
          currentAudio = newAudio;
        }

        mode = "minigame";
        return;
      }
    }

    return;
  }

  // === EXPLORATION ===
  if (mode === "exploration") {
    // Blobs (mapButton et blob circulaire)
    for (let zone of blobHitZones) {
      if (isInsideClickableZone(zone, mouseX, mouseY)) {
        if (zone.type === "mapButton") {
          if (zone.isUnlocked) currentMapIndex = zone.index;
        } else {
          selectedTrack = zone.track;
          selectedPendingTrack = zone.track;

          if (currentAudio && currentAudio.isPlaying()) currentAudio.stop();

          let newAudio = audioPlayers[selectedTrack.title];
          if (newAudio && newAudio.isLoaded()) {
            newAudio.play();
            currentAudio = newAudio;
          }
        }
        return;
      }
    }
    /// Valider son sélectionné
    let valBtnW = isMobile ? 240 : 200;
    let valBtnH = isMobile ? 55 : 45;
    let valBtnX = width / 2 - valBtnW / 2;
    let valBtnY = height - valBtnH - 20;

    if (
      selectedPendingTrack &&
      mouseX > valBtnX &&
      mouseX < valBtnX + valBtnW &&
      mouseY > valBtnY &&
      mouseY < valBtnY + valBtnH
    ) {
      let points = getGenreClusterPoints(selectedPendingTrack);
      playerScore += points;

      pointFeedbacks.push({ points, x: 100, y: 30, alpha: 255, size: 36 });

      let cleaned = cleanTrack(selectedPendingTrack);
      playerCollection.push(cleaned);
      localStorage.setItem("btm_collection", JSON.stringify(playerCollection));

      updateAvatarGif();
      evolutionTrack = cleaned;
      evolutionPoints = points;
      selectedPendingTrack = null;
      selectedTrack = null;
      mode = "evolution";
      return;
    }

    // Navigation flèches
    let unlocked = getUnlockedMaps();
    if (mouseX < 60 && mouseY > height / 2 - 30 && mouseY < height / 2 + 30) {
      if (currentMapIndex > 0) currentMapIndex--;
    } else if (
      mouseX > width - 60 &&
      mouseY > height / 2 - 30 &&
      mouseY < height / 2 + 30
    ) {
      if (currentMapIndex < unlocked.length - 1) currentMapIndex++;
    }

    // Ma collection
    if (mouseX > 150 && mouseX < 290 && mouseY > 20 && mouseY < 55) {
      mode = "collection";
      return;
    }

    return;
  }

  // === ONBOARDING ===
  if (mode === "onboarding") {
    handleOnboardingClick();
    return;
  }

  // === AVATAR ===
  if (mode === "avatar") {
    // Clique central
    if (dist(mouseX, mouseY, width / 2, height / 2) < 40) {
      mode = "minigame";
      return;
    }

    // Bouton retour
    if (
      mouseX > 40 &&
      mouseX < 140 &&
      mouseY > height - 60 &&
      mouseY < height - 25
    ) {
      mode = "collection";
      return;
    }

    // Bouton "Continuer"
    let btnW = 200;
    let btnH = 40;
    let btnX = width / 2 - btnW / 2;
    let btnY = 470;

    if (
      mouseX > btnX &&
      mouseX < btnX + btnW &&
      mouseY > btnY &&
      mouseY < btnY + btnH
    ) {
      mode = "collection";
      return;
    }
  }
}

isDragging = false;
lastTouch = null;

function touchMoved() {
  if (isDragging && lastTouch) {
    let dx = mouseX - lastTouch.x;
    let dy = mouseY - lastTouch.y;
    scrollXOffset += dx;
    scrollYOffset += dy;
    lastTouch.set(mouseX, mouseY);
  }
  return false;
}

function touchEnded() {
  isDragging = false;
  lastTouch = null;
  return false;
}

function mouseWheel(event) {
  scrollYOffset -= event.delta;
  scrollXOffset -= event.deltaX || 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Recalculer les dimensions dépendantes de la taille
  redraw();
}

function touchStarted() {
  isDragging = true;
  lastTouch = createVector(mouseX, mouseY);

  // Simule le clic souris
  mousePressed();

  return false;
}

function touchMoved() {
  if (isDragging && lastTouch) {
    let dx = mouseX - lastTouch.x;
    let dy = mouseY - lastTouch.y;
    scrollXOffset += dx;
    scrollYOffset += dy;
    lastTouch.set(mouseX, mouseY);
  }
  return false;
}

function touchEnded() {
  isDragging = false;
  lastTouch = null;
  return false;
}
