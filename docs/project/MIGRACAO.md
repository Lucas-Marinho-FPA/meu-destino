# Registro da migração: Canvas → GitHub

| Campo | Valor |
|---|---|
| Origem | Protótipo navegável no Canvas ("Meu Destino — Protótipo navegável da jornada") |
| Versão de origem | **1794094392-9b11** (publicada em 07/11/2026, 23:33 UTC) |
| Arquivos de origem | `Main.dc.html` (sha256 `dfbfd085…`), `canvas.json` (`bd71f9df…`), `Componentes.dc.html` (`2b9c6aa8…`), preservados em `legacy/canvas/` |
| Backup correspondente | `backup_final_r5_1794094392-9b11.zip` (privado, fora do repositório). O anterior, `backup_antes_rodada5.zip`, foi preservado e verificado sem erros |
| Data da migração | 07/11/2026 |
| Repositório | https://github.com/Lucas-Marinho-FPA/meu-destino (público) |
| Aplicação publicada | https://lucas-marinho-fpa.github.io/meu-destino/ |
| Commit inicial | `d55ca7e8c7e4fe64ea6799b18bee478ff69b3b02` |

## O que foi migrado
| Origem (Canvas) | Destino (repositório) | Tipo |
|---|---|---|
| Template das telas (`Main.dc.html`, corpo) | `index.html` (`<template id="md-template">`) | Movido sem alteração |
| Script de regras (`logic`) | `src/logic.js` | Movido sem alteração |
| Script do componente | `src/component.js` | Movido sem alteração |
| Estilos (`<helmet><style>`) | `src/styles.css` | Movido + bloco de adaptação web no fim |
| Runtime do Canvas (`dc-runtime.js`, da ferramenta) | `src/runtime.js` (novo, próprio) | **Substituído**: o original não pertence ao projeto |
| Fontes do Google Fonts (rede) | `assets/fonts/` (woff2 locais, OFL 1.1) | **Adaptado** para funcionar offline |
| Testes (`run5_new.js`, `run5_reg127.js`, `run5_reg92.js`) | `tests/unit/*.test.js` | Só mudou a forma de carregar o código (de `Main.dc.html` para `src/`); nenhuma verificação foi alterada |
| Varredura visual (`shoot7.py`, Python) | `tests/e2e/e2e.mjs` (Node + Playwright) | Reescrito; as jornadas agora usam a interface real (cliques e digitação) |
| Documentos do Projeto | `docs/` | Copiados; referências de caminho atualizadas |

## Adaptações necessárias (fora do Canvas)
1. **Runtime próprio (M-01):** mesmo contrato de template e componente. A tela é atualizada por comparação com o DOM (preserva foco e rolagem) e os eventos são delegados.
2. **Artboard → tela do aparelho (M-02):** o contêiner de 390×844 passa a ocupar 100% da largura (até 480 px) e a altura visível (`100dvh`).
3. **Fontes locais (M-03):** sem requisições externas durante o uso.
4. **Marcador de versão (M-04):** `<meta name="app-version">` recebe o commit na publicação.
5. **Ícone vazio** (`<link rel="icon" href="data:,">`): evita o erro 404 de `favicon.ico` no console.

## Equivalência funcional (antes de publicar)
| Verificação | Canvas (rodada 5) | Repositório |
|---|---|---|
| Jornadas (`journeys`) | 173/173 | **173/173** |
| Regressão 127 | 127/127 | **127/127** |
| Regressão 92 | 92/92 | **92/92** |
| Regressão de referência | 219/219 | **219/219** |
| E2E no navegador (servidor local) | n/a (havia varredura em Python) | **50/50** (jornadas pela interface, 4 larguras, sem conexão) |
| Capturas de tela | `rodada5_telas_390px.png` | Visualmente equivalentes (mesmas telas, mesma identidade) |

## Limitação conhecida
- **Recarregar a página sem conexão** só funciona se o navegador tiver a página em cache, porque não existe Service Worker (o protótipo também não tinha). Depois de carregado, o app funciona sem conexão: registra, calcula e persiste. Decisão pendente P-11.

## Publicação (08/11/2026)

### Branches
| Branch | Papel | Estado |
|---|---|---|
| `main` | Estável; cada push publica no GitHub Pages | `922e93e` (primeira publicação) + commits de documentação posteriores |
| `develop` | Integração | igual à `main` após cada integração |
| `feature/ci-evidencias` | Etapa de CI que grava as evidências | integrada (merge `17b34a3` em `develop`, `922e93e` em `main`) |
| `feature/docs-migracao` | Este registro | integrada da mesma forma |
| `evidencias` | Gerada pelo CI: relatório e capturas da última validação online (substituída a cada publicação) | automática |

As integrações foram feitas por merge `--no-ff` (histórico preservado). Não houve pull request porque a sessão de migração não tinha acesso à API de PRs; a partir daqui, o fluxo é por PR (README).

### Execuções do workflow `CI e publicação (GitHub Pages)`
| Execução | Branch / commit | Resultado | Observação |
|---|---|---|---|
| 42428564717 | `main` · `d55ca7e` | Testes ✓ · Publicar ✗ | GitHub Pages ainda não estava ativado (erro 404 em `configure-pages`). Ativado manualmente pelo dono em Settings → Pages → Source: GitHub Actions |
| 42428567327 | `develop` · `d55ca7e` | ✓ | Só testes (develop não publica) |
| 42428800867 | `feature/ci-evidencias` · `0cf1193` | ✓ | Só testes |
| **42481585678** | **`main` · `922e93e`** | **Testes ✓ · Publicar ✓ · Validar online ✓** | **Primeira publicação válida** |

A ativação do Pages foi confirmada pela própria execução: `configure-pages` e `deploy-pages` concluíram ("Reported success!"), com URL de ambiente `https://lucas-marinho-fpa.github.io/meu-destino/`. A API de leitura das configurações do Pages não está acessível nesta sessão.

### Resultados (execução 42481585678)
| Suíte | Referência | Resultado |
|---|---|---|
| Jornadas (`journeys`) | 173/173 | **173/173** |
| Regressão 127 | 127/127 | **127/127** |
| Regressão 92 | 92/92 | **92/92** |
| Regressão de referência | 219/219 | **219/219** |
| E2E no site montado (CI, local) | 50/50 | **50/50** |
| **E2E no endereço público** | — | **51/51**: os 50 + a conferência "versão publicada = commit `922e93e`" |

### Evidências da validação online
- Branch `evidencias`: `e2e-report.txt`, `ORIGEM.txt` (commit, URL, execução) e 26 capturas em 390 px (jornadas B–E e varredura G).
- Navegador: Chromium (Playwright) no runner do GitHub, perfil de celular (390×844, toque, pt-BR, America/Sao_Paulo), mais a varredura em 320/360/390/412 px.
- Integridade: HTTP 200, app montado, fontes locais carregadas, nenhum recurso com erro, nenhuma requisição externa, console sem erros.

### Limitações confirmadas no ambiente publicado
- **Recarregar sem conexão falha** (`net::ERR_INTERNET_DISCONNECTED`): não há Service Worker. Com a página aberta, o app registra, calcula e persiste sem conexão. Decisão pendente P-11.
- O acesso direto a `*.github.io` a partir da sessão de migração é bloqueado por política; por isso a validação online roda no GitHub Actions. O teste manual no celular do dono é recomendado como verificação final.
- Avisos do GitHub Actions (não bloqueiam): ações com Node.js 20 forçadas a rodar em Node.js 24; `ubuntu-latest` migrará para Ubuntu 26.
