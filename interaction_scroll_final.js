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
  /*
  if (mode === "minigame") {
    // Bouton retour
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

    // === visual_match spécifique ===
    if (
      currentMiniGameType === "visual_match" &&
      miniGameOptions.length === 2
    ) {
      for (let i = 0; i < 2; i++) {
        let blobX = width / 2 + (i === 0 ? -120 : 120);
        let blobY = height * 0.4;
        let blobR = isMobile ? 80 : 60;
        let btnW = 130;
        let btnH = 40;
        let btnX = blobX - btnW / 2;
        let btnY = blobY + blobR + 10;

        // Clic sur le blob (jouer la musique)
        if (dist(mouseX, mouseY, blobX, blobY) < blobR) {
          let track = miniGameOptions[i];
          if (currentAudio && currentAudio.isPlaying()) currentAudio.stop();
          let newAudio = audioPlayers[track.title];
          if (newAudio && newAudio.isLoaded()) {
            newAudio.play();
            currentAudio = newAudio;
          }
        }

        // Clic sur le bouton sous le blob = réponse
        if (
          mouseX > btnX &&
          mouseX < btnX + btnW &&
          mouseY > btnY &&
          mouseY < btnY + btnH
        ) {
          selectedOption = i;
          miniGameFeedback =
            miniGameOptions[i].title === miniGameAnswer ? "correct" : "wrong";
        }
      }

      // Validation finale
      if (selectedOption !== null) {
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

    // === autres types classiques
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
*/
  // === MINI-JEU ===
  if (mode === "minigame") {
    // Bouton retour
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

    // === visual_match spécifique ===
    if (
      currentMiniGameType === "visual_match" &&
      miniGameOptions.length === 2
    ) {
      for (let i = 0; i < 2; i++) {
        let blobX = width / 2 + (i === 0 ? -120 : 120);
        let blobY = height * 0.4;
        let blobR = isMobile ? 80 : 60;
        let btnW = 130;
        let btnH = 40;
        let btnX = blobX - btnW / 2;
        let btnY = blobY + blobR + 10;

        // Clic sur le blob (jouer la musique)
        if (dist(mouseX, mouseY, blobX, blobY) < blobR) {
          let track = miniGameOptions[i];
          if (currentAudio && currentAudio.isPlaying()) currentAudio.stop();
          let newAudio = audioPlayers[track.title];
          if (newAudio && newAudio.isLoaded()) {
            newAudio.play();
            currentAudio = newAudio;
          }
        }

        // Clic sur le bouton sous le blob = réponse
        if (
          mouseX > btnX &&
          mouseX < btnX + btnW &&
          mouseY > btnY &&
          mouseY < btnY + btnH
        ) {
          selectedOption = i;
          miniGameFeedback =
            miniGameOptions[i].title === miniGameAnswer ? "correct" : "wrong";
        }
      }

      // Validation finale (uniquement si réponse correcte)
      if (selectedOption !== null && miniGameFeedback === "correct") {
        let valBtnW = isMobile ? 240 : 200;
        let valBtnH = isMobile ? 55 : 45;
        let valX = width / 2 - valBtnW / 2;
        let valY = height - valBtnH - 20;
        console.log("Valider :", mouseX, mouseY, "valX:", valX, "valY:", valY);

        if (
          mouseX > valX &&
          mouseX < valX + valBtnW &&
          mouseY > valY &&
          mouseY < valY + valBtnH
        ) {
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

    // === autres types classiques
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

    // Validation finale (uniquement si réponse correcte)
    if (selectedOption && miniGameFeedback === "correct") {
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

        // MINI-JEU COLLECTION
        currentMiniGameTrack = selectedTrack;
        //const gameTypes = ["tempo", "valence", "genre", "visual_match"];
        const gameTypes = ["visual_match"];
        currentMiniGameType = random(gameTypes);
        generateMiniGame(currentMiniGameTrack);

        mode = "minigame";
        return;
      }
    }

    return;
  }

  // === EXPLORATION ===
  if (mode === "exploration") {
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
    if (dist(mouseX, mouseY, width / 2, height / 2) < 40) {
      // MINI-JEU AVATAR
      currentMiniGameTrack = pickRandomTrackFromCollection();
      const gameTypes = ["tempo", "genre"];
      currentMiniGameType = random(gameTypes);
      generateMiniGame(currentMiniGameTrack);

      mode = "minigame";
      return;
    }
    /*
    if (
      mouseX > 40 &&
      mouseX < 140 &&
      mouseY > height - 60 &&
      mouseY < height - 25
    ) {
      mode = "collection";
      return;
    }

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
    }*/
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
