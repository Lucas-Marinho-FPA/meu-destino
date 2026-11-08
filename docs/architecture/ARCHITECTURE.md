# Meu Destino — Arquitetura (estado em 07/11/2026, após a migração para o GitHub)

**Escopo:** descreve o que está **efetivamente construído** neste repositório (protótipo web navegável) e como deve ser portado para o app Android. A arquitetura-alvo do app continua sendo a do PRD §8; nada aqui a substitui.

## 1. Estado real

| Item | Situação |
|---|---|
| Fonte oficial | Este repositório (`main` = estável; `develop` = integração; `feature/*` = alterações) |
| App publicado | GitHub Pages, publicado pelo workflow `.github/workflows/ci-pages.yml` |
| Origem | Protótipo no Canvas, versão 1794094392-9b11 (arquivos preservados em `legacy/canvas/`) |
| App Android | **Não existe** ainda (PRD §9, Sprints 1+) |

## 2. Estrutura

```
index.html            Página única: carrega estilos e scripts; contém o template das telas (<template id="md-template">)
src/runtime.js        Runtime próprio (sem dependências) que interpreta o template e atualiza o DOM
src/logic.js          Camada única de dados e regras (cálculos, ciclos de combustível, rateio, evolutivos, dados de exemplo)
src/component.js      Estado, navegação, persistência e ligações das telas (renderVals)
src/styles.css        Estilos do protótipo + adaptação web (artboard → tela do aparelho)
assets/fonts/         Inter e Space Grotesk (woff2, OFL 1.1) + fonts.css
tests/unit/           Suítes Node: journeys (173), regression-127, regression-92
tests/e2e/e2e.mjs     Jornadas no navegador (Playwright), viewport de celular, sem conexão, varredura 320–412 px
tests/helpers/        Carregador do código-fonte para os testes unitários
tools/serve.mjs       Servidor estático local (sem dependências)
tools/build-site.mjs  Monta _site/ (index.html + src/ + assets/) e grava a versão publicada
legacy/canvas/        Arquivos originais do Canvas (somente referência; não são executados)
```

## 3. Runtime (`src/runtime.js`)
- Template: `{{caminho}}` em texto e atributos, `<sc-if value>`, `<sc-for list as>`, `onClick`, `onChange` e `ref`. Os atributos `hint-*` são ignorados.
- Componente: classe `Component extends DCLogic` com `renderVals()`, `setState()`, `componentDidMount()` e `componentDidUpdate()`.
- Atualização: cada `setState` agenda uma renderização (microtarefa). O template vira um fragmento novo, que é comparado ao DOM atual por posição ("morph"). Isso preserva elementos, foco, cursor e rolagem; o campo em edição não é sobrescrito.
- Eventos: um ouvinte delegado na raiz. `onClick` sobe do elemento mais interno para fora (como na propagação); `onChange` dispara a cada digitação em `input`/`textarea` e na mudança de `select`.
- Diferença em relação ao Canvas: o runtime do Canvas era da ferramenta. Este reproduz o mesmo contrato, e a equivalência foi verificada pelas mesmas jornadas e por capturas de tela (ver `docs/project/MIGRACAO.md`).

## 4. Camada única de cálculo (domínio)
Toda tela lê de **uma** fonte: `data()` = estado persistido + o registro do expediente em andamento (`liveRec`).
- `aggregate(S, de, até, modoFixos)` → receita, taxas, corridas, km (do expediente, estimado e produtivo), tempo, combustível, despesas, manutenção e fixos, produzindo custos e resultado. Modos de fixos: `true` = mês integral, `'pro'` = rateio diário, `false` = sem fixos.
- `aggMonths` / `mergeAgg` / `aggFor` / `evoPlan` → Dia, Semana, Mês, 3 meses, Ano e Histórico (todos somáveis).
- `base(registros)` → soma só as realizadas (`concluida` com valor e km) e as taxas (`taxa` e `cancelada` com taxa); devolve também o tempo útil (`min`), as corridas sem duração e a receita das corridas com duração.
- `shiftMin()` → tempo total pelo relógio (início → agora/STOP). `timeStats(base, total)` → útil, não útil, %, R$/h de expediente e R$/h útil, com sinalização de parcial e de inconsistência.
- `consolidate(registros)` → após o fechamento, recalcula o dia a partir dos registros (sem duplicar), com trilha.
- Combustível: `fuelCycles` (cheio → cheio; `cpk = gasto ÷ km`). Cada dia é custeado pelo ciclo que contém o seu hodômetro; fora de ciclo usa o último medido e, sem nenhum, a referência (`cpkSource`). Elétrico: `energyStats` (medido entre cargas de 100%).
- Fixos: `fixosProrated` = valor ÷ dias reais do mês, respeitando a competência.

## 5. Modelo de registros de corrida
```
registro = { id, src: 'offer' | 'reg' | 'demo', st, i?, of?, recv?, km?, min?, fee?, at, doneAt?, ts, trail[], demo? }
st: 'oferta' (a conferir; nunca é receita) | 'concluida' (realizada) | 'cancelada' (taxa opcional em fee) | 'nao_aceita' (não marcada no STOP)
    | 'taxa' / 'excluida' (registros manuais da rodada 5, mantidos por compatibilidade)
fechamento: ofertas ainda 'oferta' → 'nao_aceita' (com trilha); o dia guarda rideList, min (total), minUtil e minUtilMissing
```

## 6. Persistência e offline
- `localStorage`, chave `meu-destino:dados:v2` (por origem do navegador). É gravado só quando os dados mudam; as datas são restauradas no carregamento.
- Nenhuma chamada de rede durante o uso: fontes locais, ícones em SVG embutido, sem APIs externas.
- **Sem Service Worker:** depois de carregado, o app funciona sem conexão, mas recarregar a página offline depende do cache HTTP do navegador (decisão pendente P-11, ideia IDEA-009).
- No app Android: Room/SQLite + DataStore (PRD §8), com trilha de auditoria por registro.

## 7. Publicação
- Workflow `ci-pages.yml`:
  1. `testes`: unitários + e2e no site montado, em todo push e PR;
  2. `publicar`: só em `main`, depois dos testes;
  3. `validar-online`: aguarda a nova versão no endereço público e roda o e2e contra ele.
- Os caminhos são todos relativos (`./src/...`), compatíveis com o subcaminho `/meu-destino/` do GitHub Pages.

## 8. Para o app Android (orientação, não decisão nova)
- Portar `src/logic.js` para o módulo `domain` em Kotlin, reaproveitando os cenários dos testes unitários (392 verificações) como testes JUnit.
- `src/component.js` corresponde aos ViewModels; o template corresponde às telas Compose.
- Manter a regra: nenhuma tela calcula números por conta própria.
