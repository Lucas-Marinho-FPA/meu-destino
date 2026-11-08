/* Rodada 4 — 22 cenários funcionais + jornada integrada com persistência (valores esperados explícitos) */
const fs = require('fs');
/* MIGRAÇÃO: antes lia o script embutido em project/Main.dc.html (Canvas); agora lê src/logic.js + src/component.js. */
const js = require('../helpers/source.js')();
/* armazenamento local simulado (o app usa localStorage do aparelho; sem nuvem) */
const mem = {}; globalThis.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
const pre = "class DCLogic{constructor(p){this.props=p||{}} setState(p){this.state=Object.assign({},this.state,p); if(this.componentDidUpdate) this.componentDidUpdate();}}\n";
const M = new Function(pre + js + "\nreturn {CLOCK,Component,aggregate,aggMonths,aggFor,evoPlan,fuelCycles,fuelCpk,fuelCpkFor,fixosProrated,energyStats,consHistory,money,fmtNum,dec,FAMILIES,STORE_KEY};")();
let NOW = new Date(2026, 10, 7, 13, 20); M.CLOCK.now = () => new Date(NOW.getTime());
let pass = 0, fail = 0; const out = [];
const eq = (n, a, b, tol = 1e-6) => { const ok = typeof b === 'number' && typeof a === 'number' ? Math.abs(a - b) < tol : a === b; ok ? pass++ : fail++; out.push((ok ? 'OK   ' : 'FALHA') + ' ' + n + ' → ' + (typeof a === 'number' ? +a.toFixed(6) : a) + (ok ? '' : '  (esperado ' + b + ')')); };
const sec = t => out.push('\n## ' + t);
const C = M.Component, T0 = new Date(2026, 10, 7);
const fresh = () => { Object.keys(mem).forEach(k => delete mem[k]); const a = new C({}); return [a, () => a.renderVals()]; };
const startShift = V => { V().goCameraStart(); V().capture(); V().confirmOdo(); };
const act = (V, list, txt, name) => { const it = V()[list].find(x => x.t.indexOf(txt) >= 0); const b = it.acts.find(x => x.n === name); if (!b) throw new Error('ação ' + name + ' em ' + txt); b.go(); };
const conclude = (V, recv, km, min) => { V().onRfRecv({ target: { value: recv } }); V().onRfKm({ target: { value: km } }); V().onRfMin({ target: { value: min } }); V().saveRf(); };

/* ---------- 1–9: corridas (ADAPTADO R5: sem aceite/recusa; registro da corrida realizada) ---------- */
const [a, V] = fresh(); startShift(V);
sec('1. Captura de oferta');
V().nextOffer(); V().closeOffer();
eq('oferta registrada no expediente', a.state.rides.length, 1); eq('estado = oferta analisada', a.state.rides[0].st, 'oferta');
eq('oferta não é receita', a.base().rec, 0); eq('nenhuma pergunta de aceite na Operação (R5)', V().opRideTitle, undefined);
sec('2. Sem classificação obrigatória (substitui "Aceite manual", R5)');
eq('oferta não exige ação para os indicadores', V().opTiles[3].v, 'R$ 0,00'); eq('trilha registra só a análise', a.state.rides[0].trail[0].acao, 'oferta analisada');
sec('3. Registro da corrida realizada');
V().goNewRide(); eq('abre formulário de registro', a.state.screen, 'rideForm'); eq('sugere ofertas recentes (opcional)', V().rfOffers.length, 1);
V().rfOffers[0].pick(); eq('preenche com a oferta', V().rfRecv, '24,60');
V().onRfRecv({ target: { value: '' } }); V().saveRf(); eq('valida valor', V().rfErr, 'Informe o valor recebido.');
conclude(V, '25,00', '7,0', '20');
const r1 = a.state.rides[1]; eq('registrada', r1.st, 'concluida'); eq('valor recebido', r1.recv, 25); eq('km', r1.km, 7); eq('duração', r1.min, 20); eq('vínculo com a oferta', r1.of, a.state.rides[0].id);
eq('volta para Operação', a.state.screen, 'op');
sec('4. Receita imediata');
eq('Operação: receita total', V().opTiles[3].v, 'R$ 25,00');
const D1 = a.data(), dA = M.aggregate(D1, T0, T0, 'pro'); eq('camada única: receita do dia inclui expediente em andamento', dA.receita, 25); eq('marca dia em andamento', dA.live, true);
V().tabFin(); eq('Financeiro: ganhos até agora', V().finRecText, 'R$ 25,00'); eq('Financeiro: rótulo', V().finResLabel, 'Ganhos até agora');
const mNov = M.aggregate(D1, new Date(2026, 10, 1), T0, true); const mNov0 = M.aggregate(a.state, new Date(2026, 10, 1), T0, true);
eq('mês corrente recebe a corrida na hora', mNov.receita - mNov0.receita, 25);
sec('5. Médias');
V().tabOp(); eq('Por km = 25 / 7', V().opTiles[0].v, M.money(25 / 7)); eq('Por corrida', V().opTiles[2].v, 'R$ 25,00');
eq('Por hora = 25 / (20 min de operação simulada ≥ 20 min da corrida)', V().opTiles[1].v, M.money(25 / (20 / 60)));
eq('aviso: média é referência, não garantia', V().opHint.indexOf('não garantia') > 0, true);
sec('6. Taxa de cancelamento (sem duplicidade)');
V().nextOffer(); V().closeOffer(); V().goNewRide(); V().rfKinds[1].pick(); V().saveRf(); eq('valida taxa', V().rfErr, 'Informe o valor da taxa de cancelamento.');
V().onRfFee({ target: { value: '4,00' } }); V().saveRf();
let b = a.base(); eq('taxa: estado', a.state.rides[3].st, 'taxa'); eq('taxa entra uma vez', b.fees, 4); eq('não conta como corrida', b.n, 1); eq('receita total = 25 + 4', V().opTiles[3].v, 'R$ 29,00');
V().nextOffer(); V().closeOffer(); eq('oferta sem registro não gera receita', a.base().rec + a.base().fees, 29);
sec('7. Fechamento como conferência');
V().goClose(); const nBefore = a.state.rides.length; eq('conferência lista só os registros', V().closeItems.length, 2);
eq('sem pendência de decisão (R5)', V().closePending, false); eq('ofertas só informativas', V().closeOffers, '3 ofertas analisadas no expediente (não entram na receita).');
eq('resumo: ganhos', V().closeRows[0].v, 'R$ 29,00');
const mBeforeClose = M.aggregate(a.data(), new Date(2026, 10, 1), T0, true).receita;
V().goCameraFinal(); V().capture(); V().confirmOdo();
eq('fechamento não cria registros', a.state.rides.length, nBefore);
const day = a.state.days[a.state.days.length - 1]; eq('registro do dia = receita registrada', day.rec + day.fees, 29); eq('trilha da conferência', day.ts.review.corridas, 1);
sec('8. Correção após o fechamento (trilha)');
V().tabFin(); V().goRides(); eq('Detalhamento: registros clicáveis', typeof V().rideRows[0].open, 'function');
eq('nenhum registro sem valor', V().rideRows.filter(r => r.v === '—').length, 0);
V().rideRows.find(r => r.sl === 'Registrada').open(); eq('abre detalhe', a.state.screen, 'ride'); eq('status claro', V().rd.sl, 'Registrada');
V().rd.acts.find(x => x.n === 'Corrigir valores').go(); V().onRfRecv({ target: { value: '30,00' } }); V().saveRf();
eq('volta ao detalhe', a.state.screen, 'ride'); eq('trilha: valores corrigidos', V().rd.trail[0].s.indexOf('valores corrigidos') === 0, true);
const day2 = a.state.days[a.state.days.length - 1]; eq('dia reconsolidado (30 + 4)', day2.rec + day2.fees, 34); eq('alteração registrada no dia', day2.ts.edits.length >= 1, true);
sec('9. Sem dupla contagem');
const mAfter = M.aggregate(a.data(), new Date(2026, 10, 1), T0, true).receita; eq('mês após fechar = antes de fechar + correção (5)', mAfter - mBeforeClose, 5);
eq('dados vivos não duplicam o dia fechado', a.data().days.length, a.state.days.length);

/* ---------- 10–16: combustível e energia ---------- */
sec('10. Gasolina');
const gas = [{ id: 1, d: new Date(2026, 0, 1), odo: 1000, l: 40, p: 6, full: true, fuel: 'gasolina' }, { id: 2, d: new Date(2026, 0, 6), odo: 1400, l: 32, p: 6.25, full: true, fuel: 'gasolina' }];
let cy = M.fuelCycles(gas); eq('ciclo: 400 km / 32 L', cy[0].cons, 12.5); eq('custo/km = 200 / 400', cy[0].cpk, 0.5);
sec('11. Etanol');
const eta = [{ id: 1, d: new Date(2026, 0, 1), odo: 1000, l: 40, p: 4, full: true, fuel: 'etanol' }, { id: 2, d: new Date(2026, 0, 6), odo: 1300, l: 37.5, p: 4, full: true, fuel: 'etanol' }];
cy = M.fuelCycles(eta); eq('consumo 8 km/L', cy[0].cons, 8); eq('custo/km = 150 / 300', cy[0].cpk, 0.5);
sec('12. Flex alternando');
const flex = [{ id: 1, d: new Date(2026, 0, 1), odo: 1000, l: 40, p: 6, full: true, fuel: 'gasolina' }, { id: 2, d: new Date(2026, 0, 3), odo: 1200, l: 15, p: 4, full: false, fuel: 'etanol' }, { id: 3, d: new Date(2026, 0, 6), odo: 1450, l: 25, p: 6, full: true, fuel: 'gasolina' }];
cy = M.fuelCycles(flex); eq('ciclo com 2 combustíveis', cy[0].fuels.join('+'), 'etanol+gasolina'); eq('custo/km = (15×4 + 25×6) / 450', cy[0].cpk, 210 / 450);
eq('não usa média simples de preços', Math.abs(cy[0].cpk - ((4 + 6) / 2) / (450 / 40)) > 1e-3, true);
sec('13. Consumo medido × estimado');
const S0 = { days: [], fuels: [gas[0]], vehicle: { motor: 'gasolina', refCons: 11 }, charges: [] };
let cp = M.fuelCpkFor(S0, T0, null); eq('sem ciclo: referência', cp.src, 'referencia'); eq('custo de referência = 6 / 11', cp.cpk, 6 / 11);
cp = M.fuelCpkFor(Object.assign({}, S0, { fuels: gas }), T0, null); eq('com ciclo: último medido', cp.src, 'ultimo'); eq('valor medido', cp.cpk, 0.5);
const gas3 = gas.concat([{ id: 3, d: new Date(2026, 0, 12), odo: 1800, l: 40, p: 6, full: true, fuel: 'gasolina' }]);
const ch = M.consHistory(gas3); eq('média histórica = 800 / 72', ch.avg, 800 / 72); eq('último ciclo = 10 km/L (distinto da média)', M.fuelCycles(gas3)[1].cons, 10);
sec('14. Custo por km no período');
const ag = M.aggregate({ days: [{ d: new Date(2026, 0, 6), start: 1000, end: 1400, kmExp: 400, kmProd: 300, rec: 900, fees: 0, rides: 30, min: 600 }], fuels: gas, vexp: [], mrecs: [], fixos: [], vehicle: { motor: 'gasolina', refCons: 11 }, charges: [] }, new Date(2026, 0, 1), new Date(2026, 0, 31), false);
eq('medido no período = gasto do ciclo / km do ciclo', ag.cpkSource, 'medido'); eq('combustível = 400 km × 0,50', ag.fuelCost, 200);
eq('compra (abastecimentos) não é o custo', ag.fuelV, 40 * 6 + 32 * 6.25);
sec('15. Híbrido convencional');
{ const [h, HV] = fresh(); HV().cfgGroups[0].go(); HV().goVehForm(); HV().vfMotors.find(x => x.n === 'Híbrido convencional').pick();
  HV().onVfBrand({ target: { value: 'Toyota' } }); HV().onVfModel({ target: { value: 'Corolla Hybrid' } }); HV().onVfOdo({ target: { value: '1.000' } }); HV().onVfTank({ target: { value: '43' } }); HV().saveVf();
  HV().tabCfg(); HV().cfgGroups[4].go(); const hv = HV(); eq('só abastecimento', hv.fuelIce, true); eq('sem recarga', hv.fuelEl, false);
  const sh = Object.assign({}, h.state, { charges: [{ id: 1, d: T0, odo: 10, kwh: 30, p: 1, full: true }] });
  eq('recargas não somam custo no híbrido', M.aggregate(sh, new Date(2026, 9, 1), new Date(2026, 9, 31), true).fuelCost, M.aggregate(h.state, new Date(2026, 9, 1), new Date(2026, 9, 31), true).fuelCost); }
sec('16. Elétrico');
{ const ve = { motor: 'eletrico', refConsEl: 6 };
  const ch1 = [{ odo: 1000, kwh: 40, p: 1, full: true }, { odo: 1200, kwh: 20, p: 1.2, full: false }, { odo: 1500, kwh: 30, p: 1, full: true }];
  const es = M.energyStats(ch1, ve); eq('medido entre cargas 100%', es.src, 'medido'); eq('km/kWh = 500 / 50', es.cons, 10); eq('custo/km = (24 + 30) / 500', es.cpk, 54 / 500);
  const es2 = M.energyStats([{ odo: 1000, kwh: 40, p: 1, full: false }, { odo: 1200, kwh: 25, p: 1, full: false }], ve);
  eq('sem carga completa: estimado', es2.src, 'estimado'); eq('estimativa 200 km / 25 kWh', es2.cons, 8);
  const [e, EV] = fresh(); e.setState({ vehicle: { brand: 'BYD', model: 'Dolphin', motor: 'eletrico', batteryKwh: 44.9, odoStart: 0, refConsEl: 6.5 } });
  EV().cfgGroups[4].go(); EV().goChargeForm(); EV().setChFull(); EV().onChK({ target: { value: '30' } }); EV().onChP({ target: { value: '0,90' } }); EV().onChOdo({ target: { value: '10.300' } });
  eq('total automático', EV().chTotal, 'R$ 27,00'); EV().saveCharge(); eq('flag carga completa salva', e.state.charges[0].full, true); eq('data/hora automáticas', e.state.charges[0].d.getTime(), NOW.getTime()); }

/* ---------- 17–22: evolutivos e integração ---------- */
const [g, G] = fresh();
sec('17. Rateio de custos fixos');
const f600 = [{ v: 600, from: new Date(2026, 0, 1) }];
eq('R$ 600 / 30 dias (setembro) = R$ 20/dia', M.fixosProrated(f600, new Date(2026, 8, 10), new Date(2026, 8, 10)), 20);
eq('fevereiro: 600 / 28', M.fixosProrated(f600, new Date(2026, 1, 3), new Date(2026, 1, 3)), 600 / 28);
eq('semana = soma dos 7 dias', M.fixosProrated(f600, new Date(2026, 8, 7), new Date(2026, 8, 13)), 140);
eq('competência: fixo a partir de dezembro não entra em novembro', M.fixosProrated([{ v: 600, from: new Date(2026, 11, 1) }], new Date(2026, 10, 5), new Date(2026, 10, 5)), 0);
eq('mês = valor integral', M.aggregate(g.state, new Date(2026, 8, 1), new Date(2026, 8, 30), true).fixos, 1580);
sec('18. Evolutivo diário');
G().tabHist(); g.setState({ evoKey: 'custos', evoPer: 'dia' }); let ev = G();
eq('custos totais disponíveis no dia', ev.evoShowChart, true); eq('valor do último dia inclui fixos rateados', ev.evoCurText !== '—', true);
const pd = M.evoPlan(g.state, 'dia').cur; const ad = M.aggFor(g.state, pd); eq('fixos do dia = 1580 / dias do mês', ad.fixos, 1580 / new Date(pd.from.getFullYear(), pd.from.getMonth() + 1, 0).getDate());
sec('19. Evolutivo semanal');
const pw = M.evoPlan(g.state, 'semana').cur; const aw = M.aggFor(g.state, pw); let sumD = 0; for (let i = 0; i < 7; i++) { const d = new Date(pw.from.getFullYear(), pw.from.getMonth(), pw.from.getDate() + i); sumD += M.aggregate(g.state, d, d, 'pro').custos; }
eq('semana = soma dos dias (custos, incl. combustível por ciclo)', aw.custos, sumD, 1e-6); eq('semana atual parcial marcada', M.evoPlan(g.state, 'semana').pts.slice(-1)[0].partial, true);
sec('20. Mensal e YTD');
const am = M.aggMonths(g.state, new Date(2026, 9, 1), new Date(2026, 9, 31)); eq('outubro: fixos integrais', am.fixos, 1580);
const ytd = M.aggMonths(g.state, new Date(2026, 0, 1), T0); let s3 = 0; [7, 8, 9, 10].forEach(m => { s3 += M.aggregate(g.state, new Date(2026, m, 1), new Date(2026, m + 1, 0), true).receita; });
eq('YTD = soma dos meses', ytd.receita, s3);
sec('21. Gráfico multissérie de custos');
g.setState({ evoKey: 'custos', evoPer: 'mes', evoHi: null, evoPt: null }); ev = G();
eq('5 séries', ev.evoLines.map(l => l.n).join('|'), 'Custos totais|Fixos|Variáveis|Combustível|Manutenção');
ev.evoLines[3].toggle(); eq('toque destaca combustível', g.state.evoHi, 'comb'); G().evoLines[3].toggle(); eq('toque de novo restaura', g.state.evoHi, null);
G().evoHits[1].pick(); const rows = G().evoPtRows; const num = t => parseFloat(t.replace(/[^\d,−-]/g, '').replace(/\./g, '').replace(',', '.').replace('−', '-'));
eq('ponto: total = soma da composição', num(rows[0].v), num(rows[1].v) + num(rows[2].v) + num(rows[3].v) + num(rows[4].v), 0.02);
sec('22. Integração entre módulos');
{ const [i, I] = fresh(); startShift(I); const evoBefore = M.aggFor(i.data(), M.evoPlan(i.data(), 'mes').pts.slice(-1)[0] || { from: new Date(2026, 10, 1), to: T0 });
  I().nextOffer(); I().closeOffer(); I().goNewRide(); conclude(I, '40,00', '10', '25');
  eq('Operação atualizada', I().opTiles[3].v, 'R$ 40,00');
  I().tabFin(); eq('Financeiro atualizado', I().finRecText, 'R$ 40,00'); eq('DRE parcial disponível', I().finCanOpen, true);
  I().openDre(); eq('DRE identifica resultado parcial', I().dreRows.some(r => r.k === 'Resultado parcial (estimado)'), true);
  const M1 = M.aggregate(i.data(), new Date(2026, 10, 1), T0, true), M0 = M.aggregate(i.state, new Date(2026, 10, 1), T0, true);
  eq('Resultados do mês atualizados', M1.receita - M0.receita, 40);
  eq('custo de combustível do expediente: km produtivos × custo/km (estimado)', M1.fuelCost - M0.fuelCost, 10 * M1.cpkFuel, 1e-6);
  const nF = i.state.fuels.length; I().tabCfg(); I().cfgGroups[4].go(); I().goFuelForm(); I().onFfL({ target: { value: '20' } }); I().onFfP({ target: { value: '6,10' } }); I().onFfOdo({ target: { value: '10.300' } }); I().setPart(); I().saveFuel();
  eq('abastecimento no histórico', i.state.fuels.length, nF + 1); eq('preço/L disponível', i.state.fuels[nF].p, 6.1); eq('histórico de lançamentos atualizado', I().recRows[0].sub.indexOf('20,0 L') >= 0, true); }

/* ---------- Jornada integrada + persistência ---------- */
sec('Jornada: cadastro → expediente → fechamento → reabrir o app');
{ const [j, J] = fresh();
  J().cfgGroups[0].go(); J().goVehForm(); J().vfMotors.find(x => x.n === 'Flex').pick(); J().onVfBrand({ target: { value: 'Fiat' } }); J().onVfModel({ target: { value: 'Argo' } }); J().onVfOdo({ target: { value: '1.279' } }); J().onVfTank({ target: { value: '48' } }); J().onVfRef({ target: { value: '11,5' } }); J().saveVf();
  eq('veículo cadastrado', j.state.vehicle.model, 'Argo');
  J().tabOp(); startShift(J); eq('expediente iniciado', !!j.state.shift, true);
  J().nextOffer(); J().closeOffer(); J().goNewRide(); J().rfOffers[0].pick(); conclude(J, '26,00', '7,6', '19');
  J().nextOffer(); J().closeOffer();
  /* reabrir durante o expediente */
  const k1 = new C({}); eq('reabrir: expediente recuperado', !!k1.state.shift, true); eq('reabrir: abre na Operação', k1.state.screen, 'op'); eq('reabrir: ofertas e registros mantidos', k1.state.rides.length, 3);
  eq('reabrir: datas restauradas como data', k1.state.shift.startedAt instanceof Date, true);
  J().tabFin(); eq('indicadores durante o expediente', J().finRecText, 'R$ 26,00');
  J().tabCfg(); J().cfgGroups[4].go(); J().goFuelForm(); J().ffTypes.find(x => x.n === 'Etanol').pick(); J().onFfL({ target: { value: '30' } }); J().onFfP({ target: { value: '4,19' } }); J().onFfOdo({ target: { value: '10.240' } }); J().saveFuel();
  J().tabCfg(); J().cfgGroups[3].go(); J().addVar(); J().onCfV({ target: { value: '15' } }); J().saveCf();
  J().tabHist(); j.setState({ evoKey: 'receita', evoPer: 'dia' }); eq('evolutivo diário mostra o dia em andamento', J().evoLabels.slice(-1)[0].l.indexOf('*') > 0, true);
  J().tabOp(); J().goClose(); J().goCameraFinal(); J().capture(); J().confirmOdo();
  J().goFinDetail(); J().openDre(); eq('DRE do dia', J().dreRows[0].v, 'R$ 26,00');
  const snap = JSON.stringify({ r: j.state.rides, d: j.state.days.length, f: j.state.fuels.length, v: j.state.vexp.length });
  const k2 = new C({}); eq('reabrir após fechamento: tudo persistido', JSON.stringify({ r: k2.state.rides, d: k2.state.days.length, f: k2.state.fuels.length, v: k2.state.vexp.length }), snap);
  eq('reabrir: veículo mantido', k2.state.vehicle.model, 'Argo'); eq('reabrir: sem expediente aberto', k2.state.shift, null);
  /* dados de exemplo × reais */
  const k2V = () => k2.renderVals(); k2.setState({ screen: 'pref', tab: 'cfg' }); eq('há dados de exemplo identificados', k2V().hasDemo, true);
  k2V().removeDemo(); eq('remover exemplo mantém o expediente real', k2.state.days.length, 1); eq('mantém o abastecimento real', k2.state.fuels.length, 1); eq('mantém custo real', k2.state.vexp.length, 1);
  eq('sem exemplo restante', k2V().hasDemo, false); const k3 = new C({}); eq('remoção persistida', k3.state.days.length, 1); }

/* ================= RODADA 5 — jornadas pedidas ================= */
sec('R5-1. Veículo: cartão → detalhes → cor → editar → persistir (offline)');
{ const [v, W] = fresh(); W().cfgGroups[0].go(); eq('tela Veículo', v.state.screen, 'veh'); eq('sem botão separado de edição na tela resumo (goVehDetail existe)', typeof W().goVehDetail, 'function');
  W().goVehDetail(); eq('cartão abre detalhes', v.state.screen, 'vehDetail');
  const rows = W().vehRows.map(r => r.k).join('|'); eq('detalhes completos', rows, 'Marca e modelo|Ano|Cor|Placa|Motorização|Combustível|Capacidade|Hodômetro atual|Hodômetro no cadastro|Consumo de referência');
  eq('cor do exemplo', W().vehRows[2].v, 'Prata'); eq('sem foto licenciada: ilustração identificada', W().vNoPhoto && W().vPhotoNote.indexOf('Ilustração genérica') === 0, true);
  eq('ilustração na cor do veículo', W().vBodyFill, 'fill: #BFC3CC');
  W().goVehForm(); eq('edição a partir dos detalhes', v.state.screen, 'vehForm'); W().vfColors.find(c => c.n === 'Vermelho').pick(); W().onVfPlate && W().onVfPlate({ target: { value: 'XYZ-9A87' } }); W().saveVf();
  eq('salvar volta aos detalhes', v.state.screen, 'vehDetail'); eq('cor alterada', v.state.vehicle.color, 'vermelho'); eq('ilustração acompanha a cor', W().vBodyFill, 'fill: #C8414B');
  const v2 = new C({}); eq('reabrir: cor persistida', v2.state.vehicle.color, 'vermelho'); eq('reabrir: modelo', v2.state.vehicle.model, 'Corolla');
  eq('nenhuma imagem remota referenciada', /https?:\/\//.test(W().vPhotoSrc), false); }
sec('R5-2. Operação: registrar corridas sem classificar ofertas');
{ const [o, O] = fresh(); startShift(O); O().nextOffer(); O().closeOffer(); O().nextOffer(); O().closeOffer();
  eq('ofertas não alteram indicadores', O().opTiles[3].v, 'R$ 0,00');
  O().goNewRide(); conclude(O, '18,50', '5,5', ''); eq('duração opcional', o.state.rides[2].min, null);
  O().goNewRide(); conclude(O, '30,00', '9', '28');
  eq('receita total', O().opTiles[3].v, 'R$ 48,50'); eq('Por km', O().opTiles[0].v, M.money(48.5 / 14.5)); eq('Por corrida', O().opTiles[2].v, M.money(24.25));
  eq('nota da Operação', O().opNote, '2 corridas registradas');
  eq('nenhuma ação Aceitei/Não aceitei disponível', JSON.stringify(o.state.rides.filter(r => r.st === 'oferta').map(r => o.rideActions(r).map(x => x.n))), '[["Registrar como corrida"],["Registrar como corrida"]]');
  eq('integridade: ids únicos', new Set(o.state.rides.map(r => r.id)).size, o.state.rides.length);
  O().tabFin(); O().goRides(); O().rideRows[0].open(); O().rd.acts.find(x => x.n === 'Excluir').go(); O().rd.acts.find(x => x.n === 'Confirmar exclusão').go();
  eq('excluir tira dos cálculos', o.base().rec, 18.5); eq('excluído fica na trilha', o.state.rides.some(r => r.st === 'excluida'), true); eq('some do detalhamento', O().rideRows.length, 1); }
sec('R5-3. Financeiro durante o expediente');
{ const [f, F] = fresh(); startShift(F); F().tabFin(); let fv = F();
  eq('aviso de expediente em andamento', fv.finLive, true); eq('explica atualização e fechamento', fv.finLiveText.indexOf('fechamento definitivo') > 0, true);
  eq('não esconde o financeiro', fv.finHas, true); eq('ganhos zerados', fv.finRecText, 'R$ 0,00');
  F().tabOp(); F().goNewRide(); conclude(F, '40,00', '10', '30'); F().tabFin(); fv = F();
  eq('ganhos parciais', fv.finRecText, 'R$ 40,00'); eq('km das corridas', fv.finSide[1].v + ' ' + fv.finSide[1].u, '10,0 km prod.'); eq('explica km total no fechamento', fv.finKmNote.indexOf('hodômetro') > 0, true);
  eq('Por km', fv.finInd[0].v, 'R$ 4,00'); eq('Por hora', fv.finInd[1].v, M.money(40 / 0.5));
  const A = M.aggregate(f.data(), T0, T0, 'pro');
  eq('custos estimados (combustível + fixos rateados)', fv.fr.rows[1].v, M.money(A.fuelCost + A.fixos)); eq('custos registrados', fv.fr.rows[2].v, M.money(A.vexp + A.maint));
  eq('resultado parcial', fv.fr.v, M.money(A.resultado)); eq('rótulo parcial', fv.fr.title, 'Resultado parcial (estimado)');
  F().tabOp(); F().goNewRide(); conclude(F, '20,00', '5', ''); F().tabFin(); eq('atualiza após novo registro', F().finRecText, 'R$ 60,00'); }
sec('R5-4. Encerramento: conferir, corrigir, confirmar, consolidar');
{ const [e, E] = fresh(); startShift(E); E().goNewRide(); conclude(E, '22,00', '6', '18'); E().goNewRide(); conclude(E, '35,00', '11', '30');
  E().goClose(); eq('conferência mostra ganhos', E().closeRows[0].v, 'R$ 57,00'); eq('lista 2 registros', E().closeItems.length, 2);
  E().closeItems[0].acts.find(x => x.n === 'Corrigir valores').go(); E().onRfRecv({ target: { value: '24,00' } }); E().saveRf();
  eq('correção volta à conferência', e.state.screen, 'close'); eq('ganhos corrigidos', E().closeRows[0].v, 'R$ 59,00');
  E().goNewRide(); conclude(E, '10,00', '3', ''); eq('corrida esquecida incluída', E().closeRows[0].v, 'R$ 69,00');
  const nDays = e.state.days.length; E().goCameraFinal(); E().capture(); E().confirmOdo();
  eq('um registro do dia', e.state.days.length, nDays + 1); const d = e.state.days[e.state.days.length - 1]; eq('dia consolidado', d.rec + d.fees, 69); eq('corridas do dia', d.rides, 3);
  E().goFinDetail(); eq('fechado e conferido', E().finDone, true); eq('valor no financeiro após fechar', E().finRecText, 'R$ 69,00');
  E().tabHist(); e.setState({ hSeg: 'ex' }); eq('histórico de expedientes mostra o dia', E().timeline.length > 0, true);
  e.setState({ hSeg: 'evo', evoKey: 'receita', evoPer: 'dia' }); const pd = M.evoPlan(e.data(), 'dia'); eq('evolutivo diário: dia fechado', M.aggFor(e.data(), pd.cur).receita, 69);
  const pw = M.evoPlan(e.data(), 'semana'); const wk = pw.pts[pw.pts.length - 1]; eq('evolutivo semanal (semana atual) inclui o dia uma vez', M.aggFor(e.data(), wk).receita - M.aggFor(e.state, { from: wk.from, to: M.TODAY_PREV || new Date(2026, 10, 6) }).receita, 69);
  const m1 = M.aggregate(e.data(), new Date(2026, 10, 1), T0, true).receita; E().tabFin(); E().goFinDetail(); const m2 = M.aggregate(e.data(), new Date(2026, 10, 1), T0, true).receita; eq('sem duplicação ao reabrir telas', m2, m1);
  const e2 = new C({}); eq('reabrir: dia consolidado persiste', e2.state.days[e2.state.days.length - 1].rec, 69); }

console.log(out.join('\n')); console.log('\nTOTAL: ' + pass + ' passaram, ' + fail + ' falharam');
process.exitCode = fail ? 1 : 0;
