# Meu Destino — Critérios de aceite

Consolidação dos critérios **já aprovados**, sem critérios novos. Origem indicada em cada bloco.

## 1. MVP (PRD §11)
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
| Operação | Iniciar expediente; oferta não vira receita nem exige aceite/recusa; registrar corrida (valor + km; duração opcional); taxa de cancelamento; corrigir e excluir com trilha; médias atualizadas | `journeys` 1–9 e R5-2, `e2e` C e D |
| Financeiro | Durante o expediente: aviso explícito, ganhos, km, médias, custos estimados × registrados, resultado parcial; nada escondido até o fechamento | `journeys` R5-3, `e2e` D |
| Encerramento | Conferência → corrigir/incluir → confirmar → hodômetro final; um único registro do dia; histórico diário e semanal; sem duplicação | `journeys` 7–9 e R5-4, `e2e` E |
| Combustível e custos | Custo/km por ciclo; Flex; híbrido sem recarga; elétrico medido × estimado; fixos rateados; evolutivos nos 6 períodos | `journeys` 10–22, `regression-127` |
| Regras de oferta e meta | Fórmulas, classes, valor exigido na próxima corrida | `regression-92` |
| Persistência e offline | Recarregar e reabrir preservam os dados; sem conexão, registra e calcula | `journeys` (jornada), `e2e` F |
| Responsividade | 320/360/390/412 px sem corte, sobreposição, "undefined" ou "NaN"; console sem erros | `e2e` G |
| Publicação | Endereço público responde; recursos carregam; sem requisições externas; a versão publicada corresponde ao commit | `e2e` A (job `validar-online`) |

**Referência de regressão:** 173/173 (jornadas) e 219/219 (127 + 92). Nenhum teste pode ser removido para fazer a bateria passar.

## 3. Sprint 0 — Frente 1 (Preparação §7)
Mantidos sem alteração em `docs/project/PREPARACAO_E_SPRINT_0.md`, §7.
