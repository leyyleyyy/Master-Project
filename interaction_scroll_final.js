let justClickedShuffle = false;

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
/*
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
        const gameTypes = ["tempo", "valence", "genre", "visual_match"];
        // const gameTypes = ["visual_match"];
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
  }
}
*/
function mousePressed() {
  // === GAME SELECTOR / AFTER GAME ===
  /* if (mode === "gameSelector") {
    for (let zone of blobHitZones) {
      if (isInsideClickableZone(zone, mouseX, mouseY)) {
        currentMiniGameType = zone.miniGameType;
        currentMiniGameTrack = pickRandomTrackFromCollection();
        generateMiniGame(currentMiniGameTrack);
        mode = "minigame";
        return;
      }
    }
  }
 */
  /*if (justClickedShuffle) {
    // ⏱ Ignore temporairement les clics parasites
    console.log("🛑 Clic ignoré car juste après shuffle");
    justClickedShuffle = false;
    return;
  }*/

  // === GAME SELECTOR / AFTER GAME ===
  if (mode === "gameSelector") {
    for (let zone of blobHitZones) {
      if (isInsideClickableZone(zone, mouseX, mouseY)) {
        currentMiniGameType = zone.miniGameType;
        currentMiniGameTrack = pickRandomTrackFromCollection();
        generateMiniGame(currentMiniGameTrack);
        mode = "minigame";
        return;
      }
    }
  }

  // === CHALLENGE INTRO ===
  if (mode === "challengeIntro") {
    for (let zone of blobHitZones) {
      if (
        zone.type === "startChallenge" &&
        isInsideClickableZone(zone, mouseX, mouseY)
      ) {
        challengeProgress = 0;
        launchNextChallengeGame();
        return;
      }
    }
  }
  if (mode === "postMiniGameWin") {
    for (let zone of blobHitZones) {
      if (
        zone.type === "continueExploration" &&
        isInsideClickableZone(zone, mouseX, mouseY)
      ) {
        mode = "exploration";
        justWonMiniGame = false;
        return;
      }
    }
  }

  // === EVOLUTION ===
  if (mode === "evolution") {
    let btnW = 200;
    let btnH = 50;
    let btnX = width / 2 - btnW / 2;
    let btnY = height - (isMobile ? 100 : 100);

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

  if (mode === "minigame") {
    // === Bouton retour ===
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

    // === Jeu VISUAL_MATCH ===
    if (
      currentMiniGameType === "visual_match" &&
      miniGameOptions.length === 2
    ) {
      let blobR = (isMobile ? 240 : 160) / 2;
      let spacing = isMobile ? 180 : 140;
      let baseY = height / 2 - spacing / 2;

      for (let i = 0; i < 2; i++) {
        let blobX = width / 2;
        let blobY = baseY + i * spacing;

        if (dist(mouseX, mouseY, blobX, blobY) < blobR) {
          selectedOption = i;

          let track = miniGameOptions[i];
          if (currentAudio && currentAudio.isPlaying()) currentAudio.stop();
          let newAudio = audioPlayers[track.title];
          if (newAudio && newAudio.isLoaded()) {
            newAudio.play();
            currentAudio = newAudio;
          }
          return;
        }
      }

      let valBtnW = isMobile ? 320 : 250;
      let valBtnH = isMobile ? 75 : 55;
      let valX = width / 2 - valBtnW / 2;
      let valY = height - valBtnH - (isMobile ? 80 : 20);

      if (
        selectedOption !== null &&
        mouseX > valX &&
        mouseX < valX + valBtnW &&
        mouseY > valY &&
        mouseY < valY + valBtnH
      ) {
        const isCorrect =
          miniGameOptions[selectedOption].title === miniGameAnswer;

        miniGameFeedback = isCorrect ? "correct" : "wrong";

        if (isCorrect) {
          lastMiniGameTrack = currentMiniGameTrack;
          mode = "postMiniGameWin";
          justWonMiniGame = true;
          currentMiniGameTrack = null;
          miniGameOptions = [];
          miniGameAnswer = null;
          selectedOption = null;
        } else {
          currentLives--;
          console.log(
            "\uD83D\uDC94 Mauvaise réponse, vies restantes :",
            currentLives
          );
        }

        return;
      }

      return;
    }

    // === Mini-jeux classiques : TEMPO / GENRE ===
    let btnW = isMobile ? width * 0.85 : min(450, width * 0.6);
    let btnH = isMobile ? 75 : 60;
    let spacing = isMobile ? 30 : 25;
    let blobCenterY = height * 0.35;
    let startY = blobCenterY + (isMobile ? 140 : 100);

    for (let i = 0; i < miniGameOptions.length; i++) {
      let x = width / 2 - btnW / 2;
      let y = startY + i * (btnH + spacing);

      if (mouseX > x && mouseX < x + btnW && mouseY > y && mouseY < y + btnH) {
        selectedOption = i;
        miniGameFeedback = "";
        return;
      }
    }

    let valBtnW = isMobile ? 320 : 250;
    let valBtnH = isMobile ? 75 : 55;
    let valX = width / 2 - valBtnW / 2;
    let valY = height - valBtnH - (isMobile ? 80 : 20);

    if (
      selectedOption !== null &&
      mouseX > valX &&
      mouseX < valX + valBtnW &&
      mouseY > valY &&
      mouseY < valY + valBtnH
    ) {
      const isCorrect = miniGameOptions[selectedOption] === miniGameAnswer;

      miniGameFeedback = isCorrect ? "correct" : "wrong";

      if (isCorrect) {
        lastMiniGameTrack = currentMiniGameTrack;
        mode = "postMiniGameWin";
        justWonMiniGame = true;
        currentMiniGameTrack = null;
        miniGameOptions = [];
        miniGameAnswer = null;
        selectedOption = null;
      } else {
        currentLives--;
        console.log(
          "\uD83D\uDC94 Mauvaise réponse, vies restantes :",
          currentLives
        );
      }
      return;
    }
    for (let zone of blobHitZones) {
      if (
        zone.type === "validateMiniGame" &&
        isInsideClickableZone(zone, mouseX, mouseY)
      ) {
        handleMiniGameValidation();
        return;
      }
    }
  }

  // ... (reste du code inchangé)

  // === EVOLUTION ===
  if (mode === "evolution") {
    let btnW = 200;
    let btnH = 50;
    let btnX = width / 2 - btnW / 2;
    let btnY = height - (isMobile ? 100 : 100); // inchangé ici

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

  if (mode === "minigame") {
    // === Bouton retour ===
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

    // === Jeu VISUAL_MATCH ===
    if (
      currentMiniGameType === "visual_match" &&
      miniGameOptions.length === 2
    ) {
      let blobR = (isMobile ? 240 : 160) / 2;
      let spacing = isMobile ? 180 : 140;
      let baseY = height / 2 - spacing / 2;

      for (let i = 0; i < 2; i++) {
        let blobX = width / 2;
        let blobY = baseY + i * spacing;

        if (dist(mouseX, mouseY, blobX, blobY) < blobR) {
          selectedOption = i;

          // 🔊 Jouer la musique associée
          let track = miniGameOptions[i];
          if (currentAudio && currentAudio.isPlaying()) currentAudio.stop();
          let newAudio = audioPlayers[track.title];
          if (newAudio && newAudio.isLoaded()) {
            newAudio.play();
            currentAudio = newAudio;
          }
          return;
        }
      }

      // === Valider
      let valBtnW = isMobile ? 320 : 250;
      let valBtnH = isMobile ? 75 : 55;
      let valX = width / 2 - valBtnW / 2;
      let valY = height - valBtnH - (isMobile ? 80 : 20);

      if (
        selectedOption !== null &&
        mouseX > valX &&
        mouseX < valX + valBtnW &&
        mouseY > valY &&
        mouseY < valY + valBtnH
      ) {
        const isCorrect =
          miniGameOptions[selectedOption].title === miniGameAnswer;

        miniGameFeedback = isCorrect ? "correct" : "wrong";

        if (isCorrect) {
          mode = "postMiniGameWin";
          justWonMiniGame = true;
          currentMiniGameTrack = null;
          miniGameOptions = [];
          miniGameAnswer = null;
          selectedOption = null;
        } else {
          currentLives--;
          console.log("💔 Mauvaise réponse, vies restantes :", currentLives);
        }

        return;
      }

      return;
    }

    // === Mini-jeux classiques : TEMPO / GENRE
    let btnW = isMobile ? width * 0.85 : min(450, width * 0.6);
    let btnH = isMobile ? 75 : 60;
    let spacing = isMobile ? 30 : 25;
    let blobCenterY = height * 0.35;
    let startY = blobCenterY + (isMobile ? 80 : 60);

    for (let i = 0; i < miniGameOptions.length; i++) {
      let x = width / 2 - btnW / 2;
      let y = startY + i * (btnH + spacing);

      if (mouseX > x && mouseX < x + btnW && mouseY > y && mouseY < y + btnH) {
        selectedOption = i;
        miniGameFeedback = "";
        return;
      }
    }

    // === Valider (classique)
    let valBtnW = isMobile ? 320 : 250;
    let valBtnH = isMobile ? 75 : 55;
    let valX = width / 2 - valBtnW / 2;
    let valY = height - valBtnH - (isMobile ? 80 : 20);

    if (
      selectedOption !== null &&
      mouseX > valX &&
      mouseX < valX + valBtnW &&
      mouseY > valY &&
      mouseY < valY + valBtnH
    ) {
      const isCorrect = miniGameOptions[selectedOption] === miniGameAnswer;

      miniGameFeedback = isCorrect ? "correct" : "wrong";

      if (isCorrect) {
        mode = "postMiniGameWin";
        justWonMiniGame = true;
        currentMiniGameTrack = null;
        miniGameOptions = [];
        miniGameAnswer = null;
        selectedOption = null;
      } else {
        currentLives--;
        console.log("💔 Mauvaise réponse, vies restantes :", currentLives);
      }
      return;
    }
    if (miniGameFeedback === "correct") {
      if (challengeProgress < challengeMax - 1) {
        challengeProgress++;
        launchNextChallengeGame();
      } else {
        challengeProgress = 0;
        mode = "exploration"; // Accès à une nouvelle musique
      }
    }
  }

  // === COLLECTION ===
  if (mode === "collection") {
    if (handlePlaylistSelection(mouseX, mouseY)) return;
    console.log("🖱️ clic détecté - mode =", mode);
    if (handlePlaylistSelection(mouseX, mouseY)) {
      console.log("🎯 playlist cliquée !");
      return;
    }

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

        currentMiniGameTrack = selectedTrack;
        const gameTypes = ["visual_match"];
        currentMiniGameType = random(gameTypes);
        generateMiniGame(null);

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
    let valBtnY = height - valBtnH - (isMobile ? 80 : 20); // ✅ corrigé ici aussi

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

      /*
      let cleaned = cleanTrack(selectedPendingTrack);
      playerCollection.push(cleaned);
      localStorage.setItem("btm_collection", JSON.stringify(playerCollection));
*/
      let cleaned = cleanTrack(selectedPendingTrack);
      let withMap = { ...cleaned, mapName: mapNames[currentMapIndex] }; // Assigne le nom de la map en cours
      playerCollection.push(withMap);
      localStorage.setItem("btm_collection", JSON.stringify(playerCollection));

      updateAvatarGif();
      evolutionTrack = cleaned;
      evolutionPoints = points;

      updateBackgroundClusterFromGenre(cleaned.genre);

      // ✅ NOUVEAU : centrage sur le dernier genre débloqué via genreStats
      const latestUnlocked = getGenreStats()
        .map((g) => g.name)
        .at(-1);
      scrollToGenre = latestUnlocked || cleaned.genre;
      delete window.genreBlobs;
      window._alreadyCentered = false;

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
  if (mode === "avatar" && !justClickedShuffle) {
    if (dist(mouseX, mouseY, width / 2, height / 2) < 40) {
      currentMiniGameTrack = pickRandomTrackFromCollection();
      const gameTypes = ["tempo", "genre"];
      currentMiniGameType = random(gameTypes);
      generateMiniGame(currentMiniGameTrack);

      mode = "minigame";
      return;
    }
    for (let zone of blobHitZones) {
      if (
        zone.type === "goToCollection" &&
        isInsideClickableZone(zone, mouseX, mouseY)
      ) {
        mode = "collection";
        return;
      }
    }
  }
  justClickedShuffle = false;
}

isDragging = false;
lastTouch = null;

/*
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
*/
function touchMoved() {
  if (mode === "avatar" && !canScrollAvatar) return false;

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
/*
function mouseWheel(event) {
  scrollYOffset -= event.delta;
  scrollXOffset -= event.deltaX || 0;
  if (!hasUnlockedGenres) return false;
  scrollYOffset -= event.delta;
  scrollXOffset -= event.deltaX || 0;
}
*/
function mouseWheel(event) {
  if (mode === "avatar" && !canScrollAvatar) return false;
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

function touchEnded() {
  isDragging = false;
  lastTouch = null;
  return false;
}
