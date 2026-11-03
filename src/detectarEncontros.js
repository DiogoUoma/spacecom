import { calcularDistancia } from "./calcularDistancia.js";
import { classificarEncontro } from "./classificarEncontro.js";

const DISTANCIA_LIMITE_METROS = 20;

export function detectarEncontros(posicionamentosPorTimestamp) {
  // para cada grupo de horarios a função percorre os pares de pessoas
  const encontros = [];

  for (const [timestamp, posicionamentos] of posicionamentosPorTimestamp) {
    // verifica os grupos por posicionamento do Timestamp
    for (let i = 0; i < posicionamentos.length; i++) {
      // verifica a primeira pessoa e em seguida percorre as pessoas da posição i ignorando pares com o mesmo identificador, para não comparar a pessoa com ela mesma
      const posicaoA = posicionamentos[i];

      for (let j = i + 1; j < posicionamentos.length; j++) {
        const posicaoB = posicionamentos[j];

        // verifica se esta comparando a pessoa com ela mesma
        if (posicaoA.idMonitorado === posicaoB.idMonitorado) {
          continue;
        }

        // classifica o tipo de encontro
        const tipo = classificarEncontro(posicaoA, posicaoB);

        if (tipo === null) {
          continue;
        }

        // verifica a distancia das posições de cada pessoa
        const distanciaMetros = calcularDistancia(posicaoA, posicaoB);

        // se caso ocorreu o encontro cria o obejto para ser escrito na resposta com os campos tipo de encontro, quais as pessoas que se encontraram, a hora do encontro, a posição em ltitude e longitude de cada pessoa, e a distancia
        if (distanciaMetros < DISTANCIA_LIMITE_METROS) {
          encontros.push({
            tipo,

            monitoradosEncontro: [posicaoA.idMonitorado, posicaoB.idMonitorado],

            timestamp,

            posicoes: {
              [posicaoA.idMonitorado]: {
                lat: posicaoA.latitude,
                lon: posicaoA.longitude,
              },

              [posicaoB.idMonitorado]: {
                lat: posicaoB.latitude,
                lon: posicaoB.longitude,
              },
            },

            distanciaMetros,
          });
        }
      }
    }
  }

  return encontros;
}
