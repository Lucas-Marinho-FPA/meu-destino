/* =====================================================================
   MEU DESTINO · protótipo navegável
   Camada única de dados e regras. Todas as telas leem daqui.
   SIMULADO: captura de oferta, OCR, sobreposição, geocodificação.
   NÃO SIMULADO: detecção de aceite (não comprovada) — ofertas ficam
   "a conferir" até o fechamento.
   ===================================================================== */

/* ---------------- Constantes de domínio ---------------- */
/* Relógio do aparelho (offline: não depende de rede). Injetável nos testes. */
var CLOCK = { now: function () { return new Date(); } };
function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
var TODAY = startOfDay(CLOCK.now());
function offStr(d) { var m = -(d || CLOCK.now()).getTimezoneOffset(), sg = m >= 0 ? '+' : '−'; m = Math.abs(m); return 'UTC' + sg + pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
function tzName() { try { var z = Intl.DateTimeFormat().resolvedOptions().timeZone; return z || offStr(); } catch (e) { return offStr(); } }
/* Carimbo de registro: instante do evento, fuso, criação, alteração e trilha de correções. */
function stamp(at) { var now = CLOCK.now(); return { at: at || now, tz: tzName(), off: offStr(at || now), createdAt: now, updatedAt: null, edits: [] }; }
function genStamp(d) { return { at: d, tz: 'America/Sao_Paulo', off: 'UTC−03:00', createdAt: d, updatedAt: null, edits: [] }; }
var SHIFT_START_MIN = 7 * 60;
var PLACES = {
  centro: { n: 'Centro', x: 120, y: 130 },
  vilanova: { n: 'Vila Nova', x: 215, y: 70 },
  jardimsul: { n: 'Jardim Sul', x: 245, y: 230 },
  aeroporto: { n: 'Aeroporto', x: 268, y: 34 },
  industrial: { n: 'Pq. Industrial', x: 70, y: 250 },
  belavista: { n: 'Bela Vista', x: 262, y: 142 }
};
var ZT = {
  vermelha: { n: 'Vermelha', label: 'risco', c: '#FF6B7D', rank: 0 },
  amarela: { n: 'Amarela', label: 'atenção', c: '#F6C445', rank: 1 },
  verde: { n: 'Verde', label: 'preferência', c: '#3FE0A0', rank: 2 },
  neutra: { n: 'Neutra', label: 'sem zona', c: '#8D79D9', rank: 3 }
};
/* Motivos oficiais (5.4). Não criar outros sem aprovação. */
var MOTIVOS = { terreno: 'Terreno irregular', risco: 'Zona de risco', demanda: 'Baixa demanda', transito: 'Trânsito intenso', mercado: 'Destino mercado/atacado' };
var MOTIVO_ICON = {
  terreno: 'M3 18l5-8 4 5 3-4 6 7z', risco: 'M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z',
  demanda: 'M4 20h16M7 20v-4M12 20v-7M17 20V9', transito: 'M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11M3 11h18v6H3zM6 17v2M18 17v2',
  mercado: 'M4 7h16l-1.5 11a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2zM9 7a3 3 0 0 1 6 0'
};
var ZONE_TAGS = ['risco', 'terreno', 'demanda', 'transito'];
var MARKET_RE = /\bbag\b|atacad/i;
var CLASSES = {
  rec: { l: 'Recomendada', c: '#3FE0A0', fg: '#0B2A1E', icon: 'M5 12.5l4.5 4.5L19 7.5' },
  atencao: { l: 'Favorável com atenção', c: '#F6C445', fg: '#2B2108', icon: 'M12 4l9 16H3zM12 10v4M12 17v.5' },
  nao: { l: 'Não recomendada', c: '#FF5C70', fg: '#FFFFFF', icon: 'M7 7l10 10M17 7L7 17' }
};
var OFFERS = [
  { p: 'Plataforma A', v: 24.6, pk: 1.4, pm: 4, tk: 6.2, tm: 15, o: 'centro', d: 'vilanova', oTxt: 'Av. Brasil, 1200', oSub: 'Centro', dTxt: 'R. das Flores, 85', dSub: 'Vila Nova' },
  { p: 'Plataforma B', v: 9.8, pk: 3.4, pm: 8, tk: 2.6, tm: 9, o: 'vilanova', d: 'centro', oTxt: 'R. das Flores, 300', oSub: 'Vila Nova', dTxt: 'Pç. da Matriz', dSub: 'Centro' },
  { p: 'Plataforma A', v: 31.5, pk: 1.2, pm: 4, tk: 10.8, tm: 24, o: 'centro', d: 'jardimsul', oTxt: 'Pç. da Matriz', oSub: 'Centro', dTxt: 'R. Ipê Roxo, 40', dSub: 'Jardim Sul' },
  { p: 'Plataforma B', v: 22.0, pk: 1.5, pm: 4, tk: 5.5, tm: 15, o: 'centro', d: 'belavista', oTxt: 'Av. Brasil, 900', oSub: 'Centro', dTxt: 'Al. dos Ipês, 210', dSub: 'Bela Vista' },
  { p: 'Plataforma A', v: 28.0, pk: 1.0, pm: 3, tk: 7.0, tm: 18, o: 'belavista', d: 'industrial', oTxt: 'Al. dos Ipês, 50', oSub: 'Bela Vista', dTxt: 'Atacadão — Av. Industrial, 1500', dSub: 'Pq. Industrial' },
  { p: 'Plataforma A', v: 14.2, pk: 0.8, pm: 3, tk: 3.9, tm: 11, o: 'belavista', d: null, oTxt: 'Al. dos Ipês, 90', oSub: 'Bela Vista', dTxt: '(destino não lido pelo OCR)', dSub: '' }
];
/* Dados de EXEMPLO de corridas já confirmadas (não é detecção de aceite). */
var DEMO_RIDES = [
  { p: 'Exemplo', v: 21.4, pk: 1.6, pm: 5, tk: 6.0, tm: 14, o: 'centro', d: 'centro' },
  { p: 'Exemplo', v: 18.9, pk: 2.2, pm: 6, tk: 5.1, tm: 13, o: 'centro', d: 'vilanova' }
];
var VAR_CATS = {
  lavagem: { n: 'Lavagem', icon: 'M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11M3 11h18v6H3zM8 3v.5M12 2v1M16 3v.5', c: '#4FB3FF' },
  pedagio: { n: 'Pedágios', icon: 'M4 21V8l8-5 8 5v13M9 21v-6h6v6M4 12h16', c: '#FF9F43' },
  estacionamento: { n: 'Estacionamento', icon: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM10 16V8h3a2.5 2.5 0 0 1 0 5h-3', c: '#4FB3FF' },
  alimentacao: { n: 'Alimentação', icon: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2.5-3 6h3v12', c: '#F6C445' },
  outros: { n: 'Outros (variáveis)', icon: 'M5 12h.01M12 12h.01M19 12h.01', c: '#C9C4EC' }
};
var ICON = {
  road: 'M5 20L9 4M19 20L15 4M12 6v2M12 11v2M12 16v2',
  clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7v5l3.5 2',
  people: 'M12 4a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM5 6.5a2.3 2.3 0 1 0 0 4.6a2.3 2.3 0 1 0 0-4.6zM19 6.5a2.3 2.3 0 1 0 0 4.6a2.3 2.3 0 1 0 0-4.6zM6 20a6 6 0 0 1 12 0M1.5 17a4 4 0 0 1 4.5-3.5M22.5 17a4 4 0 0 0-4.5-3.5',
  coins: 'M14 3c3.3 0 6 1.1 6 2.5S17.3 8 14 8s-6-1.1-6-2.5S10.7 3 14 3zM8 5.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4M10 12.3C9.7 12.1 9.4 12 9 12c-3.3 0-6 1.1-6 2.5S5.7 17 9 17s6-1.1 6-2.5M3 14.5v4C3 19.9 5.7 21 9 21s6-1.1 6-2.5v-4',
  wallet: 'M4 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4zM4 6V5a2 2 0 0 1 2-2h10M15 12h5v4h-5a2 2 0 0 1 0-4z',
  bars: 'M4 20h16M7 20v-6M12 20V6M17 20v-9',
  pie: 'M12 3v9h9M20 15.5A9 9 0 1 1 8.5 3.7',
  cal: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
  wheel: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 10a2 2 0 1 0 0 4a2 2 0 1 0 0-4zM3.5 11h6.5M14 11h6.5M12 14v7',
  route: 'M6 15a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM18 3a2.5 2.5 0 0 0-2.5 2.5C15.5 8 18 10 18 10s2.5-2 2.5-4.5A2.5 2.5 0 0 0 18 3zM8.5 17.5h5a3 3 0 0 0 0-6h-3a3 3 0 0 1 0-6h4',
  car: 'M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11M3 11h18v6H3zM6 17v2M18 17v2',
  target: 'M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 11a1 1 0 1 0 1 1M12 12l7-7M16 5h3v3',
  pin: 'M12 21s-6.5-5.8-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.2-6.5 11-6.5 11zM12 7.6a2.4 2.4 0 1 0 0 4.8a2.4 2.4 0 1 0 0-4.8z',
  fuel: 'M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h13M7 7h5v4H7zM15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  sliders: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M16 4v4M10 10v4M18 16v4',
  home: 'M3 11l9-7 9 7M5 10v10h14V10',
  shield: 'M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h6M9 16h6',
  phone: 'M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2',
  card: 'M3 6h18v12H3zM3 10h18M7 15h3',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alert: 'M12 4l9 16H3zM12 10v4M12 17v.5',
  info: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 11v5M12 8v.5',
  chart: 'M3 20h18M5 16l4-5 4 3 6-7M15 7h4v4',
  oil: 'M3 15h10l3-3h3v3l-4 4H5a2 2 0 0 1-2-2zM7 15v-3h4v3M19 9v.5',
  tire: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM12 3v5M12 16v5M3 12h5M16 12h5',
  brake: 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM3 8a10 10 0 0 0 0 8M21 8a10 10 0 0 1 0 8',
  filter: 'M4 5h16l-6 8v6l-4 2v-8z',
  spark: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 3v3M12 18v3M3 12h3M18 12h3',
  snow: 'M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9',
  gear: 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 2.5l2 2.6 3.2-.6.8 3.2 3 1.4-1.3 3 1.3 3-3 1.4-.8 3.2-3.2-.6-2 2.6-2-2.6-3.2.6-.8-3.2-3-1.4 1.3-3-1.3-3 3-1.4.8-3.2 3.2.6z',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'
};
var FIX_ICON = { seguro: ICON.shield, app: ICON.phone, ipva: ICON.doc, licenciamento: ICON.doc, financiamento: ICON.card, outros: ICON.dots };

/* ---------------- Formatação ---------------- */
/* Formatação própria pt-BR (não depende dos dados de localidade do aparelho).
   Causa do "R$ 5.860": preço com 3 casas + Intl; sem pt-BR o Intl cai para en-US e 5,860 vira 5.860. */
function fmtNum(n, d) { var neg = n < 0, s = Math.abs(n).toFixed(d), p = s.split('.'); var ip = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return (neg && Number(s) !== 0 ? '−' : '') + ip + (d > 0 ? ',' + p[1] : ''); }
function fmtInt(n) { return fmtNum(Math.round(n), 0); }
function money(n) { return (n < 0 && Math.abs(n) >= 0.005 ? '−' : '') + 'R$ ' + fmtNum(Math.abs(n), 2); }
function money0(n) { return (n < 0 && Math.round(Math.abs(n)) !== 0 ? '−' : '') + 'R$ ' + fmtInt(Math.abs(n)); }
function signedMoney(n) { return (n >= 0 ? '+' : '−') + money(Math.abs(n)); }
function pad0(n) { return (n < 10 ? '0' : '') + n; }
function dec(n, d) { return fmtNum(n, d); }
function km(n) { return fmtInt(n) + ' km'; }
function hm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
function pctTxt(n) { return (n >= 0 ? '+' : '−') + dec(Math.abs(n) * 100, 1) + '%'; }
function hhmm(min) { var h = Math.floor(min / 60), m = Math.round(min % 60); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
function dur(min) { var h = Math.floor(min / 60), m = Math.round(min % 60); return h > 0 ? h + 'h ' + (m < 10 ? '0' : '') + m + 'min' : m + 'min'; }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function dkey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function ddmm(d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); }
function ddmmyyyy(d) { return ddmm(d) + '/' + d.getFullYear(); }
function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
function daysBetween(a, b) { return Math.round((b.getTime() - a.getTime()) / 86400000); }
function addMonths(d, n) { var x = new Date(d.getTime()); x.setMonth(x.getMonth() + n); return x; }
var MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
var MES_LONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function pillStyle(on, c) {
  var col = c || '#B58AF5';
  return on ? 'background: ' + col + '; color: #15132E; border: 1.5px solid ' + col : 'background: transparent; color: #F3F1FF; border: 1.5px solid #4A4572';
}
function alpha(hex, a) {
  var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}
function parseDec(s) {
  if (s === null || s === undefined) return NaN;
  if (typeof s === 'number') return s;
  var t = String(s).trim();
  if (t === '') return NaN;
  if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
  t = t.replace(/[^0-9.]/g, '');
  return t === '' ? NaN : parseFloat(t);
}
function parseInt0(s) { var t = String(s === undefined || s === null ? '' : s).replace(/\D/g, ''); return t === '' ? NaN : parseInt(t, 10); }
function parseDate(s) { var m = String(s || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (!m) return null; var d = new Date(+m[3], +m[2] - 1, +m[1]); return d.getMonth() === +m[2] - 1 ? d : null; }

/* ---------------- Histórico de EXEMPLO (determinístico) ---------------- */
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function round2(n) { return Math.round(n * 100) / 100; }
function buildHistory() {
  var r = rng(20261107), days = [], odo = 0, d = new Date(2026, 7, 1), last = new Date(2026, 10, 3);
  while (d <= last) {
    if (d.getDay() !== 0 && r() > 0.08) {
      var kmExp = Math.round(88 + r() * 34), kmProd = Math.round(kmExp * (0.7 + r() * 0.1) * 10) / 10;
      var rec = round2(kmProd * (2.72 + r() * 0.6)), rides = Math.max(5, Math.round(kmProd / 7.6));
      days.push({ d: new Date(d.getTime()), start: odo, end: odo + kmExp, kmExp: kmExp, kmProd: kmProd, rec: rec, fees: r() < 0.15 ? 5 : 0, rides: rides, min: Math.round(kmExp * 2.7 + r() * 40) });
      odo += kmExp;
    }
    odo += Math.round(4 + r() * 14);
    d = addDays(d, 1);
  }
  var off = 10020 - odo;
  days.forEach(function (x) { x.start += off; x.end += off; });
  days.push({ d: new Date(2026, 10, 4), start: 10020, end: 10120, kmExp: 100, kmProd: 75, rec: 221.4, fees: 0, rides: 9, min: 300 });
  days.push({ d: new Date(2026, 10, 5), start: 10135, end: 10200, kmExp: 65, kmProd: 48.5, rec: 140.1, fees: 5, rides: 6, min: 210 });

  /* abastecimentos: ciclos cheio → cheio, com um parcial a cada 3 ciclos */
  var fuels = [], price = { 7: 5.69, 8: 5.79, 9: 5.85, 10: 5.89 }, lastFull = days[0].start, cyc = 0, partialL = 0, target = 400;
  fuels.push({ id: 1, d: days[0].d, odo: days[0].start, l: 38, p: 5.69, full: true, fuel: 'gasolina' });
  days.forEach(function (x, di) {
    var dist = x.end - lastFull, nextKm = days[di + 1] ? days[di + 1].end - x.end : 0;
    if (cyc % 3 === 1 && partialL === 0 && dist >= 200) { partialL = 12; fuels.push({ id: fuels.length + 1, d: x.d, odo: x.end, l: 12, p: round2(price[x.d.getMonth()] + 0.04), full: false, fuel: 'gasolina' }); }
    if (dist >= 250 && (dist + nextKm > target || !days[di + 1])) { /* abastece antes de passar do alcance: litros sempre cabem no tanque de 40 L */
      var cons = 10.9 + r() * 1.4, liters = Math.round((dist / cons - partialL) * 10) / 10;
      fuels.push({ id: fuels.length + 1, d: x.d, odo: x.end, l: liters, p: round2(price[x.d.getMonth()] + (r() - 0.5) * 0.08), full: true, fuel: 'gasolina' });
      lastFull = x.end; cyc++; partialL = 0; target = 360 + Math.round(r() * 40);
    }
  });

  /* despesas variáveis por mês */
  var vexp = [], vid = 1, plan = { lavagem: [3, 30, 5], pedagio: [8, 26.75, 3], estacionamento: [5, 11.2, 3], alimentacao: [10, 26, 6], outros: [4, 35, 10] };
  [[7, 31], [8, 30], [9, 31], [10, 5]].forEach(function (mm) {
    var mDays = days.filter(function (x) { return x.d.getMonth() === mm[0] && x.d.getDate() <= mm[1]; });
    Object.keys(plan).forEach(function (cat) {
      var n = mm[0] === 10 ? Math.max(1, Math.round(plan[cat][0] * 5 / 30)) : plan[cat][0];
      for (var i = 0; i < n; i++) {
        var day = mDays[Math.floor((i + 0.5) / n * mDays.length)];
        vexp.push({ id: vid++, cat: cat, d: day.d, v: round2(plan[cat][1] + (r() - 0.5) * 2 * plan[cat][2]), note: '' });
      }
    });
  });

  /* manutenções registradas: km lido do histórico na data */
  function firstAt(odoMin) { for (var i = 0; i < days.length; i++) if (days[i].end >= odoMin) return days[i]; return days[days.length - 1]; }
  var d0 = days[0], dAr = days[3], dPneu = firstAt(4000), dOleo = firstAt(5700);
  var mrecs = [
    { id: 1, item: 'filtro', d: d0.d, km: d0.start, cost: 60, obs: '' },
    { id: 2, item: 'ar', d: dAr.d, km: dAr.end, cost: 90, obs: '' },
    { id: 3, item: 'pneus', d: dPneu.d, km: dPneu.end, cost: 80, obs: '' },
    { id: 4, item: 'oleo', d: dOleo.d, km: dOleo.end, cost: 320, obs: 'Óleo 5W30 + filtro de óleo' }
  ];
  days.forEach(function (x) { var t = new Date(x.d.getTime()); t.setHours(7, 0); x.ts = genStamp(t); x.ts.endedAt = new Date(t.getTime() + x.min * 60000); x.demo = true; });
  [fuels, vexp, mrecs].forEach(function (L, li) { L.forEach(function (x, k) { var t = new Date(x.d.getTime()); t.setHours(li === 0 ? 18 : 12 + (k % 6), li === 0 ? 30 : 15); x.d = t; x.ts = genStamp(t); x.demo = true; }); });
  return { days: days, fuels: fuels, vexp: vexp, mrecs: mrecs, odoStart: d0.start };
}
/* Custos fixos: competência a partir de 'from' (1º dia do mês de início). Exemplo: desde ago/2026. */
var FIXOS_INI = [
  { id: 1, k: 'seguro', n: 'Seguro do veículo', v: 520, from: new Date(2026, 7, 1), demo: true },
  { id: 2, k: 'app', n: 'Plano do aplicativo', v: 99.9, from: new Date(2026, 7, 1), demo: true },
  { id: 3, k: 'ipva', n: 'IPVA (provisionado)', v: 220, from: new Date(2026, 7, 1), demo: true },
  { id: 4, k: 'licenciamento', n: 'Licenciamento (provisionado)', v: 25, from: new Date(2026, 7, 1), demo: true },
  { id: 5, k: 'financiamento', n: 'Financiamento', v: 700, from: new Date(2026, 7, 1), demo: true },
  { id: 6, k: 'outros', n: 'Outros (fixos)', v: 15.1, from: new Date(2026, 7, 1), demo: true }
];
var MAINT_ITEMS = [
  { id: 'oleo', n: 'Troca de óleo e filtro', icon: 'oil', intKm: 5000, intMonths: 6, alertKm: 600, alertDays: 30, safety: false, est: 320 },
  { id: 'pneus', n: 'Rodízio de pneus', icon: 'tire', intKm: 10000, intMonths: 0, alertKm: 1000, alertDays: 0, safety: true, est: 80 },
  { id: 'freios', n: 'Revisão dos freios', icon: 'brake', intKm: 10000, intMonths: 12, alertKm: 800, alertDays: 30, safety: true, est: 250 },
  { id: 'filtro', n: 'Filtro de ar do motor', icon: 'filter', intKm: 20000, intMonths: 0, alertKm: 1000, alertDays: 0, safety: false, est: 60 },
  { id: 'velas', n: 'Velas de ignição', icon: 'spark', intKm: 40000, intMonths: 0, alertKm: 2000, alertDays: 0, safety: false, est: 180 },
  { id: 'ar', n: 'Filtro do ar-condicionado', icon: 'snow', intKm: 15000, intMonths: 12, alertKm: 1000, alertDays: 30, safety: false, est: 90 },
  { id: 'revisao', n: 'Revisão geral', icon: 'gear', intKm: 0, intMonths: 6, alertKm: 0, alertDays: 15, safety: false, est: 450, baseDate: new Date(2026, 4, 15) }
];

/* ---------------- Regras puras ---------------- */
function avgOf(base) { return base.km > 0 ? base.rec / base.km : null; }
/* Simulação: NÃO altera a média efetiva. */
function simulateOffer(base, o) {
  var k = o.pk + o.tk, min = o.pm + o.tm, avg = avgOf(base);
  var proj = (base.rec + o.v) / (base.km + k);
  return { k: k, min: min, v: o.v, rpk: o.v / k, rph: o.v / (min / 60), avg: avg, proj: proj, impact: avg === null ? null : proj - avg };
}
/* (rec + x·d)/(km + d) = meta → x = (meta·(km + d) − rec)/d */
function requiredPerKm(base, meta, dRef) { return (meta * (base.km + dRef) - base.rec) / dRef; }
function barState(avg, meta) { if (avg === null || avg < meta) return 'abaixo'; return avg > meta + 0.5 ? 'destaque' : 'meta'; }
var RULES = {
  financialOk: function (sim, meta) { return sim.rpk >= meta || sim.proj >= meta; },
  financialFailClass: 'nao',        /* PENDENTE: classe quando só a rentabilidade falha */
  neutralDestinationClass: 'rec',   /* PENDENTE: destino rentável fora de zona de preferência */
  attentionUplift: null             /* PENDENTE 6.5: critério dos "50%" */
};
function classify(sim, meta, destHit, destText, online) {
  var sev = 0, reasons = [];
  if (online && destHit) {
    if (destHit.type === 'vermelha') sev = 2; else if (destHit.type === 'amarela') sev = 1;
    destHit.tags.forEach(function (t) { if (reasons.indexOf(t) < 0) reasons.push(t); });
  }
  if (destText && MARKET_RE.test(destText)) { sev = Math.max(sev, 1); reasons.push('mercado'); }
  if (!RULES.financialOk(sim, meta)) sev = Math.max(sev, RULES.financialFailClass === 'nao' ? 2 : 1);
  var key = sev === 2 ? 'nao' : (sev === 1 ? 'atencao' : 'rec');
  return { key: key, reasons: key === 'rec' ? [] : reasons };
}

/* Combustível: ciclos cheio → cheio (parciais somam no ciclo). */
function fuelCycles(fuels) {
  var out = [], prev = null, liters = 0, cost = 0, types = [];
  fuels.slice().sort(function (a, b) { return a.odo - b.odo; }).forEach(function (f) {
    if (prev === null) { if (f.full) prev = f; return; }
    liters += f.l; cost += f.l * f.p; if (types.indexOf(f.fuel) < 0) types.push(f.fuel);
    if (f.full) { var dist = f.odo - prev.odo; out.push({ d: f.d, dist: dist, liters: liters, cost: cost, cons: dist / liters, cpk: cost / dist, fuels: types.slice(), endId: f.id, odoFrom: prev.odo, odoTo: f.odo }); prev = f; liters = 0; cost = 0; types = []; }
  });
  return out;
}
function lastConsumption(fuels) { var c = fuelCycles(fuels); return c.length ? c[c.length - 1].cons : null; }
function lastPrice(fuels) { return fuels.length ? fuels[fuels.length - 1].p : null; }
/* custo de combustível por km: preço / consumo. Sem ciclo completo, usa o consumo de referência (PRD: estimado). */
function fuelCpk(fuels, refCons) { var c = fuelCycles(fuels); if (c.length) return c[c.length - 1].cpk; var p = lastPrice(fuels); return p && refCons ? p / refCons : null; }

/* Comparação por dia civil (registros carregam hora). */
function daysInMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
/* Fixos rateados por dia (dias reais do mês), somente a partir da competência de cada lançamento. */
function fixosProrated(fixos, from, to) {
  var t = 0, d = new Date(from.getFullYear(), from.getMonth(), from.getDate()), end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (d <= end) { var dim = daysInMonth(d), m0 = new Date(d.getFullYear(), d.getMonth(), 1); fixos.forEach(function (f) { if (!f.from || f.from <= m0) t += f.v / dim; }); d = addDays(d, 1); }
  return t;
}
function fixosMonth(fixos, monthStart) { var t = 0; fixos.forEach(function (f) { if (!f.from || f.from <= monthStart) t += f.v; }); return t; }
function inRange(d, from, to) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); return x >= new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime() && x <= new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime(); }
/* Agregação única por período. isMonth: inclui custos fixos mensais (não rateados). */
/* CAMADA ÚNICA DE CÁLCULO. fixMode: true = mês (valor integral), 'pro' = rateio diário, false = sem fixos.
   Expediente em andamento (x.live): km total ainda desconhecido → custo de combustível estimado sobre km produtivos (identificado em kmEst). */
function aggregate(S, from, to, fixMode) {
  var a = { days: 0, kmExp: 0, kmEst: 0, kmProd: 0, rec: 0, rides: 0, min: 0, fees: 0, fuelL: 0, fuelV: 0, cycDist: 0, cycL: 0, cycCost: 0, vexp: 0, vcat: {}, maint: 0, fixos: 0, live: false };
  Object.keys(VAR_CATS).forEach(function (k) { a.vcat[k] = 0; });
  S.days.forEach(function (x) { if (inRange(x.d, from, to)) { a.days++; if (x.kmExp === null || x.kmExp === undefined) a.kmEst += x.kmProd; else a.kmExp += x.kmExp; a.kmProd += x.kmProd; a.rec += x.rec; a.fees += x.fees; a.rides += x.rides; a.min += x.min; if (x.live) a.live = true; } });
  S.fuels.forEach(function (f) { if (inRange(f.d, from, to)) { a.fuelL += f.l; a.fuelV += f.l * f.p; } });
  var cycles = fuelCycles(S.fuels);
  cycles.forEach(function (c) { if (inRange(c.d, from, to)) { a.cycDist += c.dist; a.cycL += c.liters; a.cycCost += c.cost; } });
  S.vexp.forEach(function (e) { if (inRange(e.d, from, to)) { a.vexp += e.v; a.vcat[e.cat] += e.v; } });
  S.mrecs.forEach(function (m) { if (inRange(m.d, from, to)) a.maint += m.cost; });
  if (fixMode === 'pro') a.fixos = fixosProrated(S.fixos, from, to);
  else if (fixMode) a.fixos = fixosMonth(S.fixos, new Date(from.getFullYear(), from.getMonth(), 1));
  a.receita = a.rec + a.fees;
  a.cons = a.cycL > 0 ? a.cycDist / a.cycL : null;
  a.price = a.fuelL > 0 ? a.fuelV / a.fuelL : null;
  var motor = S.vehicle ? S.vehicle.motor : 'flex';
  if (motor === 'eletrico') { var cp = fuelCpkFor(S, to, a); a.cpkFuel = cp.cpk; a.cpkSource = cp.src; a.fuelCost = a.cpkFuel === null ? 0 : (a.kmExp + a.kmEst) * a.cpkFuel; }
  else {
    /* cada km é custeado pelo ciclo cheio→cheio que o contém; km em ciclo ainda aberto usam o último custo medido (ou a referência) */
    var cost = 0, kmT = 0, srcs = {};
    S.days.forEach(function (x) { if (!inRange(x.d, from, to)) return; var k = (x.kmExp === null || x.kmExp === undefined) ? x.kmProd : x.kmExp; if (!(k > 0)) return;
      var odo = x.end !== null && x.end !== undefined ? (x.start + x.end) / 2 : x.start, c = null;
      for (var i = 0; i < cycles.length; i++) if (odo > cycles[i].odoFrom && odo <= cycles[i].odoTo) { c = cycles[i]; break; }
      var cpk, src; if (c) { cpk = c.cpk; src = 'medido'; } else { var fb = fuelCpkFor(S, startOfDay(x.d), null); cpk = fb.cpk; src = fb.src; }
      if (cpk === null) return; cost += k * cpk; kmT += k; srcs[src] = true; });
    a.fuelCost = cost; a.cpkFuel = kmT > 0 ? cost / kmT : fuelCpkFor(S, to, null).cpk;
    a.cpkSource = srcs.referencia ? 'referencia' : (srcs.ultimo ? (srcs.medido ? 'medido + último ciclo' : 'ultimo') : (srcs.medido ? 'medido' : fuelCpkFor(S, to, null).src));
  }
  a.custos = a.fuelCost + a.vexp + a.maint + a.fixos;
  a.resultado = a.receita - a.custos;
  return a;
}
/* Custo de energia/combustível por km:
   'medido'     = gasto dos ciclos completos do período / km desses ciclos;
   'ultimo'     = último custo por km medido até a data;
   'referencia' = último preço pago / consumo de referência (estimativa inicial). */
function fuelCpkFor(S, to, a) {
  var veh = S.vehicle, motor = veh ? veh.motor : 'flex';
  if (motor === 'eletrico') { var es = energyStats((S.charges || []).filter(function (c) { return c.d <= addDays(to, 1); }), veh); return { cpk: es.cpk, src: es.src }; }
  if (a && a.cycDist > 0) return { cpk: a.cycCost / a.cycDist, src: 'medido' };
  var cyc = fuelCycles(S.fuels.filter(function (f) { return startOfDay(f.d) <= to; }));
  if (cyc.length) return { cpk: cyc[cyc.length - 1].cpk, src: 'ultimo' };
  var p = lastPriceUntil(S, to); var rc = veh ? veh.refCons : null;
  return p && rc ? { cpk: p / rc, src: 'referencia' } : { cpk: null, src: 'sem dados' };
}
function lastConsumptionUntil(S, to) { return lastConsumption(S.fuels.filter(function (f) { return startOfDay(f.d) <= to; })); }
function lastPriceUntil(S, to) { var l = S.fuels.filter(function (f) { return startOfDay(f.d) <= to; }).sort(function (x, y) { return x.d - y.d; }); return l.length ? l[l.length - 1].p : null; }

/* Evolutivos: natureza de cada indicador (regra global de cores) */
var EVO = [
  { g: 'Receitas e resultados', k: 'receita', n: 'Receita total', nat: 'up', f: function (a) { return a.receita; }, u: 'money' },
  { k: 'rpk', n: 'Receita por km', nat: 'up', f: function (a) { return a.kmExp && !a.kmEst ? a.receita / a.kmExp : null; }, u: 'money' },
  { k: 'rph', n: 'Receita por hora', nat: 'up', f: function (a) { return a.min ? a.receita / (a.min / 60) : null; }, u: 'money' },
  { k: 'rpc', n: 'Receita por corrida', nat: 'up', f: function (a) { return a.rides ? a.receita / a.rides : null; }, u: 'money' },
  { k: 'resultado', n: 'Resultado operacional', nat: 'up', f: function (a) { return a.resultado; }, u: 'money', monthOnly: true },
  { g: 'Custos', k: 'custos', n: 'Custos totais', nat: 'down', f: function (a) { return a.custos; }, u: 'money', monthOnly: true },
  { k: 'fixos', n: 'Custos fixos', nat: 'down', f: function (a) { return a.fixos; }, u: 'money', monthOnly: true },
  { k: 'variaveis', n: 'Custos variáveis', nat: 'down', f: function (a) { return a.vexp; }, u: 'money' },
  { k: 'cpk', n: 'Custo por km', nat: 'down', f: function (a) { return a.kmExp && !a.kmEst ? a.custos / a.kmExp : null; }, u: 'money', monthOnly: true },
  { k: 'combustivel', n: 'Combustível (estimado)', nat: 'down', f: function (a) { return a.fuelCost; }, u: 'money' },
  { k: 'cpkfuel', n: 'Custo de combustível por km', nat: 'down', f: function (a) { return a.cpkFuel; }, u: 'money' },
  { k: 'alimentacao', n: 'Alimentação', nat: 'down', f: function (a) { return a.vcat.alimentacao; }, u: 'money' },
  { k: 'lavagem', n: 'Lavagem', nat: 'down', f: function (a) { return a.vcat.lavagem; }, u: 'money' },
  { k: 'pedagio', n: 'Pedágios', nat: 'down', f: function (a) { return a.vcat.pedagio; }, u: 'money' },
  { k: 'estacionamento', n: 'Estacionamento', nat: 'down', f: function (a) { return a.vcat.estacionamento; }, u: 'money' },
  { k: 'manutencao', n: 'Manutenção', nat: 'down', f: function (a) { return a.maint; }, u: 'money' },
  { g: 'Operação e eficiência', k: 'km', n: 'Quilômetros rodados', nat: 'neutral', f: function (a) { return a.kmExp; }, u: 'km' },
  { k: 'tempo', n: 'Tempo de operação', nat: 'neutral', f: function (a) { return a.min; }, u: 'min' },
  { k: 'consumo', n: 'Consumo (km/L)', nat: 'up', f: function (a) { return a.cons; }, u: 'kml' },
  { k: 'preco', n: 'Preço médio pago por litro (PMP)', nat: 'down', f: function (a) { return a.price; }, u: 'money' },
  { k: 'abast', n: 'Histórico de abastecimentos', nat: 'neutral', list: true }
];
function fmtUnit(v, u) {
  if (v === null || v === undefined || isNaN(v)) return '—';
  if (u === 'money') return money(v);
  if (u === 'km') return km(v); if (u === 'min') return dur(v); if (u === 'kml') return dec(v, 1) + ' km/L';
  return String(v);
}
function changeColor(nat, delta) {
  if (delta === null || delta === 0 || nat === 'neutral') return '#C9B6F7';
  var good = nat === 'up' ? delta > 0 : delta < 0;
  return good ? '#3FE0A0' : '#FF6B7D';
}
/* Períodos completos e equivalentes (o período corrente parcial não entra na comparação). */
function evoPeriods(S, kind) {
  var out = [];
  if (kind === 'dia') {
    var ds = S.days.slice(-8);
    ds.forEach(function (x) { out.push({ l: ddmm(x.d), from: x.d, to: x.d }); });
  } else if (kind === 'semana') {
    var mon = addDays(TODAY, -((TODAY.getDay() + 6) % 7));
    for (var i = 8; i >= 1; i--) { var f = addDays(mon, -7 * i); out.push({ l: ddmm(f), from: f, to: addDays(f, 6) }); }
  } else {
    var m0 = new Date(2026, 7, 1), cur = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
    for (var m = m0; m <= cur; m = addMonths(m, 1)) {
      var partial = m.getTime() === cur.getTime();
      if (kind === 'mes' && partial) continue;
      out.push({ l: MES[m.getMonth()] + (partial ? '*' : ''), from: m, to: addDays(addMonths(m, 1), -1), month: true, partial: partial });
    }
  }
  return out;
}

/* Manutenção: estado de cada item a partir dos registros (ciclo = último registro). */
function maintStatus(S, refOdo, kmPerDay) {
  return S.mitems.map(function (it) {
    var recs = S.mrecs.filter(function (m) { return m.item === it.id; }).sort(function (a, b) { return a.d - b.d; });
    var last = recs.length ? recs[recs.length - 1] : null;
    var lastKm = last ? last.km : 0, lastDate = last ? last.d : (it.baseDate || null);
    var nextKm = it.intKm ? lastKm + it.intKm : null, remKm = nextKm === null ? null : nextKm - refOdo;
    var nextDate = it.intMonths && lastDate ? addMonths(lastDate, it.intMonths) : null, remDays = nextDate ? daysBetween(TODAY, nextDate) : null;
    var st = 'emdia';
    if ((remKm !== null && remKm < 0) || (remDays !== null && remDays < 0)) st = 'vencida';
    else if ((remKm !== null && remKm <= it.alertKm) || (remDays !== null && remDays <= it.alertDays)) st = 'proxima';
    var estDays = remKm !== null && kmPerDay > 0 ? Math.max(0, Math.round(remKm / kmPerDay)) : null;
    var progress = it.intKm ? Math.min(1, Math.max(0, (refOdo - lastKm) / it.intKm)) : (it.intMonths && lastDate ? Math.min(1, Math.max(0, daysBetween(lastDate, TODAY) / (it.intMonths * 30.4))) : 0);
    return { it: it, last: last, lastKm: lastKm, lastDate: lastDate, nextKm: nextKm, remKm: remKm, nextDate: nextDate, remDays: remDays, st: st, estDays: estDays, progress: progress, cost: last ? last.cost : it.est, hist: recs.length };
  });
}

/* ---------------- Combustível: estoque estimado ----------------
   Premissa de inicialização (D.3): no 1º registro o tanque é assumido cheio (capacidade) ao preço desse
   abastecimento. Não cria litros nem despesa no histórico; só inicializa o modelo (marcado como estimado).
   Tanque cheio (D.4): quantidade conhecida = capacidade; o que havia antes = capacidade − litros abastecidos.
   Parcial: antes = estoque anterior − km rodados / consumo vigente (estimado), limitado a [0, capacidade]. */
function fuelStock(fuels, cap, refCons) {
  var list = fuels.slice().sort(function (a, b) { return a.odo - b.odo; }), states = {}, stock = null, avg = null, prevOdo = null, cyc = [], prevFull = null, litersSince = 0, est = true;
  list.forEach(function (f) {
    var st = { id: f.id, warn: '' };
    if (stock === null) { stock = cap; avg = f.p; st.init = true; st.before = null; st.after = cap; st.avg = avg; st.est = true; }
    else {
      var cons = cyc.length ? cyc[cyc.length - 1] : refCons;
      var used = cons ? (f.odo - prevOdo) / cons : 0, expected = stock - used, before;
      if (f.full) {
        before = cap - f.l;
        if (before < 0) { st.warn = 'Litros acima da capacidade: estoque anterior assumido zero.'; before = 0; }
        st.calib = before - expected;
        stock = cap; est = false;
      } else {
        before = expected;
        if (before < 0) { st.warn = 'Estimativa ficou negativa: assumido tanque vazio antes do abastecimento.'; before = 0; }
        if (before + f.l > cap) { st.warn = 'Estimativa passaria da capacidade: ajustada ao tanque cheio.'; before = Math.max(0, cap - f.l); }
        stock = before + f.l; est = true;
      }
      var added = Math.min(f.l, stock - before); /* litros que cabem no tanque; excedente não entra no custo do estoque */
      avg = stock > 0 ? (before * avg + added * f.p) / stock : f.p;
      st.before = before; st.after = stock; st.avg = avg; st.est = est;
    }
    if (prevFull === null) { if (f.full) prevFull = f; } else { litersSince += f.l; if (f.full) { cyc.push((f.odo - prevFull.odo) / litersSince); prevFull = f; litersSince = 0; } }
    prevOdo = f.odo; states[f.id] = st;
  });
  return { states: states, liters: stock, avg: avg, lastOdo: prevOdo, est: est };
}
function stockNow(fs, odoNow, cons, cap) {
  if (fs.liters === null) return null;
  var l = fs.liters - (cons ? Math.max(0, odoNow - fs.lastOdo) / cons : 0);
  return { liters: Math.max(0, Math.min(cap, l)), avg: fs.avg, est: true };
}
/* PMP: soma dos valores pagos / soma dos litros (por tipo de combustível quando informado). */
function pmp(fuels, type) { var v = 0, l = 0; fuels.forEach(function (f) { if (!type || f.fuel === type) { v += f.l * f.p; l += f.l; } }); return l > 0 ? v / l : null; }
function consHistory(fuels) { var c = fuelCycles(fuels), d = 0, l = 0; c.forEach(function (x) { d += x.dist; l += x.liters; }); return { cycles: c, avg: l > 0 ? d / l : null }; }
/* Energia elétrica (recargas). Consumo km/kWh entre recargas é ESTIMATIVA (não se conhece o estado de carga). */
/* Energia: ciclo MEDIDO = entre duas recargas até 100%; sem isso, estimativa entre recargas consecutivas. */
function energyStats(charges, veh) {
  var list = charges.slice().sort(function (a, b) { return a.odo - b.odo; }), v = 0, k = 0;
  list.forEach(function (c) { v += c.kwh * c.p; k += c.kwh; });
  var p = k > 0 ? v / k : null, prev = null, kk = 0, cc = 0, mDist = 0, mK = 0, mCost = 0;
  list.forEach(function (c) { if (prev === null) { if (c.full) prev = c; return; } kk += c.kwh; cc += c.kwh * c.p; if (c.full) { mDist += c.odo - prev.odo; mK += kk; mCost += cc; prev = c; kk = 0; cc = 0; } });
  if (mDist > 0) return { pmpKwh: p, cons: mDist / mK, cpk: mCost / mDist, n: list.length, src: 'medido', measured: true };
  if (list.length >= 2) { var ek = 0, ec = 0; for (var i = 1; i < list.length; i++) { ek += list[i].kwh; ec += list[i].kwh * list[i].p; } var dist = list[list.length - 1].odo - list[0].odo; if (dist > 0) return { pmpKwh: p, cons: dist / ek, cpk: ec / dist, n: list.length, src: 'estimado', measured: false }; }
  var rc = veh && veh.refConsEl; return { pmpKwh: p, cons: null, cpk: p && rc ? p / rc : null, n: list.length, src: p && rc ? 'referencia' : 'sem dados', measured: false };
}
var MOTORS = {
  gasolina: { n: 'Gasolina', fuels: ['gasolina'], ice: true, el: false },
  etanol: { n: 'Etanol', fuels: ['etanol'], ice: true, el: false },
  flex: { n: 'Flex', fuels: ['gasolina', 'etanol'], ice: true, el: false },
  diesel: { n: 'Diesel', fuels: ['diesel'], ice: true, el: false },
  hibrido: { n: 'Híbrido convencional', fuels: null, ice: true, el: false },
  eletrico: { n: 'Elétrico', fuels: [], ice: false, el: true }
};
var FUEL_N = { gasolina: 'Gasolina', etanol: 'Etanol', diesel: 'Diesel' };
function vehicleFuels(v) { if (!v) return []; if (v.motor === 'hibrido') return v.combFuel === 'flex' ? ['gasolina', 'etanol'] : [v.combFuel || 'gasolina']; return MOTORS[v.motor].fuels; }

/* ---------------- Evolutivos: famílias de séries (composição sem duplicidade) ---------------- */
var FAMILIES = {
  custos: [['total', 'Custos totais', '#B58AF5', function (a) { return a.custos; }, true], ['fixos', 'Fixos', '#6E8BFF', function (a) { return a.fixos; }, true], ['var', 'Variáveis', '#FF9F43', function (a) { return a.vexp; }], ['comb', 'Combustível', '#F6C445', function (a) { return a.fuelCost; }], ['man', 'Manutenção', '#E879F9', function (a) { return a.maint; }]],
  variaveis: [['var', 'Variáveis', '#B58AF5', function (a) { return a.vexp; }], ['alimentacao', 'Alimentação', '#F6C445', function (a) { return a.vcat.alimentacao; }], ['lavagem', 'Lavagem', '#4FB3FF', function (a) { return a.vcat.lavagem; }], ['pedagio', 'Pedágios', '#FF9F43', function (a) { return a.vcat.pedagio; }], ['estacionamento', 'Estacionamento', '#6E8BFF', function (a) { return a.vcat.estacionamento; }], ['outros', 'Outros', '#C9C4EC', function (a) { return a.vcat.outros; }]],
  receita: [['rec', 'Receita total', '#B58AF5', function (a) { return a.receita; }], ['cor', 'Corridas', '#3FE0A0', function (a) { return a.rec; }], ['tax', 'Taxas de cancelamento', '#F6C445', function (a) { return a.fees; }]],
  resultado: [['res', 'Resultado operacional', '#B58AF5', function (a) { return a.resultado; }, true], ['rec', 'Receita', '#3FE0A0', function (a) { return a.receita; }], ['cus', 'Custos totais', '#FF9F43', function (a) { return a.custos; }, true]]
};
var EVO_FAM = { custos: ['custos', 'total'], fixos: ['custos', 'fixos'], variaveis: ['custos', 'var'], combustivel: ['custos', 'comb'], manutencao: ['custos', 'man'],
  alimentacao: ['variaveis', 'alimentacao'], lavagem: ['variaveis', 'lavagem'], pedagio: ['variaveis', 'pedagio'], estacionamento: ['variaveis', 'estacionamento'],
  receita: ['receita', 'rec'], resultado: ['resultado', 'res'] };
/* Soma agregações (meses) e recalcula os derivados: razões vêm de somas, nunca de médias de médias. */
function mergeAgg(list) {
  var m = { days: 0, kmExp: 0, kmEst: 0, kmProd: 0, rec: 0, rides: 0, min: 0, fees: 0, fuelL: 0, fuelV: 0, cycDist: 0, cycL: 0, cycCost: 0, vexp: 0, vcat: {}, maint: 0, fixos: 0, fuelCost: 0, live: false };
  Object.keys(VAR_CATS).forEach(function (k) { m.vcat[k] = 0; });
  list.forEach(function (a) { ['days', 'kmExp', 'kmEst', 'kmProd', 'rec', 'rides', 'min', 'fees', 'fuelL', 'fuelV', 'cycDist', 'cycL', 'cycCost', 'vexp', 'maint', 'fixos', 'fuelCost'].forEach(function (k) { m[k] += a[k] || 0; }); if (a.live) m.live = true; Object.keys(VAR_CATS).forEach(function (k) { m.vcat[k] += a.vcat[k]; }); });
  m.receita = m.rec + m.fees; m.cons = m.cycL > 0 ? m.cycDist / m.cycL : null; m.price = m.fuelL > 0 ? m.fuelV / m.fuelL : null;
  var anyCpk = list.some(function (x) { return x.cpkFuel !== null && x.cpkFuel !== undefined; });
  m.cpkFuel = anyCpk && (m.kmExp + m.kmEst) > 0 ? m.fuelCost / (m.kmExp + m.kmEst) : null; m.cpkSource = anyCpk ? (list.filter(function (x) { return x.cpkSource; }).slice(-1)[0] || {}).cpkSource : 'sem dados'; m.custos = m.fuelCost + m.vexp + m.maint + m.fixos; m.resultado = m.receita - m.custos;
  return m;
}
function dataStart(S) { return S.days.length ? startOfDay(S.days[0].d) : TODAY; }
/* Agregação de um intervalo em meses: fixos contam 1x por mês com operação registrada. */
function aggMonths(S, from, to) {
  var out = [], m = new Date(from.getFullYear(), from.getMonth(), 1);
  while (m <= to) {
    var a = m < from ? from : m, b = addDays(addMonths(m, 1), -1); if (b > to) b = to;
    var has = S.days.some(function (x) { return inRange(x.d, a, b); });
    out.push(aggregate(S, a, b, has ? true : false));
    m = addMonths(m, 1);
  }
  return mergeAgg(out);
}
var PERIODS = [['dia', 'Dia'], ['semana', 'Semana'], ['mes', 'Mês'], ['tri', '3 meses'], ['ytd', 'Ano'], ['hist', 'Histórico']];
function evoPlan(S, kind) {
  var pts = [], cur = null, prev = null, note = '', curLabel = '', prevLabel = '', ds = dataStart(S), monthCur = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
  var monthPt = function (m, partial) { var to = addDays(addMonths(m, 1), -1); if (to > TODAY) to = TODAY; return { l: MES[m.getMonth()] + (partial ? '*' : ''), from: m < ds ? ds : m, to: to, month: true, partial: partial, empty: to < ds }; };
  if (kind === 'dia') {
    var dd = []; S.days.forEach(function (x) { var k = dkey(x.d); if (dd.indexOf(k) < 0) dd.push(k); });
    dd.slice(-8).forEach(function (k) { var x = S.days.filter(function (y) { return dkey(y.d) === k; }); var d0 = startOfDay(x[0].d), part = x.some(function (y) { return y.live; }); pts.push({ l: ddmm(d0) + (part ? '*' : ''), from: d0, to: d0, partial: part }); });
    var comp = pts.filter(function (p) { return !p.partial; });
    cur = comp[comp.length - 1] || null; prev = comp.length > 1 ? comp[comp.length - 2] : null; curLabel = 'Último dia encerrado · ' + (cur ? cur.l : ''); prevLabel = prev ? prev.l : '';
    note = 'Dias com expediente; * dia em andamento (fora da comparação). Fixos rateados por dia.';
  } else if (kind === 'semana') {
    var mon = addDays(TODAY, -((TODAY.getDay() + 6) % 7));
    for (var i = 8; i >= 1; i--) { var f = addDays(mon, -7 * i); pts.push({ l: ddmm(f), from: f, to: addDays(f, 6) }); }
    cur = pts[pts.length - 1]; prev = pts[pts.length - 2]; pts.push({ l: ddmm(mon) + '*', from: mon, to: TODAY, partial: true });
    curLabel = 'Última semana completa · ' + cur.l; prevLabel = 'semana de ' + prev.l; note = 'Semanas seg–dom; * semana atual parcial (fora da comparação). Fixos rateados por dia.';
  } else if (kind === 'mes') {
    for (var m = new Date(ds.getFullYear(), ds.getMonth(), 1); m < monthCur; m = addMonths(m, 1)) pts.push(monthPt(m, false));
    cur = pts[pts.length - 1]; prev = pts.length > 1 ? pts[pts.length - 2] : null; curLabel = 'Último mês completo · ' + (cur ? cur.l : ''); prevLabel = prev ? prev.l : '';
    note = MES_LONGO[TODAY.getMonth()].replace(/^./, function (c) { return c.toUpperCase(); }) + ' (parcial) fica fora da comparação.';
  } else if (kind === 'tri') {
    var t0 = addMonths(monthCur, -3);
    for (var k = 0; k < 3; k++) pts.push(monthPt(addMonths(t0, k), false));
    cur = { from: t0, to: addDays(monthCur, -1), range: true }; prev = { from: addMonths(t0, -3), to: addDays(t0, -1), range: true };
    curLabel = 'Últimos 3 meses completos · ' + pts[0].l + '–' + pts[2].l; prevLabel = '3 meses anteriores';
    note = 'Soma dos três últimos meses completos.';
  } else if (kind === 'ytd') {
    var y0 = new Date(TODAY.getFullYear(), 0, 1);
    for (var mm = y0; mm <= monthCur; mm = addMonths(mm, 1)) pts.push(monthPt(mm, mm.getTime() === monthCur.getTime()));
    cur = { from: y0, to: TODAY, range: true }; prev = { from: new Date(TODAY.getFullYear() - 1, 0, 1), to: new Date(TODAY.getFullYear() - 1, TODAY.getMonth(), TODAY.getDate()), range: true };
    curLabel = 'Acumulado de ' + TODAY.getFullYear() + ' até ' + ddmm(TODAY); prevLabel = 'mesmo intervalo de ' + (TODAY.getFullYear() - 1);
    note = 'Inclui o mês atual (parcial*). Dados disponíveis desde ' + ddmmyyyy(ds) + '.';
  } else {
    for (var mh = new Date(ds.getFullYear(), ds.getMonth(), 1); mh <= monthCur; mh = addMonths(mh, 1)) pts.push(monthPt(mh, mh.getTime() === monthCur.getTime()));
    cur = { from: ds, to: TODAY, range: true }; prev = null; curLabel = 'Todo o histórico · desde ' + ddmmyyyy(ds); note = '* mês atual parcial.';
  }
  return { pts: pts, cur: cur, prev: prev, curLabel: curLabel, prevLabel: prevLabel, note: note };
}
function hasData(S, from, to) { return S.days.some(function (x) { return inRange(x.d, from, to); }); }
function aggFor(S, p) { if (p.range || p.month) return aggMonths(S, p.from, p.to); return aggregate(S, p.from, p.to, 'pro'); }
