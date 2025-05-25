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

function drawOnboardingView() {
  background(0, 0, 11);
  fill(0, 0, 100);
  textAlign(CENTER);
  textSize(24);
  text("Bienvenue !", width / 2, 60);

  if (onboardingStep < onboardingQuestions.length) {
    let q = onboardingQuestions[onboardingStep];

    textSize(20);
    text(q.question, width / 2, 120);

    for (let i = 0; i < q.options.length; i++) {
      let btnW = 300;
      let btnH = 50;
      let btnX = width / 2 - btnW / 2;
      let btnY = 200 + i * 70;

      fill(0, 0, 20);
      rect(btnX, btnY, btnW, btnH, 10);

      fill(0, 0, 100);
      textSize(16);
      text(q.options[i], width / 2, btnY + btnH / 2);
    }
  } else if (!collectionAssigned) {
    assignInitialCollection(); // 👈 exécuté une seule fois
    collectionAssigned = true;
    mode = "avatar";
  }
}

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
