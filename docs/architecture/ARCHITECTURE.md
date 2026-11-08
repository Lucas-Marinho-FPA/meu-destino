# Meu Destino — Arquitetura (atualizado em 08/11/2026)

Este documento separa duas realidades:
- **Parte A — Arquitetura existente:** o protótipo web navegável, que está construído, testado e publicado.
- **Parte B — Arquitetura-alvo:** o aplicativo Android nativo, que **ainda não foi iniciado**. Nada da Parte B existe em código; ela vem do PRD §8.

---

# PARTE A — Arquitetura existente: protótipo web

## 1. Estado real

| Item | Situação |
|---|---|
| Fonte oficial | Este repositório (`main` = estável; `develop` = integração; `feature/*` = alterações) |
| App publicado | GitHub Pages, publicado pelo workflow `.github/workflows/ci-pages.yml` |
| Origem | Protótipo no Canvas, versão 1794094392-9b11 (arquivos preservados em `legacy/canvas/`) |
| Versão de referência | `e3bca2f` (publicada e validada online em 08/11/2026) |
| App Android | **Não existe** ainda (ver Parte B e PRD §9) |
| Tecnologia | HTML + CSS + JavaScript, sem framework e sem dependências de execução; Node.js + Playwright só para testes |

## 2. Estrutura

```
index.html            Página única: carrega estilos e scripts; contém o template das telas (<template id="md-template">)
src/runtime.js        Runtime próprio (sem dependências) que interpreta o template e atualiza o DOM
src/logic.js          Camada única de dados e regras (cálculos, ciclos de combustível, rateio, evolutivos, dados de exemplo)
src/component.js      Estado, navegação, persistência e ligações das telas (renderVals)
src/styles.css        Estilos do protótipo + adaptação web (artboard → tela do aparelho)
assets/fonts/         Inter e Space Grotesk (woff2, OFL 1.1) + fonts.css
tests/unit/           Suítes Node: journeys (177), validacao-manual (60), regression-127, regression-92 = 456 verificações
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
  - **Falha aberta F-01:** quando o tempo útil passa do total, `timeStats` só sinaliza (`incons`). Os ganhos por hora continuam sendo exibidos, o que contraria a regra aprovada (dados inconsistentes não geram indicadores derivados válidos). A correção está prevista na Sprint 3 (`docs/project/HANDOFF.md`).
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

## 8. Testes existentes
| Suíte | Verificações | O que cobre |
|---|---|---|
| `tests/unit/journeys.test.js` | 177 | Ofertas, conferência, receita, médias, cancelamento, fechamento, correção, combustível, elétrico, rateio, evolutivos, integração, jornada com persistência, veículo |
| `tests/unit/validacao-manual.test.js` | 60 | Cenários A (STOP), B (custos: reproduz os R$ 60,20) e C (tempo) |
| `tests/unit/regression-127.test.js` | 127 | Regressão das rodadas 1–3 |
| `tests/unit/regression-92.test.js` | 92 | Regras de oferta e meta, fluxo do expediente |
| `tests/e2e/e2e.mjs` | 59 local / 60 publicado | Jornadas pela interface (celular), memória de cálculo, tempo, persistência, sem conexão, varredura 320–412 px, versão publicada |

**Limite dos testes:** eles não detectaram a F-01, porque usam o relógio fixo e durações coerentes. Um teste que reproduza o cenário do Galaxy (várias ofertas marcadas como realizadas num intervalo curto) precisa acompanhar a correção.

---

# PARTE B — Arquitetura-alvo: aplicativo Android (não iniciado)

Origem: PRD §8. Nada abaixo foi implementado nem comprovado no aparelho.

## 9. Tecnologias previstas
- **App nativo:** Kotlin + Jetpack Compose; MVVM + Clean Architecture modular; Gradle.
- **Persistência offline:** Room/SQLite para os registros e DataStore para as configurações. Trilha de auditoria por registro, como no protótipo.
- **Captura de tela:** mecanismo a definir na Sprint 1 (MediaProjection, Accessibility, ou acionamento pelo motorista). Hipóteses H1–H3 ainda não comprovadas.
- **Bolinha flutuante e overlay:** WindowManager (hipótese H5).
- **OCR local:** ML Kit on-device (hipótese H4).
- **Câmera do hodômetro:** CameraX.
- **Mapas e localização:** MapLibre e Android Location Services, sujeitos à escolha de provedor (L9).
- **Testes:** JUnit e testes instrumentados.

## 10. Módulos lógicos previstos
`presentation` · `domain` · `data` · `capture` · `integrations` (adaptadores por plataforma → modelo comum de oferta) · `location` · `services` · `core` · `tests` · `docs`.

## 11. Princípios que se mantêm
- Offline-first: cálculos, registros, OCR e relatórios funcionam sem internet.
- Sem servidor próprio obrigatório no MVP.
- Nenhuma automação de aceite ou recusa e nenhuma interação com os controles dos apps de motorista.
- Imagens processadas localmente, com descarte das capturas temporárias.

## 12. Do protótipo para o Android (orientação, sem decisão nova)
- **Domínio:** portar `src/logic.js` (regras puras) para o módulo `domain` em Kotlin, transformando os cenários das 456 verificações unitárias em testes JUnit com os **mesmos valores esperados**. Isso evita reimplementar cálculos de forma inconsistente.
- **Estado e telas:** `src/component.js` corresponde aos ViewModels; o template de `index.html` corresponde às telas Compose. A identidade visual vem do protótipo (pendência P-10: tokens de cor).
- **Regra estrutural:** uma única camada de cálculo; nenhuma tela calcula números por conta própria.
- **Antes de portar o tempo:** corrigir a regra da F-01 (tempo útil ≤ total) e incluir o teste correspondente.
- O protótipo web continua como referência e ambiente de validação de regras enquanto o app é construído.
