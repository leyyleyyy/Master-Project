/*function drawTrackBlob(track, cx, cy, maxSize, index) {
  let isSelected = selectedTrack && selectedTrack.title === track.title;
  let { tempo, energy, danceability, key, valence } = track;

  let numBlobs = int(map(energy, minMax.energy.min, minMax.energy.max, 1, 3));
  let deformation = map(
    danceability,
    minMax.danceability.min,
    minMax.danceability.max,
    0.2,
    2
  );
  let baseSize =
    map(key, minMax.key.min, minMax.key.max, 0.4, 1.2) * (maxSize / 2.5);
  let alphaFalloff = map(
    valence,
    minMax.valence.min,
    minMax.valence.max,
    100,
    10
  );

  let tempoNorm = map(tempo, minMax.tempo.min, minMax.tempo.max, 0, 1);
  let valenceNorm = map(valence, minMax.valence.min, minMax.valence.max, 0, 1);
  let hue = (tempoNorm * 280 + valenceNorm * 80) % 360;

  let color1 = color((hue + 20) % 360, 100, 100);
  let color2 = color((hue + 180) % 360, 100, 100);

  let detail = int(map(energy, minMax.energy.min, minMax.energy.max, 30, 100));
  let freqX = map(key, minMax.key.min, minMax.key.max, 0.1, 1.5);
  let freqY = map(key, minMax.key.min, minMax.key.max, 0.1, 1.5);

  for (let b = 0; b < numBlobs; b++) {
    let angleOffset = (TWO_PI * b) / numBlobs;
    let bx = cx + (cos(angleOffset) * maxSize) / 4;
    let by = cy + (sin(angleOffset) * maxSize) / 4;

    for (let r = baseSize; r > 5; r -= 2) {
      let tRadius = map(r, 5, baseSize, 0, 1);
      let col = lerpColor(color1, color2, tRadius);
      col.setAlpha(map(r, baseSize, 5, alphaFalloff, 0));
      fill(col);

      if (isSelected) {
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = color(270, 30, 100, 60);
      } else {
        drawingContext.shadowBlur = 0;
      }

      beginShape();
      for (let i = 0; i < detail; i++) {
        let angle = map(i, 0, detail, 0, TWO_PI);
        let nx = cos(angle) * freqX + index * 0.1;
        let ny = sin(angle) * freqY + b * 0.1;
        let noiseVal = noise(nx, ny, t);
        let deform = map(noiseVal, 0, 1, 1 - deformation, 1 + deformation);
        let finalR = r * deform;

        let pulseStrength = map(
          energy,
          minMax.energy.min,
          minMax.energy.max,
          0.02,
          0.12
        );
        finalR *= 1 + pulseStrength * sin(t + index * 0.3 + b * 0.5);

        let x = bx + cos(angle) * finalR;
        let y = by + sin(angle) * finalR;
        vertex(x, y);
      }
      endShape(CLOSE);
      drawingContext.shadowBlur = 0;
    }
  }

  blobHitZones.push({ x: cx, y: cy, r: maxSize / 2, track });
}
*/
function drawTrackBlob(track, cx, cy, maxSize, index, fixedWhiteMode = false) {
  let { tempo, energy, danceability, key, valence } = track;

  let numBlobs = int(map(energy, minMax.energy.min, minMax.energy.max, 1, 3));
  let deformation = map(
    danceability,
    minMax.danceability.min,
    minMax.danceability.max,
    0.2,
    2
  );
  let baseSize =
    map(key, minMax.key.min, minMax.key.max, 0.4, 1.2) * (maxSize / 2.5);
  let alphaFalloff = 100;

  let hue = 0,
    color1,
    color2;
  if (fixedWhiteMode) {
    color1 = color(0, 0, 100);
    color2 = color(0, 0, 100);
  } else {
    let tempoNorm = map(tempo, minMax.tempo.min, minMax.tempo.max, 0, 1);
    let valenceNorm = map(
      valence,
      minMax.valence.min,
      minMax.valence.max,
      0,
      1
    );
    hue = (tempoNorm * 280 + valenceNorm * 80) % 360;
    color1 = color((hue + 20) % 360, 100, 100);
    color2 = color((hue + 180) % 360, 100, 100);
  }

  let detail = int(map(energy, minMax.energy.min, minMax.energy.max, 30, 100));
  let freqX = map(key, minMax.key.min, minMax.key.max, 0.1, 1.5);
  let freqY = map(key, minMax.key.min, minMax.key.max, 0.1, 1.5);

  for (let b = 0; b < numBlobs; b++) {
    let angleOffset = (TWO_PI * b) / numBlobs;
    let bx = cx + (cos(angleOffset) * maxSize) / 4;
    let by = cy + (sin(angleOffset) * maxSize) / 4;

    for (let r = baseSize; r > 5; r -= 2) {
      let tRadius = map(r, 5, baseSize, 0, 1);
      let col = lerpColor(color1, color2, tRadius);
      col.setAlpha(map(r, baseSize, 5, alphaFalloff, 0));
      fill(col);

      beginShape();
      for (let i = 0; i < detail; i++) {
        let angle = map(i, 0, detail, 0, TWO_PI);
        let nx = cos(angle) * freqX + index * 0.1;
        let ny = sin(angle) * freqY + b * 0.1;
        let noiseVal = noise(nx, ny, fixedWhiteMode ? 0 : t); // plus de mouvement
        let deform = map(noiseVal, 0, 1, 1 - deformation, 1 + deformation);
        let finalR = r * deform;

        if (!fixedWhiteMode) {
          let pulseStrength = map(
            energy,
            minMax.energy.min,
            minMax.energy.max,
            0.02,
            0.12
          );
          finalR *= 1 + pulseStrength * sin(t + index * 0.3 + b * 0.5);
        }

        let x = bx + cos(angle) * finalR;
        let y = by + sin(angle) * finalR;
        vertex(x, y);
      }
      endShape(CLOSE);
    }
  }

  blobHitZones.push({ x: cx, y: cy, r: maxSize / 2, track });
}
