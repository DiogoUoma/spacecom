function limparCampo(campo) {
  const valor = campo.trim();

  if (valor.startsWith('"') && valor.endsWith('"')) {
    return valor.slice(1, -1);
  }

  return valor;
}

export function converterLinha(linha) {
  const campos = linha.split(";").map(limparCampo); // remove ; e limpa "" dos campos

  // verifica se o campo do dataset possui exatamente os 7 campos idMonitorado, faccaoMonitorado, timestamp, latitude, longitude, medidaProtetiva e idsRestricaoMedida
  if (campos.length !== 7) {
    throw new Error("A linha deve conter exatamente 7 campos.");
  }

  const [
    idMonitorado,
    faccaoMonitorado,
    timestamp,
    latitude,
    longitude,
    medidaProtetiva,
    idsRestricaoMedida,
  ] = campos;

  // verifica se o campo medidaProtetiva é true ou false
  if (medidaProtetiva !== "true" && medidaProtetiva !== "false") {
    throw new Error("O campo medidaProtetiva deve ser true ou false.");
  }

  return {
    idMonitorado: Number(idMonitorado), // garante que o id vai ser um numero

    faccaoMonitorado: faccaoMonitorado === "" ? null : Number(faccaoMonitorado), // verifica se esta vazio para deixar como null ou garante que seja um numero

    timestamp,

    latitude: Number(latitude), // garante que seja um numero

    longitude: Number(longitude), // garante que seja um numero

    medidaProtetiva: medidaProtetiva === "true", // transforma o texto em valor logico

    idsRestricaoMedida:
      idsRestricaoMedida === ""
        ? []
        : idsRestricaoMedida.split(",").map(Number), // transforma em uma lista separada por ,
  };
}
