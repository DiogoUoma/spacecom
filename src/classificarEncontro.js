export function classificarEncontro(posicaoA, posicaoB) {
  const aEhVitima = posicaoA.medidaProtetiva;
  const bEhVitima = posicaoB.medidaProtetiva;

  // verifica se um tipo de encontro se classifica como protetiva
  if (
    aEhVitima &&
    !bEhVitima &&
    posicaoA.idsRestricaoMedida.includes(posicaoB.idMonitorado)
  ) {
    return "protetiva";
  }

  // verifica se um tipo de encontro se classifica como protetiva
  if (
    bEhVitima &&
    !aEhVitima &&
    posicaoB.idsRestricaoMedida.includes(posicaoA.idMonitorado)
  ) {
    return "protetiva";
  }

  // verifica se um tipo de encontro se classifica como vazio
  if (aEhVitima || bEhVitima) {
    return null;
  }

  // verifica se um tipo de encontro se classifica como facção
  if (
    posicaoA.faccaoMonitorado !== null &&
    posicaoA.faccaoMonitorado === posicaoB.faccaoMonitorado
  ) {
    return "faccao";
  }

  // se não se aplicar a nenhum tipo de encontro anterior é tratado como generico
  return "generico";
}
