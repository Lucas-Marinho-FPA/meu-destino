# Meu Destino --- Roadmap e Controle de Sprints

**Versão:** 1.2 (07/11/2026 — migração para o GitHub)\
**Regra:** nenhuma sprint começa sem autorização explícita.

## Situação atual (07/11/2026)

| Etapa | Status | Evidência |
|---|---|---|
| Preparação (análise do PRD, lacunas, plano da Sprint 0) | Concluída — documento v0.1 entregue | `claude/PREPARACAO_E_SPRINT_0_v0.1.md` |
| Prototipação navegável (Frente 2), rodadas 1–5 | **Concluída**: a rodada 5 fecha o ciclo | Canvas "Meu Destino — Protótipo navegável da jornada", versão 1794094392-9b11; testes 173 + 127 + 92 aprovados (ver HANDOFF) |
| Migração para o GitHub + publicação no GitHub Pages | **Concluída** (08/11/2026) | https://lucas-marinho-fpa.github.io/meu-destino/; execução 42481585678; E2E online 51/51; ver `docs/project/MIGRACAO.md` |
| Sprint 0 — Frente 1 (viabilidade técnica no aparelho) | **Não iniciada** | Depende do aparelho-alvo (L11) e de autorização |
| Sprints 1–8 | Não iniciadas | — |

O protótipo web (agora no repositório) é a referência visual e funcional. **Não** é o app Android: não há projeto Android nem APK.

  -----------------------------------------------------------------------
  Sprint                  Objetivo                Entrega verificável
  ----------------------- ----------------------- -----------------------
  0                       Viabilidade de captura, Relatório técnico com
                          OCR e overlay           evidências e decisão

  1                       Fundação Android e      App instalável,
                          Design System           navegável e persistente

  2                       Motor de decisão        Cálculos e testes
                                                  aprovados

  3                       Gestão territorial      Zonas e regras
                                                  geográficas aprovadas

  4                       Controle do veículo     Foto/OCR do hodômetro e
                                                  expediente

  5                       Abastecimento e         Histórico, consumo e
                          manutenção              alertas

  6                       Gestão financeira       Conciliação e
                                                  relatórios

  7                       Captura e overlay       Fluxo de oferta
                          integrados              demonstrado

  8                       Estabilização e release APK, testes e
                                                  documentação
  -----------------------------------------------------------------------

## Próximo passo proposto (aguarda autorização)

A proposta detalhada de escopo e critérios de aceite está em `docs/project/HANDOFF.md`. Resumo: **Sprint 0 — Frente 1 (prova de viabilidade no aparelho)**, precedida de um *gate* de decisões. A alternativa, caso o dono do produto prefira, é iniciar a Sprint 1 já com o protótipo como referência; nesse caso o risco da captura continua aberto.

## Modelo obrigatório de sprint

### Sprint \[número\] --- \[nome\]

**Status:** Não iniciada / Em andamento / Bloqueada / Concluída

**Objetivo:** \[Resultado esperado\]

**Escopo autorizado:** - \[Itens\]

**Fora do escopo:** - \[Itens\]

**Dependências e riscos:** - \[Itens\]

**Plano de implementação:** - \[Etapas\]

**Testes:** - \[Cenários\]

**Critérios de aceite:** - \[Condições observáveis\]

**Evidências:** - Build: - Testes: - Demonstração: -
Arquivos/documentação:

**Pendências:** - \[Itens\]

**Ideias novas identificadas:** Registrar no backlog. Não implementar
nesta sprint sem aprovação.

## Controle de mudanças

Toda proposta nova deve receber ID e ser registrada em
`docs/backlog/IDEAS_BACKLOG.md`. A sprint em andamento não é ampliada
automaticamente.
