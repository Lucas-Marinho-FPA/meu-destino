# Instruções para agentes (Copilot e outros) — Meu Destino

Regras permanentes do projeto. Valem para qualquer alteração neste repositório.

## Fonte de verdade
- Leia `docs/product/PRD.md` e `docs/project/HANDOFF.md` antes de planejar ou alterar qualquer coisa.
- O protótipo publicado (este repositório) é a referência visual e funcional.
- Se houver conflito entre instruções, não invente uma decisão: identifique o conflito e peça validação.

## Disciplina de escopo
- Trabalhe somente na sprint explicitamente autorizada (veja `docs/project/ROADMAP.md`).
- Não antecipe funcionalidades de sprints futuras nem implemente ideias novas por conta própria; registre-as em `docs/backlog/IDEAS_BACKLOG.md`.
- Não altere regras de negócio, identidade visual, arquitetura ou tecnologias sem justificativa e aprovação registrada em `docs/decisions/DECISIONS.md`.
- Correções de bugs, segurança, estabilidade e requisitos obrigatórios fazem parte do escopo.
- **Nunca automatize aceite ou recusa de corridas.** Não interaja com controles de apps de terceiros.
- Não transforme pendências (HANDOFF §Pendências) em decisões.

## Disciplina técnica
- Inspecione o repositório e informe o estado real antes de codificar.
- Não afirme que algo está implementado sem evidência (teste, captura ou execução).
- Alterações pequenas, modulares e testáveis. Preserve as funcionalidades aprovadas.
- Uma única camada de cálculo (`src/logic.js` + `data()`): nenhuma tela calcula números por conta própria.
- Sem serviços pagos ou dependências de nuvem sem aprovação. Priorize processamento local e funcionamento offline.
- Não publique segredos, dados pessoais ou dados reais de usuários (repositório público).

## Testes e publicação
- `npm test` (unitários) e `npm run test:e2e` (navegador) precisam passar.
- Não remova testes para fazer a bateria passar; adaptações devem ser justificadas no próprio teste.
- Fluxo: `feature/*` → PR para `develop` → PR de `develop` para `main` (publicação automática no GitHub Pages).

## Ao fechar uma sprint
Apresente: objetivo e escopo; dependências e riscos; plano; arquivos afetados; testes e critérios de aceite; evidências reais; pendências e backlog. Atualize `docs/project/HANDOFF.md`.
