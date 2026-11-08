# Meu Destino

Copiloto de operação e gestão financeira para motoristas de aplicativo: avaliar ofertas, registrar corridas, controlar quilometragem, abastecimentos e manutenção, e entender o resultado do dia e do mês.

> **Estado atual:** protótipo **web navegável**, usado como referência visual e funcional do produto. O app Android definitivo ainda não foi iniciado (veja `docs/project/ROADMAP.md`).
> Captura de ofertas, OCR, sobreposição e geocodificação são **simulados**. **Nunca** há aceite ou recusa automática de corridas.

- **App publicado:** https://lucas-marinho-fpa.github.io/meu-destino/
- **Repositório:** https://github.com/Lucas-Marinho-FPA/meu-destino

## Organização

```
index.html            página única + template das telas
src/                  runtime.js (runtime próprio), logic.js (regras e cálculos), component.js (estado e telas), styles.css
assets/fonts/         fontes locais (Inter e Space Grotesk, OFL 1.1)
tests/unit/           testes de regras e jornadas (Node, sem navegador)
tests/e2e/            jornadas no navegador (Playwright, viewport de celular)
tools/                servidor local e montagem do site publicado
docs/                 documentação oficial (produto, arquitetura, decisões, backlog, projeto)
legacy/canvas/        arquivos originais do protótipo no Canvas (somente referência)
.github/workflows/    CI e publicação no GitHub Pages
```

Detalhes técnicos: `docs/architecture/ARCHITECTURE.md`.

## Executar localmente

Requisito: Node.js 20 ou superior. Não há etapa de build para desenvolver.

```bash
npm start            # http://localhost:8080/
```

Também é possível abrir `index.html` direto no navegador. Os dados ficam no `localStorage` do navegador; para zerar, use Configurações → Preferências → Seus dados.

## Testes

```bash
npm ci                                  # instala o Playwright (somente desenvolvimento)
npm test                                # suítes unitárias: 173 + 127 + 92 verificações
npx playwright install chromium         # uma vez
npm start &                             # em outro terminal
BASE_URL=http://localhost:8080/ npm run test:e2e
```

O e2e grava capturas e o relatório em `test-results/`. Para testar a versão publicada:

```bash
BASE_URL=https://lucas-marinho-fpa.github.io/meu-destino/ npm run test:e2e
```

## Publicação

O workflow `.github/workflows/ci-pages.yml`:

1. Em todo push e pull request, roda os testes unitários e o e2e no site montado (`tools/build-site.mjs`).
2. Em `main`, se os testes passarem, publica no GitHub Pages. A versão (commit) fica em `<meta name="app-version">`.
3. Depois de publicar, espera a nova versão aparecer no endereço público e roda o e2e contra ele. As evidências ficam nos artefatos da execução.

Só o que estiver em `main` é publicado.

## Como contribuir

1. Leia o PRD (`docs/product/PRD.md`), o handoff (`docs/project/HANDOFF.md`) e as regras de escopo (`.github/copilot-instructions.md`).
2. Crie uma branch `feature/<assunto>` a partir de `develop`.
3. Faça alterações pequenas e testáveis. Não mude regras de negócio, identidade visual ou arquitetura sem aprovação registrada em `docs/decisions/DECISIONS.md`.
4. Rode `npm test` e o e2e. **Não remova testes para fazê-los passar**: adaptações precisam ser justificadas no próprio teste.
5. Abra um pull request para `develop`. A versão estável vai para `main` por pull request de `develop` depois da aprovação.
6. Registre ideias novas em `docs/backlog/IDEAS_BACKLOG.md`, sem implementá-las.

## Documentos oficiais

| Documento | Caminho |
|---|---|
| PRD (Documento Mestre v1.1) | `docs/product/PRD.md` |
| Roadmap e sprints | `docs/project/ROADMAP.md` |
| Arquitetura | `docs/architecture/ARCHITECTURE.md` |
| Registro de decisões | `docs/decisions/DECISIONS.md` |
| Backlog de ideias | `docs/backlog/IDEAS_BACKLOG.md` |
| Critérios de aceite | `docs/project/ACCEPTANCE_CRITERIA.md` |
| Handoff (estado e próxima etapa) | `docs/project/HANDOFF.md` |
| Registro da migração | `docs/project/MIGRACAO.md` |
| Preparação e plano da Sprint 0 | `docs/project/PREPARACAO_E_SPRINT_0.md` |

## Licença

Ainda não definida (decisão pendente P-12). Sem licença declarada, todos os direitos ficam reservados ao autor. As fontes em `assets/fonts/` seguem a SIL Open Font License 1.1 (textos incluídos).
