function getMixRatio(collection) {
  if (!collection || collection.length < 2) return 0;

  // On extrait la liste des clusters
  const clusters = collection.map((t) => getMostCommonCluster([t]));

  // On compte combien de clusters différents il y a
  const uniqueClusters = [...new Set(clusters)];

  // On calcule le ratio : nombre de clusters distincts / total
  const mixRatio = uniqueClusters.length / clusters.length;

  return mixRatio;
}

const mixRatio = getMixRatio(playerCollection);

function getEvolutionComment(track, dominantCluster) {
  const genre = track.genre?.toLowerCase() || "inconnu";
  const cluster = getMostCommonCluster([track]);
  const comments = [];

  if (cluster !== dominantCluster) {
    if (cluster === "experimental") {
      comments.push(
        "🧪 Tu t’aventures dans des contrées sonores peu explorées."
      );
    } else if (cluster === "dance") {
      comments.push("💃 Tu choisis des sons faits pour bouger.");
    } else if (cluster === "intense") {
      comments.push("🔥 Tes choix deviennent plus énergiques et assumés.");
    } else if (cluster === "chill") {
      comments.push("🧘 Tu optes pour une vibe détendue et introspective.");
    }
  }

  // Popularité
  if (track.popularity < 20) {
    comments.push("🔍 Belle trouvaille ! C’est un son peu connu.");
  } else if (track.popularity > 80) {
    comments.push(
      "📈 Ce morceau est très populaire. Essaie de creuser un peu plus loin ?"
    );
  }

  // Ratio diversité (à calculer si tu as une fonction de mix ou de diversité)
  if (mixRatio > 0.6) {
    comments.push("🔀 Tu mixes les genres comme un·e vrai·e digger.");
  } else if (mixRatio < 0.2) {
    comments.push(
      "🧱 Ta sélection est assez uniforme. Et si tu ajoutais un peu de contraste ?"
    );
  }

  // 2. CHANGEMENT DE CLUSTER
  if (cluster === dominantCluster) {
    comments.push(
      "⚠️ Attention : rester dans le même univers musical trop longtemps pourrait te faire stagner…"
    );
  } else {
    comments.push("🌱 Tu ouvres une nouvelle branche musicale, bien joué !");
  }

  // 3. ÉQUILIBRE DES EXPLORATIONS
  const genresExplorés = [
    ...new Set(playerCollection.map((t) => t.genre?.toLowerCase())),
  ];

  if (genresExplorés.length > 10) {
    comments.push(
      "🌈 Ta collection devient un véritable arc-en-ciel musical !"
    );
  } else if (genresExplorés.length <= 3) {
    comments.push(
      "🔁 Tu tournes un peu en rond… essaie d’écouter des styles différents !"
    );
    comments.push(
      "🚨 Plus de diversité = plus de points et un avatar plus cool !"
    );
  }

  // 4. Combo genre + cluster (bonus)
  if (cluster === "chill" && genre.includes("rap")) {
    comments.push("😎 Tu explores le côté laidback du rap, c’est smooth.");
  }

  return comments;
}
