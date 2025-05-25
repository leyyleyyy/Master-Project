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

  valence: {
    label: "Quel est le mood général de cette musique ?",
    generate: (track) => ({
      answer: track.valence > 50 ? "joyeux" : "triste",
      options: shuffle(["joyeux", "triste", "neutre"]),
      displayUnit: "",
    }),
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

  // 🎨 Ajoute ici d'autres types plus visuels
  // ex: visual_match, order_by_tempo, find_the_outlier...
};

function generateMiniGame(track) {
  if (!track) return;

  const miniGame = miniGames[currentMiniGameType];
  if (!miniGame) return;

  const result = miniGame.generate(track);

  miniGameAnswer = result.answer;
  miniGameOptions = result.options;
  miniGameUnit = result.displayUnit || "";
  miniGameLabel = miniGame.label;

  selectedOption = null;
  miniGameFeedback = "";
}
