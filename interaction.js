function mousePressed() {
  // === MINI-JEU ===
  if (mode === "minigame") {
    // Retour vers collection
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

    // Réponse sélectionnée
    for (let i = 0; i < miniGameOptions.length; i++) {
      let option = miniGameOptions[i];
      let btnX = width / 2 - 100;
      let btnY = 150 + i * 60;
      let btnW = 200;
      let btnH = 40;

      if (
        mouseX > btnX &&
        mouseX < btnX + btnW &&
        mouseY > btnY &&
        mouseY < btnY + btnH
      ) {
        miniGameFeedback = option === miniGameAnswer ? "correct" : "wrong";
        selectedOption = option;
        return;
      }
    }

    // Clique sur "Valider la réponse"
    // Clique sur "Valider la réponse"
    if (
      miniGameFeedback &&
      mouseX > width / 2 - 100 &&
      mouseX < width / 2 + 100 &&
      mouseY > height - 80 &&
      mouseY < height - 35
    ) {
      if (miniGameFeedback === "correct") {
        mode = "exploration"; // débloque l'accès à la map
        showPostMiniGameMessage = true; // 👈 AJOUT ICI
      } else {
        mode = "collection";
      }

      // Reset état du jeu
      currentMiniGameTrack = null;
      miniGameOptions = [];
      miniGameAnswer = null;
      miniGameFeedback = "";
      selectedOption = null;
      return;
    }

    return;
  }
  // === COLLECTION ===
  if (mode === "collection") {
    // Retour vers exploration
    // Clic sur bouton "Carte" en haut (même endroit que les boutons Map)
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

    // Clique sur une musique de la collection → lancer le mini-jeu
    for (let zone of collectionHitZones) {
      let d = dist(mouseX, mouseY, zone.x, zone.y);
      if (d < zone.r) {
        mode = "minigame";
        currentMiniGameTrack = zone.track;

        // Stoppe l'audio actuel
        if (currentAudio && currentAudio.isPlaying()) {
          currentAudio.stop();
        }

        // Joue l'audio du track sélectionné
        let newAudio = audioPlayers[zone.track.title];
        if (newAudio && newAudio.isLoaded()) {
          newAudio.play();
          currentAudio = newAudio;
        }

        miniGameAnswer = round(zone.track.tempo);
        miniGameOptions = shuffle([
          miniGameAnswer,
          miniGameAnswer + 10,
          miniGameAnswer - 15,
          miniGameAnswer + 20,
        ]);
        miniGameFeedback = "";
        selectedOption = null;
        return;
      }
    }

    return;
  }
  // === EXPLORATION ===
  if (mode === "exploration") {
    if (showPostMiniGameMessage) {
      let btnW = 180;
      let btnH = 40;
      let btnX = width / 2 - btnW / 2;
      let btnY = height / 2 + 40;

      if (
        mouseX > btnX &&
        mouseX < btnX + btnW &&
        mouseY > btnY &&
        mouseY < btnY + btnH
      ) {
        showPostMiniGameMessage = false;
        return;
      }

      // empêche de cliquer sur les blobs tant que le message est actif
      return;
    }

    for (let zone of blobHitZones) {
      if (
        zone.type === "mapButton" &&
        mouseX > zone.x &&
        mouseX < zone.x + zone.w &&
        mouseY > zone.y &&
        mouseY < zone.y + zone.h
      ) {
        if (zone.isUnlocked) {
          currentMapIndex = zone.index;
        }
        return;
      }
    }

    // Clic sur "Ma collection"
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

    // Clique sur "Valider ce son"
    if (selectedPendingTrack) {
      let panelWidth = 280;
      let panelX = width - panelWidth;
      let btnW = panelWidth - 40;
      let btnH = 45;
      let btnX = panelX + 20;
      let baseY = height / 2 - 20;
      let validerY = baseY;

      if (
        mouseX > btnX &&
        mouseX < btnX + btnW &&
        mouseY > validerY &&
        mouseY < validerY + btnH
      ) {
        let points = getGenreClusterPoints(selectedPendingTrack);
        playerScore += points;

        pointFeedbacks.push({
          points,
          x: 100,
          y: 30,
          alpha: 255,
          size: 36,
        });

        let cleaned = cleanTrack(selectedPendingTrack);
        playerCollection.push(cleaned);
        localStorage.setItem(
          "btm_collection",
          JSON.stringify(playerCollection)
        );

        selectedPendingTrack = null;
        selectedTrack = null;
        mode = "collection"; // retour à collection
        return;
      }
    }

    // 🎯 IMPORTANT : clique sur un blob de la map (exploration)
    for (let zone of blobHitZones) {
      let d = dist(mouseX, mouseY, zone.x, zone.y);
      if (d < zone.r) {
        selectedTrack = zone.track;
        selectedPendingTrack = zone.track;

        if (currentAudio && currentAudio.isPlaying()) currentAudio.stop();

        let newAudio = audioPlayers[selectedTrack.title];
        if (newAudio && newAudio.isLoaded()) {
          newAudio.play();
          currentAudio = newAudio;
        }
        return;
      }
    }
  }
  // === ONBOARDING ===
  if (mode === "onboarding") {
    handleOnboardingClick();
    return;
  }
  // === AVATAR ===
  if (mode === "avatar") {
    if (dist(mouseX, mouseY, width / 2, height / 2) < 40) {
      mode = "minigame";
      return;
    }

    // Retour
    if (
      mouseX > 40 &&
      mouseX < 140 &&
      mouseY > height - 60 &&
      mouseY < height - 25
    ) {
      mode = "collection";
      return;
    }
    // Bouton retour
    if (
      mouseX > 40 &&
      mouseX < 140 &&
      mouseY > height - 60 &&
      mouseY < height - 25
    ) {
      mode = "collection"; // ou "exploration"
      return;
    }
    // Bouton "Continuer"
    let btnW = 200;
    let btnH = 40;
    let btnX = width / 2 - btnW / 2;
    let btnY = 440 + 10 + 20;

    if (
      mouseX > btnX &&
      mouseX < btnX + btnW &&
      mouseY > btnY &&
      mouseY < btnY + btnH
    ) {
      mode = "collection"; // ou "exploration" selon ce que tu préfères
      return;
    }
  }
}

function touchStarted() {
  mousePressed();
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
