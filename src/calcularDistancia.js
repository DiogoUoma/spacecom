const RAIO_TERRA_METROS = 6_371_000;

function converterParaRadianos(graus) {
  return (graus * Math.PI) / 180;
}

export function calcularDistancia(posicaoA, posicaoB) {
  const latitudeA = converterParaRadianos(posicaoA.latitude);
  const latitudeB = converterParaRadianos(posicaoB.latitude);

  const diferencaLatitude = converterParaRadianos(
    posicaoB.latitude - posicaoA.latitude,
  );

  const diferencaLongitude = converterParaRadianos(
    posicaoB.longitude - posicaoA.longitude,
  );

  const a =
    Math.sin(diferencaLatitude / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(diferencaLongitude / 2) ** 2;

  const aLimitado = Math.max(0, Math.min(1, a));

  const anguloCentral =
    2 * Math.atan2(Math.sqrt(aLimitado), Math.sqrt(1 - aLimitado));

  return RAIO_TERRA_METROS * anguloCentral;
}
