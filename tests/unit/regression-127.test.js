/* Rodada 3 — testes com valores conhecidos (resultado esperado explícito em cada caso) */
const fs = require('fs');
/* MIGRAÇÃO: antes lia o script embutido em project/Main.dc.html (Canvas); agora lê src/logic.js + src/component.js. */
const js = require('../helpers/source.js')();
const pre = "class DCLogic{constructor(p){this.props=p||{}} setState(p){this.state=Object.assign({},this.state,p)}}\n";
const M = new Function(pre + js + "\nreturn {CLOCK,Component,fuelStock,stockNow,pmp,consHistory,lastConsumption,fuelCycles,energyStats,money,fmtNum,fmtUnit,aggregate,aggMonths,evoPlan,changeColor,FAMILIES};")();
const NOW = new Date(2026, 10, 7, 13, 20); M.CLOCK.now = () => new Date(NOW.getTime());
let pass = 0, fail = 0; const out = [];
const eq = (n, a, b, tol = 1e-6) => { const ok = typeof b === 'number' && typeof a === 'number' ? Math.abs(a - b) < tol : a === b; ok ? pass++ : fail++; out.push((ok ? 'OK   ' : 'FALHA') + ' ' + n + ' → ' + (typeof a === 'number' ? +a.toFixed(6) : a) + (ok ? '' : '  (esperado ' + b + ')')); };
const sec = t => out.push('\n## ' + t);
const C = M.Component; const mk = () => { const a = new C({}); return [a, () => a.renderVals()]; };

sec('0. Formatação (causa do "R$ 5.860")');
eq('preço 5,86 formatado sem depender do Intl', M.money(5.86), 'R$ 5,86');
eq('PMP no Evolutivo com 2 casas', M.fmtUnit(5.86, 'money'), 'R$ 5,86');
eq('milhar com ponto e decimal com vírgula', M.fmtNum(1234567.891, 2), '1.234.567,89');
eq('negativo', M.money(-1114.2), '−R$ 1.114,20');

sec('1. Seis motorizações (cadastro pelo formulário)');
const expectFlows = { gasolina: [true, false, false], etanol: [true, false, false], flex: [true, false, true], diesel: [true, false, false], hibrido: [true, false, false] /* ADAPTADO R4: híbrido convencional sem recarga externa (decisão do PO) */, eletrico: [false, true, false] };
Object.keys(expectFlows).forEach(m => {
  const [a, V] = mk(); V().cfgGroups[0].go(); V().goVehForm();
  V().vfMotors.filter(x => x.n === { gasolina: 'Gasolina', etanol: 'Etanol', flex: 'Flex', diesel: 'Diesel', hibrido: 'Híbrido convencional', eletrico: 'Elétrico' }[m])[0].pick();
  V().onVfBrand({ target: { value: 'Marca' } }); V().onVfModel({ target: { value: 'Modelo' } }); V().onVfOdo({ target: { value: '1.000' } });
  if (m !== 'eletrico') V().onVfTank({ target: { value: '45' } }); if (m === 'eletrico') V().onVfBat({ target: { value: '60' } });
  V().saveVf();
  const v = V(); eq(m + ': salvo', a.state.vehicle.motor, m);
  eq(m + ': fluxo [abastecer, recarregar, escolher combustível]', JSON.stringify([v.fuelIce, v.fuelEl, v.fuelFlex]), JSON.stringify(expectFlows[m]));
});
{ const [a, V] = mk(); V().cfgGroups[0].go(); V().goVehForm(); V().vfMotors[5].pick(); V().onVfBrand({ target: { value: 'X' } }); V().onVfModel({ target: { value: 'Y' } }); V().onVfOdo({ target: { value: '0' } }); V().saveVf();
  eq('elétrico exige bateria', V().vf.err, 'Informe a capacidade da bateria (kWh).'); }
{ const [a, V] = mk(); a.setState({ vehicle: null }); V().cfgGroups[0].go(); eq('sem veículo: ação "Cadastrar meu veículo"', V().noVeh, true); eq('lista de configurações convida a cadastrar', V().cfgGroups[0].s, 'Cadastrar meu veículo'); }

sec('2. Flex: gasolina e etanol');
{ const [a, V] = mk(); const n0 = a.state.fuels.length; const base = a.state.fuels.slice();
  V().cfgGroups[4].go(); V().goFuelForm(); eq('opções Flex', V().ffTypes.map(t => t.n).join('+'), 'Gasolina+Etanol');
  V().onFfL({ target: { value: '20' } }); V().onFfP({ target: { value: '5,90' } }); V().onFfOdo({ target: { value: '10.300' } }); V().setPart(); V().saveFuel();
  V().goFuelForm(); V().ffTypes[1].pick(); V().onFfL({ target: { value: '15' } }); V().onFfP({ target: { value: '3,99' } }); V().onFfOdo({ target: { value: '10.350' } }); V().setPart(); V().saveFuel();
  eq('dois registros novos', a.state.fuels.length, n0 + 2); eq('tipo etanol gravado', a.state.fuels[a.state.fuels.length - 1].fuel, 'etanol');
  eq('PMP etanol = 3,99', M.pmp(a.state.fuels, 'etanol'), 3.99);
  const g = base.filter(f => f.fuel === 'gasolina'); const gv = g.reduce((s, f) => s + f.l * f.p, 0) + 20 * 5.9, gl = g.reduce((s, f) => s + f.l, 0) + 20;
  eq('PMP gasolina = Σvalor/Σlitros', M.pmp(a.state.fuels, 'gasolina'), gv / gl); }

sec('3. Recarga elétrica');
{ const [a, V] = mk(); a.setState({ vehicle: { brand: 'BYD', model: 'Dolphin', year: 2024, plate: 'EEE-0001', motor: 'eletrico', tankL: null, batteryKwh: 44.9, odoStart: 10000, refCons: null, refConsEl: 6.5 } });
  V().cfgGroups[4].go(); eq('elétrico: sem formulário de abastecimento', V().fuelIce, false);
  V().goChargeForm(); V().onChK({ target: { value: '30' } }); V().onChP({ target: { value: '0,90' } }); V().onChOdo({ target: { value: '10.100' } }); eq('total = 30 × 0,90', V().chTotal, 'R$ 27,00'); V().saveCharge();
  V().goChargeForm(); V().onChK({ target: { value: '20' } }); V().onChP({ target: { value: '1,20' } }); V().onChOdo({ target: { value: '10.250' } }); V().saveCharge();
  const es = M.energyStats(a.state.charges, a.state.vehicle);
  eq('PMP kWh = (27 + 24) / 50', es.pmpKwh, 51 / 50); eq('km/kWh estimado = 150 km / 20 kWh', es.cons, 7.5); eq('custo/km = gasto da recarga que repôs o trecho ÷ km do trecho = 24 / 150 (ADAPTADO R4: regra gasto do ciclo ÷ km do ciclo; antes PMP÷consumo = 0,136)', es.cpk, 24 / 150);
  eq('recarga com hodômetro e data/hora', a.state.charges[0].odo + '|' + a.state.charges[0].ts.at.getTime(), '10100|' + NOW.getTime()); }

sec('4. Data e hora automáticas sem internet');
{ const [a, V] = mk(); V().setOffline(); eq('offline', a.state.online, false);
  V().cfgGroups[4].go(); V().goFuelForm(); V().onFfL({ target: { value: '10' } }); V().onFfP({ target: { value: '5,80' } }); V().onFfOdo({ target: { value: '10.400' } }); V().saveFuel();
  const f = a.state.fuels[a.state.fuels.length - 1];
  eq('instante do evento = relógio do aparelho', f.d.getTime(), NOW.getTime()); eq('criação registrada', f.ts.createdAt.getTime(), NOW.getTime());
  eq('fuso registrado', typeof f.ts.tz === 'string' && f.ts.tz.length > 0, true); eq('deslocamento UTC registrado', /^UTC[+−]\d\d:\d\d$/.test(f.ts.off), true);
  eq('sem alteração ainda', f.ts.updatedAt, null);
  V().goCameraStart && V().tabOp(); V().goCameraStart(); V().capture(); V().confirmOdo(); eq('expediente com horário real', a.state.shift.startedAt.getTime(), NOW.getTime());
  V().nextOffer(); V().closeOffer(); eq('oferta capturada com horário', a.state.rides[0].at.getTime(), NOW.getTime()); }

sec('5. Correção de data retroativa');
{ const [a, V] = mk(); V().cfgGroups[4].go(); const id = a.state.fuels[a.state.fuels.length - 1].id, orig = a.state.fuels.find(f => f.id === id).d;
  V().recRows[0].menu(); V().recRows[0].fix(); eq('tela de correção', V().isEditDate, true);
  V().onEdDate({ target: { value: '08/11/2026' } }); eq('data futura recusada', V().edErr, 'A data não pode ser futura.');
  V().onEdDate({ target: { value: '03/11/2026' } }); V().onEdTime({ target: { value: '17:45' } }); V().saveEd();
  const f = a.state.fuels.find(x => x.id === id);
  eq('nova data aplicada', f.d.getDate() + '/' + (f.d.getMonth() + 1) + ' ' + f.d.getHours() + ':' + f.d.getMinutes(), '3/11 17:45');
  eq('trilha guarda a data original', f.ts.edits[0].de.getTime(), orig.getTime()); eq('trilha guarda o momento da correção', f.ts.edits[0].em.getTime(), NOW.getTime());
  eq('registro marcado como alterado', f.ts.updatedAt.getTime(), NOW.getTime()); eq('volta para Combustível', V().isFuel, true);
  /* lançamento retroativo novo */
  V().goFuelForm(); V().ffWhen.toRetro(); V().ffWhen.onDate({ target: { value: '06/11/2026' } }); V().ffWhen.onTime({ target: { value: '08:10' } }); V().onFfL({ target: { value: '5' } }); V().onFfOdo({ target: { value: '10.500' } }); V().saveFuel();
  const g = a.state.fuels[a.state.fuels.length - 1]; eq('retroativo: data do evento informada', g.d.getDate() + ' ' + g.d.getHours() + ':' + g.d.getMinutes(), '6 8:10'); eq('retroativo: criação = agora', g.ts.createdAt.getTime(), NOW.getTime()); eq('retroativo identificado', g.ts.retro, true); }

sec('6. Preço médio ponderado de compra (PMP)');
eq('PMP = (40×5,00 + 10×6,00) / 50', M.pmp([{ l: 40, p: 5, fuel: 'gasolina' }, { l: 10, p: 6, fuel: 'gasolina' }]), 5.2);

sec('7. Estoque estimado (tanque 40 L)');
{ const st = M.fuelStock([{ id: 1, odo: 0, l: 38, p: 5.89, full: true }, { id: 2, odo: 300, l: 25, p: 5.68, full: true }], 40, 11);
  eq('D.3 inicialização: 40 L ao preço do 1º registro', st.states[1].after + ' L @ ' + st.states[1].avg, '40 L @ 5.89'); eq('D.3 inicialização marcada como estimada', st.states[1].est && st.states[1].init, true);
  eq('D.2 cheio: antes = 40 − 25 = 15 L', st.states[2].before, 15); eq('D.2 custo médio = (15×5,89 + 25×5,68)/40', st.avg, (15 * 5.89 + 25 * 5.68) / 40); eq('D.2 ≈ R$ 5,76', M.money(st.avg), 'R$ 5,76'); }
{ const fu = [{ id: 1, odo: 0, l: 38, p: 5.89, full: true }]; const s0 = fu.reduce((s, f) => s + f.l, 0); M.fuelStock(fu, 40, 11); eq('premissa não cria litros no histórico', fu.reduce((s, f) => s + f.l, 0), s0); }
{ const st = M.fuelStock([{ id: 1, odo: 0, l: 38, p: 5.89, full: true }, { id: 2, odo: 220, l: 10, p: 6.0, full: false }], 40, 11);
  eq('parcial: antes = 40 − 220/11 = 20 L', st.states[2].before, 20); eq('parcial: depois = 30 L', st.liters, 30); eq('parcial: custo = (20×5,89+10×6)/30', st.avg, (20 * 5.89 + 60) / 30); }
{ const st = M.fuelStock([{ id: 1, odo: 0, l: 38, p: 5.89, full: true }, { id: 2, odo: 220, l: 30, p: 6.0, full: false }], 40, 11);
  eq('acima da capacidade: limitado a 40 L', st.liters, 40); eq('acima da capacidade: aviso', st.states[2].warn !== '', true); }
{ const st = M.fuelStock([{ id: 1, odo: 0, l: 38, p: 5.89, full: true }, { id: 2, odo: 600, l: 10, p: 6.0, full: false }], 40, 11);
  eq('estoque nunca negativo', st.states[2].before, 0); eq('negativo: aviso', st.states[2].warn !== '', true); }
{ const st = M.fuelStock([{ id: 1, odo: 0, l: 38, p: 5.89, full: true }, { id: 2, odo: 440, l: 42, p: 5.5, full: true }], 40, 11);
  eq('litros > capacidade no cheio: antes = 0, sem duplicar', st.states[2].before, 0); eq('custo médio = preço do novo', st.avg, 5.5); }
{ const fu = [{ id: 1, odo: 0, l: 38, p: 5.89, full: true }, { id: 2, odo: 300, l: 25, p: 5.68, full: true }]; const st = M.fuelStock(fu, 40, 11);
  eq('estoque atual após 110 km (consumo 300/25 = 12 km/L)', M.stockNow(st, 410, 12, 40).liters, 40 - 110 / 12); }

sec('8. Consumo dinâmico');
{ const fu = [{ id: 1, odo: 0, l: 40, p: 5.8, full: true, d: new Date(2026, 9, 1) }, { id: 2, odo: 468, l: 40, p: 5.8, full: true, d: new Date(2026, 9, 5) }, { id: 3, odo: 904, l: 40, p: 5.8, full: true, d: new Date(2026, 9, 9) }];
  const h = M.consHistory(fu); eq('ciclo 1 = 11,7 km/L', h.cycles[0].cons, 11.7); eq('ciclo 2 = 10,9 km/L', h.cycles[1].cons, 10.9);
  eq('consumo atual = último ciclo', M.lastConsumption(fu), 10.9); eq('média histórica = 904/80', h.avg, 904 / 80);
  const [a, V] = mk(); a.setState({ fuels: fu }); V().cfgGroups[4].go(); eq('referência não usada quando há ciclo', V().fuelUsingRef, false); eq('tela mostra 10,9', V().fuelCons, '10,9'); }

sec('9. Seleção das linhas do gráfico');
{ const [a, V] = mk(); V().tabHist(); a.setState({ evoKey: 'custos', evoPer: 'mes' });
  eq('custos: 5 linhas', V().evoLines.map(l => l.n).join('|'), 'Custos totais|Fixos|Variáveis|Combustível|Manutenção');
  V().evoLines[1].toggle(); eq('linha Fixos destacada', a.state.evoHi, 'fixos');
  eq('demais linhas discretas e visíveis', /opacity: 0.22/.test(V().evoLines[0].stroke) && /opacity: 1/.test(V().evoLines[1].stroke), true);
  V().evoLines[1].toggle(); eq('segundo toque restaura', a.state.evoHi, null); }

sec('10. Seleção de pontos e valores do período');
{ const [a, V] = mk(); V().tabHist(); a.setState({ evoKey: 'custos', evoPer: 'hist' }); V().evoLines[2].toggle();
  V().evoLines[0].dots[1].pick(); const v = V(); eq('ponto selecionado (com outra linha em destaque)', v.evoHasPt && a.state.evoHi === 'var', true);
  eq('título do período', v.evoPtTitle, 'Valores de Set'); eq('5 valores do período', v.evoPtRows.length, 5);
  const ag = M.aggMonths(a.state, new Date(2026, 8, 1), new Date(2026, 8, 30));
  eq('total = fixos + variáveis + combustível + manutenção (sem duplicidade)', ag.custos, ag.fixos + ag.vexp + ag.fuelCost + ag.maint);
  eq('valor exibido do total = agregação de setembro', v.evoPtRows[0].v, M.money(ag.custos)); }

sec('11. Comparação entre períodos');
{ const [a, V] = mk(); V().tabHist(); a.setState({ evoKey: 'receita', evoPer: 'mes' });
  const o = M.aggMonths(a.state, new Date(2026, 9, 1), new Date(2026, 9, 31)).receita, s = M.aggMonths(a.state, new Date(2026, 8, 1), new Date(2026, 8, 30)).receita;
  const v = V(); eq('valor = outubro (último mês completo)', v.evoCurText, M.money(o)); eq('variação = (out − set)/set', v.evoDeltaText, ((o - s) / s >= 0 ? '+' : '−') + M.fmtNum(Math.abs((o - s) / s) * 100, 1) + '%');
  eq('mês parcial fora da série', V().evoLabels.map(l => l.l).join(','), 'Ago,Set,Out');
  a.setState({ evoKey: 'custos', evoPer: 'dia' }); eq('custos totais por dia: disponível com fixos rateados (ADAPTADO R4: antes indisponível)', V().evoNA, false);
  a.setState({ evoKey: 'variaveis', evoPer: 'dia' }); eq('variáveis por dia: indisponível (pertence à família com fixos)', V().evoNA, false);
  a.setState({ evoKey: 'custos', evoPer: 'tri' }); eq('3 meses: sem dados anteriores identificado', V().evoPrevText, 'Sem dados de 3 meses anteriores para comparar.');
  eq('cor custo subindo = vermelho', M.changeColor('down', 0.05), '#FF6B7D'); eq('cor consumo subindo = verde', M.changeColor('up', 0.05), '#3FE0A0'); }

sec('12. YTD');
{ const [a, V] = mk(); V().tabHist(); a.setState({ evoKey: 'receita', evoPer: 'ytd' }); const v = V();
  const all = M.aggMonths(a.state, new Date(2026, 0, 1), new Date(2026, 10, 7)).receita;
  eq('acumulado jan → 07/11', v.evoCurText, M.money(all)); eq('rótulo', v.evoCurLabel, 'Acumulado de 2026 até 07/11');
  eq('sem 2025: não compara', v.evoPrevText, 'Sem dados de mesmo intervalo de 2025 para comparar.'); eq('mês atual identificado como parcial', v.evoLabels[v.evoLabels.length - 1].l, 'Nov*'); }

sec('13. Navegação de retorno');
{ const [a, V] = mk(); const checks = [['veh', () => V().cfgGroups[0].go()], ['cfgMeta', () => V().cfgGroups[1].go()], ['terr', () => V().cfgGroups[2].go()], ['costs', () => V().cfgGroups[3].go()], ['fuel', () => V().cfgGroups[4].go()], ['maint', () => V().cfgGroups[5].go()], ['pref', () => V().cfgGroups[6].go()]];
  checks.forEach(([sc, open]) => { V().tabCfg(); open(); eq(sc + ': botão voltar visível', V().isBack, true); V().goBack(); eq(sc + ': volta a Configurações', a.state.screen, 'cfg'); });
  V().tabCfg(); V().cfgGroups[3].go(); V().goCostFix(); eq('custos fixos: voltar', V().isBack, true); V().goBack(); eq('fixos → custos operacionais', a.state.screen, 'costs');
  V().goCostVar(); V().varRows[0].open(); V().goBack(); eq('categoria → variáveis', a.state.screen, 'costVar'); V().goBack();
  V().goCostEvo(); eq('Evolutivos aberto de Custos tem voltar', V().isBack && V().backTitle === 'Evolutivos', true); eq('aba Histórico ativa', a.state.tab, 'hist'); V().goBack(); eq('Evolutivos → volta para Custos operacionais', a.state.screen, 'costs');
  V().tabHist(); eq('Histórico pela barra inferior é raiz (sem voltar)', V().isBrand, true);
  /* fluxo de expediente + DRE */
  V().tabOp(); V().goCameraStart(); V().capture(); V().confirmOdo(); V().loadDemo(); V().goClose(); V().goCameraFinal(); V().capture(); V().confirmOdo();
  eq('Fechamento tem voltar', V().isBack, true); V().goBack(); eq('fechamento → Financeiro', a.state.screen, 'fin');
  V().openDre(); eq('DRE é tela com voltar', V().isDre && V().isBack, true); V().goBack(); eq('DRE → Financeiro', a.state.screen, 'fin');
  /* preservação de estado: aba do financeiro */
  V().finTabs[2].go(); V().goRides && null; a.setState({ finTab: 'res' }); V().goRides(); V().goBack(); eq('estado da aba preservado ao voltar', a.state.finTab, 'res');
  /* formulário com alterações */
  V().tabCfg(); V().cfgGroups[4].go(); V().goFuelForm(); V().onFfL({ target: { value: '12' } }); V().goBack();
  eq('alteração não salva: confirmação', a.state.leave, true); eq('continua no formulário', a.state.screen, 'fuelForm');
  V().leaveStay(); eq('continuar editando mantém dados', a.state.ff.l, '12');
  V().tabFin(); eq('barra inferior também pede confirmação', a.state.leave, true); V().leaveGo(); eq('descartar → sai', a.state.screen, 'fin');
  V().tabCfg(); V().cfgGroups[4].go(); V().goFuelForm(); V().goBack(); eq('sem alteração: sai direto', a.state.screen + '|' + a.state.leave, 'fuel|false'); }

sec('14. Preservação (regras anteriores, amostra)');
{ const [a, V] = mk(); V().goCameraStart(); V().capture(); V().confirmOdo(); for (let i = 0; i < 6; i++) { V().nextOffer(); V().closeOffer(); }
  eq('sem detecção de aceite: nada confirmado', a.base().n, 0); eq('ofertas sem decisão (estado renomeado pendente → oferta, ADAPTADO R4)', a.state.rides.filter(r => r.st === 'oferta').length, 6);
  eq('trava do hodômetro', mk()[1]().isHome, true); }

console.log(out.join('\n')); console.log(`\nTOTAL: ${pass} passaram, ${fail} falharam`); process.exit(fail ? 1 : 0);
process.exitCode = fail ? 1 : 0;
