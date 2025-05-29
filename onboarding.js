let onboardingQuestions = [
  {
    question: "Quel mood tu préfères ?",
    options: ["Énergique", "Calme", "Dansant"],
  },
  {
    question: "Quel type de son tu préfères ?",
    options: ["Acoustique", "Électronique", "Peu importe"],
  },
  {
    question: "Tu veux découvrir quoi ?",
    options: ["Artistes émergents", "Hits populaires", "Mélange"],
  },
];

function assignInitialCollection() {
  let selected = tracksData.filter((track) => {
    let acousticPref = userAnswers[1];
    let acoustic = track.acousticness;
    let popularity = track.popularity;

    if (acousticPref === "Acoustique" && acoustic < 0.6) return false;
    if (acousticPref === "Électronique" && acoustic > 0.4) return false;

    let popPref = userAnswers[2];
    if (popPref === "Artistes émergents" && popularity > 30) return false;
    if (popPref === "Hits populaires" && popularity < 40) return false;

    return true;
  });

  selected = shuffle(selected).slice(0, 3);
  playerCollection = selected.map(cleanTrack);
  localStorage.setItem("btm_collection", JSON.stringify(playerCollection));
}

function handleOnboardingClick() {
  if (onboardingStep >= onboardingQuestions.length) return;
  let q = onboardingQuestions[onboardingStep];

  for (let i = 0; i < q.options.length; i++) {
    let btnW = 300;
    let btnH = 50;
    let btnX = width / 2 - btnW / 2;
    let btnY = 200 + i * 70;

    if (
      mouseX > btnX &&
      mouseX < btnX + btnW &&
      mouseY > btnY &&
      mouseY < btnY + btnH
    ) {
      userAnswers.push(q.options[i]);
      onboardingStep++;
      return;
    }
  }
  console.log("Collection assignée :", playerCollection);
}
