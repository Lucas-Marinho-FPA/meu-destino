# Protótipo original no Canvas (somente referência)

Arquivos exatamente como estavam publicados na **versão 1794094392-9b11** (07/11/2026), antes da migração para este repositório.

| Arquivo | sha256 |
|---|---|
| `Main.dc.html` | `dfbfd08504f7dc4db829abf8c923ec91b5b3e55cb0e056468a61243fc2fcde79` |
| `Componentes.dc.html` | `2b9c6aa89cc5ab93e7e9c0af883b7eb675af08c7ac25f9ef7ff2d51f7b87abb5` |
| `canvas.json` | `bd71f9df663ea01eba44f45b22a4331c0b96af16517d98e8f122470852879eaf` |

- Esses arquivos **não são executados** pelo app publicado. Eles dependiam do runtime da ferramenta Canvas, que não faz parte do projeto e não foi copiado.
- O código vivo está em `index.html` e `src/`. A equivalência foi verificada pelas mesmas suítes de teste (ver `docs/project/MIGRACAO.md`).
- `Main.dc.html` usava fontes do Google Fonts; o app migrado usa fontes locais (`assets/fonts/`).
