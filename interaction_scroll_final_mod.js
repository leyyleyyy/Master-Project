function forceDiscDisplayUpdate() {
  const container = document.getElementById("discsContainer");
  if (container) {
    container.style.display = "flex";
    container.classList.remove("discs-totem", "discs-minigame");
    container.classList.add("discs-minigame");
  }
  updateDiscsFromScore("gameSelector");
}

function getCollectionPointsBonus(track) {
  const cluster = getMostCommonCluster(playerCollection);
  const sameClusterCount = playerCollection.filter(
    (t) => getMostCommonCluster([t]) === cluster
  ).length;
  if (sameClusterCount === 0) return 10;
  if (sameClusterCount === 1) return 6;
  if (sameClusterCount === 2) return 3;
  if (sameClusterCount === 3) return 1;
  return -2;
}

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
  /*if (mode === "exploration" && trackSelectedForValidation) {
    const bonus = getGenreClusterPoints(trackSelectedForValidation);
    totemPoints += bonus;
    evolutionPoints = bonus;
    updatePlayerScore();
    localStorage.setItem("btm_totemPoints", totemPoints);

    // Réinitialise les disques
    discsEarned = 0;
    for (let i = 1; i <= 3; i++) {
      const disc = document.getElementById(`disc${i}`);
      if (disc) disc.classList.remove("earned");
    }

    // Ajouter à la collection
    playerCollection.push(cleanTrack(trackSelectedForValidation));
    localStorage.setItem("btm_collection", JSON.stringify(playerCollection));

    trackSelectedForValidation = null;
    mode = "evolution";
    redraw();
    return;
  }*/
  if (mode === "evolution") {
    totemPoints += evolutionPoints;
    localStorage.setItem("btm_totemPoints", totemPoints);
  }

  // === GESTION GLOBALE DE LA CROIX DE FERMETURE ===
  for (let zone of blobHitZones) {
    if (
      zone.type === "closeButton" &&
      isInsideClickableZone(zone, mouseX, mouseY)
    ) {
      console.log("❌ Fermeture via croix");

      // ✅ AJOUTER : Nettoyer la vidéo d'évolution
      if (typeof hideEvolutionVideo === "function") {
        hideEvolutionVideo();
      }

      // Arrêter l'audio si en cours
      if (currentAudio && currentAudio.isPlaying()) {
        currentAudio.stop();
      }

      // ✅ Logique conditionnelle selon le mode
      if (mode === "minigame") {
        // En mode minigame, retourner au gameSelector
        mode = "gameSelector";
        console.log("🎮 Retour au Game Selector depuis Mini-jeu");

        // Reset des variables du mini-jeu
        currentMiniGameTrack = null;
        miniGameOptions = [];
        miniGameAnswer = null;
        selectedOption = null;
        miniGameFeedback = "";
        window.miniGameStarted = false;
        window.miniGameMusicStarted = false;
        miniGameAttempts = 0;
      } else {
        // Pour tous les autres modes, retourner au totem
        mode = "totem";
        console.log("🏠 Retour au Totem depuis", mode);
      }

      return;
    }
  }
  // Dans votre fonction mousePressed(), ajoutez cette section :

  // === TOTEM EVOLUTION ===
  if (mode === "totemEvolution") {
    for (let zone of blobHitZones) {
      if (isInsideClickableZone(zone, mouseX, mouseY)) {
        if (zone.type === "continueFromEvolution") {
          // ✅ NOUVEAU : Réinitialiser les disques après l'évolution du totem
          discsEarned = 0;

          // Mettre à jour visuellement les disques
          for (let i = 1; i <= 3; i++) {
            const disc = document.getElementById(`disc${i}`);
            if (disc) disc.classList.remove("earned");
          }

          // Sauvegarder l'état des disques
          localStorage.setItem("btm_discsEarned", discsEarned.toString());

          console.log("🔄 Disques réinitialisés après évolution du totem");

          mode = "totem"; // ✅ Retourner vers le totem principal
          redraw();
          return;
        }
      }
    }
    return;
  }
  if (mode === "totem") {
    handleTotemClick(mouseX, mouseY);
    return;
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
      }
    }
    return;
  }

  // === POST MINI GAME LOSE ===
  if (mode === "postMiniGameLose") {
    for (let zone of blobHitZones) {
      if (zone.type === "retryMiniGame") {
        // Relancer un nouveau mini-jeu
        currentMiniGameTrack = pickRandomTrackFromDatabase();
        currentMiniGameType = random(["tempo", "genre", "visual_match"]);
        generateMiniGame(currentMiniGameTrack);
        mode = "gameSelector";
        redraw();
        return;
      }
      if (zone.type === "backToCollection") {
        mode = "totem";
        redraw();
        return;
      }
    }
  }

  // === HOW TO DIG ===

  if (mode === "preDig") {
    for (let zone of blobHitZones) {
      if (zone.type === "startDigging") {
        mode = "preDig";
        redraw();
        return;
      }
      if (zone.type === "backToTotem") {
        mode = "totem";
        redraw();
        return;
      }
    }
  }
  /*if (mode === "preDig" && !preDigBlockedTemporarily) {
    for (let zone of blobHitZones) {
      if (zone.type === "goDigging") {
        mode = "exploration";
        redraw();
        return;
      }
    }
  }
*/
  if (mode === "preDig") {
    for (let zone of blobHitZones) {
      if (isInsideClickableZone(zone, mouseX, mouseY)) {
        if (zone.type === "goDigging") {
          console.log("🎯 Clic sur goDigging - passage en exploration");
          mode = "exploration";
          redraw();
          return;
        }
        if (zone.type === "backToTotem") {
          console.log("🏠 Retour au totem");
          mode = "totem";
          redraw();
          return;
        }
      }
    }
    // Ne rien faire si pas de clic dans une zone
    return;
  }

  // === POST MINI GAME WIN ===
  if (mode === "postMiniGameWin") {
    for (let zone of blobHitZones) {
      if (
        zone.type === "continueExploration" &&
        isInsideClickableZone(zone, mouseX, mouseY)
      ) {
        console.log("✅ Clic sur Continuer - Retour au Totem");

        // ✅ MODIFIER : Aller vers totem au lieu d'exploration
        mode = "totem";

        // Réinitialiser les variables du mini-jeu
        lastMiniGameTrack = null;
        currentMiniGameTrack = null;
        miniGameOptions = [];
        miniGameAnswer = null;
        selectedOption = null;
        miniGameFeedback = "";
        window.miniGameStarted = false;
        window.miniGameMusicStarted = false;

        return;
      }
    }
    return;
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
      mode = "totemEvolution";
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
          /*
          // 🎵 Ajouter à la collection comme avant
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
            }
          }
*/
          // ✅ NOUVEAU : Gagner un disque au lieu de points
          gainDisc();
          forceDiscDisplayUpdate();
          // ✅ Message différent selon le nombre de disques
          let motivationMessage = "";
          if (discsEarned === 1) {
            motivationMessage = "Premier disque gagné ! 💿";
          } else if (discsEarned === 2) {
            motivationMessage = "Deuxième disque ! Plus qu'un ! 💿💿";
          } else if (discsEarned >= 3) {
            motivationMessage =
              "Tous les disques gagnés ! Stream débloqué ! 💿💿💿🌊";
          }

          console.log(motivationMessage);

          // 🏆 Calculer les points basés sur les essais
          // ✅ MODIFIER : Toujours 1 point pour tous les mini-jeux
          let points = 1; // ← Directement 1 au lieu de getMiniGamePoints(actualAttempts)

          let previousScore = playerScore;
          playerScore += points;
          updateDiscsFromScore;
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
          console.log("💔 Mauvaise réponse → échec immédiat (visual_match)");
          mode = "postMiniGameLose";
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
        /*
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
*/
        // 🏆 Calculer les points basés sur les essais
        // ✅ MODIFIER : Toujours 1 point pour tous les mini-jeux classiques aussi
        let points = 1; // ← Directement 1 au lieu de getMiniGamePoints(actualAttempts)

        playerScore += points;
        gainDisc(); // ajoute un disque
        updateDiscsFromScore("minigame"); // force le changement visuel tout de suite

        // ✅ SAUVEGARDER LE SCORE
        localStorage.setItem("btm_score", playerScore.toString());

        pointFeedbacks.push({
          points,
          x: width / 2,
          y: height / 2,
          alpha: 255,
          size: 36,
        });

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
        console.log("💔 Mauvaise réponse");
        mode = "postMiniGameLose";
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
      let points = getGenreClusterPoints(selectedPendingTrack); // ← GARDER : Système de points variable pour l'exploration
      playerScore += points;
      updateDiscsFromScore(); // ✅ CORRIGER : Ajouter les parenthèses manquantes
      collectionPoints += points;
      updatePlayerScore();

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

isDragging = false;
lastTouch = null;

function touchMoved() {
  // Collection scroll (existant)
  if (mode === "collection") {
    let deltaY = (window.touchStartY || mouseY) - mouseY;
    handleCollectionScroll(deltaY / 10);
    window.touchStartY = mouseY;
    return false;
  }

  // ✅ MODIFIÉ : Avatar sans zoom, seulement scroll
  if (mode === "avatar") {
    if (touches.length === 1) {
      // Scroll avec un doigt seulement
      if (
        typeof lastTouchX !== "undefined" &&
        typeof lastTouchY !== "undefined"
      ) {
        let deltaX = touches[0].x - lastTouchX;
        let deltaY = touches[0].y - lastTouchY;
        handleAvatarDrag(deltaX, deltaY);
      }

      lastTouchX = touches[0].x;
      lastTouchY = touches[0].y;
      return false;
    }
  }

  // Ancien code pour autres modes
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
