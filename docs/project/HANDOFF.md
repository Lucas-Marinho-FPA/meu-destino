# Meu Destino — Handoff (ponto de partida da próxima sessão)

**Atualizado em:** 08/11/2026, na consolidação documental de fim de sessão.\
**Este documento é autossuficiente:** a próxima sessão começa do zero em termos de conversa, mas não de conhecimento do projeto. Leia este documento antes de qualquer outro.

| Item | Valor |
|---|---|
| Repositório (fonte oficial) | https://github.com/Lucas-Marinho-FPA/meu-destino (público) |
| Protótipo publicado | https://lucas-marinho-fpa.github.io/meu-destino/ |
| Versão de referência do protótipo | **`e3bca2f`**: último commit com código do app, publicado e validado online (60/60). Os commits seguintes em `main` são só de documentação |
| Aparelho de referência | Samsung Galaxy S25+ |
| Próxima etapa | **Sprint 1 — Fundação Android e prova técnica de captura**, ainda **não iniciada** e dependente de autorização explícita |

## 1. O que é o Meu Destino
Copiloto de operação e gestão financeira para motoristas de aplicativo (Uber, 99): avaliar ofertas, registrar a operação real, controlar quilometragem, abastecimentos, manutenção e custos, e entender o resultado do dia e do mês.

Princípios inegociáveis:
- offline-first e processamento local;
- simplicidade e pouca digitação;
- **nunca automatizar aceite ou recusa** de corridas e nunca interagir com os controles dos apps de motorista;
- separar o valor ofertado, o recebido, a despesa efetiva e o custo estimado;
- privacidade.

Documento mestre: `docs/product/PRD.md` (v1.3).

## 2. Objetivo: o MVP (D-30)
O MVP está pronto quando o Meu Destino puder ser usado **numa operação real, no Galaxy S25+, sem dados fictícios, exemplos ou simulações**. O motorista deve conseguir:
1. abrir o app;
2. iniciar o expediente;
3. abrir o Uber Driver ou o 99 Motorista e ver uma oferta;
4. acionar a **bolinha flutuante**;
5. capturar a oferta e processá-la com **OCR**;
6. ver os dados para análise e registrar as ofertas reais;
7. acompanhar os indicadores;
8. encerrar o expediente e **conferir as corridas realizadas e canceladas**;
9. registrar hodômetro, abastecimentos e despesas reais;
10. consultar os resultados reais.

Com persistência local, offline nas funções essenciais, respeito às permissões do Android e às políticas, e sem automação de aceite ou recusa. Lista completa de 14 passos: PRD §1B.

## 3. O que já foi construído — e o que não existe
**Existe (protótipo web, HTML/JavaScript):** interface e regras de negócio elaboradas, testadas e publicadas.

| Área | Funcionalidade no protótipo |
|---|---|
| Operação | Hodômetro como trava; recuperação de expediente; oferta **simulada** com card de impacto e classificação; nada a marcar durante a operação; médias com aviso "referência, não garantia"; tempo pelo relógio real |
| Conferência no STOP (D-27) | Todas as ofertas do expediente: Realizada (valores da oferta, corrigíveis) / Cancelada (taxa opcional); não marcadas → Não aceita; correção com trilha, inclusive após o fechamento; o fechamento usa exatamente os registros conferidos |
| Financeiro | Ganhos, km e médias durante o expediente; custos separados (combustível e fixos estimados; despesas e manutenção registradas); **memória de cálculo**; resultado parcial; tempo total, útil e não útil; DRE do dia; "Fechado e conferido"; Custos, Resultados, Metas |
| Histórico | Evolutivos (6 períodos, multissérie), Ofertas, Expedientes |
| Veículo e combustível | Cartão → detalhes (ilustração na cor); 6 motorizações; ciclos cheio → cheio; custo/km por ciclo; Flex; híbrido; elétrico medido × estimado |
| Plataforma | Persistência local (navegador); dados de exemplo identificados e removíveis; navegação de 4 abas com voltar em toda tela |

**Ainda NÃO existe:** aplicativo Android, APK, bolinha flutuante, overlay sobre os apps de motorista, captura real de ofertas, OCR na operação real. No protótipo, captura, OCR, overlay e geocodificação são **simulados**.

## 4. O que existe no GitHub
- **Branches:**
  - `main`: estável; cada push publica no GitHub Pages;
  - `develop`: integração;
  - `evidencias`: gerada pelo CI, com o relatório e as capturas da última validação online;
  - `feature/*` e `fix/*`: já integradas, mantidas como histórico.
- **Fluxo:** `feature/*` → PR para `develop` → PR para `main`. Os PRs #1 a #6 seguiram esse fluxo.
- **CI** (`.github/workflows/ci-pages.yml`):
  1. testes unitários e e2e em todo push e PR;
  2. publicação no Pages só a partir de `main`;
  3. validação e2e no endereço público, com conferência da versão publicada.
- **Testes:** jornadas 177/177 · validação manual 60/60 · regressão 219/219 (127 + 92) · E2E 59/59 local e 60/60 no endereço público. Os comandos são `npm ci`, `npm test` e `BASE_URL=… npm run test:e2e`.
- **Histórico completo** (Canvas → GitHub → correções): `docs/project/MIGRACAO.md`.

## 5. Arquitetura atual (resumo; detalhes em `docs/architecture/ARCHITECTURE.md`)
- **Existente (Parte A):** `index.html` com o template das telas; `src/runtime.js` (runtime próprio); `src/logic.js` (camada única de cálculo); `src/component.js` (estado, navegação, persistência em `localStorage`); `src/styles.css`; fontes locais. Nenhuma tela calcula números por conta própria.
- **Alvo (Parte B, não iniciado):** Android nativo com Kotlin, Jetpack Compose, MVVM + Clean Architecture modular, Room/SQLite + DataStore, OCR local (ML Kit), captura de tela, bolinha flutuante e overlay (WindowManager), offline-first.
- **Ao portar:** levar `src/logic.js` para o módulo `domain` reaproveitando as 456 verificações unitárias como testes JUnit com os mesmos valores esperados.

## 6. Decisões aprovadas (registro completo em `docs/decisions/DECISIONS.md`)
- **D-01 a D-21 (rodadas 2–4):**
  - geocodificação online por padrão;
  - ofertas nunca viram corridas sozinhas;
  - regra de km e hodômetro como trava;
  - limites 2,50 / 2,99 / 3,00 R$/km;
  - mockups como referência e 4 abas;
  - 6 motorizações;
  - data e hora do aparelho com trilha;
  - evolutivos;
  - camada única de cálculo;
  - custo de combustível por km = gasto do ciclo ÷ km do ciclo;
  - rateio diário de custos fixos;
  - persistência e dados de exemplo separados.
- **D-22 a D-25 (rodada 5):** sem marcação durante a operação; financeiro durante o expediente; cartão do veículo e imagem local com alternativa.
- **D-26:** GitHub público, GitHub Pages, branches e CI.
- **D-27:** conferência das ofertas no STOP.
- **D-28:** abastecimento como desembolso informativo, sem duplicar o custo de combustível.
- **D-29:** tempo pelo relógio real, com tempo útil e não útil. **Implementada, mas falhou na validação manual (F-01).**
- **D-30:** definição oficial do MVP.
- **D-31:** nova sequência de sprints, com Android e captura antecipados.
- **D-32:** regra do tempo: útil ≤ total; dados inconsistentes devem ser sinalizados e não podem gerar indicadores derivados apresentados como válidos.
- **Aguardando confirmação:** decisões de interface I-03 a I-06. **Propostas não aprovadas:** PT-01 a PT-06.

## 7. Problemas e pendências (lista única e oficial)

### 7.1 Falha aberta — F-01: tempo útil maior que o tempo total
- **Evidência:** validação manual no Galaxy S25+ (08/11/2026): tempo total do expediente **1h16min**; operação útil **2h36min** (1h20min acima do total). O app mostrou um aviso ("soma das corridas maior que o expediente"), mas continuou exibindo ganho por hora de expediente (R$ 134,53) e por hora útil (R$ 65,54).
- **Status: PENDENTE** — diagnóstico e correção na evolução do aplicativo (Sprint 3 da nova sequência). **O comportamento de tempo não está validado, apesar de os testes automatizados passarem.**
- **Regra esperada (D-32):** tempo útil ≤ tempo total; tempo não útil = total − útil. Com dados inconsistentes, sinalizar e não apresentar os indicadores derivados como válidos.
- **Causas a investigar (nenhuma confirmada):**
  - sobreposição de corridas;
  - soma duplicada de durações;
  - referências temporais diferentes;
  - inconsistência entre horários e durações;
  - problemas na associação das corridas ao expediente.
- **Hipótese levantada na sessão, não confirmada no aparelho:** no protótipo, as ofertas simuladas chegam no momento do toque. Várias recebidas em poucos minutos e marcadas como realizadas somariam as durações das ofertas (cerca de 20 a 30 min cada) sem que esse tempo tenha passado no relógio.
- **Propostas de correção (não aprovadas, P-18):** PT-01 validar sobreposição na conferência; PT-02 só reforçar o aviso; PT-03 modo de simulação de relógio.
- **Testes:** a correção deve vir com um teste que reproduza o cenário do Galaxy.

### 7.2 Pendências de produto (não decidir por iniciativa própria)
| ID | Tema |
|---|---|
| P-00 | Fotografia real do veículo e estratégia de armazenamento (catálogo licenciado embutido × foto do próprio motorista, IDEA-005 × pacote baixado, IDEA-006) |
| P-01 | DRE: método de provisões e depreciação |
| P-02 | Regras de custos fixos além do rateio diário (meses sem operação, competência de itens anuais) |
| P-03 | Metodologia definitiva do custo de combustível, incluindo a estimativa durante o expediente sobre km produtivos |
| P-04 | Pausas e intervalos dentro do expediente (o tempo total já é início → STOP, D-29) |
| P-05 | Comunicação do resultado diário negativo causado pelo rateio de fixos |
| P-06 | Diferenciação definitiva entre ganho por km de corrida (km produtivo) e resultado por km total |
| P-07 | Regra dos 50% de "Favorável com atenção"; classe financeira; destino neutro; limites de trânsito, risco e terreno |
| P-08 | Decisões de interface I-03 a I-06 (I-01 e I-02 foram substituídas pela D-27) |
| P-09 | Lacunas L5–L13 da Preparação. L11 parcialmente respondida: aparelho Galaxy S25+; faltam a versão do Android e os apps usados (Uber, 99 ou ambos). L13: APK direto × Google Play |
| P-10 | Reconciliar os tokens de cor do protótipo com os 7 tokens do PRD |
| P-11 | Reabertura offline do protótipo (Service Worker, IDEA-009) |
| P-12 | Licença do repositório público (hoje sem licença = todos os direitos reservados) |
| P-13 | Tempo perdido com cancelamentos (IDEA-013) |
| P-14 | Corridas não capturadas no uso real: voltar um "registrar corrida esquecida" na conferência? (IDEA-011) |
| P-15 | Custos fixos de exemplo carregados por padrão (IDEA-012) |
| P-16 | Captura automática sem toque: continua como requisito futuro (D-06) ou a bolinha flutuante do MVP (D-30) basta? |
| P-17 | Gestão territorial (zonas) e motor de classificação de ofertas: ficam no MVP? Em qual sprint da nova sequência? |
| P-18 | Como corrigir a F-01 (escolher entre PT-01, PT-02 e PT-03 ou outra solução) |

### 7.3 Pendências técnicas
| ID | Pendência |
|---|---|
| T-01 | Nenhuma imagem licenciada de modelo de veículo (ilustração genérica, identificada como tal) |
| T-04 | Elétrico: custo/km pelo último resultado do período, não ciclo por ciclo |
| T-05 | Sem Service Worker no protótipo (P-11) |
| T-06 | Portar as regras para Kotlin com as 456 verificações como testes |
| T-07 | Proteção da branch `main` (exigir CI verde e PR): configurar em Settings → Branches |
| T-08 | Atualizar as actions do CI para Node.js 24 (aviso de descontinuação do Node.js 20) |

T-02 (fontes remotas) e T-03 (tempo simulado) foram resolvidas.

### 7.4 Riscos
1. A captura pode ser inviável ou não permitida (hipóteses H1–H8 ainda sem evidência). Isso atinge diretamente o MVP (D-30).
2. Risco à conta do motorista se os termos das plataformas proibirem ferramentas de terceiros (E8 não feito).
3. Divergência de cálculos entre o protótipo e o app se as regras não forem portadas com os mesmos testes.
4. As pendências financeiras (P-01, P-02, P-03, P-06) podem mudar os resultados exibidos.
5. O repositório é público: nunca versionar dados reais, capturas de ofertas reais sem anonimizar, nem credenciais.

## 8. Sequência do roadmap (D-31; detalhes em `docs/project/ROADMAP.md`)
1. **Fundação Android e prova técnica de captura**
2. Captura e interpretação de ofertas
3. Motor operacional (inclui a F-01)
4. Gestão do veículo e hodômetro
5. Combustível e manutenção
6. Gestão financeira
7. Integração e estabilização operacional
8. Validação final e preparação do MVP

É uma sequência de planejamento, não uma autorização. A Sprint 0 fica como histórico: a prototipação foi feita, e os experimentos no aparelho (E0–E8) não foram executados e foram absorvidos pela Sprint 1 (`docs/project/PREPARACAO_E_SPRINT_0.md`, revisão R1–R6).

## 9. Sprint 1 — objetivo e escopo proposto (**não autorizado**)
**Objetivo:** iniciar o app Android nativo e investigar, desde o início, a viabilidade da funcionalidade central: bolinha flutuante, captura e OCR no Galaxy S25+.

**Frentes propostas (D-31):**
- Estrutura do projeto Android: Kotlin, Compose, módulos, Gradle e build do APK no CI.
- Ambiente.
- Arquitetura modular.
- Banco local (Room).
- Navegação básica (4 abas).
- Design system: tokens do protótipo, com a P-10 a decidir.
- Permissões: overlay, captura e notificação, com divulgação clara.
- Prova técnica da **bolinha flutuante e do overlay** (E5).
- Investigação da **captura de tela** (E1, E2, E3).
- Investigação do **OCR local** (E4).
- Ciclo de vida e bateria (E6).
- Fluxo ponta a ponta de prova (E7).
- Revisão de políticas e termos (E8).
- Testes no Galaxy S25+.

**Fora do escopo proposto:**
- motor operacional, financeiro e gestão do veículo no Android (Sprints 3–6);
- correção da F-01 (Sprint 3);
- ideias do backlog;
- qualquer interação com os controles do Uber ou do 99.

**Dependências:**
- versão do Android do Galaxy S25+ e apps usados (L11);
- aparelho disponível para instalar APKs de teste;
- dataset de capturas reais anonimizadas (PT-05);
- decisão L13 (distribuição);
- P-16 (influencia a investigação de captura).

**Critérios de aceite (proposta, para aprovação):**
- APK de debug compila de forma reproduzível no CI e instala no Galaxy S25+.
- O app abre com a navegação básica e persiste um registro de teste localmente.
- A bolinha flutuante aparece sobre o Uber/99 sem bloquear toques no app externo, ou a impossibilidade fica documentada com evidência.
- Relatório por mecanismo de captura e por plataforma (Viável / Com restrições / Inviável / Não testado) e precisão do OCR por campo.
- E8 com fontes oficiais datadas.
- ADR-001 (captura) e ADR-002 (OCR) para aprovação.
- Nenhum código interage com os controles dos apps de motorista.

Detalhes dos experimentos: Preparação §6 e §7.

## 10. Arquivos para consultar primeiro
1. `docs/project/HANDOFF.md` (este)
2. `docs/product/PRD.md`, em especial §1A estado, §1B MVP, §6 regras e §9 roadmap
3. `docs/project/ROADMAP.md`
4. `docs/decisions/DECISIONS.md`
5. `docs/architecture/ARCHITECTURE.md`
6. `docs/backlog/IDEAS_BACKLOG.md`
7. `docs/project/PREPARACAO_E_SPRINT_0.md` (revisão R1–R6 e experimentos)
8. `docs/project/MIGRACAO.md`, `docs/project/ACCEPTANCE_CRITERIA.md`, `README.md`, `.github/copilot-instructions.md`

## 11. Instruções para a próxima sessão
1. Ler este Handoff e os documentos oficiais acima.
2. Verificar o repositório: `git clone`, branch `main`, último commit, `npm ci && npm test`, e a última execução do workflow e a branch `evidencias`.
3. Confirmar o ambiente: ferramentas de build Android disponíveis (JDK, Android SDK/Gradle no CI), acesso ao repositório e ao aparelho para instalar APKs.
4. Revisar o escopo da Sprint 1 (§9) com o dono do produto.
5. Identificar dependências e riscos, e pedir as respostas pendentes: L11, L13, P-16 e P-17.
6. Apresentar o plano de execução no modelo obrigatório de sprint (`docs/project/ROADMAP.md` §6).
7. **Obter autorização explícita antes de implementar.**

**Não iniciar a Sprint 1 automaticamente.** Não transformar pendências em decisões. Não remover testes. Não alterar regras de negócio sem aprovação registrada.
