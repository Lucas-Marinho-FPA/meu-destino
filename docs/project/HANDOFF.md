# Meu Destino — Handoff

**Atualizado em:** 08/11/2026 (migração para o GitHub concluída)\
**Comece por aqui:** este repositório é a fonte oficial. Leia, nesta ordem: `README.md`, `docs/product/PRD.md`, `docs/project/ROADMAP.md`, `docs/decisions/DECISIONS.md`, `docs/architecture/ARCHITECTURE.md`, `docs/backlog/IDEAS_BACKLOG.md` e `.github/copilot-instructions.md`.

## 1. Estado atual
- **Existe:** o protótipo web navegável e testado, publicado no GitHub Pages, que cobre a jornada completa com captura simulada.
- **Não existe:** app Android, APK, captura real, OCR, overlay ou geocodificação.
- **Sprint 0 (Frente 1)** e **Sprints 1–8**: não iniciadas. **Nenhuma sprint deve começar sem autorização.**
- **Origem:** protótipo Canvas, versão 1794094392-9b11 (`docs/project/MIGRACAO.md`).

## 2. Funcionalidades concluídas no protótipo (com evidência de teste)
| Área | Funcionalidade |
|---|---|
| Operação | Hodômetro como trava; recuperação de expediente; oferta simulada com card de impacto e classificação; registro de corrida realizada (valor + km; duração opcional; pré-preenchimento opcional pela oferta); taxa de cancelamento; médias ao vivo com aviso de "referência, não garantia"; nenhuma marcação de aceite/recusa |
| Financeiro | Aviso de expediente em andamento; ganhos, km, médias, custos estimados × registrados e resultado parcial; DRE do dia; detalhamento com detalhe, correção e exclusão com trilha; "Fechado e conferido"; Custos, Resultados e Metas |
| Encerramento | Conferência (resumo, corrigir, excluir, incluir corrida esquecida) → hodômetro final → consolidação sem duplicidade |
| Histórico | Evolutivos (6 períodos, multissérie), Ofertas e Expedientes |
| Veículo | Cartão clicável → detalhes com ilustração na cor; cor; hodômetro atual e no cadastro; edição a partir dos detalhes; 6 motorizações |
| Combustível | Ciclos cheio → cheio; custo/km por ciclo; PMP; estoque estimado; Flex; híbrido sem recarga; elétrico medido × estimado |
| Plataforma | Persistência local; dados de exemplo separáveis; voltar em toda tela; confirmação de formulário alterado; data e hora do aparelho com trilha |

## 3. Como trabalhar
- Executar: `npm start`. Testar: `npm test` e `BASE_URL=http://localhost:8080/ npm run test:e2e`.
- Fluxo: `feature/*` → PR para `develop` → PR para `main`. Publicação automática ao entrar em `main`, só se os testes passarem; depois disso, a validação no endereço público é automática.
- Referência de testes: 173/173 (jornadas), 219/219 (127 + 92), E2E sem falhas. Não remover testes.

## 4. Pendências técnicas
| ID | Pendência |
|---|---|
| T-01 | Nenhuma imagem licenciada de modelo de veículo; hoje aparece a ilustração genérica, identificada como ilustração |
| T-03 | Tempo do expediente simulado (+20 min por oferta) no protótipo |
| T-04 | Elétrico: o custo/km usa o último resultado até o fim do período, não ciclo por ciclo |
| T-05 | Sem Service Worker: recarregar sem conexão depende do cache do navegador (ver P-11) |
| T-06 | Portar as regras para Kotlin (`domain`) com os 392 cenários unitários como testes |
| T-07 | Proteção da branch `main` (exigir CI verde e PR): configurar em Settings → Branches (a sessão não tem acesso a essa API) |
| T-08 | Atualizar as actions para versões com Node.js 24, por causa do aviso de descontinuação do Node.js 20 nos runners |

T-02 (fontes remotas) foi resolvido na migração com as fontes locais.

## 5. Pendências de produto (aguardam decisão — **não decidir por iniciativa própria**)
| ID | Tema |
|---|---|
| P-00 | Fotografia real do veículo e estratégia de armazenamento (catálogo licenciado embutido × foto do próprio motorista, IDEA-005 × pacote baixado, IDEA-006) |
| P-01 | DRE: método de provisões e depreciação |
| P-02 | Regras de custos fixos além do rateio diário (meses sem operação, competência de itens anuais) |
| P-03 | Metodologia definitiva do custo de combustível, incluindo a estimativa durante o expediente sobre km produtivos |
| P-04 | Medição real dos horários de operação (relógio real × pausas) |
| P-05 | Comunicação do resultado diário negativo causado pelo rateio de fixos |
| P-06 | Diferenciação definitiva entre ganho por km de corrida (km produtivo) e resultado por km total |
| P-07 | Regra dos 50% de "Favorável com atenção"; classe financeira; destino neutro; limites de trânsito, risco e terreno |
| P-08 | Decisões de interface I-01 a I-04 (`docs/decisions/DECISIONS.md`) |
| P-09 | Lacunas L5–L13 da Preparação (aparelho-alvo L11, distribuição L13, provedor de mapas L9, categorias de km L7…) |
| P-10 | Reconciliar os tokens de cor do protótipo com os 7 tokens do PRD |
| P-11 | Adotar PWA/Service Worker para reabertura offline garantida (IDEA-009) |
| P-12 | Licença do repositório público (hoje sem licença = todos os direitos reservados) |

## 6. Riscos
1. A captura automática pode ser inviável ou não permitida (H1–H5 da Preparação).
2. Licenciamento e tamanho das imagens de veículos.
3. Divergência protótipo → app se as regras não forem portadas com os mesmos testes.
4. Pendências financeiras (P-01, P-02, P-03, P-06) podem mudar os resultados exibidos.
5. Repositório público: nunca versionar dados reais, capturas de ofertas reais nem credenciais (os dados de passageiros na Sprint 0 precisam ser anonimizados).

## 7. Proposta para a próxima sprint (não iniciada — depende de autorização)
**Sprint 0 — Frente 1: prova de viabilidade no aparelho** (PRD §9; detalhes em `docs/project/PREPARACAO_E_SPRINT_0.md` §6).
- **Escopo sugerido:** projeto Android mínimo de prova em `spikes/sprint0-poc`, isolado do app; E0–E8; relatório; ADR-001 (captura) e ADR-002 (OCR); evidências anonimizadas em `docs/spikes/sprint-0/`.
- **Fora do escopo:** app real (Sprint 1), interação com controles de apps externos, ideias do backlog e as pendências P-01, P-02 e P-04 a P-07.
- **Dependências:** L11 (modelo e versão do Android), aparelho físico com os apps de motorista, dataset de ≥ 30 capturas por plataforma (proposta) e L13.
- **Critérios de aceite:** os 9 itens da Preparação §7 (`docs/project/ACCEPTANCE_CRITERIA.md` §3).
- **Alternativa:** Sprint 1 (Fundação e Design System) com o protótipo como referência; exige decidir antes P-08, P-10, L11 e L13, e deixa o risco da captura em aberto.

## 8. Publicação e validação online (estado real)
| Item | Valor |
|---|---|
| Repositório | https://github.com/Lucas-Marinho-FPA/meu-destino (público) |
| Aplicativo | https://lucas-marinho-fpa.github.io/meu-destino/ |
| Commit inicial | `d55ca7e` |
| Primeira publicação validada | `922e93e` (execução 42481585678: testes ✓, publicar ✓, validar online ✓) |
| Branches | `main`, `develop`, `evidencias` (gerada pelo CI), `feature/ci-evidencias`, `feature/docs-migracao` (integradas) |
| Testes | Jornadas 173/173 · Regressão 219/219 · E2E local 50/50 · **E2E no endereço público 51/51** |
| Evidências | Branch `evidencias` (relatório + 26 capturas); detalhes em `docs/project/MIGRACAO.md` |

**Próxima sessão:** comece pelo repositório (`git clone`, `npm ci`, `npm test`). Toda alteração passa por `feature/*` → `develop` → `main`; ao entrar em `main`, a publicação e a validação online são automáticas. Confira o resultado na aba Actions e na branch `evidencias`.
