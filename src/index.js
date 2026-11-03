import { createReadStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";

import { converterLinha } from "./converterLinha.js";
import { detectarEncontros } from "./detectarEncontros.js";

async function main() {
  const nomeDataset = process.argv[2] ?? "dataset1";

  if (!/^dataset[1-7]$/.test(nomeDataset)) {
    throw new Error("Dataset inválido. Use dataset1 até dataset7.");
  }

  console.log(`Processando ${nomeDataset}...`);

  const caminhoEntrada = new URL(
    `../datasets/${nomeDataset}.txt`,
    import.meta.url,
  );

  const arquivo = createReadStream(caminhoEntrada, {
    encoding: "utf8",
  });

  const linhas = createInterface({
    input: arquivo,
    crlfDelay: Infinity,
  });

  const posicionamentosPorTimestamp = new Map();
  let numeroLinha = 0;

  for await (const linha of linhas) {
    numeroLinha++;

    if (numeroLinha === 1 || linha.trim() === "") {
      continue;
    }

    const posicionamento = converterLinha(linha);
    const timestamp = posicionamento.timestamp;

    if (!posicionamentosPorTimestamp.has(timestamp)) {
      posicionamentosPorTimestamp.set(timestamp, []);
    }

    posicionamentosPorTimestamp.get(timestamp).push(posicionamento);
  }

  const encontros = detectarEncontros(posicionamentosPorTimestamp);

  const pastaSaida = new URL("../outputs/", import.meta.url);
  await mkdir(pastaSaida, { recursive: true });

  const caminhoSaida = new URL(
    `../outputs/${nomeDataset}.json`,
    import.meta.url,
  );

  await writeFile(caminhoSaida, JSON.stringify(encontros, null, 2), {
    encoding: "utf8",
  });

  console.log(`Encontros encontrados: ${encontros.length}`);
  console.log(`Resultado salvo em outputs/${nomeDataset}.json`);
}

main().catch((erro) => {
  console.error("Erro ao processar o dataset:", erro.message);
  process.exitCode = 1;
});
