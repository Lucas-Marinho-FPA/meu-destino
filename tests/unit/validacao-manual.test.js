/* Validação manual (Galaxy S25+, 08/11/2026): cenários A (STOP), B (custos) e C (tempo). Valores esperados explícitos. */
const js = require('../helpers/source.js')();
const mem = {}; globalThis.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
const pre = "class DCLogic{constructor(p){this.props=p||{}} setState(p){this.state=Object.assign({},this.state,p); if(this.componentDidUpdate) this.componentDidUpdate();}}\n";
const M = new Function(pre + js + "\nreturn {CLOCK,Component,aggregate,aggFor,evoPlan,fuelCycles,money,OFFERS,DEMO_RIDES};")();
let NOW = new Date(2026, 10, 8, 7, 0); M.CLOCK.now = () => new Date(NOW.getTime());
let pass = 0, fail = 0; const out = [];
const eq = (n, a, b, tol = 1e-6) => { const ok = typeof b === 'number' && typeof a === 'number' ? Math.abs(a - b) < tol : a === b; ok ? pass++ : fail++; out.push((ok ? 'OK   ' : 'FALHA') + ' ' + n + ' → ' + (typeof a === 'number' ? +a.toFixed(6) : a) + (ok ? '' : '  (esperado ' + b + ')')); };
const sec = t => out.push('\n## ' + t);
const fresh = () => { Object.keys(mem).forEach(k => delete mem[k]); const a = new M.Component({}); return [a, () => a.renderVals()]; };
const startShift = V => { V().goCameraStart(); V().capture(); V().confirmOdo(); };
const T8 = new Date(2026, 10, 8);
const offerAt = (V, minute) => { NOW = new Date(2026, 10, 8, 7, minute); V().nextOffer(); V().closeOffer(); };
const mark = (app, id, name) => app.rideActions(app.rideById(id)).find(x => x.n === name).go();

/* ---------------- A. Corridas no STOP ---------------- */
sec('A. Corridas no STOP');
{ const [a, V] = fresh(); startShift(V);
  [5, 25, 45, 70, 95, 120].forEach(m => offerAt(V, m));   /* 6 ofertas: aceitas e não aceitas — o app não sabe quais */
  const ids = a.state.rides.map(r => r.id);
  eq('6 ofertas registradas no expediente', a.state.rides.length, 6);
  eq('nada a marcar durante a operação: receita 0', a.base().rec, 0);
  NOW = new Date(2026, 10, 8, 9, 41);   /* STOP após 2h41 */
  V().goClose(); const L = V().closeItems;
  eq('STOP lista todas as ofertas do expediente', L.length, 6);
  eq('nenhum exemplo misturado', L.filter(c => c.isDemo).length, 0);
  eq('todas a conferir', L.every(c => c.sl === 'A conferir'), true);
  mark(a, ids[0], 'Realizada'); mark(a, ids[1], 'Realizada'); mark(a, ids[3], 'Realizada');
  mark(a, ids[2], 'Cancelada'); mark(a, ids[4], 'Cancelada');
  /* ids[5] fica sem marcação (não aceita) */
  const O = i => M.OFFERS[a.rideById(ids[i]).i];
  const recExp = O(0).v + O(1).v + O(3).v, kmExp = O(0).pk + O(0).tk + O(1).pk + O(1).tk + O(3).pk + O(3).tk;
  const b = a.base();
  eq('receita = só realizadas', b.rec, recExp); eq('corridas realizadas', b.n, 3); eq('km produtivo = só realizadas', b.km, kmExp, 1e-9); eq('canceladas', b.canc, 2);
  mark(a, ids[1], 'Cancelada'); eq('corrigir classificação (realizada → cancelada)', a.base().n, 2); mark(a, ids[1], 'Realizada'); eq('e de volta', a.base().n, 3);
  eq('trilha da correção preservada', a.rideById(ids[1]).trail.filter(t => t.para).map(t => t.para).join(' > '), 'Realizada > Cancelada > Realizada');
  V().goClose(); eq('alerta: 1 sem marcação', V().closePending, true);
  /* recarregar antes de confirmar: nada se perde */
  const a2 = new M.Component({}); eq('recarregar no STOP: marcações preservadas', a2.state.rides.map(r => r.st).join(','), 'concluida,concluida,cancelada,concluida,cancelada,oferta');
  V().goCameraFinal(); V().capture(); V().confirmOdo();
  const d = a.state.days[a.state.days.length - 1];
  eq('fechamento usa exatamente os registros conferidos', d.rec, recExp); eq('corridas do dia', d.rides, 3); eq('km produtivo do dia', d.kmProd, kmExp, 1e-9);
  eq('sem marcação → não aceita', a.rideById(ids[5]).st, 'nao_aceita'); eq('canceladas mantidas para análise', a.state.rides.filter(r => r.st === 'cancelada').length, 2);
  eq('não duplicou registros', a.state.rides.length, 6); eq('um único dia novo', a.state.days.filter(x => x.today).length, 1);
  V().tabHist(); a.setState({ hSeg: 'ex' }); eq('histórico mostra o expediente', V().timeline.some(t => (t.t || '').indexOf('08/11') >= 0 || JSON.stringify(t).indexOf('08/11') >= 0), true);
  const a3 = new M.Component({}); eq('persistência após fechar', a3.state.days[a3.state.days.length - 1].rec, recExp);
  /* novo expediente não mistura registros */
  V().newShift(); NOW = new Date(2026, 10, 8, 18, 0); startShift(V);
  eq('novo expediente começa sem registros do anterior', a.state.rides.length, 0);
  eq('o dia anterior guarda seus registros', d.rideList.length, 6);
}

/* ---------------- B. Custos (reprodução da captura) ---------------- */
sec('B. Custos: memória de cálculo dos R$ 60,20');
{ NOW = new Date(2026, 10, 8, 7, 0); const [a, V] = fresh(); startShift(V); V().loadDemo(); for (let i = 0; i < 4; i++) { V().nextOffer(); V().closeOffer(); }
  V().tabFin(); const f = V();
  eq('ganhos (2 corridas de exemplo 21,40 + 18,90)', f.finRecText, 'R$ 40,30');
  eq('exemplo identificado', a.state.rides.filter(r => r.demo).length, 2);
  eq('combustível estimado = 14,9 km × 0,5053', f.fr.rows[1].v, 'R$ 7,53');
  eq('fixos rateados = 1.580 / 30 dias', f.fr.rows[2].v, 'R$ 52,67');
  eq('registrados = 0', f.fr.rows[3].v, 'R$ 0,00');
  eq('resultado parcial', f.fr.v, '−R$ 19,90');
  eq('aviso de fixos de exemplo', f.fr.note.indexOf('EXEMPLO') >= 0, true);
  V().goCostDay(); const cd = V().cd;
  eq('memória: combustível (base, 4 casas para conferir a conta)', cd.comps[0].base, 'R$ 0,5053/km × 14,9 km');
  eq('memória: origem do custo/km', cd.comps[0].note.indexOf('(04/11): R$ 167,76 ÷ 332 km') >= 0, true);
  eq('memória: fixos (base)', cd.comps[1].base, 'R$ 1.580,00/mês ÷ 30 dias');
  eq('memória: tipos', cd.comps.map(c => c.kind).join(','), 'Estimado,Estimado,Registrado,Registrado');
  eq('memória: 6 fixos de exemplo listados', cd.fixos.filter(x => x.n.indexOf('exemplo') > 0).length, 6);
  eq('memória: total dos custos', cd.total, 'R$ 60,20'); eq('memória: fórmula', cd.formula, 'R$ 40,30 − R$ 7,53 − R$ 52,67 − R$ 0,00 = −R$ 19,90');
  const A = M.aggregate(a.data(), T8, T8, 'pro');
  eq('sem duplicidade: custos = combustível + fixos + despesas + manutenção', A.custos, A.fuelCost + A.fixos + A.vexp + A.maint);
  /* abastecimento do dia: registrado como desembolso, não descontado de novo (decisão do PO 08/11) */
  V().tabCfg(); V().cfgGroups[4].go(); V().goFuelForm(); V().onFfL({ target: { value: '20' } }); V().onFfP({ target: { value: '6,00' } }); V().onFfOdo({ target: { value: '10.300' } }); V().setPart(); V().saveFuel();
  const A2 = M.aggregate(a.data(), T8, T8, 'pro');
  eq('abastecimento não altera o resultado (sem dupla contagem)', A2.resultado, A.resultado);
  V().tabFin(); V().goCostDay(); eq('abastecimento listado como desembolso', V().cd.fuelsTotal, 'R$ 120,00');
  /* despesa registrada entra como registrado */
  V().tabCfg(); V().cfgGroups[3].go(); V().addVar(); V().onCfV({ target: { value: '15' } }); V().saveCf();
  V().tabFin(); eq('despesa registrada entra no resultado', V().fr.rows[3].v, 'R$ 15,00');
  eq('resultado = 40,30 − 7,53 − 52,67 − 15', V().fr.v, '−R$ 34,90');
}

/* ---------------- C. Tempo útil e não útil ---------------- */
sec('C. Tempo total, útil e não útil');
{ NOW = new Date(2026, 10, 8, 7, 0); const [a, V] = fresh(); startShift(V);
  [10, 40, 70, 100].forEach(m => offerAt(V, m)); const ids = a.state.rides.map(r => r.id);
  mark(a, ids[0], 'Realizada'); mark(a, ids[1], 'Realizada'); mark(a, ids[2], 'Cancelada'); mark(a, ids[3], 'Realizada');
  const durs = [0, 1, 3].map(i => M.OFFERS[a.rideById(ids[i]).i]).map(o => o.pm + o.tm); const util = durs.reduce((t, x) => t + x, 0);
  NOW = new Date(2026, 10, 8, 9, 41);
  V().tabFin(); let ft = V().ft.rows;
  eq('tempo total (início → agora) = 2h41', ft[0].v, '2h 41min');
  eq('operação útil = soma das realizadas (' + durs.join('+') + ' min)', a.timeStats(a.base(), a.shiftMin()).util, util);
  eq('não útil = total − útil', a.timeStats(a.base(), a.shiftMin()).naoUtil, 161 - util);
  eq('cancelada não entra no tempo útil', a.base().nMin, 3);
  const TS = a.timeStats(a.base(), 161), b = a.base();
  eq('ganho por hora de expediente', ft[4].v, M.money(b.rec / (161 / 60)));
  eq('ganho por hora útil', ft[5].v, M.money(b.rec / (util / 60)));
  eq('percentuais', ft[3].v, Math.round(util / 161 * 100) + '% útil · ' + Math.round((1 - util / 161) * 100) + '% não útil');
  eq('aviso de cancelamento sem tempo medido', V().ft.note.indexOf('1 cancelamento: tempo perdido não medido') >= 0, true);
  /* dado incompleto: realizada sem duração */
  a.rideActions(a.rideById(ids[3])).find(x => x.n === 'Corrigir valores').go(); V().onRfMin({ target: { value: '' } }); V().saveRf();
  V().tabFin(); ft = V().ft.rows; eq('sem duração: marcado como parcial', ft[1].k, 'Operação útil (parcial)');
  eq('sem duração: não inventa', a.base().min, durs[0] + durs[1]); eq('nota explica o dado ausente', V().ft.note.indexOf('1 corrida realizada sem duração') >= 0, true);
  eq('ganho por hora útil usa só corridas com duração', V().ft.rows[5].v, M.money((M.OFFERS[a.rideById(ids[0]).i].v + M.OFFERS[a.rideById(ids[1]).i].v) / ((durs[0] + durs[1]) / 60)));
  V().tabOp(); eq('Operação mostra o relógio real (sem tempo simulado)', V().shiftTimeText.slice(-4), '2h41');
  V().goClose(); eq('conferência mostra os três tempos', V().closeRows.slice(5).map(r => r.k + '=' + r.v).join(' | '), 'Tempo total do expediente=2h 41min | Operação útil (parcial)=' + V().closeRows[6].v + ' | Operação não útil=' + V().closeRows[7].v);
  V().goCameraFinal(); V().capture(); V().confirmOdo(); const d = a.state.days[a.state.days.length - 1];
  eq('dia guarda tempo total, útil e ausência de dado', [d.min, d.minUtil, d.minUtilMissing].join('/'), [161, durs[0] + durs[1], 1].join('/'));
  V().goFinDetail(); eq('após fechar: tempo total do dia', V().ft.rows[0].v, '2h 41min');
}

console.log(out.join('\n')); console.log('\nTOTAL: ' + pass + ' passaram, ' + fail + ' falharam');
process.exitCode = fail ? 1 : 0;
