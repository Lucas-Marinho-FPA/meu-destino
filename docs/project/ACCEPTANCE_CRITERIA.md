# Meu Destino — Critérios de aceite

Consolidação dos critérios **já aprovados**, sem critérios novos. Origem indicada em cada bloco.

## 0. Critério de pronto do MVP (D-30, PRD §1B) — prevalece sobre os demais
O MVP está pronto quando o Meu Destino for usado numa **operação real no Galaxy S25+, sem dados fictícios, exemplos ou simulações**, cumprindo os 14 passos do PRD §1B:
- bolinha flutuante, captura e OCR da oferta no Uber/99;
- registro das ofertas reais e indicadores;
- STOP com conferência de realizadas e canceladas;
- hodômetro, abastecimento e despesas reais;
- resultados reais.

Também exige persistência local, offline nas funções essenciais, respeito às permissões e políticas e nenhuma automação de aceite ou recusa. Inclui **tempo útil ≤ tempo total** (D-32, falha F-01 resolvida).

## 1. MVP — critérios gerais (PRD §11, complementares)
O MVP deverá:
- instalar e iniciar;
- persistir configurações;
- calcular indicadores corretamente;
- cadastrar e consultar zonas;
- registrar hodômetro por foto ou manualmente;
- iniciar e encerrar expediente;
- registrar abastecimentos e ciclos válidos;
- registrar manutenções e alertas por km/tempo;
- registrar despesas e receitas;
- conciliar quilometragem;
- gerar resumo diário e mensal;
- respeitar permissões e privacidade;
- não automatizar aceite/recusa;
- passar por testes de regressão;
- entregar APK e documentação.

Acrescentados na v1.1:
- registrar corridas realizadas sem classificar ofertas;
- atualizar os indicadores imediatamente a cada registro, correção ou exclusão;
- fechar o expediente por conferência, sem duplicar valores;
- identificar estimativas e medições;
- separar dados de exemplo de dados reais.

## 2. Protótipo web (rodadas 4 e 5 + migração) — verificados pelos testes do repositório

| Jornada | Critério | Teste |
|---|---|---|
| Veículo | O cartão abre os detalhes; os detalhes mostram a identificação visual e os 10 campos; a edição parte dos detalhes, sem botão separado; a cor persiste ao reabrir; a ilustração não é apresentada como foto | `journeys` R5-1, `e2e` B |
| Operação | Iniciar expediente; oferta não vira receita nem exige marcação durante a operação; nenhum botão de aceite/recusa | `journeys` 1–2 e R5-2, `e2e` C |
| Conferência no STOP (D-27) | Lista todas as ofertas do expediente, sem exemplos misturados; Realizada/Cancelada; não marcadas → Não aceita; classificação corrigível com trilha; recarregar no STOP não perde marcações; fechamento usa exatamente os registros conferidos; novo expediente não mistura registros | `validacao-manual` A, `journeys` 3–9, `e2e` E |
| Custos (D-28) | Memória de cálculo reproduz o resultado; componentes com base, quantidade e tipo; fixos de exemplo sinalizados; abastecimento não descontado de novo; despesa registrada entra | `validacao-manual` B, `e2e` D |
| Tempo (D-29) | Total = início → STOP; útil = soma das realizadas; não útil = diferença; R$/h de expediente × útil; parcial quando falta duração; cancelamento fora do tempo útil | `validacao-manual` C, `e2e` D · **falhou na validação manual no Galaxy S25+ (F-01): tempo útil > total; critério NÃO atendido** |
| Financeiro | Durante o expediente: aviso explícito, ganhos, km, médias, custos estimados × registrados, resultado parcial; nada escondido até o fechamento | `journeys` R5-3, `e2e` D |
| Encerramento | Conferência → corrigir/incluir → confirmar → hodômetro final; um único registro do dia; histórico diário e semanal; sem duplicação | `journeys` 7–9 e R5-4, `e2e` E |
| Combustível e custos | Custo/km por ciclo; Flex; híbrido sem recarga; elétrico medido × estimado; fixos rateados; evolutivos nos 6 períodos | `journeys` 10–22, `regression-127` |
| Regras de oferta e meta | Fórmulas, classes, valor exigido na próxima corrida | `regression-92` |
| Persistência e offline | Recarregar e reabrir preservam os dados; sem conexão, registra e calcula | `journeys` (jornada), `e2e` F |
| Responsividade | 320/360/390/412 px sem corte, sobreposição, "undefined" ou "NaN"; console sem erros | `e2e` G |
| Publicação | Endereço público responde; recursos carregam; sem requisições externas; a versão publicada corresponde ao commit | `e2e` A (job `validar-online`) |

**Referência de regressão:** jornadas 177/177 (173 + 4 verificações acrescentadas na adaptação D-27), validação manual 60/60, regressão 219/219 (127 + 92), E2E 59/59 local (60/60 no endereço público, com a verificação de versão). Nenhum teste pode ser removido para fazer a bateria passar.

## 3. Prova técnica de captura (Preparação §7 → Sprint 1)
Os 9 critérios da Preparação §7 continuam válidos como referência para a frente de captura da **Sprint 1** (D-31). A versão proposta para a Sprint 1 está no HANDOFF §9 e aguarda aprovação.
