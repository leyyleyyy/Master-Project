const miniGames = {
  tempo: {
    label: "Quel est le tempo de cette musique ?",
    generate: (track) => {
      const correct = round(track.tempo);
      const options = new Set([correct]);
      while (options.size < 3) options.add(correct + floor(random(-20, 20)));
      return {
        answer: correct,
        options: shuffle([...options]),
        displayUnit: " BPM",
      };
    },
  },

  genre: {
    label: "Quel est le genre de cette musique ?",
    generate: (track) => {
      const correct = track.genre;
      let genres = [...new Set(playerCollection.map((t) => t.genre))];
      shuffle(genres);
      const wrong = genres.filter((g) => g !== correct).slice(0, 2);
      return {
        answer: correct,
        options: shuffle([correct, ...wrong]),
        displayUnit: "",
      };
    },
  },

  visual_match: {
    label: "Quelle musique est la plus mainstream ?",
    generate: () => {
      const highs = tracksData.filter((t) => t.popularity >= 70);
      const lows = tracksData.filter((t) => t.popularity <= 30);

      if (highs.length === 0 || lows.length === 0) {
        console.warn(
          "Pas assez de morceaux populaires et peu populaires pour visual_match"
        );
        return null;
      }

      const high = random(highs);
      const low = random(lows.filter((t) => t.title !== high.title));

      if (!high || !low) return null;

      const options = shuffle([high, low]);

      return {
        answer: high.title, // ou high selon ton système de vérification
        options: options,
        displayUnit: "",
      };
    },
  },

  // 🎨 Ajoute ici d'autres types plus visuels
  // ex: visual_match, order_by_tempo, find_the_outlier...
};

function generateMiniGame(track) {
  const generator = miniGames[currentMiniGameType];
  if (!generator) {
    console.warn("Mini-jeu inconnu :", currentMiniGameType);
    return;
  }

  const game = generator.generate(track);
  if (!game) {
    console.warn("Mini-jeu mal généré :", currentMiniGameType);
    return;
  }

  miniGameLabel = generator.label;
  miniGameOptions = game.options || [];
  miniGameAnswer = game.answer;
  miniGameUnit = game.displayUnit || "";
}

function launchMiniGameFromCollection() {
  currentMiniGameTrack = pickRandomTrackFromCollection();
  currentMiniGameType = random(["tempo", "genre"]);
  miniGameOptions = []; // Pour forcer la génération
  mode = "minigame";
}

function generateVisualMatchGame(track) {
  // Sélectionne une autre track différente
  let otherTrack;
  do {
    otherTrack = random(tracksData);
  } while (otherTrack.title === track.title);

  // Calcule la plus populaire (mainstream = + populaire)
  let answerIndex = track.popularity > otherTrack.popularity ? 0 : 1;

  // Crée les blobs (centrés à gauche et à droite)
  let blob1 = {
    track: track,
    x: width / 2 - 120,
    y: height * 0.35,
    r: isMobile ? 80 : 60,
  };

  let blob2 = {
    track: otherTrack,
    x: width / 2 + 120,
    y: height * 0.35,
    r: isMobile ? 80 : 60,
  };

  return {
    //label: "Quelle musique est mainstream ?",
    answer: answerIndex,
    blobs: [blob1, blob2],
    options: [0, 1],
    unit: "", // pas nécessaire ici
  };
}
