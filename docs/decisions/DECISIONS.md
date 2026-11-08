# Meu Destino — Registro de decisões

Somente decisões **aprovadas pelo dono do produto**. Propostas e pendências ficam no HANDOFF (§7) e no backlog.

| ID | Rodada / data | Decisão aprovada | Substitui | Situação no protótipo |
|---|---|---|---|---|
| D-01 | 2 · 06/11 | Geocodificação online como padrão | Opção L5 em aberto | Simulado (destino como texto; sem rede = dados insuficientes) |
| D-02 | 2 | Ofertas capturadas nunca contam automaticamente como corridas | — | Implementado |
| D-03 | 2 | Regra oficial de km (expediente, produtivos, não produtivos, pessoais entre expedientes); correção retroativa preservando o original | — | Implementado |
| D-04 | 2 | Hodômetro inicial como trava obrigatória | — | Implementado |
| D-05 | 2 | Limites configuráveis 2,50 / 2,99 / 3,00; média ponderada por km; fórmula do valor exigido na próxima corrida | — | Implementado |
| D-06 | 2 | Captura automática segue como requisito, com alternativa manual | — | Captura simulada |
| D-07 | 3 · 07/11 | Mockups aprovados como referência visual oficial | — | Aplicado |
| D-08 | 3 | Navegação em 4 abas (Operação, Financeiro, Histórico, Configurações); sem Planejamento | Navegação de 3 áreas do PRD v1.0 | Implementado |
| D-09 | 3 | Card da oferta sem cabeçalho próprio, sem repetir dados da plataforma; impacto, R$/h, 3 classes e motivos oficiais | — | Implementado |
| D-10 | 3 | Veículo com 6 motorizações; Flex escolhe o combustível por abastecimento; elétrico com recarga | — | Implementado |
| D-11 | 3 | Voltar em toda tela secundária; retorno à origem; confirmação de formulário alterado | — | Implementado |
| D-12 | 3 | Data e hora automáticas do aparelho, offline, com fuso; trilha de correção retroativa | — | Implementado |
| D-13 | 3 | Evolutivos multissérie com toque em série e em ponto; regra de cor econômica | — | Implementado |
| D-14 | 3 | Não simular detecção de aceite | — | Respeitado |
| D-15 | 4 · 07/11 | Camada única de cálculo; corrida conta assim que é registrada; o fechamento não cria registros | Contabilização só no fechamento | Implementado |
| D-16 | 4 | Custo de combustível por km = gasto do ciclo ÷ km do ciclo; sem ciclo, último medido; nunca média simples de preços | Fórmula "preço/consumo" do PRD v1.0 | Implementado |
| D-17 | 4 | Híbrido convencional: só combustível, km/L, sem custo elétrico | Híbrido com recarga (rodada 3) | Implementado |
| D-18 | 4 | Elétrico: medido entre cargas de 100%; demais casos estimados | — | Implementado |
| D-19 | 4 | Fixos rateados pelos dias reais do mês; semana = soma dos dias; mês = integral; respeitar competência | Fixos indisponíveis em Dia/Semana | Implementado |
| D-20 | 4 | Todos os indicadores em Dia, Semana, Mês, 3 meses, Ano e Histórico | — | Implementado |
| D-21 | 4 | Persistência offline; dados de exemplo identificados e separáveis | — | Implementado (localStorage no protótipo) |
| D-22 | 5 · 07/11 | **Retirada da marcação de aceite/recusa/término.** Indicadores só com corridas efetivamente registradas | Aceite/conclusão manuais da rodada 4 | Implementado |
| D-23 | 5 | Financeiro em dois momentos: transparente durante o expediente e consolidado após a conferência no encerramento | — | Implementado |
| D-24 | 5 | Cartão do veículo clicável → detalhes (com identificação visual e cor); edição a partir dos detalhes; sem botão separado | Botão "Editar dados do veículo" | Implementado |
| D-25 | 5 | Imagem do veículo do modelo/geração/cor com direitos de uso, armazenada localmente, com alternativa | — | Parcial: só a alternativa (ilustração); sem imagem licenciada |
| D-26 | Migração · 07/11 | GitHub como fonte oficial; repositório **público** `meu-destino`; publicação no **GitHub Pages**; desenvolvimento direto no repositório; testes automatizados + validação no ambiente online; documentação no repositório; branches `main` (estável), `develop` (integração) e `feature/*` | Protótipo no Canvas como fonte | Ver `docs/project/MIGRACAO.md` |
| D-27 | Validação manual · 08/11 | **Conferência no STOP com todas as ofertas do expediente.** O app não detecta aceite, então nada é marcado durante a operação. No STOP o motorista marca cada oferta como **Realizada** (valor e km da oferta, corrigíveis) ou **Cancelada** (taxa opcional). As não marcadas viram **Não aceita** no fechamento, com trilha. Só as realizadas entram na receita, nas corridas, no km produtivo e no tempo útil | D-22 (registro manual "Registrar corrida" durante a operação) | Implementado (`fix/validacao-manual-stop-custos-tempo`) |
| D-28 | Validação manual · 08/11 | Abastecimento do dia **não** é descontado do resultado: o combustível entra estimado (km × custo/km) e a compra aparece como desembolso registrado no detalhamento (confirma o PRD §6 F) | — | Implementado |
| D-29 | Validação manual · 08/11 | Tempo: **total** = início → STOP (relógio do aparelho); **útil** = soma das durações das corridas realizadas; **não útil** = total − útil. Indicadores: ganho por hora de expediente, ganho por hora útil, % produtivo e % não produtivo. Duração ausente não é inventada: o indicador fica "parcial". Cancelamento não entra no tempo útil; o tempo perdido com cancelamentos ainda não é medido | Tempo simulado (+20 min por oferta) do protótipo | Implementado |

## Decisões de implementação tomadas nesta rodada (dentro do escopo, para validação)
Não alteram regra de negócio, mas são escolhas de interface que o dono do produto deve confirmar.
- **I-01:** ~~"Registrar corrida" com duração opcional~~ → **substituída pela D-27** (o registro manual saiu da Operação). Na correção de valores, a duração continua podendo ficar em branco; nesse caso o tempo útil fica "parcial" (D-29).
- **I-02:** ~~Pré-preenchimento opcional a partir de uma oferta~~ → **substituída pela D-27** (a realizada já usa os valores da oferta, corrigíveis).
- **I-03:** A exclusão de um registro manual (rodada 5) pede confirmação e preserva a trilha. Nas ofertas, em vez de excluir, corrige-se a classificação (Realizada / Cancelada / Não aceita).
- **I-04:** As cores disponíveis para o veículo são Branco, Prata, Cinza, Preto, Vermelho, Azul, Bege/Marrom, Verde e Outra.
- **I-05 (08/11):** A conferência pode ser feita **antes** do STOP, de forma opcional, em Financeiro → Detalhamento das corridas. Isso permite ver ganhos parciais durante o expediente sem tornar a marcação obrigatória.
- **I-06 (08/11):** No detalhamento, o custo/km aparece com 4 casas decimais para que a conta possa ser conferida (ex.: R$ 0,5053 × 14,9 km = R$ 7,53).

## Preservado sem alteração nesta rodada
Identidade visual; navegação de 4 abas; jornada de hodômetro e recuperação de expediente; correções retroativas; regras de combustível e custos (D-16 a D-19); evolutivos; manutenção; território; card da oferta; persistência.

## Decisões técnicas da migração (adaptações necessárias, sem mudar o produto)
- **M-01:** O runtime do Canvas pertence à ferramenta e não pode ir para o repositório. Foi substituído por `src/runtime.js`, um runtime próprio, sem dependências, que interpreta o mesmo formato de template.
- **M-02:** O artboard fixo de 390×844 passou a ocupar a tela do aparelho (até 480 px de largura, centralizado), com regra própria em `src/styles.css`.
- **M-03:** As fontes Inter e Space Grotesk (licença OFL 1.1) agora estão embutidas em `assets/fonts/`, em vez de virem do Google Fonts, o que resolve a pendência T-02 sem mudar a identidade visual.
- **M-04:** A versão publicada (commit) fica registrada em `<meta name="app-version">`, para verificar as atualizações.
- **M-05:** Nenhum Service Worker foi adicionado, porque o protótipo não tinha. Isso fica como decisão pendente (P-11).
