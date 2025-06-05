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

  // 🔥 AJOUTER : Pour la collection, on corrige avec le scroll Y
  if (
    mode === "collection" &&
    (zone.type === "blob" || zone.type === "collectionPlay")
  ) {
    correctedX = mx;
    correctedY = my - (window.collectionScrollY || 0); // ✅ CORRECTION SCROLL COLLECTION
  }

  if (zone.r) {
    // Zone circulaire
    let distance = dist(correctedX, correctedY, zone.x, zone.y);
    return distance <= zone.r;
  } else if (zone.w && zone.h) {
    // Zone rectangulaire
    return (
      correctedX >= zone.x &&
      correctedX <= zone.x + zone.w &&
      correctedY >= zone.y &&
      correctedY <= zone.y + zone.h
    );
  }

  return false;
}

function mousePressed() {
  // === GESTION GLOBALE DE LA CROIX DE FERMETURE ===
  for (let zone of blobHitZones) {
    if (
      zone.type === "closeButton" &&
      isInsideClickableZone(zone, mouseX, mouseY)
    ) {
      console.log("❌ Fermeture via croix");

      // Arrêter l'audio si en cours
      if (currentAudio && currentAudio.isPlaying()) {
        currentAudio.stop();
      }

      // Retour au sélecteur de jeux
      mode = "gameSelector";
      return;
    }
  }

  // === GAME SELECTOR ===
  if (mode === "gameSelector") {
    for (let zone of blobHitZones) {
      if (isInsideClickableZone(zone, mouseX, mouseY)) {
        // 🎮 Mini-jeux classiques
        if (zone.miniGameType) {
          currentMiniGameType = zone.miniGameType;
          currentMiniGameTrack = pickRandomTrackFromAllTracks();

          console.log("🎮 Mini-jeu sélectionné:", {
            type: currentMiniGameType,
            track: currentMiniGameTrack?.title || "UNDEFINED",
          });

          generateMiniGame(currentMiniGameTrack);
          mode = "minigame";

          // Reset des flags pour le nouveau jeu
          window.miniGameStarted = false;
          window.miniGameMusicStarted = false;
          miniGameAttempts = 0;
          return;
        }

        // 🌊 Mode Stream (Exploration)
        /*if (zone.type === "streamMode") {
          // ✨ Marquer l'illumination comme vue
          localStorage.setItem("btm_streamIlluminationSeen", "true");
          localStorage.removeItem("btm_justUnlockedStream"); // Nettoyer aussi ce flag

          console.log("🌊 Accès au mode Stream");
          console.log("✨ Illumination Stream marquée comme vue");
          mode = "exploration";
          return;
        }*/
      }
    }
    return;
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
    return;
  }

  // === POST MINI GAME WIN ===
  if (mode === "postMiniGameWin") {
    for (let zone of blobHitZones) {
      if (isInsideClickableZone(zone, mouseX, mouseY)) {
        if (zone.type === "continueExploration") {
          // ✨ Vérifier s'il faut montrer la page de déblocage
          let justUnlocked =
            localStorage.getItem("btm_justUnlockedStream") === "true";

          if (justUnlocked) {
            // 🎉 Aller à la page de déblocage
            localStorage.removeItem("btm_justUnlockedStream"); // Nettoyer le flag
            localStorage.setItem("btm_firstStreamUnlock", "true"); // Marquer comme vu
            mode = "exploration";
            console.log("On explore !");
          } else {
            // 📱 Retour normal au sélecteur de jeux
            mode = "gameSelector";
          }
          return;
        }
      }
    }
    return;
  }
  if (mode === "postMiniGameWin") {
    for (let zone of blobHitZones) {
      if (
        zone.type === "continueExploration" &&
        isInsideClickableZone(zone, mouseX, mouseY)
      ) {
        mode = "gameSelector";
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
    return;
  }

  // === MINI GAME ===
  if (mode === "minigame") {
    // === ÉCRAN DE DÉMARRAGE ===
    if (!window.miniGameStarted) {
      // Clic n'importe où pour démarrer
      window.miniGameStarted = true;

      // 🎵 Lancer la musique maintenant
      if (
        currentMiniGameTrack &&
        (currentMiniGameType === "tempo" || currentMiniGameType === "genre")
      ) {
        if (currentAudio && currentAudio.isPlaying()) currentAudio.stop();

        let newAudio = audioPlayers[currentMiniGameTrack.title];
        if (newAudio && newAudio.isLoaded()) {
          newAudio.play();
          currentAudio = newAudio;
          console.log(
            "🎵 Musique du mini-jeu lancée :",
            currentMiniGameTrack.title
          );
        }
      }
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
      currentMiniGameTrack = null;
      miniGameOptions = [];
      miniGameAnswer = null;
      miniGameFeedback = "";
      selectedOption = null;

      // Reset du flag musique
      window.miniGameMusicStarted = false;
      return;
    }

    // === Jeu VISUAL_MATCH ===
    if (
      currentMiniGameType === "visual_match" &&
      miniGameOptions.length === 2
    ) {
      // Pas de musique automatique pour VISUAL_MATCH
      let blobR = (isMobile ? 240 : 160) / 2;
      let spacing = isMobile ? 340 : 260;
      let baseY = height / 2 - spacing / 2;

      // Clic sur les blobs
      for (let i = 0; i < 2; i++) {
        let blobX = width / 2;
        let blobY = baseY + i * spacing;

        if (dist(mouseX, mouseY, blobX, blobY) < blobR) {
          selectedOption = i;

          // Jouer la musique sélectionnée
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

      // Bouton Valider pour VISUAL_MATCH
      let valBtnW = isMobile ? 820 : 250;
      let valBtnH = isMobile ? 170 : 55;
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

          // 🎵 AJOUTER LE MORCEAU À LA COLLECTION
          if (currentMiniGameTrack) {
            let cleaned = cleanTrack(currentMiniGameTrack);
            let withMap = { ...cleaned, mapName: "Mini-jeu" };

            let alreadyInCollection = playerCollection.some(
              (track) => track.title === cleaned.title
            );

            if (!alreadyInCollection) {
              playerCollection.push(withMap);
              localStorage.setItem(
                "btm_collection",
                JSON.stringify(playerCollection)
              );

              updateAvatarGif();
              updateBackgroundClusterFromGenre(cleaned.genre);

              console.log(
                "🎵 Nouveau morceau ajouté à la collection :",
                cleaned.title
              );
            }
          }

          // 🏆 Calculer les points basés sur les essais
          // ✅ Compter l'essai actuel (miniGameAttempts + 1)
          let actualAttempts = miniGameAttempts + 1;
          let points = getMiniGamePoints(actualAttempts);

          let previousScore = playerScore;
          playerScore += points;

          // ✨ MARQUER SI ON VIENT DE DÉBLOQUER LE STREAM
          if (previousScore < 5 && playerScore >= 5) {
            // 🎉 Première fois qu'on atteint 5 points !
            localStorage.setItem("btm_justUnlockedStream", "true");
            console.log(
              "🌊 Mode Stream sera débloqué après la page de victoire !"
            );
            console.log("🎯 Flag btm_justUnlockedStream défini à true");
          }

          // ✅ TOUJOURS aller d'abord à la page de victoire
          mode = "postMiniGameWin";
          justWonMiniGame = true;
          currentMiniGameTrack = null;
          miniGameOptions = [];
          miniGameAnswer = null;
          selectedOption = null;

          // Reset des flags
          window.miniGameStarted = false;
          window.miniGameMusicStarted = false;
          miniGameAttempts = 0;
        } else {
          // ❌ Mauvaise réponse - incrémenter les essais
          miniGameAttempts++;
          currentLives--;
          console.log(
            `💔 Mauvaise réponse (essai ${
              miniGameAttempts + 1
            }), vies restantes : ${currentLives}`
          );
        }

        // Reset du flag musique
        window.miniGameMusicStarted = false;
        return;
      }
      return;
    }

    // === Mini-jeux classiques (TEMPO / GENRE) ===
    // ✅ Définir les variables du bouton Valider
    let valBtnW = isMobile ? 820 : 250;
    let valBtnH = isMobile ? 170 : 55;
    let valX = width / 2 - valBtnW / 2;
    let valY = height - valBtnH - (isMobile ? 80 : 20);

    // Sélection des options (clic sur les boutons)
    let btnW = isMobile ? width * 0.9 : min(500, width * 0.65);
    let btnH = isMobile ? 150 : 75;
    let spacing = isMobile ? 50 : 35;
    let blobCenterY = height * 0.35;
    let startY = blobCenterY + (isMobile ? 140 : 100);

    for (let i = 0; i < miniGameOptions.length; i++) {
      let x = width / 2 - btnW / 2;
      let y = startY + i * (btnH + spacing);

      if (mouseX > x && mouseX < x + btnW && mouseY > y && mouseY < y + btnH) {
        selectedOption = i;
        console.log("🎯 Option sélectionnée:", i, miniGameOptions[i]);
        return;
      }
    }

    // Validation de la réponse
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

        // 🎵 AJOUTER LE MORCEAU À LA COLLECTION
        if (currentMiniGameTrack) {
          let cleaned = cleanTrack(currentMiniGameTrack);
          let withMap = { ...cleaned, mapName: "Mini-jeu" };

          let alreadyInCollection = playerCollection.some(
            (track) => track.title === cleaned.title
          );

          if (!alreadyInCollection) {
            playerCollection.push(withMap);
            localStorage.setItem(
              "btm_collection",
              JSON.stringify(playerCollection)
            );

            updateAvatarGif();
            updateBackgroundClusterFromGenre(cleaned.genre);

            console.log(
              "🎵 Nouveau morceau ajouté à la collection :",
              cleaned.title
            );
          }
        }

        // 🏆 Calculer les points basés sur les essais
        let actualAttempts = miniGameAttempts + 1;
        let points = getMiniGamePoints(actualAttempts);

        console.log("🔍 DEBUG SCORE CLASSIQUE:", {
          scoreActuel: playerScore,
          pointsGagnés: points,
          miniGameAttempts: miniGameAttempts,
          actualAttempts: actualAttempts,
        });

        playerScore += points;

        // ✅ SAUVEGARDER LE SCORE
        localStorage.setItem("btm_score", playerScore.toString());

        pointFeedbacks.push({
          points,
          x: width / 2,
          y: height / 2,
          alpha: 255,
          size: 36,
        });

        console.log(
          `🎯 ${points} points gagnés (${actualAttempts} essai${
            actualAttempts > 1 ? "s" : ""
          })`
        );
        console.log(`📊 Score total: ${playerScore}`);

        mode = "postMiniGameWin";
        justWonMiniGame = true;
        currentMiniGameTrack = null;
        miniGameOptions = [];
        miniGameAnswer = null;
        selectedOption = null;

        // Reset des flags
        window.miniGameStarted = false;
        window.miniGameMusicStarted = false;
        miniGameAttempts = 0;
      } else {
        // ❌ Mauvaise réponse - incrémenter les essais
        miniGameAttempts++;
        currentLives--;
        console.log(
          `💔 Mauvaise réponse (essai ${
            miniGameAttempts + 1
          }), vies restantes : ${currentLives}`
        );
      }

      // Reset du flag musique
      window.miniGameMusicStarted = false;
      return;
    }
    return;
  }

  // === COLLECTION ===
  if (mode === "collection") {
    // Gestion des playlists
    if (handlePlaylistSelection(mouseX, mouseY)) return;

    // Bouton retour exploration
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

    // ✅ CORRECTION : Clic sur les blobs - JOUER au lieu de lancer mini-jeu
    for (let zone of blobHitZones) {
      if (isInsideClickableZone(zone, mouseX, mouseY)) {
        // ✅ VÉRIFIER : Si c'est le nouveau type "collectionPlay"
        if (zone.type === "collectionPlay") {
          handleCollectionTrackClick(zone.track);
          return;
        }

        // ✅ ANCIEN CODE : Pour compatibilité avec l'ancien type "blob"
        if (zone.type === "blob") {
          selectedTrack = zone.track;

          // ✅ JOUER : Arrêter l'audio précédent et jouer le nouveau
          if (currentAudio && currentAudio.isPlaying()) {
            currentAudio.stop();
          }

          let newAudio = audioPlayers[zone.track.title];
          if (newAudio && newAudio.isLoaded()) {
            newAudio.play();
            currentAudio = newAudio;
            console.log("🎵 Lecture:", zone.track.title);
          }

          return; // ✅ IMPORTANT : Ne pas lancer de mini-jeu !
        }
      }
    }
    return;
  }

  // === EXPLORATION ===
  if (mode === "exploration") {
    // Clic sur les zones (blobs et boutons de map)
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

    // Bouton Valider
    let valBtnW = isMobile ? 240 : 200;
    let valBtnH = isMobile ? 55 : 45;
    let valBtnX = width / 2 - valBtnW / 2;
    let valBtnY = height - valBtnH - (isMobile ? 80 : 20);

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
      let withMap = { ...cleaned, mapName: "Mini-jeu" };
      playerCollection.push(withMap);
      localStorage.setItem("btm_collection", JSON.stringify(playerCollection));

      updateAvatarGif();
      evolutionTrack = cleaned;
      evolutionPoints = points;

      updateBackgroundClusterFromGenre(cleaned.genre);

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

    // Navigation entre cartes
    let unlocked = getUnlockedMaps();
    if (mouseX < 60 && mouseY > height / 2 - 30 && mouseY < height / 2 + 30) {
      if (currentMapIndex > 0) currentMapIndex--;
      return;
    } else if (
      mouseX > width - 60 &&
      mouseY > height / 2 - 30 &&
      mouseY < height / 2 + 30
    ) {
      if (currentMapIndex < unlocked.length - 1) currentMapIndex++;
      return;
    }

    // Bouton Collection
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
    // Clic sur l'avatar central
    if (dist(mouseX, mouseY, width / 2, height / 2) < 40) {
      currentMiniGameTrack = pickRandomTrackFromCollection();
      const gameTypes = ["tempo", "genre"];
      currentMiniGameType = random(gameTypes);
      generateMiniGame(currentMiniGameTrack);
      mode = "minigame";

      // Reset des flags pour le nouveau jeu
      window.miniGameStarted = false;
      window.miniGameMusicStarted = false;
      miniGameAttempts = 0; // Reset du compteur d'essais
      return;
    }

    // Autres boutons de l'avatar
    for (let zone of blobHitZones) {
      if (
        zone.type === "goToCollection" &&
        isInsideClickableZone(zone, mouseX, mouseY)
      ) {
        mode = "collection";
        return;
      }
    }
    return;
  }

  // Reset du flag shuffle à la fin
  justClickedShuffle = false;
}
/*
// Cherchez la fonction qui gère les clics sur la navigation et ajoutez :
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const targetMode = btn.dataset.mode;
    
    // ✅ AJOUTER : Marquer l'illumination Genre Map comme vue
    if (targetMode === "avatar") {
      localStorage.setItem("btm_genreMapIlluminationSeen", "true");
    }
    
    // ✅ OPTIONNEL : Garder l'ancienne logique Collection
    if (targetMode === "collection") {
      localStorage.setItem("btm_collectionIlluminationSeen", "true");
    }
    
    mode = targetMode;
    // ...rest of click logic...
  });
});
*/
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
  // 🔥 AJOUTER : Gestion du scroll tactile pour la collection
  if (mode === "collection") {
    let deltaY = (window.touchStartY || mouseY) - mouseY;
    handleCollectionScroll(deltaY / 10); // Divise pour un scroll plus doux
    window.touchStartY = mouseY;
    return false;
  }

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
  // 🔥 AJOUTER : Gestion du scroll pour la collection
  if (mode === "collection") {
    handleCollectionScroll(event.delta);
    return false; // Empêche le scroll par défaut de la page
  }

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

  // 🔥 AJOUTER : Pour la collection sur mobile
  if (mode === "collection") {
    window.touchStartY = mouseY;
  }

  // Simule le clic souris
  mousePressed();

  return false;
}

function touchEnded() {
  isDragging = false;
  lastTouch = null;
  return false;
}
