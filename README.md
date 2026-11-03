# Spacecom — Detecção de Encontros

Solução desenvolvida por **Diogo Luiz Uoma da Silva** para o desafio do Programa Trainee Tech Spacecom 2027.

O programa processa arquivos de geolocalização com dados fictícios e identifica encontros entre monitorados e entre vítimas e seus respectivos agressores. Para cada dataset, gera um arquivo JSON com os encontros detectados.

## Tecnologias

- JavaScript com módulos ES (`import` e `export`).
- Node.js e seus módulos nativos `fs`, `fs/promises` e `readline`.
- Sem dependências externas declaradas no projeto.

## Preparação e execução

Utilize uma versão recente do Node.js com suporte a módulos ES e às APIs utilizadas. A versão usada na execução de conferência do dataset1 foi a **24.22.1**.

1. Baixe ou clone este repositório e abra o terminal na raiz, onde está o `package.json`.
2. Crie a pasta `datasets` na raiz.
3. Baixe os arquivos abaixo e salve-os nessa pasta, mantendo os nomes originais.

| Dataset | Download |
| --- | --- |
| 1 | [dataset1.txt](https://bucket-projeto-trainee.s3.sa-east-1.amazonaws.com/dataset1.txt) |
| 2 | [dataset2.txt](https://bucket-projeto-trainee.s3.sa-east-1.amazonaws.com/dataset2.txt) |
| 3 | [dataset3.txt](https://bucket-projeto-trainee.s3.sa-east-1.amazonaws.com/dataset3.txt) |
| 4 | [dataset4.txt](https://bucket-projeto-trainee.s3.sa-east-1.amazonaws.com/dataset4.txt) |
| 5 | [dataset5.txt](https://bucket-projeto-trainee.s3.sa-east-1.amazonaws.com/dataset5.txt) |
| 6 | [dataset6.txt](https://bucket-projeto-trainee.s3.sa-east-1.amazonaws.com/dataset6.txt) |
| 7 | [dataset7.txt](https://bucket-projeto-trainee.s3.sa-east-1.amazonaws.com/dataset7.txt) |

Os datasets não precisam ser versionados no GitHub devido ao tamanho. Não é necessário executar `npm install`, pois o programa utiliza apenas módulos nativos.

Execute um dataset por vez:

```bash
npm start -- dataset1
```

Para outro arquivo, altere o argumento:

```bash
npm start -- dataset7
```

Também é possível executar diretamente:

```bash
node src/index.js dataset1
```

Sem argumento, o programa utiliza `dataset1`. Os nomes aceitos são `dataset1` até `dataset7`.

A saída é salva em `outputs/dataset1.json`, ou no nome correspondente ao dataset escolhido. A pasta é criada automaticamente. Uma nova execução do mesmo dataset sobrescreve seu JSON anterior.

## Organização do código

| Arquivo | Responsabilidade |
| --- | --- |
| `src/index.js` | Selecionar o dataset, ler e agrupar as posições, chamar a detecção e salvar o JSON. |
| `src/converterLinha.js` | Separar os campos e converter cada linha em um objeto JavaScript. |
| `src/classificarEncontro.js` | Determinar a relação entre as pessoas e o tipo de encontro aplicável. |
| `src/calcularDistancia.js` | Calcular a distância em metros com a fórmula de Haversine. |
| `src/detectarEncontros.js` | Comparar pares de posições e montar os encontros que atendem ao limite. |
| `outputs/` | Armazenar os JSONs gerados para entrega. |

## Formato de entrada

Os arquivos `.txt` possuem cabeçalho e campos separados por ponto e vírgula:

```text
idMonitorado;faccaoMonitorado;timestamp;latitude;longitude;medidaProtetiva;idsRestricaoMedida
```

Cada linha representa uma posição de uma pessoa em um instante. O identificador pode corresponder a um usuário de tornozeleira ou a uma vítima. O campo `medidaProtetiva` indica a vítima, e `idsRestricaoMedida` contém os IDs dos agressores vinculados a ela, separados por vírgulas.

A conversão remove espaços externos e aspas externas dos campos, transforma os valores numéricos e booleanos e representa facção ausente por `null` e lista de restrições vazia por `[]`. Também verifica a quantidade de campos e o valor textual do booleano.

## Lógica utilizada

1. Ler o arquivo linha por linha, ignorando o cabeçalho e as linhas vazias.
2. Converter cada linha em um objeto com os campos do posicionamento.
3. Agrupar os objetos em um `Map`, usando o timestamp como chave.
4. Percorrer os pares de posições dentro de cada grupo.
5. Ignorar pares com o mesmo ID e classificar a relação entre as pessoas.
6. Calcular a distância apenas para os pares com classificação aplicável.
7. Registrar o encontro quando a distância for estritamente menor que 20 metros.
8. Salvar a lista de encontros em JSON.

### Horário e unicidade

A comparação ocorre apenas entre timestamps exatamente iguais, conforme solicitado. O programa não aplica tolerância temporal nem estima posições entre medições.

O segundo laço começa em `j = i + 1`. Assim, um par A–B não é comparado novamente como B–A. Considera-se uma posição por pessoa em cada timestamp; linhas duplicadas na entrada não são deduplicadas explicitamente.

### Classificação

| Situação | Resultado |
| --- | --- |
| Vítima e monitorado cujo ID está na lista de restrições dela | `protetiva` |
| Dois monitorados com a mesma facção não nula | `faccao` |
| Outros pares de monitorados sem vítima | `generico` |
| Duas vítimas ou vítima com pessoa não vinculada à sua medida | Não gera encontro |

Cada par recebe uma única classificação. Para dois monitorados da mesma facção, a classificação específica `faccao` prevalece sobre `generico`.

### Distância

A fórmula de Haversine calcula a distância entre duas coordenadas, considerando a Terra como uma esfera de raio **6.371.000 metros**, conforme o enunciado.

As coordenadas são convertidas de graus para radianos antes do cálculo. Um valor intermediário é limitado ao intervalo de 0 a 1 para evitar problemas numéricos por arredondamento. O resultado é expresso em metros, sem arredondamento adicional para decidir o encontro.

A condição é `distanciaMetros < 20`: uma distância de exatamente 20 metros não gera encontro.

## Formato de saída

Cada arquivo contém um array com os encontros detectados. Exemplo de registro gerado no dataset1:

```json
[
  {
    "tipo": "generico",
    "monitoradosEncontro": [4, 6],
    "timestamp": "2024-01-01 00:05:15",
    "posicoes": {
      "4": { "lat": -31.93195, "lon": -40.61438 },
      "6": { "lat": -31.93187, "lon": -40.61435 }
    },
    "distanciaMetros": 9.33522817789823
  }
]
```

Se não houver encontros, a saída será `[]`. Posições próximas em timestamps diferentes geram registros independentes; não são consolidadas em um evento com duração.

## Justificativa da abordagem

Escolhi uma abordagem direta e dividida em funções para facilitar a compreensão, a conferência das regras e a manutenção. O agrupamento por timestamp elimina comparações entre horários diferentes, que não são permitidas no desafio. A classificação antes do cálculo geográfico evita calcular distâncias para pares que não podem gerar encontros.

A comparação de todos os pares dentro de cada horário é simples de verificar e não depende de uma biblioteca externa. Essa escolha prioriza clareza e implementação fiel às regras, sem afirmar que seja a solução mais rápida possível.

Para um grupo com `n` posições, são avaliados até `n × (n − 1) / 2` pares. Considerando todos os grupos, o custo de comparação é proporcional à soma dos quadrados de seus tamanhos. A consulta à lista de agressores com `includes` também depende do tamanho dessa lista.

Embora a leitura seja feita por linhas, todos os posicionamentos são armazenados no `Map` antes da detecção, e os encontros são mantidos em uma lista antes da escrita. Portanto, o uso de memória cresce com o total de posições e resultados.

Para volumes maiores, possíveis evoluções seriam uma divisão espacial para reduzir os pares candidatos e o processamento de um grupo por vez, desde que seja garantido que a entrada esteja ordenada por timestamp.

## Conferência dos resultados

O enunciado fornece respostas de referência para os dois primeiros datasets:

- [respostas1.json](https://bucket-projeto-trainee.s3.sa-east-1.amazonaws.com/respostas1.json)
- [respostas2.json](https://bucket-projeto-trainee.s3.sa-east-1.amazonaws.com/respostas2.json)

A execução de conferência do dataset1 processou **5.000 posições**, agrupadas em **500 timestamps**, e gerou **4 encontros**. Essa execução, isoladamente, não comprova equivalência completa com as respostas oficiais nem valida os demais datasets.

Para validar, compare os JSONs gerados com as referências, considerando tipo, timestamp, IDs, coordenadas e distância. A ordem dos IDs no par não altera o encontro, conforme o enunciado. Não há suíte automatizada de testes declarada no projeto.

## Limitações conhecidas

- A validação de entrada é parcial: não verifica integralmente datas, limites das coordenadas ou todos os valores numéricos.
- O programa pressupõe o cabeçalho na primeira linha e o formato de entrada fornecido no desafio.
- A separação por `;` atende ao layout esperado; não é um parser CSV genérico para campos com delimitadores internos.
- O custo de comparação aumenta quando há muitas pessoas no mesmo timestamp.
- Os registros são mantidos em memória durante o processamento.

## Utilização de inteligência artificial

Utilizei o ChatGPT como apoio na construção do código, na discussão da lógica e na compreensão das funções e regras do desafio. A IA também auxiliou na revisão e organização desta documentação.

## Autor

Diogo Luiz Uoma da Silva.
