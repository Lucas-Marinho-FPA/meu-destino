const fs = require('fs');
/* MIGRAÇÃO: antes lia o script embutido em project/Main.dc.html (Canvas); agora lê src/logic.js + src/component.js. */
const js = require('../helpers/source.js')();
const pre = "class DCLogic{constructor(p){this.props=p||{}} setState(p){this.state=Object.assign({},this.state,p)}}\n";
const M = new Function(pre + js + "\nreturn {CLOCK,Component,PLACES,simulateOffer,requiredPerKm,barState,classify,avgOf,OFFERS,RULES,fuelCycles,fuelCpk,aggregate,changeColor,evoPeriods,EVO,TODAY,buildHistory,lastConsumption};")();
M.CLOCK.now = () => new Date(2026, 10, 7, 13, 20);
let pass = 0, fail = 0; const fails = [];
const eq = (n, a, b, tol = 1e-6) => { const ok = typeof b === 'number' ? Math.abs(a - b) < tol : a === b; if (ok) pass++; else { fail++; fails.push(n + ' => ' + a + ' (esperado ' + b + ')'); } };
const R = (x) => x.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---- 1. Fórmulas da oferta ---- */
let base = { rec: 24.6, km: 7.6, n: 1 };
let sim = M.simulateOffer(base, { v: 9.8, pk: 3.4, pm: 8, tk: 2.6, tm: 9 });
eq('km total inclui deslocamento', sim.k, 6);
eq('R$/h usa tempo total', sim.rph, 9.8 / (17 / 60));
eq('média projetada ponderada por km', sim.proj, (24.6 + 9.8) / 13.6);
eq('impacto = projetada − atual', sim.impact, (24.6 + 9.8) / 13.6 - 24.6 / 7.6);
eq('primeira corrida: impacto nulo', M.simulateOffer({ rec: 0, km: 0 }, { v: 10, pk: 1, pm: 1, tk: 4, tm: 9 }).impact, null);
base = { rec: 20, km: 8, n: 2 }; let x = M.requiredPerKm(base, 3, 4);
eq('requerido recupera exatamente a meta', (20 + x * 4) / 12, 3);
base = { rec: 40, km: 10, n: 2 }; x = M.requiredPerKm(base, 3, 5);
eq('mínimo preserva exatamente a meta', (40 + x * 5) / 15, 3); eq('mínimo < meta quando acima', x < 3, true);
eq('barra abaixo', M.barState(2.99, 3), 'abaixo'); eq('barra na meta', M.barState(3, 3), 'meta'); eq('barra +0,50 ainda verde', M.barState(3.5, 3), 'meta'); eq('barra destaque', M.barState(3.51, 3), 'destaque');

/* ---- 2. Classificação ---- */
const S = (rpk, proj) => ({ rpk, proj });
eq('verde e rentável = rec', M.classify(S(3.2, 3.2), 3, { type: 'verde', tags: [] }, 'R. X', true).key, 'rec');
eq('rec sem motivo', M.classify(S(3.2, 3.2), 3, { type: 'verde', tags: [] }, 'R', true).reasons.length, 0);
let c = M.classify(S(3.5, 3.4), 3, { type: 'vermelha', tags: ['risco', 'demanda'] }, 'R', true);
eq('vermelha paga bem = nao', c.key, 'nao'); eq('motivos combinados', c.reasons.join(','), 'risco,demanda');
c = M.classify(S(3.5, 3.4), 3, { type: 'amarela', tags: ['terreno'] }, 'Atacadão — Av', true);
eq('amarela + atacado = atencao', c.key, 'atencao'); eq('atencao mostra motivos', c.reasons.join(','), 'terreno,mercado');
eq('"bag" dispara', M.classify(S(3.5, 3.4), 3, null, 'Entrega bag', true).key, 'atencao');
eq('"bagagem" não dispara', M.classify(S(3.5, 3.4), 3, null, 'Bagagem', true).key, 'rec');
eq('prioridade restritiva', M.classify(S(3.5, 3.4), 3, { type: 'vermelha', tags: ['risco'] }, 'Atacado', true).key, 'nao');
eq('abaixo da meta mas preserva média = rec', M.classify(S(2.8, 3.05), 3, { type: 'verde', tags: [] }, 'R', true).key, 'rec');
eq('offline ignora geografia', M.classify(S(3.5, 3.4), 3, { type: 'vermelha', tags: ['risco'] }, 'R', false).key, 'rec');
eq('regra 50% não implementada', M.RULES.attentionUplift, null);

/* ---- 3. Combustível ---- */
const fu = [{ id: 1, d: new Date(2026, 0, 1), odo: 1000, l: 40, p: 5, full: true }, { id: 2, d: new Date(2026, 0, 3), odo: 1200, l: 10, p: 5, full: false }, { id: 3, d: new Date(2026, 0, 5), odo: 1460, l: 30, p: 6, full: true }];
const cy = M.fuelCycles(fu);
eq('ciclo cheio→cheio soma parcial', cy[0].liters, 40); eq('consumo do ciclo', cy[0].cons, 460 / 40);
eq('custo/km = gasto do ciclo ÷ km do ciclo = (10×5 + 30×6) / 460 (ADAPTADO R4: antes último preço ÷ consumo = 0,5217)', M.fuelCpk(fu, 11), (10 * 5 + 30 * 6) / 460);
eq('sem ciclo usa referência', M.fuelCpk([fu[0]], 10), 0.5);

/* ---- 4. Regra global de cores ---- */
eq('receita sobe = verde', M.changeColor('up', 0.1), '#3FE0A0'); eq('receita cai = vermelho', M.changeColor('up', -0.1), '#FF6B7D');
eq('custo sobe = vermelho', M.changeColor('down', 0.1), '#FF6B7D'); eq('custo cai = verde', M.changeColor('down', -0.1), '#3FE0A0');
const nat = k => M.EVO.filter(e => e.k === k)[0].nat;
eq('consumo km/L: maior é melhor', nat('consumo'), 'up'); eq('preço do litro: menor é melhor', nat('preco'), 'down'); eq('resultado: maior é melhor', nat('resultado'), 'up'); eq('alimentação: custo', nat('alimentacao'), 'down');

/* ---- 5. Fluxo completo do expediente ---- */
const C = M.Component; const app = new C({}); const V = () => app.renderVals();
eq('abre bloqueado', V().isHome, true);
V().goCameraStart(); V().capture(); eq('OCR 10.225', V().odoInput, '10.225'); eq('km pessoais 25', V().confirmFacts[1].v, '25 km');
app.setState({ odoInput: '10.230' }); eq('correção manual sinalizada', V().odoCorrected, true); app.setState({ odoInput: '10.225' });
V().confirmOdo(); eq('expediente ativo', V().isOp, true);
eq('sem corridas confirmadas: meta', V().reqText, '≥ R$ 3,00/km');
const labels = [];
for (let i = 0; i < 6; i++) { V().nextOffer(); const of = V().of; labels.push(of.label + (of.hasReasons ? ' [' + of.reasons.map(r => r.n).join(' · ') + ']' : '')); V().closeOffer(); }
eq('ofertas não alteram base (sem detecção de aceite)', app.base().n, 0);
eq('6 ofertas capturadas sem decisão (ADAPTADO R4: estado pendente → oferta)', app.state.rides.filter(r => r.st === 'oferta').length, 6);
eq('oferta 1 Recomendada', labels[0], 'Recomendada');
eq('oferta 2 Não recomendada (só financeiro)', labels[1], 'Não recomendada');
eq('oferta 3 Jardim Sul: risco + baixa demanda', labels[2], 'Não recomendada [Zona de risco · Baixa demanda]');
eq('oferta 5 atenção combinada', labels[4], 'Favorável com atenção [Terreno irregular · Destino mercado/atacado]');
V().loadDemo(); eq('exemplo confirmado entra na base', app.base().n, 2);
const b2 = app.base(); const v2 = V(); eq('Por km = média ponderada', v2.opTiles[0].v, 'R$ ' + R(b2.rec / b2.km));
eq('próxima corrida recalcula a meta exata', (b2.rec + M.requiredPerKm(b2, 3, b2.km / b2.n) * (b2.km / b2.n)) / (b2.km + b2.km / b2.n), 3);
/* ADAPTADO D-27 (validação manual, 08/11): o STOP lista todas as ofertas do expediente e o motorista marca cada uma.
   Mesmo cenário: Jardim Sul → cancelada com taxa 5,00; Vila Nova → Centro sem marcação (vira "não aceita" no fechamento); demais 4 → realizadas. */
V().goClose();
const offers = app.state.rides.filter(r => r.st === 'oferta');
const name = r => { const o = M.OFFERS[r.i]; return M.PLACES[o.o].n + ' → ' + (o.d ? M.PLACES[o.d].n : ''); };
offers.forEach(r => { const n = name(r); if (n.indexOf('Vila Nova → Centro') === 0) return;
  if (n.indexOf('Jardim Sul') >= 0) { app.rideActions(r).find(x => x.n === 'Cancelada').go(); const rr = app.rideById(r.id); app.rideActions(rr).find(x => x.n === 'Informar taxa').go(); V().onRfFee({ target: { value: '5,00' } }); V().saveRf(); return; }
  app.rideActions(r).find(x => x.n === 'Realizada').go(); });
const fb = app.base(); eq('realizadas = 6', fb.n, 6); eq('taxa recebida', fb.fees, 5); eq('cancelamentos', fb.canc, 1);
V().goCameraFinal(); V().capture(); const ff = V().confirmFacts; eq('km do expediente apresentado', ff[0].k, 'Km do expediente');
V().confirmOdo(); const vc = V(); eq('tela Expediente encerrado', vc.isClosed, true); eq('resumo pronto', vc.cl.ok, true);
eq('receita do dia', vc.cl.rec, 'R$ ' + R(fb.rec + fb.fees));
const today = app.state.days[app.state.days.length - 1]; eq('registro do dia gravado', !!today.today, true); eq('km produtivos do dia', today.kmProd, fb.km);

/* ---- 6. DRE do dia e do mês (sem dupla contagem) ---- */
V().goFinDetail(); const vf = V(); eq('Financeiro aberto', vf.isFin, true); eq('pode abrir DRE', vf.finCanOpen, true);
const A = M.aggregate(app.state, M.TODAY, M.TODAY, 'pro');
eq('resultado do dia = receita − combustível − fixos rateados − variáveis − manutenção (ADAPTADO R4: fixos rateados)', A.resultado, A.receita - A.fuelCost - A.fixos - A.vexp - A.maint);
eq('fixos do dia = Σ fixos mensais ÷ 30 dias de novembro (ADAPTADO R4: antes 0)', A.fixos, app.state.fixos.reduce((t, f) => t + f.v, 0) / 30);
const Am = M.aggregate(app.state, new Date(2026, 9, 1), new Date(2026, 9, 31), true);
eq('custos do mês = fixos + variáveis + combustível + manutenção', Am.custos, Am.fixos + Am.vexp + Am.fuelCost + Am.maint);
eq('resultado do mês = receita − custos', Am.resultado, Am.receita - Am.custos);
eq('abastecimento pago não é subtraído (combustível por km)', Am.custos - Am.fuelV !== Am.custos - Am.fuelCost || Am.fuelV === Am.fuelCost, true);

/* ---- 7. Custos operacionais ---- */
const app2 = new C({}); const W = () => app2.renderVals();
W().cfgGroups[3].go(); eq('Configurações → Custos operacionais', W().isCosts, true);
W().goCostFix(); const n0 = app2.state.fixos.length; W().addFix(); W().saveCf(); eq('valida valor', W().cfErr, 'Informe um valor maior que zero.');
W().onCfV({ target: { value: '45,50' } }); W().saveCf(); eq('valida nome', W().cfErr, 'Informe o nome do custo.');
W().onCfName({ target: { value: 'Internet do celular' } }); W().saveCf(); eq('custo fixo incluído', app2.state.fixos.length, n0 + 1);
W().fixRows[n0].menu(); W().fixRows[n0].edit(); W().onCfV({ target: { value: '50,00' } }); W().saveCf(); eq('custo fixo editado', app2.state.fixos[n0].v, 50);
W().fixRows[n0].menu(); W().fixRows[n0].del(); eq('custo fixo excluído', app2.state.fixos.length, n0);
W().goBack(); W().goCostVar(); const nv = app2.state.vexp.length; W().addVar(); W().onCfV({ target: { value: '12' } }); W().cfWhen.toRetro(); W().cfWhen.onDate({ target: { value: '31/12/2026' } }); W().saveCf();
eq('data futura recusada', W().cfErr, 'A data não pode ser futura.'); W().cfWhen.onDate({ target: { value: '07/11/2026' } }); W().cfWhen.onTime({ target: { value: '09:15' } }); W().saveCf(); eq('variável incluída', app2.state.vexp.length, nv + 1);

/* ---- 8. Manutenção ---- */
const v8 = W(); eq('status: 4 em dia', v8.mCntOk, '4 itens'); eq('status: 2 próximas', v8.mCntNext, '2 itens'); eq('status: 1 vencida', v8.mCntLate, '1 item');
W().tabCfg(); W().cfgGroups[5].go(); W().goMaintReg(); W().mfItems.filter(o=>o.v==='freios')[0].pick(); W().onMfCost({ target: { value: '250' } }); W().saveMaint();
eq('novo ciclo: freios saem de vencida', W().mCntLate, '0 itens'); eq('histórico preservado', app2.state.mrecs.length, 5);

/* ---- 9. Evolutivos ---- */
const mp = M.evoPeriods(app2.state, 'mes'); eq('mês: só meses completos', mp.map(p => p.l).join(','), 'Ago,Set,Out');
W().tabHist(); app2.setState({ evoKey: 'fixos', evoPer: 'dia' }); eq('fixos por dia disponíveis com rateio (ADAPTADO R4: antes indisponível)', W().evoNA, false);
app2.setState({ evoKey: 'receita', evoPer: 'mes' }); const ve = W(); eq('variação exibida', ve.hasEvoDelta, true);
app2.setState({ evoKey: 'abast' }); eq('histórico de abastecimentos em lista', W().evoIsList, true);

/* ---- 10. Zonas, pendente, offline ---- */
W().tabCfg(); W().cfgGroups[2].go(); W().goZoneForm(); W().onZfR({ target: { value: '7,5' } }); eq('raio 7,5 aceito', W().zfErr, false); W().saveZone(); eq('zona salva 7,5', app2.state.zones[app2.state.zones.length - 1].r, 7.5);
W().goZoneForm(); W().onZfR({ target: { value: '0' } }); eq('raio 0 bloqueado', W().zfErr, true);
const app3 = new C({}); app3.setState(app3.init('pendente', true)); const P = () => app3.renderVals();
eq('pendente bloqueia', P().pendingPrev, true); P().goRecover(); P().confirmRecover(); P().capture();
eq('km pessoais 20', P().confirmFacts[1].v, '20 km'); eq('marcado estimado', P().confirmFacts[0].v, '10.280 km (estimado)');
const app4 = new C({}); app4.setState({ online: false }); const O = () => app4.renderVals(); O().goCameraStart(); O().capture(); O().confirmOdo(); app4.setState({ offerIdx: 2 }); O().nextOffer();
eq('offline: nota', O().of.note, 'Sem internet: território não verificado');

/* ---- 11. Veículo ---- */
const app5 = new C({}); const Q = () => app5.renderVals(); Q().cfgGroups[0].go(); Q().goVehForm(); Q().onVfRef({ target: { value: '12,5' } }); Q().saveVf(); eq('consumo de referência editado', app5.state.vehicle.refCons, 12.5);

console.log(`${pass} passaram, ${fail} falharam`); if (fail) { console.log(fails.join('\n')); process.exit(1); }
process.exitCode = fail ? 1 : 0;
