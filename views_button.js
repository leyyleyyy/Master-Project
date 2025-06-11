// Variables pour gérer les touches
let lastTouchDistance = 0;
let lastTouchX, lastTouchY;
window.lastEvolutionPlayed = null;

// buttons.js — module centralisé pour tous les boutons de l'app

function drawStyledButton(
  label,
  x,
  y,
  w,
  h,
  {
    variant = "default", // "default", "col", "stream", "locked"
    font = bananaFont,
    fontSize = isMobile ? 80 : 16,
    radius = isMobile ? 80 : 12,
    isActive = true,
    hasShadow = true,
  } = {}
) {
  // === Style par défaut (noir transparent + bord blanc doux)
  let fillColor = color(10, 8, 11, isActive ? 10 : 5);
  let strokeColor = color(0, 0, 100, isActive ? 100 : 100);
  let textColor = color(0, 0, isActive ? 100 : 60);

  // === Variantes
  if (variant === "col") {
    fillColor = color(0, 0, 0, 0); // transparent
    strokeColor = color(0, 0, 100, isActive ? 80 : 20); // bord blanc vif
    textColor = color(0, 0, isActive ? 100 : 60);
  } else if (variant === "stream") {
    fillColor = color(0, 0, 100); // blanc pur
    strokeColor = color(0, 0, 100, 60);
    textColor = color(0, 0, 0); // texte noir
  } else if (variant === "selector") {
    fillColor = color(10, 8, 11);
    strokeColor = color(0, 0, 100);
    textColor = color(0, 0, 100);
  } else if (variant === "game") {
    fillColor = color(10, 0, 0, isActive ? 80 : 20); // blanc pur
    strokeColor = color(0, 0, 100);
    textColor = color(0, 0, 100);
  }

  // === Rectangle
  fill(fillColor);
  stroke(strokeColor);
  strokeWeight(1.5);
  rect(x, y, w, h, radius);

  // === Texte
  noStroke();
  fill(textColor);
  textAlign(CENTER, CENTER);
  textFont(font);
  textSize(fontSize);

  // Gestion du label avec icône 🔒
  if (label.includes("🔒")) {
    let parts = label.split("🔒");
    let icon = "🔒";
    let textOnly = parts[1].trim();

    textFont("sans-serif");
    let iconWidth = textWidth(icon);

    textFont(font);
    let textWidthOnly = textWidth(textOnly);

    let spacing = 20;
    let totalWidth = iconWidth + spacing + textWidthOnly;
    let startX = x + w / 2 - totalWidth / 2;

    textFont("sans-serif");
    text(icon, startX + iconWidth / 2, y + h / 2);

    textFont(font);
    text(textOnly, startX + iconWidth + spacing + textWidthOnly / 2, y + h / 2);
  } else {
    text(label, x + w / 2, y + h / 2);
  }
}
function drawButtonGame(label, x, y, w, h, isActive = true) {
  let radius = isMobile ? 80 : 24;
  let fontSize = isMobile ? 60 : 20;

  // === STYLE MODERNE ===
  let fillColor = isActive ? color(10, 0, 0, 70) : color(10, 0, 0, 45); // léger fond blanc
  let shadowColor = isActive ? color(0, 0, 100, 40) : color(0, 0, 100, 15); // ombre blanche douce
  let textColor = color(0, 0, 100);

  // === Ombre portée style glass / soft UI ===
  drawingContext.shadowBlur = isActive ? 90 : 10;
  drawingContext.shadowColor = shadowColor;

  fill(fillColor);
  noStroke(); // ❌ plus de bordure
  rect(x, y, w, h, radius);

  // === Texte
  drawingContext.shadowBlur = 0; // pas d'ombre sur le texte
  fill(textColor);
  noStroke();
  textFont(manropeSemiBold);
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
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
  drawCloseButton();
  // ✅ MODIFIER : Utiliser la même position que gameSelector
  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(isMobile ? 28 : 20);
  textFont(manropeFont);
  //text(`Score : ${playerScore}`, width / 2, isMobile ? 320 : 100);

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

  const mapCarousel = document.getElementById("mapCarousel");

  if (mode === "exploration") {
    mapCarousel.style.display = "block"; // Affiche le carousel
    mapCarousel.innerHTML = ""; // Nettoie les anciens boutons

    maps.forEach((map, i) => {
      const isUnlocked = playerScore >= map.unlockScore;
      const button = document.createElement("button");
      button.className =
        "map-carousel-btn" + (i === currentMapIndex ? " active" : "");
      button.disabled = !isUnlocked;
      button.textContent = isUnlocked ? map.name : "🔒 " + map.name;
      button.onclick = () => {
        currentMapIndex = i;
        redraw();
      };
      mapCarousel.appendChild(button);
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

  push();
  translate(scrollXOffset, scrollYOffset);
  let visibleTracks = currentMap.tracks;
  let blobSize = isMobile ? 250 : 90;
  let savedT = t;
  t = 0;
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

        drawTrackBlob(track, x, y, blobSize, i, false, true, false, true); // hitZone stable
        t = savedT;
        t += 0.01;

        //drawTrackBlob(track, x, y, blobSize, i);
        //drawTrackBlob(blob, blobX, blobY, blobSize, i, false, true, true);

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

  let valBtnW = isMobile ? 820 : 250;
  let valBtnH = isMobile ? 185 : 55;
  let valBtnX = width / 2 - valBtnW / 2;
  let valBtnY = height - valBtnH - (isMobile ? 80 : 20);
  drawStyledButton("Ajouter", valBtnX, valBtnY, valBtnW, valBtnH, {
    variant: "selector",
  });
}

function drawMiniGameView() {
  imageMode(CORNER);
  image(minigameBackground, 0, 0, width, height);
  // === ÉCRAN DE DÉMARRAGE ===
  if (!window.miniGameStarted) {
    fill(0, 0, 0, 150); // Overlay sombre
    rect(0, 0, width, height);

    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(isMobile ? 48 : 32);
    text(" Appuie pour commencer", width / 2, height / 2);

    textSize(isMobile ? 24 : 18);
    text("(La musique va se lancer)", width / 2, height / 2 + 60);
    drawCloseButton();

    return; // Stoppe l'affichage du jeu
  }
  drawCloseButton();

  let valBtnW = isMobile ? 820 : 250;
  let valBtnH = isMobile ? 170 : 55;
  let valX = width / 2 - valBtnW / 2;
  let valY = height - valBtnH - (isMobile ? 80 : 20);

  // === Consigne du jeu
  fill(0, 0, 80);
  textSize(isMobile ? 52 : 26);
  textAlign(CENTER, CENTER);
  textWrap(WORD);
  textFont("sans-serif");
  let instruction = "";
  if (currentMiniGameType === "tempo")
    instruction = "Écoute bien… c’est rapide ou lent ? Trouve le BPM";
  else if (currentMiniGameType === "genre")
    instruction = "Tu reconnais le style ? Trouve le genre de cette musique";
  else if (currentMiniGameType === "visual_match")
    instruction = "Deux sons. Lequel est le plus streamé ?";

  //text(instruction, width / 2, isMobile ? 300 : 160);
  let maxTextWidth = width * 0.85; // 👈 largeur max
  let textY = isMobile ? 190 : 160;
  let textX = width / 2 - maxTextWidth / 2;
  textFont("sans-serif");

  text(instruction, textX, textY, maxTextWidth);
  // === Jeu VISUAL_MATCH ===
  if (currentMiniGameType === "visual_match" && miniGameOptions.length === 2) {
    let blobSize = isMobile ? 240 : 160;
    let spacing = isMobile ? 200 : 260;
    let baseY = height / 2 - spacing / 2;

    for (let i = 0; i < 2; i++) {
      let blob = miniGameOptions[i];
      let blobX = width / 2;
      let blobY = baseY + i * spacing;

      push();
      translate(blobX, blobY);

      // 🤍 Glow uniquement si sélectionné (comme dans exploration)
      selectedTrack = selectedOption === i ? blob : null;

      drawTrackBlob(blob, 0, 0, blobSize, i, false, true);

      selectedTrack = null;
      pop();
    }

    drawStyledButton("Valider", valX, valY, valBtnW, valBtnH, {
      variant: "selector",
    });
    return;
  }

  // === Jeux classiques (tempo / genre)
  let titleSize = isMobile ? 34 : 28;
  let labelSize = isMobile ? 16 : 14;
  let blobCenterY = height * 0.4;

  if (currentMiniGameTrack) {
    push();
    drawTrackBlob(
      currentMiniGameTrack,
      width / 2,
      height * 0.4 - 150,
      isMobile ? 460 : 100,
      0
    );
    pop();
  }

  // let btnW = isMobile ? width * 0.9 : min(500, width * 0.65);
  let btnW = isMobile ? width * 0.75 : 300;

  let btnH = isMobile ? 150 : 75; // ← plus haut
  let spacing = isMobile ? 30 : 35; // ← plus espacé

  let startY = blobCenterY + (isMobile ? 140 : 100);

  for (let i = 0; i < miniGameOptions.length; i++) {
    let option = miniGameOptions[i];
    let x = width / 2 - btnW / 2;
    let y = startY + i * (btnH + spacing);

    drawButtonGame(
      option + (miniGameUnit || ""),
      x,
      y,
      btnW,
      btnH,
      selectedOption === i
    );
  }
  //drawCloseButton();

  drawStyledButton("Valider", valX, valY, valBtnW, btnH, {
    variant: "selector",
  }); // ✅ valBtnH existe bien
}

function playMorphVideo(stage) {
  const video = document.getElementById("morphVideo");
  if (!video) return;

  console.log("🎬 playMorphVideo stage:", stage);

  video.src = `videos/${stage}.mp4`;
  video.style.display = "block";
  video.currentTime = 0;
  video.muted = true;

  // ✅ IMPORTANT : Forcer le rechargement et la lecture
  video.load();

  // ✅ Attendre que la vidéo soit prête avant de jouer
  video.addEventListener(
    "loadeddata",
    () => {
      console.log("🎥 Video readyState =", video.readyState);

      video.play().catch((e) => console.log("Erreur lecture vidéo:", e));
    },
    { once: true }
  );

  video.onended = () => {
    video.pause();
    video.currentTime = video.duration;
  };
}

function playEvolutionVideo(stage) {
  const video = document.getElementById("evolutionVideo");
  if (!video) return;

  // 🔁 Reset complet
  video.pause();
  //video.removeAttribute("src");
  //video.load();

  // 🎬 Définir le nouveau src
  const newSrc = `videos/evolution_${stage}.mp4`;
  video.src = newSrc;

  // ✅ Appliquer les attributs essentiels
  video.setAttribute("playsinline", "true");
  video.setAttribute("muted", "true");
  video.setAttribute("autoplay", "true");
  video.muted = true;
  video.loop = true;
  video.style.display = "block";
  video.currentTime = 0;

  console.log("▶️ Tentative de lecture :", newSrc);

  // ✅ Attendre que la vidéo soit prête
  video.addEventListener(
    "canplay",
    () => {
      console.log("🟢 Vidéo peut être jouée");
      video
        .play()
        .then(() => {
          console.log("✅ Lecture démarrée");
        })
        .catch((e) => {
          console.warn("❌ Erreur lecture après canplay :", e);
        });
    },
    { once: true }
  );
}

function drawEvolutionView() {
  if (!evolutionTrack) {
    background(0, 0, 11);
    fill(0, 0, 100);
    textAlign(CENTER, CENTER);
    textSize(isMobile ? 35 : 20);
    text("Erreur : aucune musique en évolution", width / 2, height / 2);
    return;
  }

  background(10, 8, 11);
  // === 🎨 Affiche le blob de evolutionTrack ===
  push();
  translate(width / 2, height * 0.3); // position ajustable
  drawTrackBlob(
    evolutionTrack,
    0,
    0,
    isMobile ? 300 : 180,
    0,
    false, // fixedWhiteMode
    true, // isUnlocked
    false // forceRound
  );
  pop();

  push();
  let x = width / 2; // ✅ Position X centrée
  let y = height / 2 - (isMobile ? -10 : 150);
  let spacing = isMobile ? 90 : 50;

  // 🎉 Titbre
  textAlign(CENTER, CENTER);
  textFont(bananaFont);
  textSize(isMobile ? 140 : 28);
  text("+ 1 Musique !", width / 2, height / 2 - 600);

  colorMode(HSB, 360, 100, 100, 100);
  textSize(isMobile ? 26 : 20);
  textFont("sans-serif");
  textAlign(CENTER, CENTER); // ✅ CHANGER : CENTER pour vraiment centrer
  textWrap(WORD);
  noStroke();

  if (typeof evolutionPoints === "undefined") {
    evolutionPoints = 0;
  }

  // 🎯 Points
  textSize(isMobile ? 56 : 24);
  if (evolutionPoints >= 0) {
    fill(120, 100, 100);
  } else {
    fill(0, 100, 100);
  }

  // ✅ CORRIGER : Enlever la largeur pour un vrai centrage
  text(
    `${evolutionPoints >= 0 ? "+" : ""}${evolutionPoints} points ${
      evolutionPoints >= 0 ? "🎉" : "😞"
    }`,
    x,
    y
  );
  y += spacing;

  // Add
  textSize(isMobile ? 36 : 20);
  fill(0, 0, 100);
  text(`Tu as ajouté ... `, x, y);
  y += spacing;

  // 🎵 Titre
  textSize(isMobile ? 66 : 20);
  fill(0, 0, 100);
  textWrap(WORD);
  let maxTextWidth = width * 0.85; // 85% de la largeur de l'écran
  let textStartX = width / 2 - maxTextWidth / 2; // Position de départ pour centrer
  text(
    `${evolutionTrack.title || "—"}, ${evolutionTrack.artist || "—"}`,
    textStartX,
    y,
    maxTextWidth
  );
  y += spacing;

  // 🎧 Genre
  if (evolutionTrack.genre) {
    textSize(isMobile ? 32 : 18);
    fill(0, 0, 90);
    text(`🎧 Genre débloqué : ${evolutionTrack.genre}`, x, y);
    y += spacing;
  }

  // 💬 Commentaires - ✅ CORRIGER : Si texte long, utiliser LEFT + calcul manuel
  if (
    typeof getMostCommonCluster === "function" &&
    typeof getEvolutionComment === "function"
  ) {
    let dominantCluster = getMostCommonCluster(playerCollection);
    let evolutionComments = getEvolutionComment(
      evolutionTrack,
      dominantCluster
    );

    textSize(isMobile ? 36 : 16);
    fill(0, 0, 80);

    if (evolutionComments && evolutionComments.length > 0) {
      for (let comment of evolutionComments) {
        // ✅ SOLUTION : Si le commentaire est court, centrer. Si long, utiliser LEFT
        if (comment.length < 50) {
          textAlign(CENTER, CENTER);
          text(comment, x, y);
        } else {
          textAlign(LEFT, CENTER);
          let maxTextWidth = isMobile ? width * 0.85 : width * 0.6;
          let textX = width / 2 - maxTextWidth / 2;
          text(comment, textX, y, maxTextWidth);
        }
        y += spacing;
      }
    }
  }

  pop();

  // ✅ Bouton

  /*let btnW = isMobile ? width * 0.6 : 250;
  let btnH = isMobile ? 160 : 60;
  let btnX = width / 2 - btnW / 2;
  let btnY = height - (isMobile ? 160 : 120);

  drawStyledButton("Continuer", btnX, btnY, btnW, btnH);*/
  let btnW = isMobile ? 820 : 250;
  let btnH = isMobile ? 185 : 55;
  let btnX = width / 2 - btnW / 2;
  let btnY = height - btnH - (isMobile ? 80 : 20);
  drawStyledButton("Continuer", btnX, btnY, btnW, btnH, {
    variant: "selector",
  });
}

function drawEvolutionTotemView() {
  const evolutionVideo = document.getElementById("evolutionVideo");
  const evolutionVideoWrapper = document.getElementById(
    "evolutionVideoWrapper"
  );

  // ✅ Afficher wrapper
  if (evolutionVideoWrapper) {
    evolutionVideoWrapper.style.display = "block";
  }

  // ✅ Masquer morph video
  const morphVideo = document.getElementById("morphVideo");
  const morphWrapper = document.getElementById("videoWrapper");
  if (morphVideo) morphVideo.pause();
  if (morphVideo) morphVideo.style.display = "none";
  if (morphWrapper) morphWrapper.style.display = "none";

  background(10, 8, 11);

  // === TITRE
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textFont(bananaFont);
  textSize(isMobile ? 120 : 36);
  text("Ton Totem", width / 2, isMobile ? 200 : 120);

  // === VIDÉO d'ÉVOLUTION
  if (evolutionVideo && evolutionVideoWrapper) {
    evolutionVideoWrapper.style.position = "fixed";
    evolutionVideoWrapper.style.left = "50%";
    evolutionVideoWrapper.style.top = "50%";
    evolutionVideoWrapper.style.transform = "translate(-50%, -50%)";
    evolutionVideoWrapper.style.zIndex = "1000";
    evolutionVideoWrapper.style.width = isMobile ? "400px" : "300px";
    evolutionVideoWrapper.style.height = isMobile ? "400px" : "300px";

    evolutionVideo.style.width = "100%";
    evolutionVideo.style.height = "100%";
    evolutionVideo.style.borderRadius = "50%";
    evolutionVideo.style.objectFit = "cover";

    // ✅ Lecture conditionnelle avec vérif du stage
    const stage = getAvatarStage();
    if (window.lastEvolutionPlayed !== stage) {
      playEvolutionVideo(stage);
      window.lastEvolutionPlayed = stage;
    }
  }

  // === PHRASE D'ÉVOLUTION - MODIFIER cette ligne ===
  let evolutionPhrase = getTotemEvolutionPhrase(); // ← Changement ici
  fill(0, 0, 90);
  textFont("sans-serif");
  textSize(isMobile ? 40 : 20);
  textAlign(CENTER, CENTER);
  textWrap(WORD);

  let maxTextWidth = width * 0.85;
  let phraseY = height / 2 + (isMobile ? 320 : 220);
  text(evolutionPhrase, width / 2 - maxTextWidth / 2, phraseY, maxTextWidth);

  // === BOUTON CONTINUER
  let btnW = isMobile ? 820 : 250;
  let btnH = isMobile ? 185 : 55;
  let btnX = width / 2 - btnW / 2;
  let btnY = height - btnH - (isMobile ? 80 : 20);

  drawStyledButton("Continuer", btnX, btnY, btnW, btnH, {
    variant: "selector",
  });

  if (!blobHitZones) blobHitZones = [];
  blobHitZones.push({
    type: "continueFromEvolution",
    x: btnX,
    y: btnY,
    w: btnW,
    h: btnH,
  });
}

function drawCollectionView() {
  blobHitZones = [];
  background(10, 8, 11);
  drawCloseButton();

  textFont("sans-serif");

  // === Applique le scroll à TOUT le contenu ===
  push();
  translate(0, window.collectionScrollY || 0);

  // === Avatar en grand ===
  let avatarSize = isMobile ? 220 : 160;
  let avatarY = 140;
  let avatarImg = document.getElementById("avatar");
  if (avatarImg) {
    avatarImg.classList.add("avatar-collection");
  }

  // === Titre + score ===
  let infoY = height / 2 - 30;
  fill(0, 0, 100);
  textSize(28);
  textAlign(CENTER);
  textFont("sans-serif");

  text(`Score total : ${playerScore}`, width / 2, infoY);

  // === Playlists par map ===
  let allPlaylists = [
    ...new Set(playerCollection.map((t) => t.mapName || "Inconnue")),
  ];

  // Initialise activePlaylist s'il n'existe pas
  if (typeof window.activePlaylist === "undefined") {
    window.activePlaylist = allPlaylists[0];
  }

  // Affichage des boutons de playlist
  let btnW = isMobile ? 160 : 140;
  let btnH = isMobile ? 55 : 40;
  let spacing = 20;
  let startX =
    width / 2 - (allPlaylists.length * (btnW + spacing) - spacing) / 2;
  let btnY = infoY + 60;

  for (let i = 0; i < allPlaylists.length; i++) {
    let label = allPlaylists[i];
    let x = startX + i * (btnW + spacing);

    drawStyledButton(
      label,
      x,
      btnY,
      btnW,
      btnH,
      label === window.activePlaylistx
    ),
      { variant: "col" };

    blobHitZones.push({
      type: "playlistSelect",
      x,
      y: btnY,
      w: btnW,
      h: btnH,
      playlist: label,
    });
  }

  // === Zone des blobs + morceaux ===
  let filteredTracks = playerCollection.filter(
    (t) => (t.mapName || "Inconnue") === window.activePlaylist
  );
  let grouped = groupByCluster(filteredTracks);
  let clusters = Object.keys(grouped);
  let y = btnY + btnH + 60; // Position de départ

  // 🎨 Tailles améliorées - PLUS GROS
  let blobSize = isMobile ? 200 : 120;
  let lineHeight = blobSize + 100;
  let textOffsetX = blobSize + 100;
  let leftMargin = isMobile ? 100 : 80;

  for (let cluster of clusters) {
    let tracks = grouped[cluster];

    // Nom du cluster
    fill(220, 80, 100);
    textSize(isMobile ? 36 : 28);
    textAlign(LEFT);
    text(cluster, leftMargin, y);
    y += 80;

    for (let track of tracks) {
      let blobX = leftMargin + blobSize / 2;
      let blobY = y + blobSize / 2;

      // 🎨 Dessin du blob avec illumination si sélectionné
      push();
      translate(blobX, blobY);

      // ✅ CORRIGER : Garder la forme originale, juste changer l'illumination
      let isSelectedTrack =
        selectedTrack && selectedTrack.title === track.title;

      // ✅ MODIFICATION : Utiliser un paramètre pour contrôler seulement l'illumination
      drawTrackBlob(track, 0, 0, blobSize, 0, false, true, false); // ✅ Dernier paramètre à false

      // ✅ AJOUTER : Effet d'illumination personnalisé si sélectionné

      pop();

      // 🎯 Zone clic
      blobHitZones.push({
        x: blobX,
        y: blobY,
        r: blobSize / 2,
        track: track,
        type: "collectionPlay",
      });

      // 🎵 Texte à droite
      fill(0, 0, 100);
      textAlign(LEFT);
      textSize(isMobile ? 28 : 20);
      text(track.title || "Sans titre", blobX + textOffsetX, y + 35);

      fill(0, 0, 60);
      textSize(isMobile ? 24 : 18);
      text(track.artist || "Artiste inconnu", blobX + textOffsetX, y + 70);

      y += lineHeight;
    }

    y += 80;
  }

  // 🔧 Calcul de la hauteur totale du contenu
  window.collectionContentHeight = y + 100; // +100 pour une marge en bas

  pop(); // Fin du translate global
}

function groupByCluster(tracks) {
  let grouped = {};
  for (let t of tracks) {
    let cluster = getGenreCluster(t.genre);
    if (!grouped[cluster]) grouped[cluster] = [];
    grouped[cluster].push(t);
  }
  return grouped;
}

function handlePlaylistSelection(mx, my) {
  for (let zone of blobHitZones) {
    if (
      zone.type === "playlistSelect" &&
      mx >= zone.x &&
      mx <= zone.x + zone.w &&
      my >= zone.y &&
      my <= zone.y + zone.h
    ) {
      window.activePlaylist = zone.playlist;
      redraw();
      return true;
    }
  }
  return false;
}

function drawAvatarView() {
  background(10, 8, 11);

  let genreAvgs = getGenreAverages();
  let genreStats = getGenreStats();
  let genreUnlocked = genreStats.map((g) => g.name);
  let genreNames = Object.keys(genreAvgs);

  const hasUnlockedGenres = genreUnlocked.length > 0;
  canScrollAvatar = hasUnlockedGenres;

  // Construction des blobs (inchangé)
  if (!window.genreBlobs || window.genreBlobs.length !== genreNames.length) {
    const clusterGenreMap = {};
    for (let genre of genreNames) {
      const cluster = getClusterNameForGenre(genre);
      if (!clusterGenreMap[cluster]) clusterGenreMap[cluster] = [];
      clusterGenreMap[cluster].push(genre);
    }

    window.genreBlobs = genreNames.map((genre, i) => {
      const cluster = getClusterNameForGenre(genre);
      const clusterGenres = clusterGenreMap[cluster];
      const localIndex = clusterGenres.indexOf(genre);
      const pos = getPositionForGenre(genre, localIndex, clusterGenres.length);

      const isUnlocked =
        genreUnlocked.includes(genre) ||
        genreUnlocked.includes(genre.toLowerCase());

      return {
        title: genre,
        genre: genre,
        ...genreAvgs[genre],
        pos,
        isUnlocked,
        index: i,
      };
    });

    let focusGenre = scrollToGenre || genreUnlocked[0];

    if (!focusGenre) {
      let centerX = 0;
      let centerY = 0;
      for (let blob of window.genreBlobs) {
        centerX += blob.pos.x;
        centerY += blob.pos.y;
      }
      centerX /= window.genreBlobs.length;
      centerY /= window.genreBlobs.length;
      scrollXOffset = width / 2 - centerX;
      scrollYOffset = height / 2 - centerY;
      console.log("📍 Centrage par défaut (aucun genre débloqué)");
    } else {
      const focusBlob = window.genreBlobs.find((b) => b.title === focusGenre);
      if (focusBlob) {
        const verticalOffset = height * 0.35;
        scrollXOffset = width / 2 - focusBlob.pos.x;
        scrollYOffset = height / 2 - focusBlob.pos.y - verticalOffset;
        console.log("📍 Centrage sur :", focusGenre);
      } else {
        console.warn("❌ Genre non trouvé pour recentrage :", focusGenre);
      }
    }

    scrollToGenre = null;
  }

  // 🎨 DESSIN
  push();
  translate(scrollXOffset, scrollYOffset);
  scale(window.avatarZoom); // ✅ AJOUTER cette ligne

  let screenMin = min(windowWidth, windowHeight);
  let blobSize = isMobile ? min(screenMin * 0.45, 240) : 80;

  // ✅ MODIFIER : Ne pas ajouter de zones cliquables pour les blobs
  for (let blob of window.genreBlobs) {
    const isUnlocked =
      genreUnlocked.includes(blob.genre) ||
      genreUnlocked.includes(blob.genre.toLowerCase());
    let { pos, index } = blob;

    drawTrackBlob(blob, pos.x, pos.y, blobSize, index, false, isUnlocked);

    if (isUnlocked) {
      fill(0, 0, 100);
      textAlign(CENTER);
      textFont(manropeFont);
      textSize(isMobile ? 42 : 18);
      textStyle(BOLD);
      text(blob.genre, pos.x, pos.y + blobSize / 2 + 20);
      textStyle(NORMAL);
    }
  }

  pop();

  // ✅ AJOUTER : Initialiser blobHitZones vide pour éviter les clics parasites
  blobHitZones = [];
}

function drawGameSelectorView() {
  imageMode(CORNER);
  image(minigameBackground, 0, 0, width, height);
  drawCloseButton();

  // Reste du code existant...
  textAlign(CENTER, CENTER);
  fill(0, 0, 100);
  textFont(bananaFont);

  let options = [
    { label: "Feel the Beat", type: "tempo" },
    { label: "GenreGuesser", type: "genre" },
    { label: "Pop’ Or Not", type: "visual_match" },
  ];

  let btnW = isMobile ? width * 0.85 : 300;
  let btnH = isMobile ? 160 : 70;
  let spacing = isMobile ? 80 : 40;
  //let startY = height / 2 - ((btnH + spacing) * options.length - spacing) / 2;
  let totalHeight = btnH * options.length + spacing * (options.length - 1);
  let startY = height / 2 - totalHeight / 2 + 65;

  for (let i = 0; i < options.length; i++) {
    let x = width / 2 - btnW / 2;
    let y = startY + i * (btnH + spacing);
    drawStyledButton(options[i].label, x, y, btnW, btnH, {
      variant: "selector",
    });
    // Ajout de la zone cliquable
    blobHitZones.push({
      type: "gameChoice",
      x,
      y,
      w: btnW,
      h: btnH,
      miniGameType: options[i].type,
    });
  }

  let lockBtnW = btnW;
  let lockBtnH = btnH;
  let lockBtnX = width / 2 - lockBtnW / 2;
  let lockBtnY = height - lockBtnH - (isMobile ? 60 : 40);
  const isUnlocked = discsEarned >= 3;
}

function drawPostMiniGameWinView() {
  //imageMode(CORNER);
  //image(winBackground, 0, 0, width, height);
  background(0, 0, 10); // Fond uni pour simplifier
  textAlign(LEFT, CENTER); // ← important : LEFT + largeur fixée
  textWrap(WORD);
  fill(0, 0, 100);
  textFont("sans-serif");
  let baseY = height / 2 - 600;
  let spacing = isMobile ? 160 : 30;
  let maxTextWidth = width * 0.85;
  let textX = width / 2 - maxTextWidth / 2; // ← centre visuel

  // 🎉 Titre
  textAlign(CENTER, CENTER);
  textFont(bananaFont);
  textSize(isMobile ? 140 : 28);
  text("Bravo !", width / 2, baseY);

  // ✅ Confirmation
  textSize(isMobile ? 50 : 18);
  textFont("sans-serif");
  textStyle(BOLD);

  text("Tu as gagné... ", width / 2, baseY + spacing);

  textSize(isMobile ? 140 : 28);
  text("+ 1 💿 ", width / 2, baseY + spacing + 200);

  textFont("sans-serif");
  textStyle(NORMAL);
  // 🎵 Musique
  /*if (lastMiniGameTrack) {
    let title = lastMiniGameTrack.title || "Titre inconnu";
    let artist = lastMiniGameTrack.artist || "Artiste inconnu";
    fill(0, 0, 95);
    textSize(isMobile ? 60 : 16);
    textAlign(CENTER, CENTER);

    text(`${title} – ${artist}`, width / 2, baseY + spacing * 2); // 👈 pas de largeur
  }*/

  // 🧠 Anecdote
  let anecdote = getMiniGameAnecdote(currentMiniGameType, lastMiniGameTrack);
  fill(0, 0, 85);
  textSize(isMobile ? 38 : 14);
  text(anecdote, textX, baseY + spacing + 600, maxTextWidth);

  // 💡 Astuce
  /*fill(0, 0, 80);
  textSize(isMobile ? 28 : 14);
  text(
    "💡 Astuce : cherche une musique suisse pour marquer plus de points !",
    textX,
    baseY + spacing * 4,
    maxTextWidth
  );

  // 💠 Blob musique

  if (lastMiniGameTrack) {
    let scalePulse = 1 + 0.05 * sin(frameCount * 0.1);
    push();
    translate(width / 2, baseY + spacing * 6 - 800);
    scale(scalePulse);
    drawTrackBlob(lastMiniGameTrack, 0, 0, 120, 0, false, true);
    pop();
  }
*/
  // 🟦 Bouton continuer

  let btnW = isMobile ? 820 : 240;
  let btnH = isMobile ? 130 : 55;
  let btnX = width / 2 - btnW / 2;
  let btnY = baseY + spacing * 7 + 30;

  // ✨ Changer le texte du bouton si on vient de débloquer
  //let justUnlocked = localStorage.getItem("btm_justUnlockedStream") === "true";
  //let buttonText = justUnlocked ? "Découvrir la surprise !" : "Continuer";

  drawStyledButton("Continuer", btnX, btnY, btnW, btnH);

  blobHitZones.push({
    type: "continueExploration",
    x: btnX,
    y: btnY,
    w: btnW,
    h: btnH,
  });
  drawCloseButton();
}

function drawPostMiniGameLoseView() {
  background(0, 0, 10); // Fond uni pour simplifier
  textAlign(LEFT, CENTER); // ← important : LEFT + largeur fixée
  textWrap(WORD);
  fill(0, 0, 100);
  textFont("sans-serif");
  let baseY = height / 2 - 600;
  let spacing = isMobile ? 160 : 30;
  let maxTextWidth = width * 0.85;
  let textX = width / 2 - maxTextWidth / 2; // ← centre visuel

  // 😞 Titre
  textAlign(CENTER, CENTER);
  textFont(bananaFont);
  textSize(isMobile ? 140 : 28);
  fill(0, 0, 100); // Rouge pour la défaite
  text("Dommage !", width / 2, baseY);

  // ❌ Message de défaite
  textSize(isMobile ? 50 : 18);
  textFont("sans-serif");
  textStyle(BOLD);
  fill(0, 0, 100);

  text("Ce n'était pas la bonne réponse...", width / 2, baseY + spacing);

  textFont("sans-serif");
  textStyle(NORMAL);

  // 🧠 Message encourageant avec explication
  let encouragementMessage = getMiniGameEncouragement(
    currentMiniGameType,
    lastMiniGameTrack
  );
  fill(0, 0, 85);
  textSize(isMobile ? 38 : 14);
  text(encouragementMessage, textX, baseY + spacing + 600, maxTextWidth);

  // 🟦 Bouton réessayer
  let btnW = isMobile ? 820 : 240;
  let btnH = isMobile ? 130 : 55;
  let btnX = width / 2 - btnW / 2;
  let btnY = baseY + spacing * 7 + 30;

  drawStyledButton("Réessayer", btnX, btnY, btnW, btnH, {
    variant: "col",
  });

  blobHitZones.push({
    type: "retryMiniGame",
    x: btnX,
    y: btnY,
    w: btnW,
    h: btnH,
  });

  drawCloseButton();
}

function getMiniGameAnecdote(type, track) {
  if (!track) return "";

  let genre = track.genre || "inconnu";
  let tempo = track.tempo ? Math.round(track.tempo) : "un tempo inconnu";

  // Messages motivants basés sur les points
  let motivationalMessage = "";
  let pointsToNextGoal = 0;

  if (playerScore < 5) {
    pointsToNextGoal = 5 - playerScore;
    motivationalMessage = `⭐Continue comme ça si tu veux faire évoluer ton totem !`;
  } else if (playerScore < 10) {
    pointsToNextGoal = 10 - playerScore;
    motivationalMessage = `🚀 Tu es sur la bonne voie pour devenir un vrai expert musical !`;
  } else if (playerScore < 25) {
    pointsToNextGoal = 25 - playerScore;
    motivationalMessage = `⭐ Impressionnant ! `;
  } else if (playerScore < 50) {
    pointsToNextGoal = 50 - playerScore;
    motivationalMessage = `⭐ Impressionnant ! `;
  } else {
    motivationalMessage = `👑 Tu es devenu un maître de la musique ! Continue d'explorer pour enrichir ta collection !`;
  }

  let baseMessage = "";
  switch (type) {
    case "tempo":
      baseMessage = `⚡ Ce morceau a un tempo de ${tempo} BPM — parfait pour te booster !`;
      break;
    case "visual_match":
      baseMessage = `Tu as bien matché la vibe visuelle de ce son.`;
      break;
    case "genre":
      baseMessage = `Tu as identifié le genre "${genre}" avec justesse !`;
      break;
    default:
      baseMessage = `Une belle découverte musicale !`;
  }

  return `${baseMessage}\n\n${motivationalMessage}`;
}

function getMiniGameEncouragement(type, track) {
  if (!track) return "";

  let genre = track.genre || "inconnu";
  let tempo = track.tempo ? Math.round(track.tempo) : "un tempo inconnu";

  // Messages encourageants basés sur les points
  let motivationalMessage = "";
  let pointsToNextGoal = 0;

  if (playerScore < 5) {
    pointsToNextGoal = 5 - playerScore;
    motivationalMessage = `💪 Plus que ${pointsToNextGoal} point${
      pointsToNextGoal > 1 ? "s" : ""
    } avant de pouvoir digger ! N'abandonne pas !`;
  } else if (playerScore < 10) {
    pointsToNextGoal = 10 - playerScore;
    motivationalMessage = `🔥 Tu peux déjà digger ! Plus que ${pointsToNextGoal} point${
      pointsToNextGoal > 1 ? "s" : ""
    } pour débloquer encore plus de contenu...`;
  } else {
    motivationalMessage = `🎯 Continue d'explorer ! Chaque tentative t'apprend quelque chose de nouveau.`;
  }

  let hintMessage = "";
  switch (type) {
    case "tempo":
      hintMessage = `💡 Astuce : Ce morceau avait un tempo de ${tempo} BPM. Les tempos lents sont généralement en dessous de 100 BPM, les tempos rapides au-dessus de 140 BPM.`;
      break;
    case "visual_match":
      hintMessage = `💡 Astuce : Observe bien les couleurs et formes des blobs - elles reflètent la popularité du morceau !`;
      break;
    case "genre":
      hintMessage = `💡 Astuce : C'était du "${genre}". Écoute attentivement les instruments et le rythme pour mieux identifier les genres !`;
      break;
    default:
      hintMessage = `💡 Astuce : L'entraînement rend parfait !`;
  }

  return `${hintMessage}\n\n${motivationalMessage}`;
}

function drawCloseButton() {
  // Position en haut à droite
  let closeSize = isMobile ? 60 : 40;
  let margin = isMobile ? 30 : 20;
  let closeX = width - closeSize - margin - 40;
  let closeY = margin + 40; // ✅ AJOUTER +50 pour descendre le bouton

  // Fond semi-transparent
  push();
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = "rgba(0, 0, 0, 0.4)";

  /*fill(0, 0, 0, 150);
  stroke(0, 0, 100);
  strokeWeight(2);
  ellipse(closeX + closeSize / 2, closeY + closeSize / 2, closeSize, closeSize);

  drawingContext.shadowBlur = 0;*/
  pop();

  // Croix blanche
  stroke(0, 0, 100);
  strokeWeight(isMobile ? 6 : 3);
  strokeCap(ROUND);

  let crossSize = closeSize * 0.4;
  let centerX = closeX + closeSize / 2;
  let centerY = closeY + closeSize / 2;

  // Lignes de la croix
  line(
    centerX - crossSize / 2,
    centerY - crossSize / 2,
    centerX + crossSize / 2,
    centerY + crossSize / 2
  );
  line(
    centerX + crossSize / 2,
    centerY - crossSize / 2,
    centerX - crossSize / 2,
    centerY + crossSize / 2
  );

  noStroke();

  // Zone cliquable
  blobHitZones.push({
    type: "closeButton",
    x: closeX,
    y: closeY,
    w: closeSize,
    h: closeSize,
  });
}

// Variables globales pour le scroll de la collection
if (typeof window.collectionScrollY === "undefined") {
  window.collectionScrollY = 0;
}
if (typeof window.collectionContentHeight === "undefined") {
  window.collectionContentHeight = 0;
}

function handleCollectionScroll(deltaY) {
  if (mode !== "collection") return false;

  let maxScroll = max(0, window.collectionContentHeight - height + 100);
  let scrollSpeed = isMobile ? 15 : 8;

  window.collectionScrollY -= deltaY * scrollSpeed;
  window.collectionScrollY = constrain(window.collectionScrollY, -maxScroll, 0);

  redraw();
  return true;
}

function handleAvatarDrag(deltaX, deltaY) {
  if (mode !== "avatar") return false;

  scrollXOffset += deltaX;
  scrollYOffset += deltaY;

  redraw();
  return true;
}

function drawTotemView() {
  // background(0, 0, 10);

  // === Totem au milieu (beaucoup plus gros) ===
  let totemSize = isMobile ? 350 : 500;
  let totemX = width / 2;
  let totemY = height / 2 - 440;

  // Afficher le totem/avatar avec la classe CSS originale
  let morphVideo = document.getElementById("morphVideo");
  let videoWrapper = document.getElementById("videoWrapper");

  if (morphVideo && videoWrapper) {
    // ✅ Réinitialiser les styles du wrapper pour la vue totem normale
    videoWrapper.style.position = "";
    videoWrapper.style.left = "";
    videoWrapper.style.top = "";
    videoWrapper.style.transform = "";
    videoWrapper.style.width = "";
    videoWrapper.style.height = "";

    morphVideo.classList.add("totem-mode");
    morphVideo.classList.remove("totem-evolution-mode");
    // 🎥 Change dynamiquement la vidéo en fonction des points
    let currentStage = getAvatarStage();
    if (window.lastMorphPlayed !== currentStage) {
      morphVideo.src = `videos/evolution${currentStage}.mp4`;
      morphVideo.load(); // recharge la nouvelle vidéo
      window.lastMorphPlayed = currentStage;
    }

    if (morphVideo.paused) {
      morphVideo.play().catch((e) => console.log("Erreur lecture vidéo:", e));
    }
    if (!morphVideo.canPlayType("video/mp4")) {
      console.warn("⚠️ Ce navigateur ne supporte pas la vidéo MP4.");
    }
  }

  // === Nombre de points en dessous ===
  fill(0, 0, 100);
  textAlign(CENTER, CENTER);
  textSize(isMobile ? 48 : 32);
  textFont(manropeFont);
  text(`${totemPoints} points`, totemX, totemY + totemSize / 2 + 50);

  // === Phrase évolutive juste sous les points ===
  let evolutionPhrase = getEvolutionPhrase();
  fill(0, 0, 80);
  textSize(isMobile ? 43 : 18);
  textAlign(CENTER, CENTER);
  textWrap(WORD);

  let maxTextWidth = width * 0.85;
  let textX = width / 2;
  let textY = totemY + totemSize / 2 + 540;

  text(evolutionPhrase, textX - maxTextWidth / 2, textY, maxTextWidth);

  // === Bouton "Jouer" avec le même design que drawButtonBis ===
  let jouerY = totemY + totemSize / 2 + 850;
  let jouerBtnW = isMobile ? width * 0.6 : 300;
  let jouerBtnH = isMobile ? 160 : 60;
  let jouerBtnX = totemX - jouerBtnW / 2;
  let jouerBtnY = height - jouerBtnH - (isMobile ? 80 : 20);

  // ✅ Utiliser le même design que drawButtonBis mais sans contour
  drawStyledButton("Jouer", jouerBtnX, jouerBtnY, jouerBtnW, jouerBtnH); // false = pas de contour

  // ✅ Zone cliquable pour "Jouer"
  blobHitZones.push({
    type: "jouerButton",
    x: jouerBtnX,
    y: jouerBtnY,
    w: jouerBtnW,
    h: jouerBtnH,
  });

  // ✅ Zone cliquable pour le totem vers la collection
  blobHitZones.push({
    type: "totemToCollection",
    x: totemX - totemSize / 2,
    y: totemY - totemSize / 2,
    w: totemSize,
    h: totemSize,
  });

  // === Repositionner le bouton Stream au milieu en bas ===
  const streamButton = document.getElementById("streamButton");
  if (streamButton) {
    streamButton.style.display = "block";
    let isStreamUnlocked = playerScore >= 5;
    updateStreamButtonLock(streamButton, isStreamUnlocked);
  }

  /* if (isStreamUnlocked) {
    blobHitZones.push({
      type: "streamMode",
      x: 0,
      y: window.innerHeight - 200, // Zone approximative du bouton
      w: window.innerWidth,
      h: 200,
    });
  }*/

  if (morphVideo) {
    morphVideo.style.display = "block";
    morphVideo.classList.add("totem-mode");
    morphVideo.classList.remove("totem-evolution-mode");
  }
}

function getEvolutionPhrase() {
  let collectionSize = playerCollection.length;
  let genreStats = getGenreStats();
  let genreCount = genreStats ? genreStats.length : 0;
  textFont("sans-serif");
  // Phrases basées sur le nombre de disques gagnés
  if (discsEarned === 0) {
    if (collectionSize === 0) {
      return "Ton totem attend tes premiers disques... Joue aux mini-jeux pour commencer à digger !";
    } else {
      return "🎮 Joue aux mini-jeux pour gagner des disques et pouvoir digger de nouvelles musiques !";
    }
  } else if (discsEarned === 1) {
    return "💿 Premier disque gagné ! Plus que 2 disques avant de pouvoir digger...";
  } else if (discsEarned === 2) {
    return "💿💿 Deux disques ! Plus qu'un seul disque pour débloquer le digging !";
  } else if (discsEarned >= 3) {
    return "💿💿💿 Tu peux maintenant digger ! Choisis bien ta musique";
  } else {
    // Phrases bonus pour après avoir diggé (quand les disques sont remis à 0)
    if (collectionSize <= 5) {
      return "🌟 Belle évolution ! Rejoue pour gagner 3 nouveaux disques et digger à nouveau...";
    } else if (collectionSize <= 10) {
      return "🚀 Ton totem évolue bien ! Continue de jouer pour accumuler des disques et digger encore...";
    } else if (collectionSize <= 20) {
      return "⭐ Excellent travail ! Chaque digging transforme ton totem... Accumule 3 disques pour continuer !";
    } else {
      return "👑 Maître du digging ! Ton totem reflète parfaitement tes choix musicaux !";
    }
  }
}

function getTotemEvolutionPhrase() {
  let collectionSize = playerCollection.length;
  let genreStats = getGenreStats();
  let genreCount = genreStats ? genreStats.length : 0;

  // Phrases spécifiques à l'évolution du totem (plus émotionnelles et mystiques)
  if (collectionSize === 0) {
    return "🌟 Ton totem prend vie... Il attend avec impatience tes premières découvertes musicales !";
  } else if (collectionSize === 1) {
    return "✨ Première transformation ! Chaque nouvelle musique change son essence...";
  } else if (collectionSize <= 3) {
    return "🎭 Ton totem se façonne petit à petit... CTon totem ressent déjà l'influence de ta musique !";
  } else if (collectionSize <= 5) {
    return "🌈 L'âme de ton totem se colore ! Il commence à refléter ta personnalité musicale...";
  } else if (collectionSize <= 10) {
    return "🔮 Ton totem évolue magnifiquement ! Il devient le miroir de tes goûts uniques...";
  } else if (collectionSize <= 15) {
    return "⚡ Évolution puissante ! Ton totem rayonne de toute la diversité de tes choix musicaux !";
  } else if (collectionSize <= 20) {
    return "🎆 Transformation épique ! Ton totem est devenu une œuvre d'art vivante de tes préférences !";
  } else if (collectionSize <= 30) {
    return "👑 Maître de l'évolution ! Ton totem atteint des formes extraordinaires grâce à ta collection !";
  } else {
    return "🌌 Totem légendaire ! Il transcende maintenant les frontières musicales... Continue ton voyage infini !";
  }
}

// Fonction pour mettre à jour l'état du bouton Stream
function updateStreamButtonLock(streamButton, isUnlocked) {
  const lockIcon = streamButton.querySelector(".lock-icon");

  if (isUnlocked) {
    streamButton.classList.remove("locked");
    streamButton.classList.add("unlocked");
    if (lockIcon) lockIcon.style.display = "none";
    streamButton.disabled = false;
  } else {
    streamButton.classList.add("locked");
    streamButton.classList.remove("unlocked");
    if (lockIcon) lockIcon.style.display = "inline";
    streamButton.disabled = true;
  }
}

function updateDiscVisibilityAndPosition(mode) {
  const container = document.getElementById("discsContainer");
  if (!container) return;

  if (mode === "totem") {
    // 💿 Affiché avec style CSS prédéfini
    container.style.display = "flex";
    container.className = "discs-totem"; // une classe qui fixe la position
  } else if (mode === "gameSelector") {
    // 💿 Affiché avec styles dynamiques JS
    container.className = "discs-minigame";
  } else {
    // 🚫 Caché pour tous les autres modes
    container.style.display = "none";
  }
}

function drawPreDigExplanationView() {
  imageMode(CORNER);
  image(digBackground, 0, 0, width, height);
  textAlign(LEFT, CENTER);
  textWrap(WORD);
  fill(0, 0, 100);
  textFont("sans-serif");

  let baseY = height / 2 - 400;
  let spacing = isMobile ? 120 : 40;
  let maxTextWidth = width * 0.85;
  let textX = width / 2 - maxTextWidth / 2;
  textSize(isMobile ? 50 : 32);
  text("Time to", width / 2 - 90, baseY - 200);

  // 🎵 Titre principal
  textAlign(CENTER, CENTER);
  textFont(bananaFont);
  textSize(isMobile ? 170 : 32);
  fill(0, 0, 100);
  text("Dig", width / 2, baseY);

  // 🎯 Explication principale
  textAlign(LEFT, CENTER);
  textSize(isMobile ? 48 : 20);
  textFont("sans-serif");
  textStyle(BOLD);
  fill(0, 0, 90);

  let explanationText =
    "Tu vas pouvoir choisir une musique parmi une sélection. Plus tu gagnes de points, plus ta sélection s'élargira !";
  text(explanationText, textX, baseY + spacing * 2, maxTextWidth);

  textStyle(NORMAL);

  // 💡 Instructions détaillées
  textSize(isMobile ? 40 : 16);
  fill(0, 0, 80);

  let instructionsText = `Comment ça marche :

🎯 Choisis la musique qui te plaît le plus
💿 Elle sera ajoutée automatiquement à ta collection
⭐ Ton Totem evolura selon tes choix...`;

  text(instructionsText, textX, baseY + spacing * 4, maxTextWidth);

  // 🎨 Texte cliquable "Toucher pour continuer"
  textAlign(CENTER, CENTER);
  textSize(isMobile ? 48 : 20);
  textFont("sans-serif");
  textStyle(ITALIC);
  fill(0, 0, 100);

  // ✅ CORRIGER : Définir les variables AVANT de les utiliser
  let continueText = "Toucher pour continuer";
  let continueX = width / 2;
  let continueY = baseY + spacing * 9;

  text(continueText, continueX, continueY);

  // ✅ Zone cliquable pour le texte - maintenant les variables sont définies
  let textW = textWidth(continueText);
  let textH = isMobile ? 60 : 30;

  blobHitZones.push({
    type: "goDigging",
    x: continueX - textW / 2,
    y: continueY - textH / 2,
    w: textW,
    h: textH,
  });

  drawCloseButton();
}

// Ajoutez cette fonction pour nettoyer quand on change de mode
function hideEvolutionVideo() {
  const evolutionVideo = document.getElementById("evolutionVideo");
  const evolutionVideoWrapper = document.getElementById(
    "evolutionVideoWrapper"
  );

  if (evolutionVideo && evolutionVideoWrapper) {
    evolutionVideo.pause();
    evolutionVideoWrapper.style.display = "none";
  }

  // ✅ CORRIGER : Réafficher morphVideo ET son wrapper
  const morphVideo = document.getElementById("morphVideo");
  const morphWrapper = document.getElementById("videoWrapper");

  if (morphVideo && mode !== "evolution") {
    morphVideo.style.display = "block";

    // ✅ AJOUTER : Réafficher aussi le wrapper
    if (morphWrapper) {
      morphWrapper.style.display = "block";
    }

    // ✅ AJOUTER : Remettre les bonnes classes
    morphVideo.classList.add("totem-mode");
    morphVideo.classList.remove("totem-evolution-mode");
  }
}
