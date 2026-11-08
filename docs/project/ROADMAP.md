# Meu Destino — Roadmap e Controle de Sprints

**Versão:** 1.3 (08/11/2026 — consolidação: MVP definido e nova sequência de sprints)\
**Regra:** nenhuma sprint começa sem autorização explícita. O escopo definitivo de cada sprint é apresentado e aprovado antes da execução.

## 1. Situação atual (08/11/2026)

| Etapa | Status | Evidência |
|---|---|---|
| Preparação (análise do PRD, lacunas, plano da Sprint 0) | Concluída — documento v0.1 de 06/11, revisado em 08/11 | `docs/project/PREPARACAO_E_SPRINT_0.md` |
| Prototipação navegável (rodadas 1–5, no Canvas) | Concluída | Versão de origem 1794094392-9b11 (`docs/project/MIGRACAO.md`) |
| Migração para o GitHub + publicação no GitHub Pages | Concluída (08/11) | Primeira publicação validada `922e93e` (execução 42481585678) |
| Correções da validação manual (STOP, custos, tempo) | Implementadas e publicadas; **validação manual com falha aberta F-01** (tempo útil > tempo total) | PRs #1–#6; versão de referência `e3bca2f`; testes: jornadas 177/177, validação manual 60/60, regressão 219/219, E2E 59/59 local e 60/60 público |
| Sprint 0 — experimentos no aparelho (E0–E8) | **Não executada**; incorporada à Sprint 1 | — |
| Sprints 1–8 (nova sequência) | Não iniciadas | — |

O protótipo web é a referência visual e funcional. **Não** é o app Android: ainda não existem app Android, APK, bolinha flutuante, overlay, captura real nem OCR na operação real.

## 2. Objetivo: MVP (D-30)

O MVP está pronto quando o Meu Destino puder ser usado numa **operação real, no Galaxy S25+, sem dados fictícios, exemplos ou simulações**. A sequência completa (abrir o app → expediente → oferta no Uber/99 → bolinha flutuante → captura → OCR → análise → registro → indicadores → STOP com conferência → hodômetro, abastecimento e despesas reais → resultados reais) está no PRD §1B.

## 3. Nova sequência de sprints (D-31)

Direcionamento aprovado: antecipar a construção do app Android e a investigação da captura. É uma **sequência de planejamento, não uma autorização** para implementar tudo antecipadamente.

| Sprint | Objetivo | Frentes |
|---|---|---|
| **1 — Fundação Android e prova técnica de captura** | Iniciar o app Android nativo e investigar desde o início a viabilidade da funcionalidade central | Estrutura do projeto Android; ambiente; arquitetura modular; banco local; navegação básica; design system; permissões; investigação de captura de tela; prova técnica da bolinha flutuante e do overlay; investigação do OCR local; testes no Galaxy S25+ |
| 2 — Captura e interpretação de ofertas | Transformar a tela de oferta em dados confiáveis | Integração da captura; OCR; extração e normalização dos campos; identificação da plataforma; erros e dados incompletos |
| 3 — Motor operacional | Operar um expediente com ofertas reais | Integração das ofertas; registro operacional; corridas realizadas e canceladas; conferência no STOP; persistência e histórico; **correção das inconsistências de tempo (F-01)** |
| 4 — Gestão do veículo e hodômetro | Base de quilometragem real | Cadastro do veículo; hodômetro; quilometragem; expediente; conciliação |
| 5 — Combustível e manutenção | Custos do veículo | Abastecimentos; ciclos de tanque; consumo; custo por km; manutenções |
| 6 — Gestão financeira | Resultado real | Receitas; custos; despesas; resultados; relatórios; DRE (respeitando as decisões pendentes P-01, P-02, P-03 e P-06) |
| 7 — Integração e estabilização operacional | Uso contínuo | Integração completa; confiabilidade da captura; ajustes de interface; testes de uso real |
| 8 — Validação final e preparação do MVP | Critério do PRD §1B atendido | Testes com dados reais; correções; estabilidade; desempenho; segurança e proteção; APK instalável; preparação para uso real |

**Pendência de planejamento (P-17):** a gestão territorial (zonas) e o motor de classificação das ofertas, que eram as Sprints 3 e 2 da sequência anterior, não aparecem explicitamente na nova sequência nem nos 14 passos do MVP. É preciso decidir se ficam no MVP e em qual sprint entram.

## 4. Próximo passo (aguarda autorização)

**Sprint 1 — Fundação Android e prova técnica de captura.** Antes de executar:
1. Apresentar o escopo definitivo, o plano, as dependências e os critérios de aceite.
2. Obter autorização explícita do dono do produto.

A proposta inicial de escopo está em `docs/project/HANDOFF.md` §9. Ela reaproveita os experimentos E0–E8 da Preparação.

## 5. Histórico — sequência anterior (PRD v1.0, substituída pela D-31)

| Sprint | Objetivo | Entrega verificável |
|---|---|---|
| 0 | Viabilidade de captura, OCR e overlay | Relatório técnico com evidências e decisão |
| 1 | Fundação Android e Design System | App instalável, navegável e persistente |
| 2 | Motor de decisão | Cálculos e testes aprovados |
| 3 | Gestão territorial | Zonas e regras geográficas aprovadas |
| 4 | Controle do veículo | Foto/OCR do hodômetro e expediente |
| 5 | Abastecimento e manutenção | Histórico, consumo e alertas |
| 6 | Gestão financeira | Conciliação e relatórios |
| 7 | Captura e overlay integrados | Fluxo de oferta demonstrado |
| 8 | Estabilização e release | APK, testes e documentação |

## 6. Modelo obrigatório de sprint

### Sprint \[número\] — \[nome\]

**Status:** Não iniciada / Em andamento / Bloqueada / Concluída

**Objetivo:** \[Resultado esperado\]

**Escopo autorizado:** - \[Itens\]

**Fora do escopo:** - \[Itens\]

**Dependências e riscos:** - \[Itens\]

**Plano de implementação:** - \[Etapas\]

**Testes:** - \[Cenários\]

**Critérios de aceite:** - \[Condições observáveis\]

**Evidências:** - Build: - Testes: - Demonstração: - Arquivos/documentação:

**Pendências:** - \[Itens\]

**Ideias novas identificadas:** registrar no backlog. Não implementar nesta sprint sem aprovação.

## 7. Controle de mudanças

Toda proposta nova recebe ID e é registrada em `docs/backlog/IDEAS_BACKLOG.md`. A sprint em andamento não é ampliada automaticamente.
