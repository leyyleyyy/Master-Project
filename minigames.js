function pickRandomTrackFromDatabase() {
  return random(tracksData);
}

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
      let genres = [...new Set(tracksData.map((t) => t.genre))];
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

  // 🎨 Tu peux ajouter d'autres jeux ici…
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
  currentMiniGameTrack = pickRandomTrackFromDatabase();
  currentMiniGameType = random(["tempo", "genre"]);
  miniGameOptions = [];
  mode = "minigame";
}
