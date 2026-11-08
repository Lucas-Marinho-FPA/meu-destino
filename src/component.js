
/* ---------------- Componente ---------------- */
function tile(k, v, c, path, small) {
  return {
    k: k, v: v, path: path,
    box: 'display: flex; align-items: center; gap: ' + (small ? '8px' : '12px') + '; padding: ' + (small ? '12px 10px' : '16px 14px') + '; border-radius: 20px; min-width: 0; background: linear-gradient(100deg, ' + alpha(c, 0.22) + ' 0%, rgba(30,27,58,.92) 55%); border: 1.5px solid ' + alpha(c, 0.7) + '; border-left-width: 3px',
    ic: 'color: ' + c + '; display: flex; flex: none'
  };
}
function iconBox(c, size) { var s = size || 44; return 'width: ' + s + 'px; height: ' + s + 'px; border-radius: 14px; flex: none; display: flex; align-items: center; justify-content: center; color: ' + c + '; background: ' + alpha(c, 0.14); }
function tabBtn(on) {
  return 'flex: 1 1 auto; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 4px; min-height: 44px; padding: 0 8px; border: 0; border-radius: 16px; cursor: pointer; font: 500 12.5px Inter, sans-serif; white-space: nowrap; ' +
    (on ? 'background: linear-gradient(180deg, #8F62F2, #6C3FD6); color: #FFFFFF; box-shadow: 0 4px 14px rgba(124,77,230,.45)' : 'background: transparent; color: #E4DEFA');
}
function chipStyle(c, solid) { return solid ? 'background: ' + c + '; color: #15132E' : 'background: ' + alpha(c, 0.16) + '; color: ' + c + '; border: 1px solid ' + alpha(c, 0.45); }
function dmyhm(d) { return ddmmyyyy(d) + ' ' + hm(d); }
/* data (dd/mm/aaaa) + hora (hh:mm) → Date local; null se inválida */
function parseWhen(ds, ts) { var d = parseDate(ds); if (!d) return null; var m = String(ts || '').match(/^(\d{1,2}):(\d{2})$/); if (!m || +m[1] > 23 || +m[2] > 59) return null; d.setHours(+m[1], +m[2], 0, 0); return d; }
var ROOTS = { home: 1, op: 1, fin: 1, hist: 1, cfg: 1 };
var FORMS = { rideForm: 'rf', vehForm: 'vf', fuelForm: 'ff', chargeForm: 'ch', costForm: 'cf', maintReg: 'mf', maintItem: 'mi', zoneForm: 'zf', editDate: 'ed' };
var TITLES = {
  recover: ['Recuperação', 'Expediente pendente'], camera: ['Hodômetro', 'Registro'], confirm: ['Hodômetro', 'Confirmar leitura'], close: ['Encerramento', 'Conferência do dia'],
  closed: ['', 'Fechamento do expediente'], rides: ['Financeiro', 'Detalhamento das corridas'], ride: ['Corridas', 'Registro da corrida'], rideForm: ['Corridas', 'Registro'], dre: ['Financeiro', 'DRE do expediente'], offerSim: ['', 'Simulação da corrida'],
  veh: ['Configurações', 'Veículo'], vehDetail: ['Veículo', 'Detalhes do veículo'], vehForm: ['Veículo', 'Editar dados do veículo'], cfgMeta: ['Configurações', 'Metas e limites'], terr: ['Configurações', 'Território'], zoneForm: ['Território', 'Nova zona'],
  pref: ['Configurações', 'Preferências'], fuel: ['Configurações', 'Combustível'], fuelForm: ['Combustível', 'Novo abastecimento'], chargeForm: ['Combustível', 'Nova recarga'], editDate: ['Registro', 'Corrigir data'],
  costs: ['Configurações', 'Custos operacionais'], costFix: ['Custos operacionais', 'Custos fixos'], costVar: ['Custos operacionais', 'Custos variáveis'], costKm: ['Custos operacionais', 'Custo por quilômetro'],
  costCat: ['Custos variáveis', ''], costForm: ['Custos operacionais', ''], maint: ['Configurações', 'Manutenção'], maintReg: ['Manutenção', 'Registrar manutenção'], maintItem: ['Manutenção', 'Novo serviço'],
  hist: ['Histórico', 'Evolutivos'], fin: ['', 'Financeiro'], cfg: ['', 'Configurações'], op: ['', 'Operação'], home: ['', 'Operação']
};

/* ---------- corridas: registros (R5) ----------
   oferta    = oferta analisada (captura); nunca é receita e não exige classificação do motorista
   concluida = corrida efetivamente realizada, registrada pelo motorista (valor recebido + km; duração opcional)
   taxa      = taxa de cancelamento recebida (receita de taxas, não conta como corrida)
   excluida  = registro excluído pelo motorista (mantido para a trilha; fora dos cálculos) */
var RIDE_ST = { oferta: ['Oferta analisada', '#C9C4EC'], concluida: ['Registrada', '#3FE0A0'], taxa: ['Taxa de cancelamento', '#F6C445'], excluida: ['Excluída', '#FF6B7D'] };
var OLD_ST = { pendente: 'oferta', realizada: 'concluida', ignorada: 'oferta', aceita: 'oferta', recusada: 'oferta' };
/* cores do veículo (ilustração) */
var VEH_COLORS = [['branco', 'Branco', '#ECEBF2'], ['prata', 'Prata', '#BFC3CC'], ['cinza', 'Cinza', '#7C8190'], ['preto', 'Preto', '#2B2A33'], ['vermelho', 'Vermelho', '#C8414B'], ['azul', 'Azul', '#3F6BC9'], ['bege', 'Bege/Marrom', '#A8876A'], ['verde', 'Verde', '#4E8F6B'], ['outra', 'Outra', '#9B97B8']];
function vehColor(k) { return VEH_COLORS.filter(function (c) { return c[0] === k; })[0] || null; }
/* Fotos do modelo: catálogo LOCAL (embutido no app, sem rede). Chave: marca|modelo|geração (faixa de anos) → imagem por cor.
   Vazio nesta rodada: nenhuma imagem licenciada foi incorporada (ver pendências). Sem foto → ilustração genérica, identificada como tal. */
var VEH_PHOTOS = [];
function vehPhoto(v) { if (!v) return null; var b = String(v.brand || '').toLowerCase(), m = String(v.model || '').toLowerCase(); var hit = VEH_PHOTOS.filter(function (p) { return p.brand === b && p.model === m && (!v.year || (v.year >= p.from && v.year <= p.to)); })[0]; return hit ? (hit.byColor[v.color] || hit.byColor.default || null) : null; }

/* ---------- persistência local (somente neste aparelho, sem nuvem) ---------- */
var STORE_KEY = 'meu-destino:dados:v2';
var PERSIST = ['scenario', 'online', 'days', 'fuels', 'charges', 'vexp', 'mrecs', 'fixos', 'mitems', 'vehicle', 'shift', 'rides', 'nextRideId', 'offerIdx', 'dayClosedAt', 'demoLoaded', 'clock', 'endOdo', 'dayDone', 'zones', 'nextZoneId', 'low', 'meta'];
var ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
function storeGet() { try { var ls = (typeof localStorage !== 'undefined') ? localStorage : null; if (!ls) return null; var raw = ls.getItem(STORE_KEY); if (!raw) return null; return JSON.parse(raw, function (k, v) { return typeof v === 'string' && ISO_RE.test(v) ? new Date(v) : v; }); } catch (e) { return null; } }
function storeSet(obj) { try { if (typeof localStorage === 'undefined') return false; localStorage.setItem(STORE_KEY, JSON.stringify(obj)); return true; } catch (e) { return false; } }
function storeClear() { try { if (typeof localStorage !== 'undefined') localStorage.removeItem(STORE_KEY); } catch (e) { } }
function migrateRide(r, i) { if (!r) return r; var st = r.st === 'cancelada' ? (r.fee > 0 ? 'taxa' : 'oferta') : (OLD_ST[r.st] || r.st); var x = Object.assign({}, r, { st: st }); if (x.id === undefined) x.id = i + 1; if (!x.trail) x.trail = []; return x; }

class Component extends DCLogic {
  constructor(props) {
    super(props); var st = this.init('normal', true), saved = storeGet();
    if (saved && saved.v === 2 && saved.data) { PERSIST.forEach(function (k) { if (saved.data[k] !== undefined) st[k] = saved.data[k]; }); st.rides = (st.rides || []).map(migrateRide); st.savedAt = saved.at; st.restored = true; if (st.shift) { st.screen = 'op'; st.tab = 'op'; } }
    this.state = st; this._snap = null; this._pending = null; this._scrollEl = null; this._restore = null; this._lastSaved = null;
  }

  init(sc, online) {
    TODAY = startOfDay(CLOCK.now());
    var H = buildHistory();
    var days = H.days.map(function (x) { return Object.assign({}, x); });
    if (sc === 'pendente') { var lp = days[days.length - 1]; lp.end = null; lp.kmExp = 0; lp.pending = true; }
    return {
      scenario: sc, online: online, screen: 'home', tab: 'op', stack: [], leave: false,
      finTab: 'fin', hSeg: 'evo', evoKey: 'custos', evoPer: 'mes', evoOpen: false, evoHi: null, evoPt: null, resMonth: 'prev', costMonth: 'prev', open: {},
      days: days, fuels: H.fuels, charges: [], vexp: H.vexp, mrecs: H.mrecs, fixos: FIXOS_INI.map(function (f) { return Object.assign({}, f); }), mitems: MAINT_ITEMS.map(function (m) { return Object.assign({}, m); }),
      vehicle: { brand: 'Toyota', model: 'Corolla', year: 2021, color: 'prata', plate: 'ABC-1234', motor: 'flex', combFuel: 'gasolina', tankL: 40, batteryKwh: null, odoStart: H.odoStart, refCons: 11.0, refConsEl: null, ts: genStamp(new Date(2026, 7, 1)) },
      vf: null, recoverInput: '10.280',
      shift: null, odoMode: 'start', ocrRead: 0, odoInput: '', clock: 0,
      offerIdx: 0, cur: null, rides: [], nextRideId: 1, simSel: null, rideSel: null, rf: null, delSel: null, dayClosedAt: null, demoLoaded: false, savedAt: null, restored: false, storeOk: true, confirmClear: false,
      zones: [
        { id: 1, name: 'Centro comercial', place: 'centro', type: 'verde', r: 1.5, tags: [] },
        { id: 2, name: 'Vila Nova', place: 'vilanova', type: 'verde', r: 1.0, tags: [] },
        { id: 3, name: 'Jardim Sul', place: 'jardimsul', type: 'vermelha', r: 1.5, tags: ['risco', 'demanda'] },
        { id: 4, name: 'Pq. Industrial', place: 'industrial', type: 'amarela', r: 1.5, tags: ['terreno'] }
      ],
      nextZoneId: 5, zf: { name: '', place: 'belavista', type: 'amarela', r: '1,5', tags: ['transito'] }, query: 'belavista',
      ff: null, ch: null, ed: null, mTab: 'res', mf: null, mSaved: null, mi: { name: '', intKm: '', intMonths: '' },
      cf: null, menu: null, cat: null, flash: null,
      endOdo: null, dayDone: false, low: 2.5, meta: 3.0
    };
  }

  /* ---------- navegação compartilhada (pilha) ---------- */
  componentDidUpdate() {
    if (this._restore !== null && this._scrollEl) { this._scrollEl.scrollTop = this._restore; this._restore = null; }
    this.persist();
  }
  componentDidMount() { this.persist(); }
  /* grava somente quando os dados mudam (não a cada navegação) */
  persist() {
    var s = this.state, data = {}; PERSIST.forEach(function (k) { data[k] = s[k]; });
    var json = JSON.stringify(data); if (json === this._lastSaved) return; this._lastSaved = json;
    var ok = storeSet({ v: 2, at: CLOCK.now(), data: data }); if (ok !== s.storeOk) this.setState({ storeOk: ok });
  }
  snapEntry() { var s = this.state; return { screen: s.screen, tab: s.tab, finTab: s.finTab, hSeg: s.hSeg, mTab: s.mTab, evoKey: s.evoKey, evoPer: s.evoPer, cat: s.cat, scroll: this._scrollEl ? this._scrollEl.scrollTop : 0 }; }
  formSlice(st) { var k = FORMS[st.screen]; return k ? JSON.stringify(st[k]) : null; }
  isDirty() { var s = this.state; return !!(FORMS[s.screen] && this._snap && this._snap.screen === s.screen && this._snap.json !== this.formSlice(s)); }
  guard(fn) { if (this.isDirty()) { this._pending = fn; this.setState({ leave: true }); } else fn(); }
  nav(screen, extra) { var self = this; this.guard(function () { var st = self.state.stack.concat([self.snapEntry()]); self._restore = 0; self.setState(Object.assign({ screen: screen, stack: st, menu: null, evoOpen: false }, extra || {})); }); }
  back() {
    var self = this;
    this.guard(function () {
      var st = self.state.stack.slice(), e = st.pop();
      if (!e) { self.tabTo(self.state.tab); return; }
      self._restore = e.scroll || 0; self._snap = null;
      self.setState({ screen: e.screen, tab: e.tab, finTab: e.finTab, hSeg: e.hSeg, mTab: e.mTab, evoKey: e.evoKey, evoPer: e.evoPer, cat: e.cat, stack: st, menu: null, evoOpen: false });
    });
  }
  tabTo(tab) { var self = this; this.guard(function () { var sc = tab === 'op' ? (self.state.shift ? 'op' : 'home') : tab; self._restore = 0; self._snap = null; self.setState({ tab: tab, screen: sc, stack: [], menu: null, evoOpen: false }); }); }
  /* saída após salvar: não pergunta, volta à origem */
  done(patch) { this._snap = null; var st = this.state.stack.slice(), e = st.pop(); if (!e) { this.setState(Object.assign({ screen: 'cfg', tab: 'cfg', stack: [] }, patch || {})); return; } this._restore = e.scroll || 0; this.setState(Object.assign({ screen: e.screen, tab: e.tab, finTab: e.finTab, hSeg: e.hSeg, mTab: e.mTab, cat: e.cat, stack: st, menu: null }, patch || {})); }

  /* ---------- dados derivados ---------- */
  lastDay() { var d = this.state.days; return d.length ? d[d.length - 1] : null; }
  lastFinal() { var ld = this.lastDay(); return ld ? ld.end : null; }
  refOdo() { var s = this.state; if (s.shift) return s.endOdo || s.shift.start; var lf = this.lastFinal(); return lf !== null ? lf : 10225; }
  kmPerDay() { var ds = this.state.days.filter(function (x) { return x.end !== null; }); if (ds.length < 2) return 0; var a = ds[Math.max(0, ds.length - 22)], b = ds[ds.length - 1]; var n = Math.max(1, daysBetween(startOfDay(a.d), startOfDay(b.d))); return (b.end - a.start) / n; }
  zoneAt(placeKey) {
    var pt = PLACES[placeKey]; if (!pt) return null;
    var hits = this.state.zones.filter(function (z) { var c = PLACES[z.place]; var dx = c.x - pt.x, dy = c.y - pt.y; return Math.sqrt(dx * dx + dy * dy) <= z.r * 20; });
    if (!hits.length) return { type: 'neutra', name: 'fora de zonas', hits: [], tags: [] };
    hits.sort(function (a, b) { return ZT[a.type].rank - ZT[b.type].rank; });
    var top = hits[0].type, tags = [];
    hits.forEach(function (h) { if (h.type === top) h.tags.forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); }); });
    return { type: top, name: hits[0].name, hits: hits, tags: tags };
  }
  rideSrc(r) { return r.src === 'demo' ? DEMO_RIDES[r.i] : OFFERS[r.i]; }
  rideById(id) { return this.state.rides.filter(function (r) { return r.id === id; })[0] || null; }
  /* oferta associada a um registro (opcional): usada só para título/rota */
  offerOf(r) { if (r.src === 'offer') return OFFERS[r.i]; if (r.src === 'demo') return DEMO_RIDES[r.i]; if (r.of !== null && r.of !== undefined) { var o = this.rideById(r.of); return o ? OFFERS[o.i] : null; } return null; }
  /* Base REALIZADA: somente corridas registradas (valor recebido + km) + taxas de cancelamento. */
  base(rides) {
    var rec = 0, k = 0, fees = 0, n = 0, canc = 0, min = 0;
    (rides || this.state.rides).forEach(function (r) {
      if (r.st === 'taxa') { canc++; if (r.fee > 0) fees += r.fee; return; }
      if (r.st !== 'concluida' || !(r.recv > 0) || !(r.km > 0)) return;
      rec += r.recv; k += r.km; min += r.min || 0; n++;
    });
    return { rec: rec, km: k, fees: fees, n: n, canc: canc, min: min };
  }
  shiftMin() { var s = this.state; if (!s.shift) return 0; var el = Math.max(0, (CLOCK.now() - s.shift.startedAt) / 60000); return Math.max(Math.round(el + s.clock), this.base().min); }
  /* Registro do expediente EM ANDAMENTO: entra na mesma camada de cálculo (km total ainda desconhecido). */
  liveRec() { var s = this.state; if (!s.shift) return null; var b = this.base(); return { d: s.shift.startedAt, start: s.shift.start, end: null, kmExp: null, kmProd: b.km, rec: b.rec, fees: b.fees, rides: b.n, min: this.shiftMin(), today: true, live: true }; }
  /* Fonte única de dados para todos os módulos. */
  data() { var s = this.state, lr = this.liveRec(); return lr ? Object.assign({}, s, { days: s.days.concat([lr]) }) : s; }
  /* Se o expediente já foi fechado, reconsolida o registro do dia a partir dos registros (sem duplicar). */
  consolidate(rides, label) {
    var s = this.state, t = CLOCK.now(), out = { rides: rides };
    if (!s.shift && s.dayDone) {
      var days = s.days.slice(), li = -1; days.forEach(function (x, k) { if (x.today && x.rideList) li = k; });
      if (li >= 0) { var b = this.base(rides), d0 = days[li], ts = Object.assign({}, d0.ts); ts.updatedAt = t; ts.edits = (ts.edits || []).concat([{ campo: label + ' (após fechamento)', de: d0.rec + d0.fees, para: b.rec + b.fees, em: t }]); days[li] = Object.assign({}, d0, { kmProd: b.km, rec: b.rec, fees: b.fees, rides: b.n, rideList: rides, ts: ts }); out.days = days; }
    }
    return out;
  }
  ridePatch(id, patch, trail) {
    var t = CLOCK.now();
    var rides = this.state.rides.map(function (r) { if (r.id !== id) return r; var x = Object.assign({}, r, patch); x.trail = (r.trail || []).concat(trail ? [Object.assign({ em: t }, trail)] : []); x.ts = Object.assign({}, r.ts || stamp(t), { updatedAt: t }); return x; });
    return this.consolidate(rides, 'registro #' + id);
  }
  rideActions(r) {
    var self = this, s = this.state, A = [];
    if (r.st === 'oferta') A.push(['Registrar como corrida', function () { self.newRide(r); }, '#3FE0A0']);
    else if (r.st === 'concluida' || r.st === 'taxa') {
      if (s.delSel === r.id) { A.push(['Confirmar exclusão', function () { var p = self.ridePatch(r.id, { st: 'excluida' }, { acao: 'registro excluído', de: r.st === 'taxa' ? 'Taxa ' + money(r.fee) : money(r.recv), para: 'fora dos cálculos' }); p.delSel = null; self.setState(p); }, '#FF6B7D']); A.push(['Manter', function () { self.setState({ delSel: null }); }, '#8D79D9']); }
      else { A.push(['Corrigir valores', function () { self.openRideForm(r); }, '#B58AF5']); A.push(['Excluir', function () { self.setState({ delSel: r.id }); }, '#FF6B7D']); }
    }
    return A.map(function (x) { return { n: x[0], go: x[1], style: 'flex: 1 1 auto; min-height: 44px; padding: 0 12px; border-radius: 14px; cursor: pointer; font: 600 14px Inter, sans-serif; white-space: nowrap; color: #F3F1FF; background: ' + alpha(x[2], 0.16) + '; border: 1.5px solid ' + alpha(x[2], 0.6) }; });
  }
  /* novo registro (opcionalmente pré-preenchido a partir de uma oferta analisada) */
  newRide(offer) {
    var o = offer ? OFFERS[offer.i] : null;
    this.nav('rideForm', { delSel: null, rf: { id: null, kind: 'corrida', of: offer ? offer.id : null, recv: o ? fmtNum(o.v, 2) : '', km: o ? fmtNum(o.pk + o.tk, 1) : '', min: o ? String(o.pm + o.tm) : '', fee: '', suggested: !!o, err: '' } });
  }
  openRideForm(r) {
    this.nav('rideForm', { rideSel: r.id, delSel: null, rf: { id: r.id, kind: r.st === 'taxa' ? 'taxa' : 'corrida', of: r.of === undefined ? null : r.of,
      recv: r.recv > 0 ? fmtNum(r.recv, 2) : '', km: r.km > 0 ? fmtNum(r.km, 1) : '', min: r.min > 0 ? String(r.min) : '', fee: r.fee > 0 ? fmtNum(r.fee, 2) : '', suggested: false, err: '' } });
  }
  analyze(i) {
    var s = this.state, o = OFFERS[i];
    var sim = simulateOffer(this.base(), o);
    var dz = s.online && o.d ? this.zoneAt(o.d) : null;
    return { o: o, sim: sim, dz: dz, cls: classify(sim, s.meta, dz, o.d ? o.dTxt : '', s.online) };
  }
  barCss(avg) {
    var s = this.state, st = barState(avg, s.meta);
    var pct = avg === null ? 0 : Math.min(1, avg / s.meta) * 100;
    var bg = st === 'destaque' ? 'linear-gradient(90deg, #B58AF5, #6E8BFF); box-shadow: 0 0 12px rgba(140,140,255,.6)' : (st === 'meta' ? '#3FE0A0' : 'linear-gradient(90deg, #F8D15A, #FFA51F)');
    return 'height: 100%; border-radius: 999px; width: ' + pct + '%; background: ' + bg;
  }
  monthRange(which) { var m = which === 'cur' ? new Date(TODAY.getFullYear(), TODAY.getMonth(), 1) : new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1); return { from: m, to: which === 'cur' ? TODAY : addDays(addMonths(m, 1), -1), label: MES[m.getMonth()] + '/' + m.getFullYear(), partial: which === 'cur' }; }
  mItem(id) { return this.state.mitems.filter(function (m) { return m.id === id; })[0]; }
  mName(id) { var m = this.mItem(id); return m ? m.n : id; }
  /* corrige data de um registro existente, preservando a trilha */
  correctDate(coll, id, when) {
    var now = CLOCK.now(), list = this.state[coll].map(function (x) {
      if (x.id !== id) return x;
      var ts = Object.assign({}, x.ts || genStamp(x.d)); ts.edits = (ts.edits || []).concat([{ campo: 'data/hora', de: x.d, para: when, em: now }]); ts.updatedAt = now;
      return Object.assign({}, x, { d: when, ts: ts });
    });
    var p = {}; p[coll] = list; return p;
  }

  renderVals() {
    var self = this, s = this.state, sc = s.screen, D = this.data();
    var nav = function (screen, extra) { return function () { self.nav(screen, extra); }; };
    var now = CLOCK.now();
    if (FORMS[sc] && (!this._snap || this._snap.screen !== sc)) this._snap = { screen: sc, json: this.formSlice(s) };
    if (!FORMS[sc]) this._snap = null;

    /* ---------- cabeçalho compartilhado ---------- */
    var isRoot = !!ROOTS[sc] && s.stack.length === 0;
    var BRAND = { home: 'Gestão da sua operação', op: 'Gestão da sua operação', fin: 'Gestão da sua operação', hist: 'Histórico', cfg: 'Configurações' };
    var tt = TITLES[sc] || ['', ''];
    if (sc === 'camera') tt = ['Hodômetro', s.odoMode === 'final' ? 'Registro final' : 'Registro inicial'];
    if (sc === 'costCat') tt = ['Custos variáveis', s.cat ? VAR_CATS[s.cat].n : ''];
    if (sc === 'costForm') tt = ['Custos operacionais', s.cf && s.cf.id ? 'Editar custo' : (s.cf && s.cf.mode === 'fixo' ? 'Novo custo fixo' : 'Novo custo variável')];
    if (sc === 'hist' && !isRoot) tt = ['Histórico', s.hSeg === 'evo' ? 'Evolutivos' : (s.hSeg === 'of' ? 'Ofertas' : 'Expedientes')];

    /* ---------- hodômetro / expediente ---------- */
    var lf = this.lastFinal(), ld = this.lastDay();
    var pendingPrev = !!(ld && ld.pending && ld.end === null);
    var odoVal = parseInt0(s.odoInput), fin = this.base();
    var odoErr = false, odoErrText = '', odoWarn = false, odoWarnText = '', facts = [];
    if (s.odoMode === 'start') {
      if (isNaN(odoVal)) { odoErr = true; odoErrText = 'Informe a leitura.'; }
      else if (lf !== null && odoVal < lf) { odoErr = true; odoErrText = 'Menor que o último encerramento (' + km(lf) + ').'; }
      else if (lf !== null && odoVal - lf > 500) { odoWarn = true; odoWarnText = 'Diferença alta desde o último encerramento. Confira.'; }
      facts = [
        { k: 'Último encerramento', v: lf !== null ? km(lf) + (ld && ld.est ? ' (estimado)' : '') : '—' },
        { k: 'Km pessoais entre expedientes', v: (!isNaN(odoVal) && lf !== null) ? km(Math.max(0, odoVal - lf)) : '—' },
        { k: 'Registro', v: dmyhm(now) }
      ];
    } else if (s.shift) {
      var tot = odoVal - s.shift.start;
      if (isNaN(odoVal)) { odoErr = true; odoErrText = 'Informe a leitura.'; }
      else if (tot < 0) { odoErr = true; odoErrText = 'Menor que o hodômetro inicial (' + km(s.shift.start) + ').'; }
      else if (tot < fin.km) { odoWarn = true; odoWarnText = 'Km do expediente menor que os km produtivos conferidos. Revise.'; }
      facts = [
        { k: 'Km do expediente', v: !isNaN(odoVal) ? km(Math.max(0, tot)) : '—' },
        { k: 'Km produtivos (confirmados)', v: dec(fin.km, 1) + ' km' },
        { k: 'Km não produtivos', v: !isNaN(odoVal) ? dec(Math.max(0, tot - fin.km), 1) + ' km' : '—' },
        { k: 'Encerramento', v: dmyhm(now) }
      ];
    }
    var camVal = s.odoMode === 'final' && s.shift ? s.shift.start + Math.max(40, Math.round(fin.km * 1.33)) : (s.scenario === 'pendente' ? 10300 : 10225);

    /* ---------- operação ---------- */
    var avg = avgOf(fin), dRef = fin.n > 0 ? fin.km / fin.n : null;
    var req = dRef === null ? s.meta : requiredPerKm(fin, s.meta, dRef), below = avg === null || avg < s.meta, bst = barState(avg, s.meta);
    var hours = this.shiftMin() / 60;
    var opTiles = [
      tile('Por km', avg === null ? '—' : money(avg), '#F6C445', ICON.road),
      tile('Por hora', hours > 0 && fin.n > 0 ? money((fin.rec + fin.fees) / hours) : '—', '#B58AF5', ICON.clock),
      tile('Por corrida', fin.n > 0 ? money(fin.rec / fin.n) : '—', '#4FB3FF', ICON.people),
      tile('Receita total', money(fin.rec + fin.fees), '#3FE0A0', ICON.coins)
    ];
    var regs = s.rides.filter(function (r) { return r.st === 'concluida' || r.st === 'taxa'; });
    var offersAll = s.rides.filter(function (r) { return r.st === 'oferta' && r.src === 'offer'; });

    /* ---------- card da oferta ---------- */
    var of = { valueText: '', pickText: '', tripText: '', oTxt: '', oSub: '', dTxt: '', dSub: '', label: '', c: '#B58AF5', fg: '#000', icon: '', cardStyle: '', impText: '', impColor: '', newAvgText: '', rphText: '', reasons: [], hasReasons: false, note: '', hasNote: false };
    if (s.cur !== null) {
      var A = this.analyze(s.cur), C = CLASSES[A.cls.key], o = A.o;
      var note = !s.online ? 'Sem internet: território não verificado' : (!o.d ? 'Destino não lido: território não verificado' : '');
      of = {
        valueText: money(o.v), pickText: dec(o.pk, 1) + ' km (' + o.pm + ' min) até o passageiro', tripText: dec(o.tk, 1) + ' km (' + o.tm + ' min) de viagem',
        oTxt: o.oTxt, oSub: o.oSub, dTxt: o.dTxt, dSub: o.dSub, label: C.l, c: C.c, fg: C.fg, icon: C.icon,
        cardStyle: 'position: absolute; top: 12px; left: 10px; right: 10px; z-index: 2; border-radius: 24px; padding: 14px 16px 12px; display: flex; flex-direction: column; gap: 10px; background: linear-gradient(160deg, rgba(40,34,86,.97), rgba(20,18,48,.97)); border: 2px solid ' + C.c + '; box-shadow: 0 0 24px ' + alpha(C.c, 0.45) + ', 0 14px 30px rgba(0,0,0,.45)',
        impLabel: 'Impacto na média', impText: A.sim.impact === null ? 'Primeira corrida' : signedMoney(A.sim.impact) + '/km', impColor: A.sim.impact === null ? '#F3F1FF' : C.c, impWs: A.sim.impact === null ? 'normal' : 'nowrap',
        newAvgText: money(A.sim.proj) + '/km', rphText: money(A.sim.rph) + '/h',
        reasons: A.cls.reasons.map(function (k2) { return { n: MOTIVOS[k2], path: MOTIVO_ICON[k2] }; }), hasReasons: A.cls.reasons.length > 0,
        note: note, hasNote: note !== ''
      };
    }
    var simV = { ok: false };
    var rrS = s.simSel !== null ? this.rideById(s.simSel) : null;
    if (rrS && rrS.src === 'offer') {
      var rr = rrS, ro = OFFERS[rr.i], CC = CLASSES[rr.cls.key];
      simV = {
        ok: true, valueText: money(ro.v), kmText: dec(rr.sim.k, 1) + ' km', minText: rr.sim.min + ' min', time: 'Capturada em ' + dmyhm(rr.at) + ' · ' + ro.p,
        impText: rr.sim.impact === null ? '—' : signedMoney(rr.sim.impact) + '/km', impColor: rr.sim.impact === null ? '#F3F1FF' : CC.c,
        projText: money(rr.sim.proj), rphText: money(rr.sim.rph) + '/h', label: CC.l, c: CC.c, fg: CC.fg, icon: CC.icon,
        badge: 'display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 58px; border-radius: 18px; font: 700 18px Inter, sans-serif; background: linear-gradient(180deg, ' + alpha(CC.c, 0.32) + ', ' + alpha(CC.c, 0.14) + '); border: 1.5px solid ' + CC.c + '; color: #FFFFFF',
        reasons: rr.cls.reasons.map(function (k2) { return { n: MOTIVOS[k2], path: MOTIVO_ICON[k2] }; }), hasReasons: rr.cls.reasons.length > 0
      };
    }
    var histItems = [];
    s.rides.forEach(function (r, idx) {
      if (r.src !== 'offer') return;
      var o2 = OFFERS[r.i], C2 = CLASSES[r.cls.key];
      histItems.push({
        l: C2.l, chip: chipStyle(C2.c), platform: o2.p, valueText: money(o2.v), route: PLACES[o2.o].n + ' → ' + (o2.d ? PLACES[o2.d].n : 'não lido'),
        impact: r.sim.impact === null ? '1ª' : signedMoney(r.sim.impact), ic: r.sim.impact === null ? '#B4B0D6' : C2.c,
        status: RIDE_ST[r.st][0] + ' · ' + hm(r.at),
        open: function () { self.nav('offerSim', { simSel: r.id }); }
      });
    });
    histItems.reverse();
    var rideView = function (r) {
      var o3 = self.offerOf(r), L = RIDE_ST[r.st] || RIDE_ST.concluida;
      var title = r.src === 'demo' ? 'Corrida de exemplo ' + (r.i + 1) : (r.st === 'taxa' ? 'Taxa de cancelamento' : (o3 ? o3.p + ' · ' + PLACES[o3.o].n + ' → ' + (o3.d ? PLACES[o3.d].n : 'destino não lido') : 'Corrida registrada'));
      var v, det;
      if (r.st === 'concluida') { v = money(r.recv); det = dec(r.km, 1) + ' km' + (r.min > 0 ? ' · ' + r.min + ' min' : '') + ' · ' + money(r.recv / r.km) + '/km'; }
      else if (r.st === 'taxa') { v = money(r.fee); det = 'Receita de taxa · não conta como corrida'; }
      else { v = '—'; det = 'Oferta analisada'; }
      return { k: r.id, t: title, v: v, s: det + ' · ' + hm(r.doneAt || r.at), sl: L[0], st: chipStyle(L[1]), isDemo: !!r.demo, open: function () { self.nav('ride', { rideSel: r.id, delSel: null }); }, acts: self.rideActions(r) };
    };
    var closeItems = regs.map(rideView);
    var rideRows = regs.slice().reverse().map(rideView);
    /* detalhe e formulário do registro */
    var RS = s.rideSel !== null ? this.rideById(s.rideSel) : null, RSo = RS ? this.offerOf(RS) : null;
    var rd = { ok: !!RS };
    if (RS) {
      var Lr = RIDE_ST[RS.st] || RIDE_ST.concluida, isT = RS.st === 'taxa';
      rd = { ok: true, title: rideView(RS).t, sl: Lr[0], st: chipStyle(Lr[1]), isDemo: !!RS.demo, acts: this.rideActions(RS),
        rows: (isT ? [['Registrada em', dmyhm(RS.doneAt || RS.at)], ['Taxa recebida', money(RS.fee)]] : [
          ['Registrada em', dmyhm(RS.doneAt || RS.at)],
          ['Valor recebido', RS.recv > 0 ? money(RS.recv) : '—'],
          ['Km da corrida', RS.km > 0 ? dec(RS.km, 1) + ' km' : '—'],
          ['Duração', RS.min > 0 ? RS.min + ' min' : 'não informada'],
          ['Receita por km', RS.km > 0 ? money(RS.recv / RS.km) : '—'],
          ['Receita por hora', RS.min > 0 ? money(RS.recv / (RS.min / 60)) : '—']
        ]).concat(RSo && RS.src !== 'demo' ? [['Oferta associada', money(RSo.v) + ' · ' + dec(RSo.pk + RSo.tk, 1) + ' km']] : []).map(function (x) { return { k: x[0], v: x[1] }; }),
        note: RS.st === 'excluida' ? 'Registro excluído: fora dos cálculos (mantido na trilha).' : (isT ? 'Entra uma única vez como receita de taxas; não conta como corrida.' : (RS.st === 'oferta' ? 'Oferta analisada: não é receita.' : 'Conta na receita e nas médias desde o registro.')),
        trail: (RS.trail || []).slice().reverse().map(function (e) { return { t: dmyhm(e.em), s: e.acao + (e.de !== undefined && e.de !== null ? ': ' + e.de + ' → ' + e.para : '') }; }) };
      rd.hasTrail = rd.trail.length > 0;
    }
    var rf = s.rf || { kind: 'corrida', recv: '', km: '', min: '', fee: '', err: '' };
    var setRf = function (patch) { self.setState({ rf: Object.assign({}, s.rf, patch, { err: '' }) }); };
    var linked = function (o) { return regs.some(function (r) { return r.of === o.id; }); };
    var rfOffers = !rf.id ? offersAll.filter(function (o) { return !linked(o); }).slice(-3).reverse().map(function (o) {
      var oo = OFFERS[o.i], on = rf.of === o.id;
      return { t: money(oo.v) + ' · ' + dec(oo.pk + oo.tk, 1) + ' km', sub: oo.p + ' · ' + hm(o.at), style: 'display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 8px 12px; border-radius: 14px; cursor: pointer; text-align: left; color: #F3F1FF; font: 600 14px Inter, sans-serif; background: ' + (on ? 'rgba(63,224,160,.16)' : 'rgba(255,255,255,.04)') + '; border: 1.5px solid ' + (on ? 'rgba(63,224,160,.7)' : 'rgba(181,138,245,.3)'),
        pick: function () { if (on) return setRf({ of: null, suggested: false }); setRf({ of: o.id, recv: fmtNum(oo.v, 2), km: fmtNum(oo.pk + oo.tk, 1), min: String(oo.pm + oo.tm), suggested: true }); } };
    }) : [];

    /* ---------- veículo / combustível / energia ---------- */
    var veh = s.vehicle, ref = this.refOdo();
    var motor = veh ? MOTORS[veh.motor] : null, vFuels = vehicleFuels(veh);
    var cpk = veh ? fuelCpk(s.fuels, veh.refCons) : fuelCpk(s.fuels, null), cons = lastConsumption(s.fuels), ch = consHistory(s.fuels);
    var FS = veh && veh.tankL ? fuelStock(s.fuels, veh.tankL, veh.refCons) : null;
    var SN = FS ? stockNow(FS, ref, cons || (veh && veh.refCons), veh.tankL) : null;
    var ES = energyStats(s.charges, veh);
    var cycById = {}; ch.cycles.forEach(function (c) { cycById[c.endId] = c.cons; });
    var recRows = s.fuels.map(function (f) { return { kind: 'fuel', r: f }; }).concat(s.charges.map(function (c) { return { kind: 'ch', r: c }; }))
      .sort(function (a, b) { return b.r.d - a.r.d || b.r.odo - a.r.odo; }).slice(0, 14).map(function (x) {
        var f = x.r, isF = x.kind === 'fuel', edits = f.ts && f.ts.edits && f.ts.edits.length ? f.ts.edits[f.ts.edits.length - 1] : null, m = 'r' + x.kind + f.id;
        var cc = isF ? cycById[f.id] : null, st = isF && FS ? FS.states[f.id] : null;
        return {
          top: dmyhm(f.d) + ' · ' + km(f.odo) + (f.demo ? ' · exemplo' : ''),
          sub: isF ? (FUEL_N[f.fuel] || 'Combustível') + ' · ' + dec(f.l, 1) + ' L · ' + money(f.p) + '/L · ' + (f.full ? 'cheio' : 'parcial') : 'Recarga · ' + dec(f.kwh, 1) + ' kWh · ' + money(f.p) + '/kWh',
          total: money(isF ? f.l * f.p : f.kwh * f.p),
          cons: isF ? (cc ? dec(cc, 1) + ' km/L' : (st && st.init ? 'início do modelo' : (f.full ? 'ciclo' : 'em ciclo'))) : '',
          cc: cc ? '#3FE0A0' : '#C9C4EC', hasEdit: !!edits, edit: edits ? 'Data corrigida em ' + dmyhm(edits.em) + ' · original ' + dmyhm(edits.de) : '',
          hasWarn: !!(st && st.warn), warn: st ? st.warn : '',
          menuOpen: s.menu === m, menu: function () { self.setState({ menu: s.menu === m ? null : m }); },
          fix: function () { self.nav('editDate', { menu: null, ed: { coll: isF ? 'fuels' : 'charges', id: f.id, date: ddmmyyyy(f.d), time: hm(f.d), err: '' } }); }
        };
      });
    var cyc2 = fuelCycles(s.fuels), cycRows = cyc2.slice(-6).reverse().map(function (c) { return { l: ddmm(c.d), d: km(c.dist) + ' · ' + money(c.cost) + ' · ' + money(c.cpk) + '/km', v: dec(c.cons, 1) + ' km/L' }; });

    /* ---------- financeiro do dia (mesma camada; inclui expediente em andamento) ---------- */
    var todayRecs = s.days.filter(function (x) { return x.today; });
    var dayA = (todayRecs.length || s.shift) ? aggregate(D, TODAY, TODAY, 'pro') : null;
    var finHas = !!dayA, fRec = dayA ? dayA.receita : 0, fRides = dayA ? dayA.rides : 0, fMin = dayA ? dayA.min : 0;
    var fKm = dayA && !dayA.live ? dayA.kmExp : null;
    var fKmBase = fKm === null ? (dayA ? dayA.kmProd : 0) : fKm;
    var finInd = [
      tile(fKm === null ? 'Por km prod.' : 'Por km', fKmBase > 0 ? money(fRec / fKmBase) : '—', '#F6C445', ICON.coins, true),
      tile('Por hora', fMin > 0 && fRides > 0 ? money(fRec / (fMin / 60)) : '—', '#B58AF5', ICON.clock, true),
      tile('Por corrida', fRides > 0 ? money((dayA.rec) / fRides) : '—', '#4FB3FF', ICON.people, true)
    ];
    var finSide = [
      { path: ICON.wheel, v: String(fRides), u: fRides === 1 ? 'corrida' : 'corridas' },
      { path: ICON.route, v: dec(fKmBase, 1), u: fKm === null ? 'km prod.' : 'km' },
      { path: ICON.clock, v: dur(fMin), u: '' }
    ];
    var row = function (k, v, kind, color) {
      var strong = kind === 'total', head = kind === 'head', sub = kind === 'sub';
      return {
        k: k, v: v,
        wrap: 'display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: ' + (strong ? '12px 0 2px; border-top: 1px solid rgba(181,138,245,.22)' : '3px 0') + (sub ? '; padding-left: 14px' : '') + (head ? '; margin-top: 6px' : ''),
        ks: 'margin: 0; min-width: 0; font: ' + (strong || head ? '600 15px' : '400 14px') + ' Inter, sans-serif; color: ' + (sub ? '#C9C4EC' : '#F3F1FF'),
        vs: 'margin: 0; flex: none; white-space: nowrap; font: 600 ' + (strong ? '18px' : '15px') + " 'Space Grotesk', sans-serif; color: " + (color || (sub ? '#C9C4EC' : '#F3F1FF'))
      };
    };
    var dreRows = [];
    if (dayA) {
      var outFuel = 0; s.fuels.forEach(function (f) { if (inRange(f.d, TODAY, TODAY)) outFuel += f.l * f.p; });
      var rc = dayA.resultado >= 0 ? '#3FE0A0' : '#FF6B7D', live = dayA.live;
      var kmB = live ? dayA.kmEst : dayA.kmExp, src = { medido: 'medido no ciclo', ultimo: 'último ciclo medido', referencia: 'referência (estimativa)', estimado: 'estimado', 'sem dados': 'sem dados' }[dayA.cpkSource] || '';
      dreRows = [
        row('Receita bruta', money(dayA.receita), 'head'), row('Corridas registradas (' + dayA.rides + ')', money(dayA.rec), 'sub'), row('Taxas de cancelamento', money(dayA.fees), 'sub'),
        row('(−) Custos estimados', money(dayA.fuelCost + dayA.fixos), 'head'),
        row((motor && !motor.ice ? 'Energia' : 'Combustível') + ' · ' + dec(kmB, 1) + ' km' + (live ? ' produtivos' : '') + ' × ' + (dayA.cpkFuel ? money(dayA.cpkFuel) : '—') + '/km', money(dayA.fuelCost), 'sub'),
        row('  custo/km: ' + src, '', 'sub'),
        row('Custos fixos rateados (1 dia)', money(dayA.fixos), 'sub'), row('Provisões e depreciação', 'método pendente', 'sub'),
        row('(−) Despesas do dia', money(dayA.vexp + dayA.maint), 'head'), row('Custos variáveis lançados', money(dayA.vexp), 'sub'), row('Manutenção paga', money(dayA.maint), 'sub'),
        row(live ? 'Resultado parcial (estimado)' : 'Resultado operacional do dia', money(dayA.resultado), 'total', rc),
        row('Desembolsos efetivos (informativo)', money(outFuel + dayA.vexp + dayA.maint), 'head'), row('Abastecimentos pagos', money(outFuel), 'sub')
      ];
      if (live) dreRows.splice(1, 0, row('Expediente em andamento: km total só no fechamento', '', 'sub'));
    }
    /* ---------- mês ---------- */
    var RM = this.monthRange(s.resMonth), MA = aggregate(D, RM.from, RM.to, true);
    var openG = function (k) { return !!s.open[k]; };
    var tog = function (k) { return function () { var o5 = Object.assign({}, s.open); o5[k] = !o5[k]; self.setState({ open: o5 }); }; };
    var groups = [
      { k: 'rec', t: 'Receita bruta', v: money(MA.receita), c: '#3FE0A0', rows: [['Corridas (' + MA.rides + ')', money(MA.rec)], ['Taxas de cancelamento', money(MA.fees)]] },
      { k: 'est', t: 'Custos estimados', v: money(MA.fuelCost), c: '#F6C445', rows: [['Combustível · ' + km(MA.kmExp + MA.kmEst) + (MA.kmEst ? ' (inclui km produtivos do expediente em andamento)' : '') + ' × ' + (MA.cpkFuel ? money(MA.cpkFuel) : '—') + '/km', money(MA.fuelCost)], ['Manutenção e depreciação (provisões)', 'método pendente']] },
      { k: 'fix', t: 'Custos fixos', v: money(MA.fixos), c: '#6E8BFF', rows: s.fixos.filter(function (f) { return !f.from || f.from <= RM.from; }).map(function (f) { return [f.n + (f.demo ? ' (exemplo)' : ''), money(f.v)]; }) },
      { k: 'var', t: 'Custos variáveis', v: money(MA.vexp), c: '#FF9F43', rows: Object.keys(VAR_CATS).map(function (c2) { return [VAR_CATS[c2].n, money(MA.vcat[c2])]; }) },
      { k: 'man', t: 'Manutenção (paga)', v: money(MA.maint), c: '#E879F9', rows: s.mrecs.filter(function (m) { return inRange(m.d, RM.from, RM.to); }).map(function (m) { return [self.mName(m.item) + ' · ' + ddmm(m.d), money(m.cost)]; }) },
      { k: 'des', t: 'Desembolsos efetivos (informativo)', v: money(MA.fuelV + MA.fixos + MA.vexp + MA.maint), c: '#C9B6F7', rows: [['Abastecimentos pagos', money(MA.fuelV)], ['Fixos', money(MA.fixos)], ['Variáveis', money(MA.vexp)], ['Manutenção', money(MA.maint)]] },
      { k: 'km', t: 'Quilometragem', v: km(MA.kmExp), c: '#8D79D9', rows: [['Em expediente', km(MA.kmExp)], ['Produtivos', km(MA.kmProd)], ['Dias trabalhados', String(MA.days)]] }
    ].map(function (g) { return { t: g.t, v: g.v, dot: 'width: 10px; height: 10px; border-radius: 50%; flex: none; background: ' + g.c, open: openG(g.k), toggle: tog(g.k), sign: openG(g.k) ? '−' : '+', rows: g.rows.map(function (x) { return { k: x[0], v: x[1] }; }) }; });
    var monthsCmp = evoPlan(D, 'hist').pts.map(function (p) { var a = aggMonths(D, p.from, p.to); return { l: p.l, v: a.resultado }; });
    var maxM = Math.max.apply(null, monthsCmp.map(function (x) { return Math.abs(x.v); }).concat([1]));
    var monthBars = monthsCmp.map(function (x) { return { l: x.l, v: money0(x.v), h: Math.max(4, Math.round(Math.abs(x.v) / maxM * 96)) + 'px', c: x.v < 0 ? '#FF6B7D' : (x.l.indexOf('*') >= 0 ? 'linear-gradient(180deg,#B58AF5,#6E8BFF)' : '#8D79D9') }; });
    var CMR = this.monthRange(s.costMonth), CA = aggregate(D, CMR.from, CMR.to, true), cTot = CA.custos;
    var costParts = [{ n: 'Custos fixos', v: CA.fixos, c: '#6E8BFF' }, { n: 'Custos variáveis', v: CA.vexp, c: '#FF9F43' }, { n: 'Combustível e manutenção', v: CA.fuelCost + CA.maint, c: '#A7A3C8' }]
      .map(function (p) { return { n: p.n, v: money(p.v), pct: cTot > 0 ? dec(p.v / cTot * 100, 1) + '%' : '—', dot: 'width: 12px; height: 12px; border-radius: 50%; flex: none; background: ' + p.c, seg: 'height: 100%; background: ' + p.c + '; width: ' + (cTot > 0 ? p.v / cTot * 100 : 0) + '%' }; });
    var cpkTot = CA.kmExp > 0 ? cTot / CA.kmExp : null;

    /* ---------- custos: listas ---------- */
    var fixTotal = s.fixos.reduce(function (a2, f) { return a2 + f.v; }, 0);
    var menuFor = function (id) { return { open: s.menu === id, toggle: function () { self.setState({ menu: s.menu === id ? null : id }); } }; };
    var fixRows = s.fixos.map(function (f) {
      var m = menuFor('f' + f.id);
      return { n: f.n, v: money(f.v), path: FIX_ICON[f.k] || ICON.dots, menuOpen: m.open, menu: m.toggle,
        edit: function () { self.nav('costForm', { cf: { mode: 'fixo', id: f.id, name: f.n, v: dec(f.v, 2), cat: 'outros', retro: false, date: '', time: '', note: '', err: '' } }); },
        del: function () { self.setState({ fixos: s.fixos.filter(function (x) { return x.id !== f.id; }), menu: null }); } };
    });
    var CMv = this.monthRange('cur'), CVA = aggregate(D, CMv.from, CMv.to, true);
    var varRows = Object.keys(VAR_CATS).map(function (c3) {
      var n = s.vexp.filter(function (e) { return e.cat === c3 && inRange(e.d, CMv.from, CMv.to); }).length;
      return { n: VAR_CATS[c3].n, cnt: n + (n === 1 ? ' registro' : ' registros'), v: money(CVA.vcat[c3]), path: VAR_CATS[c3].icon, ic: 'color: ' + VAR_CATS[c3].c + '; display: flex; flex: none', open: function () { self.nav('costCat', { cat: c3 }); } };
    });
    var catRows = !s.cat ? [] : s.vexp.filter(function (e) { return e.cat === s.cat && inRange(e.d, CMv.from, CMv.to); }).sort(function (a2, b2) { return b2.d - a2.d; }).map(function (e) {
      var m = menuFor('v' + e.id), ed = e.ts && e.ts.edits && e.ts.edits.length ? e.ts.edits[e.ts.edits.length - 1] : null;
      return { d: dmyhm(e.d), v: money(e.v), note: (e.note || '') + (ed ? (e.note ? ' · ' : '') + 'data corrigida em ' + dmyhm(ed.em) + ' (original ' + dmyhm(ed.de) + ')' : ''), hasNote: !!(e.note || ed), menuOpen: m.open, menu: m.toggle,
        edit: function () { self.nav('costForm', { cf: { mode: 'var', id: e.id, name: '', cat: e.cat, v: dec(e.v, 2), retro: true, date: ddmmyyyy(e.d), time: hm(e.d), note: e.note || '', err: '' } }); },
        del: function () { self.setState({ vexp: s.vexp.filter(function (x) { return x.id !== e.id; }), menu: null }); } };
    });
    var cf = s.cf || { mode: 'fixo', name: '', v: '', cat: 'lavagem', retro: false, date: '', time: '', note: '', err: '' };
    var setCf = function (patch) { self.setState({ cf: Object.assign({}, s.cf, patch) }); };

    /* ---------- manutenção ---------- */
    var kpd = this.kmPerDay(), MS = maintStatus(s, ref, kpd);
    var stLabel = { emdia: ['Em dia', '#3FE0A0'], proxima: ['Próxima', '#F6C445'], vencida: ['Vencida', '#FF6B7D'] };
    var counts = { emdia: 0, proxima: 0, vencida: 0 }; MS.forEach(function (x) { counts[x.st]++; });
    var nextList = MS.filter(function (x) { return x.st !== 'emdia'; }).sort(function (a2, b2) { return (a2.st === 'vencida' ? 0 : 1) - (b2.st === 'vencida' ? 0 : 1); }).map(function (x) {
      var L = stLabel[x.st];
      var sub = x.st === 'vencida' ? (x.remKm !== null && x.remKm < 0 ? 'Vencida há ' + km(-x.remKm) : 'Vencida') : [x.remKm !== null ? 'Em ' + km(x.remKm) + (x.estDays !== null ? ' (≈ ' + x.estDays + ' dias)' : '') : null, x.remDays !== null ? (x.remKm !== null ? 'ou ' : 'Em ') + x.remDays + ' dias' : null].filter(Boolean).join(' ');
      return { n: x.it.n, path: ICON[x.it.icon], sub: sub + (x.it.safety ? ' · inspeção física' : ''), badge: x.nextKm !== null ? (x.st === 'vencida' ? 'Vencida' : km(x.nextKm)) : (x.nextDate ? ddmm(x.nextDate) : '—'), chip: chipStyle(L[1]), ic: 'color: ' + L[1] + '; display: flex; flex: none' };
    });
    var forecast = 0; MS.forEach(function (x) { if (x.st === 'vencida' || (x.estDays !== null && x.estDays <= 30) || (x.remDays !== null && x.remDays <= 30)) forecast += x.cost; });
    var agenda = MS.map(function (x) {
      var L = stLabel[x.st];
      return { n: x.it.n, path: ICON[x.it.icon], every: (x.it.intKm ? 'A cada ' + km(x.it.intKm) : '') + (x.it.intKm && x.it.intMonths ? ' ou ' : '') + (x.it.intMonths ? x.it.intMonths + ' meses' : ''),
        prog: x.nextKm !== null ? fmtInt(x.lastKm) + ' / ' + km(x.nextKm) : (x.lastDate ? ddmm(x.lastDate) + ' → ' + (x.nextDate ? ddmm(x.nextDate) : '') : ''),
        bar: 'height: 100%; border-radius: 999px; width: ' + Math.round(x.progress * 100) + '%; background: ' + L[1],
        badge: x.st === 'vencida' ? 'Vencida' : (x.remKm !== null ? 'Em ' + km(x.remKm) : 'Em ' + x.remDays + ' dias'), chip: chipStyle(L[1]), ic: 'color: ' + L[1] + '; display: flex; flex: none' };
    });
    var mhist = s.mrecs.slice().sort(function (a2, b2) { return b2.d - a2.d; }).map(function (m) {
      var ed = m.ts && m.ts.edits && m.ts.edits.length ? m.ts.edits[m.ts.edits.length - 1] : null, mk = 'm' + m.id;
      return { n: self.mName(m.item), sub: dmyhm(m.d) + ' · ' + km(m.km), v: money(m.cost), obs: (m.obs || '') + (ed ? (m.obs ? ' · ' : '') + 'data corrigida em ' + dmyhm(ed.em) + ' (original ' + dmyhm(ed.de) + ')' : ''), hasObs: !!(m.obs || ed), path: ICON[(self.mItem(m.item) || {}).icon || 'wrench'],
        menuOpen: s.menu === mk, menu: function () { self.setState({ menu: s.menu === mk ? null : mk }); },
        fix: function () { self.nav('editDate', { menu: null, ed: { coll: 'mrecs', id: m.id, date: ddmmyyyy(m.d), time: hm(m.d), err: '' } }); } };
    });
    var mCostTotal = s.mrecs.reduce(function (a2, m) { return a2 + m.cost; }, 0);
    var mCostByItem = s.mitems.map(function (it) { var t = 0, n = 0; s.mrecs.forEach(function (m) { if (m.item === it.id) { t += m.cost; n++; } }); return { n: it.n, v: money(t), cnt: n + (n === 1 ? ' registro' : ' registros'), has: n > 0 }; }).filter(function (x) { return x.has; });
    var mf = s.mf || { item: 'oleo', km: '', cost: '', obs: '', retro: false, date: '', time: '' };
    var mfKm = parseInt0(mf.km === '' ? String(ref) : mf.km), mfCost = parseDec(mf.cost), mfIt = this.mItem(mf.item);
    var mfWhen = mf.retro ? parseWhen(mf.date, mf.time) : now;
    var mfErr = isNaN(mfKm) ? 'Informe a quilometragem.' : (isNaN(mfCost) || mfCost < 0 ? 'Informe o custo.' : (!mfWhen ? 'Data/hora inválida (dd/mm/aaaa e hh:mm).' : (mfWhen > now ? 'A data não pode ser futura.' : '')));
    var setMf = function (patch) { self.setState({ mf: Object.assign({}, s.mf, patch), mSaved: null }); };

    /* ---------- formulários com data automática ---------- */
    var whenBlock = function (key, obj) {
      var o6 = obj || {};
      return { auto: !o6.retro, retro: !!o6.retro, nowText: dmyhm(now) + ' · relógio do aparelho (' + offStr(now) + ')', date: o6.date || '', time: o6.time || '',
        toRetro: function () { var p = {}; p[key] = Object.assign({}, self.state[key], { retro: true, date: ddmmyyyy(now), time: hm(now) }); self.setState(p); },
        toAuto: function () { var p = {}; p[key] = Object.assign({}, self.state[key], { retro: false, date: '', time: '' }); self.setState(p); },
        onDate: function (e) { var p = {}; p[key] = Object.assign({}, self.state[key], { date: e.target.value, err: '' }); self.setState(p); },
        onTime: function (e) { var p = {}; p[key] = Object.assign({}, self.state[key], { time: e.target.value, err: '' }); self.setState(p); } };
    };
    var ff = s.ff || { odo: '', l: '', p: '5,89', full: true, fuel: 'gasolina', retro: false };
    var ffL = parseDec(ff.l), ffP = parseDec(ff.p), ffOdo = parseInt0(ff.odo === '' ? String(ref) : ff.odo), ffWhen = ff.retro ? parseWhen(ff.date, ff.time) : now;
    var lastFuelOdo = s.fuels.length ? Math.max.apply(null, s.fuels.map(function (f) { return f.odo; })) : 0;
    var ffErr = isNaN(ffL) || ffL <= 0 ? 'Informe os litros.' : (isNaN(ffP) || ffP <= 0 ? 'Informe o preço por litro.' : (isNaN(ffOdo) || ffOdo <= lastFuelOdo ? 'Hodômetro deve ser maior que o do último abastecimento (' + km(lastFuelOdo) + ').' : (!ffWhen ? 'Data/hora inválida.' : (ffWhen > now ? 'A data não pode ser futura.' : (veh && veh.tankL && ffL > veh.tankL ? 'Litros acima da capacidade do tanque (' + veh.tankL + ' L).' : '')))));
    var chf = s.ch || { odo: '', kwh: '', p: '', full: false, retro: false };
    var chK = parseDec(chf.kwh), chP = parseDec(chf.p), chOdo = parseInt0(chf.odo === '' ? String(ref) : chf.odo), chWhen = chf.retro ? parseWhen(chf.date, chf.time) : now;
    var chErr = isNaN(chK) || chK <= 0 ? 'Informe os kWh.' : (isNaN(chP) || chP <= 0 ? 'Informe o preço por kWh.' : (isNaN(chOdo) ? 'Informe o hodômetro.' : (!chWhen ? 'Data/hora inválida.' : (chWhen > now ? 'A data não pode ser futura.' : ''))));
    var ed = s.ed || { date: '', time: '', err: '' }, edWhen = parseWhen(ed.date, ed.time);
    var edErr = !edWhen ? 'Data/hora inválida (dd/mm/aaaa e hh:mm).' : (edWhen > now ? 'A data não pode ser futura.' : '');
    var edRec = s.ed ? (s[s.ed.coll] || []).filter(function (x) { return x.id === s.ed.id; })[0] : null;

    /* ---------- veículo: formulário ---------- */
    var vf = s.vf || {};
    var vfMotor = vf.motor ? MOTORS[vf.motor] : null;
    var vfErr = !String(vf.brand || '').trim() || !String(vf.model || '').trim() ? 'Informe marca e modelo.' : (!vf.motor ? 'Escolha a motorização.' :
      (vfMotor.ice && !(parseDec(vf.tankL) > 0) ? 'Informe a capacidade do tanque (litros).' : (vf.motor === 'eletrico' && !(parseDec(vf.batteryKwh) > 0) ? 'Informe a capacidade da bateria (kWh).' :
      (!(parseInt0(vf.odoStart) >= 0) ? 'Informe o hodômetro inicial.' : (vf.year && !(parseInt0(vf.year) >= 1950 && parseInt0(vf.year) <= TODAY.getFullYear() + 1) ? 'Ano inválido.' : '')))));
    var setVf = function (patch) { self.setState({ vf: Object.assign({}, s.vf, patch) }); };
    var vCol = veh ? vehColor(veh.color) : null, vPhoto = vehPhoto(veh);
    var vehRows = !veh ? [] : [
      ['Marca e modelo', veh.brand + ' ' + veh.model], ['Ano', veh.year ? String(veh.year) : '—'], ['Cor', vCol ? vCol[1] : 'não informada'], ['Placa', veh.plate || '—'], ['Motorização', MOTORS[veh.motor].n],
      ['Combustível', veh.motor === 'eletrico' ? 'Energia elétrica (recarga)' : (veh.motor === 'flex' ? 'Gasolina ou etanol (escolhido em cada abastecimento)' : (veh.motor === 'hibrido' ? (veh.combFuel === 'flex' ? 'Flex (gasolina ou etanol)' : FUEL_N[veh.combFuel]) + ' · sem recarga externa' : FUEL_N[veh.motor]))],
      ['Capacidade', [veh.tankL ? veh.tankL + ' L (tanque)' : null, veh.batteryKwh ? fmtNum(veh.batteryKwh, 1) + ' kWh (bateria)' : null].filter(Boolean).join(' · ') || '—'],
      ['Hodômetro atual', km(ref)], ['Hodômetro no cadastro', km(veh.odoStart)], ['Consumo de referência', [motor.ice && veh.refCons ? dec(veh.refCons, 1) + ' km/L' : null, motor.el && veh.refConsEl ? dec(veh.refConsEl, 1) + ' km/kWh' : null].filter(Boolean).join(' · ') || '—']
    ].map(function (x) { return { k: x[0], v: x[1] }; });

    /* ---------- evolutivos ---------- */
    var evoDef = EVO.filter(function (e) { return e.k === s.evoKey; })[0];
    var famInfo = EVO_FAM[evoDef.k], plan = evoPlan(D, s.evoPer);
    var series = famInfo ? FAMILIES[famInfo[0]] : [[evoDef.k, evoDef.n, '#B58AF5', evoDef.f, !!evoDef.monthOnly]];
    var mainKey = famInfo ? famInfo[1] : evoDef.k;
    var mainSer = series.filter(function (x) { return x[0] === mainKey; })[0];
    var evoNA = false; /* fixos rateados por dia: todos os indicadores disponíveis em todos os períodos */
    var aggs = evoNA || evoDef.list ? [] : plan.pts.map(function (p) { return p.empty ? null : aggFor(D, p); });
    var pick = function (a, ser) { if (!a) return null; var v = ser[3](a); return v === undefined ? null : v; };
    var evoCur = null, evoPrev = null, evoDelta = null, prevNote = '';
    if (!evoNA && !evoDef.list && plan.cur) {
      evoCur = pick(aggFor(D, plan.cur), mainSer);
      if (plan.prev) {
        if (hasData(D, plan.prev.from, plan.prev.to)) { evoPrev = pick(aggFor(D, plan.prev), mainSer); evoDelta = evoPrev !== null && evoPrev !== 0 && evoCur !== null ? (evoCur - evoPrev) / Math.abs(evoPrev) : null; }
        else prevNote = 'Sem dados de ' + plan.prevLabel + ' para comparar.';
      } else prevNote = 'Histórico completo: sem período anterior equivalente.';
    }
    var W = 320, Hc = 170, padL = 6, padR = 6, padT = 14, padB = 10, allV = [];
    series.forEach(function (ser) { aggs.forEach(function (a) { var v = pick(a, ser); if (v !== null && !isNaN(v)) allV.push(v); }); });
    var zeroBase = !!famInfo, vmin = allV.length ? Math.min.apply(null, zeroBase ? allV.concat([0]) : allV) : 0, vmax = allV.length ? Math.max.apply(null, allV) : 1;
    if (vmax === vmin) { vmax = vmin + 1; vmin = vmin - 1; } var span = vmax - vmin; vmax += span * 0.08; if (vmin < 0 || !zeroBase) vmin -= span * 0.12;
    var X = function (i) { return plan.pts.length > 1 ? padL + i * (W - padL - padR) / (plan.pts.length - 1) : W / 2; };
    var Y = function (v) { return padT + (1 - (v - vmin) / (vmax - vmin)) * (Hc - padT - padB); };
    var hi = s.evoHi && series.some(function (x) { return x[0] === s.evoHi; }) ? s.evoHi : null;
    var evoLines = series.map(function (ser) {
      var d = '', started = false, pts2 = [];
      aggs.forEach(function (a, i) { var v = pick(a, ser); if (v === null || isNaN(v)) { started = false; return; } var x = X(i), y = Y(v); d += (started ? ' L' : ' M') + x.toFixed(1) + ' ' + y.toFixed(1); started = true; pts2.push({ i: i, x: x, y: y }); });
      var on = hi === null || hi === ser[0];
      var toggle = function () { self.setState({ evoHi: self.state.evoHi === ser[0] ? null : ser[0] }); };
      return { k: ser[0], n: ser[1], c: ser[2], d: d.trim(), toggle: toggle,
        stroke: 'stroke: ' + ser[2] + '; stroke-width: ' + (hi === ser[0] ? 4 : (ser[0] === mainKey && hi === null ? 3 : 2.2)) + '; opacity: ' + (on ? 1 : 0.22),
        dots: pts2.map(function (p) { var sel = s.evoPt === p.i; return { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: sel ? 6 : (hi === ser[0] ? 4.5 : 3.2), st: 'fill: ' + (sel ? '#FFFFFF' : ser[2]) + '; stroke: ' + ser[2] + '; stroke-width: 2; opacity: ' + (on ? 1 : 0.25), pick: function () { self.setState({ evoPt: self.state.evoPt === p.i ? null : p.i }); } }; }),
        chip: 'display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px; border-radius: 999px; cursor: pointer; font: 600 12.5px Inter, sans-serif; white-space: nowrap; color: #F3F1FF; ' + (hi === ser[0] ? 'background: ' + alpha(ser[2], 0.28) + '; border: 1.5px solid ' + ser[2] : 'background: rgba(17,15,42,.5); border: 1.5px solid ' + (on ? alpha(ser[2], 0.45) : 'rgba(181,138,245,.15)') + '; opacity: ' + (on ? 1 : 0.55)),
        dot: 'width: 10px; height: 10px; border-radius: 50%; background: ' + ser[2] };
    });
    var evoHits = [];
    plan.pts.forEach(function (p, i) { if (aggs[i]) evoHits.push({ x: (X(i) - 12).toFixed(1), w: 24, pick: function () { self.setState({ evoPt: self.state.evoPt === i ? null : i }); } }); });
    var ptSel = s.evoPt !== null && s.evoPt < plan.pts.length && aggs[s.evoPt] ? s.evoPt : null;
    var ptDetail = ptSel === null ? [] : series.map(function (ser) { var v = pick(aggs[ptSel], ser); return { n: ser[1], v: fmtUnit(v, evoDef.u === 'km' || evoDef.u === 'min' || evoDef.u === 'kml' ? evoDef.u : 'money'), dot: 'width: 10px; height: 10px; border-radius: 50%; flex: none; background: ' + ser[2], st: 'display: flex; align-items: center; gap: 10px; min-height: 34px; padding: 0 8px; border-radius: 10px; ' + (hi === ser[0] || (hi === null && ser[0] === mainKey) ? 'background: rgba(181,138,245,.16)' : '') }; });
    var gridY = [vmax, (vmax + vmin) / 2, vmin].map(function (v) { return { y: Y(v).toFixed(1), l: Math.abs(v) >= 1000 ? fmtNum(v / 1000, 1) + ' mil' : fmtNum(v, Math.abs(v) < 10 ? 2 : 0) }; });
    var groupsEvo = [];
    EVO.forEach(function (e) { if (e.g) groupsEvo.push({ g: e.g, items: [] }); groupsEvo[groupsEvo.length - 1].items.push({ n: e.n, style: 'display: flex; width: 100%; align-items: center; min-height: 44px; padding: 0 14px; border: 0; border-radius: 12px; cursor: pointer; text-align: left; font: 500 15px Inter, sans-serif; ' + (e.k === s.evoKey ? 'background: rgba(181,138,245,.22); color: #FFFFFF' : 'background: transparent; color: #E4DEFA'), pick: function () { self.setState({ evoKey: e.k, evoOpen: false, evoHi: null, evoPt: null }); } }); });
    var evoColor = changeColor(evoDef.nat, evoDelta);

    /* ---------- território ---------- */
    var mapZones = s.zones.map(function (z) { var p = PLACES[z.place], r = z.r * 20, c = ZT[z.type].c; return { style: 'position: absolute; left: ' + (p.x - r) + 'px; top: ' + (p.y - r) + 'px; width: ' + (2 * r) + 'px; height: ' + (2 * r) + 'px; border-radius: 50%; background: ' + alpha(c, 0.16) + '; border: 2px solid ' + c + '; box-shadow: 0 0 16px ' + alpha(c, 0.35) }; });
    var mapPlaces = Object.keys(PLACES).map(function (k) { var p = PLACES[k], q = s.query === k; return { n: p.n, dot: 'position: absolute; left: ' + (p.x - 5) + 'px; top: ' + (p.y - 5) + 'px; width: 10px; height: 10px; border-radius: 50%; background: ' + (q ? '#FFFFFF' : '#D8D4F2') + '; box-shadow: 0 0 0 3px ' + (q ? '#B58AF5' : 'rgba(25,24,47,.8)'), lab: 'position: absolute; left: ' + (p.x + 9) + 'px; top: ' + (p.y - 8) + 'px; font: 600 11px Inter, sans-serif; color: #EDEBFA; white-space: nowrap; text-shadow: 0 1px 2px #19182F' }; });
    var qz = this.zoneAt(s.query);
    var chips = function (cur, setter) { return Object.keys(PLACES).map(function (k) { return { n: PLACES[k].n, style: pillStyle(cur === k), pick: function () { setter(k); } }; }); };
    var zfR = parseDec(s.zf.r), zfErr = isNaN(zfR) || zfR <= 0;
    var zCount = { verde: 0, amarela: 0, vermelha: 0 }; s.zones.forEach(function (z) { zCount[z.type]++; });

    /* ---------- linha do tempo ---------- */
    var timeline = [], lastDays = s.days.slice(-4);
    lastDays.forEach(function (x, i) {
      if (i > 0) { var prev = lastDays[i - 1]; if (prev.end !== null) timeline.push({ t: 'Uso pessoal', s: 'entre ' + ddmm(prev.d) + ' e ' + ddmm(x.d), v: km(x.start - prev.end), c: '#4A4572', r: '3px' }); }
      timeline.push({ t: 'Expediente ' + ddmm(x.d), s: fmtInt(x.start) + ' → ' + (x.end === null ? 'pendente' : fmtInt(x.end)) + (x.est ? ' · final ESTIMADO (informado em ' + (x.changedAt || '') + ')' : (x.end === null ? '' : ' · foto confirmada')) + (x.ts && x.today ? ' · ' + hm(x.ts.at) + '–' + hm(x.ts.endedAt || x.ts.at) : ''), v: x.end === null ? '—' : km(x.end - x.start), c: x.est ? '#F6C445' : (x.today ? '#3FE0A0' : '#B58AF5'), r: '50%' });
    });
    if (s.shift) { var lde = s.days[s.days.length - 1]; if (lde && lde.end !== null && !lde.today) timeline.push({ t: 'Uso pessoal', s: 'entre ' + ddmm(lde.d) + ' e ' + ddmm(TODAY), v: km(s.shift.start - lde.end), c: '#4A4572', r: '3px' }); timeline.push({ t: 'Expediente ' + ddmm(TODAY), s: 'em andamento desde ' + hm(s.shift.startedAt) + ' · ' + km(s.shift.start), v: '—', c: '#3FE0A0', r: '50%' }); }

    var navStyle = function (on) { return on ? 'color: #FFFFFF; background: linear-gradient(180deg, #8F62F2, #6C3FD6); box-shadow: 0 4px 16px rgba(124,77,230,.45)' : 'color: #E4DEFA'; };
    var alertsN = counts.vencida + counts.proxima;
    var cfgEntry = function (screen, extra) { return function () { self.nav(screen, Object.assign({ tab: 'cfg' }, extra || {})); }; };
    var fuelOk = !!veh;
    var isDemo = function (l) { return (l || []).some(function (x) { return x.demo; }); };
    var hasDemo = isDemo(s.days) || isDemo(s.fuels) || isDemo(s.vexp) || isDemo(s.mrecs) || isDemo(s.fixos) || isDemo(s.rides);

    return {
      scrollRef: function (el) { self._scrollEl = el; },
      /* moldura */
      isBrand: isRoot, isBack: !isRoot, brandSub: BRAND[sc] || '', backSub: tt[0], backTitle: tt[1], hasBackSub: tt[0] !== '', goBack: function () { self.back(); },
      hasAlerts: alertsN > 0, bellLabel: 'Alertas de manutenção (' + alertsN + ')', goAlerts: function () { self.nav('maint', { tab: 'cfg', mTab: 'res' }); }, goCfg: function () { self.tabTo('cfg'); },
      navOp: navStyle(s.tab === 'op'), navFin: navStyle(s.tab === 'fin'), navHist: navStyle(s.tab === 'hist'), navCfg: navStyle(s.tab === 'cfg'),
      tabOp: function () { self.tabTo('op'); }, tabFin: function () { self.tabTo('fin'); }, tabHist: function () { self.tabTo('hist'); }, tabCfg: function () { self.tabTo('cfg'); },
      leave: s.leave, leaveStay: function () { self._pending = null; self.setState({ leave: false }); },
      leaveGo: function () { var fn = self._pending; self._pending = null; self._snap = null; self.setState({ leave: false }); if (fn) fn(); },
      hasFlash: !!s.flash, flash: s.flash || '',
      isHome: sc === 'home', isRecover: sc === 'recover', isCamera: sc === 'camera', isConfirm: sc === 'confirm', isOp: sc === 'op', isOffer: sc === 'offer', isOfferSim: sc === 'offerSim',
      isClose: sc === 'close', isClosed: sc === 'closed', isFin: sc === 'fin', isRides: sc === 'rides', isDre: sc === 'dre', isHist: sc === 'hist',
      isCfg: sc === 'cfg', isVeh: sc === 'veh', isVehForm: sc === 'vehForm', isCfgMeta: sc === 'cfgMeta', isTerr: sc === 'terr', isZoneForm: sc === 'zoneForm', isPref: sc === 'pref',
      isFuel: sc === 'fuel', isFuelForm: sc === 'fuelForm', isChargeForm: sc === 'chargeForm', isEditDate: sc === 'editDate',
      isCosts: sc === 'costs', isCostFix: sc === 'costFix', isCostVar: sc === 'costVar', isCostKm: sc === 'costKm', isCostCat: sc === 'costCat', isCostForm: sc === 'costForm',
      isMaint: sc === 'maint', isMaintReg: sc === 'maintReg', isMaintItem: sc === 'maintItem',
      /* início */
      pendingPrev: pendingPrev, alertsTitle: alertsN + (alertsN === 1 ? ' alerta preventivo' : ' alertas preventivos'),
      alertsSub: MS.filter(function (x) { return x.st !== 'emdia'; }).map(function (x) { return x.it.n; }).slice(0, 2).join(' · ') + (alertsN > 2 ? ' · …' : ''),
      lastRecordText: pendingPrev ? 'pendente (' + ddmm(ld.d) + ')' : (lf !== null ? km(lf) + (ld && ld.est ? ' (estimado)' : '') : '—'),
      goRecover: nav('recover'), goMaint: function () { self.nav('maint', { tab: 'cfg', mTab: 'res' }); },
      goCameraStart: function () { self.nav('camera', { odoMode: 'start' }); },
      scNormalStyle: pillStyle(s.scenario === 'normal', '#F6C445'), scPendStyle: pillStyle(s.scenario === 'pendente', '#F6C445'),
      scNormal: function () { self._snap = null; self.setState(self.init('normal', s.online)); }, scPend: function () { self._snap = null; self.setState(self.init('pendente', s.online)); },
      onStyle: pillStyle(s.online, '#F6C445'), offStyle: pillStyle(!s.online, '#F6C445'),
      setOnline: function () { self.setState({ online: true }); }, setOffline: function () { self.setState({ online: false }); },
      recStartText: ld ? km(ld.start) + ' · foto · ' + ddmm(ld.d) : '',
      recoverInput: s.recoverInput, onRecoverInput: function (e) { self.setState({ recoverInput: e.target.value }); },
      recoverErr: !(ld && parseInt0(s.recoverInput) >= ld.start), recoverErrText: 'Deve ser maior ou igual ao início daquele expediente (' + (ld ? km(ld.start) : '') + ').',
      confirmRecover: function () {
        var n = parseInt0(s.recoverInput); if (!(ld && n >= ld.start)) return;
        var days = s.days.slice(), ts = Object.assign({}, ld.ts || genStamp(ld.d)); ts.edits = (ts.edits || []).concat([{ campo: 'hodômetro final', de: null, para: n, em: CLOCK.now() }]); ts.updatedAt = CLOCK.now();
        days[days.length - 1] = Object.assign({}, ld, { end: n, kmExp: n - ld.start, est: true, original: null, changedAt: dmyhm(CLOCK.now()), pending: false, ts: ts });
        self.nav('camera', { days: days, odoMode: 'start' });
      },
      camDigits: String(camVal).padStart(6, '0').split(''),
      capture: function () { self.nav('confirm', { ocrRead: camVal, odoInput: fmtInt(camVal) }); },
      ocrText: km(s.ocrRead), odoInput: s.odoInput, onOdoInput: function (e) { self.setState({ odoInput: e.target.value }); },
      odoCorrected: !isNaN(odoVal) && odoVal !== s.ocrRead, odoErr: odoErr, odoErrText: odoErrText, odoWarn: odoWarn, odoWarnText: odoWarnText,
      confirmFacts: facts, confirmLabel: s.odoMode === 'final' ? 'Confirmar e encerrar' : 'Confirmar e iniciar expediente',
      confirmOdo: function () {
        if (odoErr) return; var t = CLOCK.now();
        if (s.odoMode === 'start') {
          self._restore = 0; self.setState({ shift: { start: odoVal, startedAt: t, ts: stamp(t) }, screen: 'op', tab: 'op', stack: [], dayDone: false, endOdo: null, clock: 0, rides: [], nextRideId: 1, offerIdx: 0, cur: null, demoLoaded: false });
        } else {
          var b = self.base(), ts = Object.assign(stamp(s.shift.startedAt), { endedAt: t });
          ts.review = { em: t, corridas: b.n, taxas: b.canc, ofertasAnalisadas: s.rides.filter(function (r) { return r.st === 'oferta'; }).length };
          var rec = { d: s.shift.startedAt, start: s.shift.start, end: odoVal, kmExp: odoVal - s.shift.start, kmProd: b.km, rec: b.rec, fees: b.fees, rides: b.n, min: self.shiftMin(), today: true, ts: ts, rideList: s.rides };
          self._restore = 0; self.setState({ endOdo: odoVal, shift: null, dayDone: true, dayClosedAt: t, days: s.days.concat([rec]), screen: 'closed', tab: 'fin', finTab: 'fin', stack: [{ screen: 'fin', tab: 'fin', finTab: 'fin', hSeg: s.hSeg, mTab: s.mTab, evoKey: s.evoKey, evoPer: s.evoPer, cat: null, scroll: 0 }] });
        }
      },
      /* operação */
      shiftTimeText: s.shift ? 'Iniciado às ' + hm(s.shift.startedAt) + ' • ' + Math.floor(s.clock / 60) + 'h' + pad(Math.round(s.clock % 60)) : '',
      reqText: '≥ ' + money(Math.max(0, req)) + '/km', reqColor: below ? '#F6C445' : (bst === 'destaque' ? '#A9B6FF' : '#3FE0A0'),
      barStyle: this.barCss(avg), opTiles: opTiles, metaText: money(s.meta),
      opNote: fin.n === 0 ? 'Nenhuma corrida registrada ainda' : fin.n + (fin.n === 1 ? ' corrida registrada' : ' corridas registradas'),
      hasOpNote: true,
      goNewRide: function () { self.newRide(null); },
      opHint: 'Médias do expediente: referência para avaliar as próximas ofertas, não garantia de ganho.',
      noMoreOffers: s.offerIdx >= OFFERS.length,
      nextOfferLabel: s.offerIdx >= OFFERS.length ? 'Fim das ofertas simuladas' : 'Receber oferta ' + (s.offerIdx + 1) + ' de ' + OFFERS.length,
      nextOffer: function () { if (s.offerIdx >= OFFERS.length) return; self.setState({ cur: s.offerIdx, offerIdx: s.offerIdx + 1, screen: 'offer' }); },
      demoLabel: s.demoLoaded ? 'Exemplo carregado' : 'Carregar 2 corridas registradas (exemplo)', demoDisabled: s.demoLoaded,
      loadDemo: function () { if (s.demoLoaded) return; var t = CLOCK.now(), n0 = s.nextRideId; self.setState({ demoLoaded: true, clock: s.clock + 40, nextRideId: n0 + DEMO_RIDES.length, rides: DEMO_RIDES.map(function (d, i) { return { id: n0 + i, src: 'demo', demo: true, i: i, st: 'concluida', recv: d.v, km: d.pk + d.tk, min: d.pm + d.tm, at: t, doneAt: t, ts: stamp(t), trail: [{ acao: 'exemplo carregado', em: t }] }; }).concat(s.rides) }); },
      goClose: nav('close'), of: of,
      closeOffer: function () { var a2 = self.analyze(s.cur), t = CLOCK.now(); self.setState({ rides: s.rides.concat([{ id: s.nextRideId, src: 'offer', i: s.cur, st: 'oferta', cls: a2.cls, sim: a2.sim, at: t, ts: stamp(t), fee: null, recv: null, km: null, min: null, trail: [{ acao: 'oferta analisada', em: t }] }]), nextRideId: s.nextRideId + 1, clock: s.clock + 20, screen: 'op', cur: null }); },
      sim: simV, closeSim: function () { self.back(); },
      /* histórico */
      histItems: histItems, histEmpty: histItems.length === 0, timeline: timeline,
      hsEvo: s.hSeg === 'evo', hsOf: s.hSeg === 'of', hsEx: s.hSeg === 'ex',
      hSegs: [['evo', 'Evolutivos'], ['of', 'Ofertas'], ['ex', 'Expedientes']].map(function (x) { return { n: x[1], style: tabBtn(s.hSeg === x[0]), go: function () { self.setState({ hSeg: x[0], evoOpen: false }); } }; }),
      evoName: evoDef.n, evoOpen: s.evoOpen, toggleEvo: function () { self.setState({ evoOpen: !s.evoOpen }); }, evoGroups: groupsEvo,
      evoPers: PERIODS.map(function (x) { return { n: x[1], style: tabBtn(s.evoPer === x[0]), go: function () { self.setState({ evoPer: x[0], evoPt: null }); } }; }),
      evoNA: evoNA, evoIsList: !!evoDef.list, evoShowChart: !evoDef.list && !evoNA,
      evoCurText: fmtUnit(evoCur, evoDef.u), evoCurLabel: plan.curLabel,
      evoPrevText: evoPrev === null ? prevNote : 'Anterior (' + plan.prevLabel + '): ' + fmtUnit(evoPrev, evoDef.u),
      hasEvoDelta: evoDelta !== null, evoDeltaText: evoDelta === null ? '' : pctTxt(evoDelta),
      evoDeltaStyle: 'display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: 999px; font: 700 14px Inter, sans-serif; color: ' + evoColor + '; background: ' + alpha(evoColor, 0.14) + '; border: 1px solid ' + alpha(evoColor, 0.5),
      evoArrow: evoDelta === null ? '' : (evoDelta >= 0 ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M5 12l7 7 7-7'),
      evoNote: plan.note, evoDemoNote: s.days.some(function (x) { return x.demo; }) ? ' Histórico de exemplo desde ' + MES[s.days.filter(function (x) { return x.demo; })[0].d.getMonth()].toLowerCase() + '/' + s.days.filter(function (x) { return x.demo; })[0].d.getFullYear() + '.' : '', evoLines: evoLines, evoMulti: evoLines.length > 1, evoHits: evoHits, evoGrid: gridY,
      evoLabels: plan.pts.map(function (p) { return { l: p.l }; }),
      evoHasPt: ptSel !== null, evoPtTitle: ptSel === null ? '' : 'Valores de ' + plan.pts[ptSel].l + (plan.pts[ptSel].partial ? ' (parcial)' : ''), evoPtRows: ptDetail, evoPtClose: function () { self.setState({ evoPt: null }); },
      evoHint: series.length > 1 ? (hi ? 'Toque de novo na categoria para ver todas.' : 'Toque numa categoria para destacar; toque num ponto para ver os valores.') : 'Toque num ponto para ver o valor.',
      evoNAText: '',
      evoList: recRows,
      /* conferência / fechamento */
      closeItems: closeItems, closeEmpty: closeItems.length === 0, closePending: false, closePendingText: '',
      closeRec: money(fin.rec + fin.fees), closeKm: dec(fin.km, 1) + ' km', closeN: fin.n + (fin.n === 1 ? ' corrida registrada' : ' corridas registradas') + (fin.canc ? ' · ' + fin.canc + (fin.canc === 1 ? ' taxa de cancelamento' : ' taxas de cancelamento') : ''),
      closeOffers: offersAll.length + (offersAll.length === 1 ? ' oferta analisada' : ' ofertas analisadas') + ' no expediente (não entram na receita).',
      closeBtn: 'Confirmar conferência e registrar hodômetro final',
      closeRows: [['Ganhos', money(fin.rec + fin.fees)], ['Corridas', String(fin.n)], ['Taxas de cancelamento', money(fin.fees)], ['Km das corridas', dec(fin.km, 1) + ' km'], ['Tempo de operação', dur(this.shiftMin())]].map(function (x) { return { k: x[0], v: x[1] }; }),
      goCameraFinal: function () { self.nav('camera', { odoMode: 'final' }); },
      /* corrida: detalhe e formulário */
      rd: rd, isRide: sc === 'ride', isRideForm: sc === 'rideForm',
      rfConc: rf.kind === 'corrida', rfCanc: rf.kind === 'taxa', rfSuggested: !!rf.suggested && rf.kind === 'corrida', rfIsNew: !rf.id,
      rfRecv: rf.recv, rfKm: rf.km, rfMin: rf.min, rfFee: rf.fee, rfErr: rf.err || '', rfHasErr: !!rf.err,
      rfTitle: rf.id ? 'Corrigir registro' : 'Registrar corrida',
      rfKinds: [['corrida', 'Corrida realizada'], ['taxa', 'Taxa de cancelamento']].map(function (x) { return { n: x[1], style: pillStyle(rf.kind === x[0], '#B58AF5'), pick: function () { setRf({ kind: x[0] }); } }; }),
      rfOffers: rfOffers, rfHasOffers: rfOffers.length > 0,
      onRfRecv: function (e) { setRf({ recv: e.target.value }); }, onRfKm: function (e) { setRf({ km: e.target.value }); }, onRfMin: function (e) { setRf({ min: e.target.value }); }, onRfFee: function (e) { setRf({ fee: e.target.value }); },
      saveRf: function () {
        var f = self.state.rf, t = CLOCK.now(), r = f.id ? self.rideById(f.id) : null; if (f.id && !r) return;
        var err = function (m) { self.setState({ rf: Object.assign({}, f, { err: m }) }); }, patch, label;
        if (f.kind === 'taxa') {
          var fee = parseDec(f.fee); if (isNaN(fee) || fee <= 0) return err('Informe o valor da taxa de cancelamento.');
          patch = { st: 'taxa', fee: fee, recv: null, km: null, min: null }; label = 'Taxa ' + money(fee);
        } else {
          var v = parseDec(f.recv), k = parseDec(f.km), m = f.min === '' ? 0 : parseInt0(f.min);
          if (isNaN(v) || v <= 0) return err('Informe o valor recebido.');
          if (isNaN(k) || k <= 0) return err('Informe os km da corrida.');
          if (isNaN(m) || m < 0) return err('Duração inválida (pode deixar vazio).');
          patch = { st: 'concluida', recv: v, km: k, min: m || null, fee: null }; label = money(v) + ' · ' + dec(k, 1) + ' km' + (m ? ' · ' + m + ' min' : '');
        }
        if (r) {
          var was = r.st === 'taxa' ? 'Taxa ' + money(r.fee) : money(r.recv) + ' · ' + dec(r.km, 1) + ' km' + (r.min ? ' · ' + r.min + ' min' : '');
          var p1 = self.ridePatch(r.id, patch, { acao: 'valores corrigidos', de: was, para: label }); p1.rf = null; return self.done(p1);
        }
        var rec = Object.assign({ id: self.state.nextRideId, src: 'reg', of: f.of === undefined ? null : f.of, at: t, doneAt: t, ts: stamp(t), trail: [{ acao: f.kind === 'taxa' ? 'taxa registrada' : 'corrida registrada', para: label, em: t }] }, patch);
        var p2 = self.consolidate(self.state.rides.concat([rec]), 'registro #' + rec.id); p2.nextRideId = rec.id + 1; p2.rf = null; self.done(p2);
      },
      cl: (function () {
        var tr = todayRecs.length ? todayRecs[todayRecs.length - 1] : null; if (!tr) return { ok: false };
        var a3 = aggregate(D, TODAY, TODAY, 'pro'), av = tr.kmProd > 0 ? tr.rec / tr.kmProd : null, diff = av === null ? null : av - s.meta;
        return { ok: true, rec: money(tr.rec + tr.fees), rides: tr.rides + (tr.rides === 1 ? ' corrida' : ' corridas'), km: dec(tr.kmExp, 1) + ' km', time: dur(tr.min),
          when: hm(tr.ts.at) + ' – ' + hm(tr.ts.endedAt || tr.ts.at) + ' · ' + ddmmyyyy(tr.ts.at),
          tiles: [tile('Média por km', av === null ? '—' : money(av), '#3FE0A0', ICON.bars, true), tile('Por hora', tr.min ? money((tr.rec + tr.fees) / (tr.min / 60)) : '—', '#4FB3FF', ICON.clock, true), tile('Por corrida', tr.rides ? money(tr.rec / tr.rides) : '—', '#4FB3FF', ICON.car, true), tile('Combustível', a3.cpkFuel ? money(a3.cpkFuel) + '/km' : '—', '#F6C445', ICON.fuel, true)],
          meta: 'Meta: ' + money(s.meta) + '/km', diff: diff === null ? 'Sem corridas confirmadas' : signedMoney(diff) + '/km', diffColor: diff === null ? '#C9C4EC' : (diff >= 0 ? '#3FE0A0' : '#FF6B7D'), diffWord: diff === null ? '' : (diff >= 0 ? ' (acima da meta)' : ' (abaixo da meta)') };
      })(),
      goFinDetail: function () { self.tabTo('fin'); },
      newShift: function () { self._restore = 0; self.setState({ screen: 'home', tab: 'op', stack: [], shift: null, rides: [], nextRideId: 1, offerIdx: 0, endOdo: null, dayDone: false, clock: 0, demoLoaded: false }); },
      /* financeiro */
      finTabs: [['fin', 'Financeiro', ICON.wallet], ['cost', 'Custos', ICON.bars], ['res', 'Resultados', ICON.pie], ['meta', 'Metas', ICON.cal]].map(function (x) { return { n: x[1], path: x[2], style: tabBtn(s.finTab === x[0]), go: function () { self.setState({ finTab: x[0] }); } }; }),
      ftFin: s.finTab === 'fin', ftCost: s.finTab === 'cost', ftRes: s.finTab === 'res', ftMeta: s.finTab === 'meta',
      finNone: !finHas, finHas: finHas, finResLabel: s.shift ? 'Ganhos até agora' : 'Ganhos do dia', finCanOpen: !!dayA,
      finLive: !!s.shift, finDone: !s.shift && !!dayA && s.dayDone,
      finLiveText: 'Os valores se atualizam a cada corrida registrada. O fechamento definitivo acontece quando você encerrar o expediente e conferir os dados.',
      finDoneText: 'Expediente fechado e conferido' + (s.dayClosedAt ? ' às ' + hm(s.dayClosedAt) : '') + '. Valores consolidados no histórico.',
      finKmNote: s.shift ? 'Km das corridas registradas. O km total do dia vem do hodômetro no fechamento.' : '',
      fr: dayA ? (function () {
        var est = dayA.fuelCost + dayA.fixos, reg = dayA.vexp + dayA.maint;
        return { rows: [
            { k: 'Ganhos registrados', v: money(dayA.receita), c: '#F3F1FF' },
            { k: '(−) Custos estimados' + (dayA.cpkFuel === null ? ' · sem custo de combustível' : ''), v: money(est), c: '#F3F1FF' },
            { k: '(−) Custos registrados', v: money(reg), c: '#F3F1FF' }],
          title: dayA.live ? 'Resultado parcial (estimado)' : 'Resultado operacional do dia', v: money(dayA.resultado), c: dayA.resultado < 0 ? '#FF6B7D' : '#3FE0A0',
          note: 'Estimados: combustível pelo custo/km e custos fixos rateados no dia. Registrados: despesas e manutenções lançadas.' + (dayA.cpkFuel === null ? ' Registre um abastecimento para estimar o combustível.' : '') };
      })() : { rows: [], title: '', v: '', c: '#F3F1FF', note: '' },
      finPartial: dayA ? (dayA.live ? 'Resultado parcial estimado: ' : 'Resultado do dia: ') + money(dayA.resultado) + (dayA.cpkFuel === null ? ' · sem custo de combustível (registre um abastecimento)' : '') : '', finPartialColor: dayA && dayA.resultado < 0 ? '#FF6B7D' : '#3FE0A0',
      finRecText: money(fRec), finInd: finInd, finSide: finSide, dreRows: dreRows, openDre: nav('dre'),
      goRides: nav('rides'), rideRows: rideRows, ridesEmpty: rideRows.length === 0, ridesNote: 'Corridas e taxas registradas. Toque para ver detalhes, corrigir ou excluir.', goNewRideFin: function () { self.newRide(null); }, canAddRide: !!s.shift || s.dayDone,
      costCards: [
        { t: 'Custos operacionais', s: 'Fixos, variáveis e por quilômetro', path: ICON.coins, c: '#F6C445', go: function () { self.nav('costs', { tab: 'fin' }); } },
        { t: motor && !motor.ice ? 'Energia' : 'Combustível', s: motor && !motor.ice ? 'Recargas: ' + ES.n : 'Consumo: ' + (cons ? dec(cons, 1) + ' km/L' : '—') + ' · ' + (cpk ? money(cpk) + '/km' : '—'), path: ICON.fuel, c: '#FF9F43', go: function () { self.nav('fuel', { tab: 'fin' }); } },
        { t: 'Manutenção', s: alertsN ? alertsN + ' alerta(s) preventivo(s)' : 'Tudo em dia', path: ICON.wrench, c: '#FF9F43', go: function () { self.nav('maint', { tab: 'fin', mTab: 'res' }); } }
      ].map(function (x) { x.ib = iconBox(x.c, 44); return x; }),
      resMonths: [['prev', this.monthRange('prev').label], ['cur', this.monthRange('cur').label + ' · parcial']].map(function (x) { return { n: x[1], style: tabBtn(s.resMonth === x[0]), go: function () { self.setState({ resMonth: x[0] }); } }; }),
      resValue: money(MA.resultado), resColor: MA.resultado >= 0 ? '#3FE0A0' : '#FF6B7D', resRec: money(MA.receita), resCost: money(MA.custos), resKm: km(MA.kmExp),
      resPartial: RM.partial, resGroups: groups, monthBars: monthBars,
      mtLabel: s.shift && fin.n > 0 ? 'Média do expediente (registradas)' : 'Média realizada no mês',
      mtText: (function () { var v2 = s.shift && fin.n > 0 ? avg : (function () { var a4 = aggregate(D, self.monthRange('cur').from, TODAY, false); return a4.kmProd ? a4.rec / a4.kmProd : null; })(); return v2 === null ? '—' : money(v2); })(),
      mtColor: (function () { var a4 = aggregate(D, self.monthRange('cur').from, TODAY, false), v2 = s.shift && fin.n > 0 ? avg : (a4.kmProd ? a4.rec / a4.kmProd : null); return v2 === null || v2 < s.meta ? '#F6C445' : '#3FE0A0'; })(),
      mtBar: this.barCss((function () { var a4 = aggregate(D, self.monthRange('cur').from, TODAY, false); return s.shift && fin.n > 0 ? avg : (a4.kmProd ? a4.rec / a4.kmProd : null); })()),
      mtNote: 'Média ponderada por km produtivo, só com corridas registradas.', goCfgMeta: function () { self.nav('cfgMeta', { tab: 'fin' }); },
      /* custos operacionais */
      costMonthLabel: CMR.label + (CMR.partial ? ' · parcial' : ''), toggleCostMonth: function () { self.setState({ costMonth: s.costMonth === 'cur' ? 'prev' : 'cur' }); },
      costTotal: money(cTot), costPerKm: cpkTot === null ? '—' : money(cpkTot) + '/km', costParts: costParts, costPartial: CMR.partial,
      goCostFix: nav('costFix'), goCostVar: nav('costVar'), goCostKm: nav('costKm'), goCostEvo: function () { self.nav('hist', { tab: 'hist', hSeg: 'evo', evoKey: 'custos', evoPer: 'mes', evoHi: null, evoPt: null }); },
      fixTotal: money(fixTotal), fixPct: CA.custos > 0 ? dec(fixTotal / CA.custos * 100, 1) + '% do total' : '', fixRows: fixRows,
      varTotal: money(CVA.vexp), varPct: CVA.custos > 0 ? dec(CVA.vexp / CVA.custos * 100, 1) + '% do total' : '', varRows: varRows, varCpk: cpkTot === null ? '—' : money(cpkTot) + '/km', varKmTxt: km(CA.kmExp),
      varCpkMonth: CMR.label + (CMR.partial ? ' · parcial' : ' · último mês completo'), varMonth: CMv.label + ' · parcial',
      catRows: catRows, catEmpty: catRows.length === 0,
      addFix: function () { self.nav('costForm', { cf: { mode: 'fixo', id: null, name: '', v: '', cat: 'outros', retro: false, date: '', time: '', note: '', err: '' } }); },
      addVar: function () { self.nav('costForm', { cf: { mode: 'var', id: null, name: '', cat: s.cat || 'lavagem', v: '', retro: false, date: '', time: '', note: '', err: '' } }); },
      kmRows: [['Combustível (estimado)', CA.kmExp ? CA.fuelCost / CA.kmExp : null], ['Custos fixos', CA.kmExp ? CA.fixos / CA.kmExp : null], ['Custos variáveis', CA.kmExp ? CA.vexp / CA.kmExp : null], ['Manutenção paga', CA.kmExp ? CA.maint / CA.kmExp : null]].map(function (x) { return { k: x[0], v: x[1] === null ? '—' : money(x[1]) + '/km' }; }),
      kmBaseText: km(CA.kmExp) + ' em expediente · ' + CMR.label,
      cfIsFix: cf.mode === 'fixo', cfIsVar: cf.mode === 'var', cfName: cf.name || '', cfV: cf.v || '', cfNote: cf.note || '', cfErr: cf.err || '', cfHasErr: !!cf.err, cfWhen: whenBlock('cf', cf),
      cfCats: Object.keys(VAR_CATS).map(function (k) { return { n: VAR_CATS[k].n, style: pillStyle(cf.cat === k, '#FF9F43'), pick: function () { setCf({ cat: k }); } }; }),
      onCfName: function (e) { setCf({ name: e.target.value, err: '' }); }, onCfV: function (e) { setCf({ v: e.target.value, err: '' }); }, onCfNote: function (e) { setCf({ note: e.target.value }); },
      saveCf: function () {
        var c = self.state.cf, v = parseDec(c.v), t = CLOCK.now();
        if (isNaN(v) || v <= 0) return setCf({ err: 'Informe um valor maior que zero.' });
        if (c.mode === 'fixo') {
          if (!c.name.trim()) return setCf({ err: 'Informe o nome do custo.' });
          var fx = c.id ? self.state.fixos.map(function (f) { return f.id === c.id ? Object.assign({}, f, { n: c.name.trim(), v: v, ts: Object.assign({}, f.ts || genStamp(t), { updatedAt: t }) }) : f; }) : self.state.fixos.concat([{ id: t.getTime(), k: 'outros', n: c.name.trim(), v: v, ts: stamp(t) }]);
          self.done({ fixos: fx, cf: null });
        } else {
          var when = c.retro ? parseWhen(c.date, c.time) : t;
          if (!when) return setCf({ err: 'Data/hora inválida (dd/mm/aaaa e hh:mm).' }); if (when > t) return setCf({ err: 'A data não pode ser futura.' });
          var vx;
          if (c.id) { vx = self.state.vexp.map(function (e) { if (e.id !== c.id) return e; var ts = Object.assign({}, e.ts || genStamp(e.d)); ts.updatedAt = t; if (when.getTime() !== e.d.getTime()) ts.edits = (ts.edits || []).concat([{ campo: 'data/hora', de: e.d, para: when, em: t }]); return Object.assign({}, e, { cat: c.cat, v: v, d: when, note: c.note || '', ts: ts }); }); }
          else { var st2 = stamp(when); st2.retro = !!c.retro; vx = self.state.vexp.concat([{ id: t.getTime(), cat: c.cat, v: v, d: when, note: c.note || '', ts: st2 }]); }
          self.done({ vexp: vx, cf: null });
        }
      },
      cancelCf: function () { self.back(); },
      /* configurações */
      cfgGroups: [
        ['Veículo', veh ? veh.brand + ' ' + veh.model + ' · ' + MOTORS[veh.motor].n : 'Cadastrar meu veículo', ICON.car, '#9B7BFF', cfgEntry('veh')],
        ['Metas e limites', 'Meta, limite inferior e faixas de análise', ICON.target, '#E879F9', cfgEntry('cfgMeta')],
        ['Território (zonas)', 'Áreas de preferência, atenção e risco', ICON.pin, '#FF9F43', cfgEntry('terr')],
        ['Custos operacionais', 'Fixos, variáveis e por quilômetro', ICON.coins, '#F6C445', cfgEntry('costs')],
        [motor && !motor.ice ? 'Energia' : 'Combustível', 'Abastecimentos, recargas, consumo e estoque', ICON.fuel, '#FF9F43', cfgEntry('fuel')],
        ['Manutenção', 'Revisões, trocas e alertas', ICON.wrench, '#FF9F43', cfgEntry('maint', { mTab: 'res' })],
        ['Preferências e permissões', 'Alertas, notificações e uso em segundo plano', ICON.sliders, '#B58AF5', cfgEntry('pref')]
      ].map(function (x) { return { t: x[0], s: x[1], path: x[2], ic: 'color: ' + x[3] + '; display: flex; flex: none', go: x[4] }; }),
      hasDemo: hasDemo, demoBar: hasDemo && (sc === 'fin' || sc === 'hist' || sc === 'costs' || sc === 'fuel' || sc === 'rides' || sc === 'dre'),
      goPrefData: function () { self.nav('pref', { tab: s.tab }); },
      prefStore: s.storeOk ? 'Salvo neste aparelho' + (s.savedAt ? ' · última restauração de ' + dmyhm(s.savedAt) : '') + '. Sem nuvem.' : 'Armazenamento local indisponível neste ambiente: os dados não serão mantidos ao fechar.',
      prefDemo: hasDemo ? 'Há dados de exemplo misturados aos seus (marcados como “exemplo”).' : 'Nenhum dado de exemplo. Todos os registros são seus.',
      removeDemo: function () { var f = function (l) { return (l || []).filter(function (x) { return !x.demo; }); }; self.setState({ days: f(s.days), fuels: f(s.fuels), vexp: f(s.vexp), mrecs: f(s.mrecs), fixos: f(s.fixos), rides: f(s.rides), demoLoaded: false, flash: 'Dados de exemplo removidos.' }); },
      restoreDemo: function () { self._snap = null; var st = self.init('normal', s.online); st.screen = 'pref'; st.tab = 'cfg'; st.stack = s.stack; st.flash = 'Dados de exemplo restaurados.'; self.setState(st); },
      askClear: function () { self.setState({ confirmClear: true }); }, cancelClear: function () { self.setState({ confirmClear: false }); }, confirmClear: s.confirmClear, confirmClearOff: !s.confirmClear,
      clearAll: function () { storeClear(); self._lastSaved = null; var st = self.init('normal', s.online); ['days', 'fuels', 'vexp', 'mrecs', 'fixos', 'charges'].forEach(function (k) { st[k] = []; }); st.screen = 'pref'; st.tab = 'cfg'; st.stack = s.stack; st.flash = 'Todos os registros foram apagados deste aparelho.'; self.setState(st); },
      lowText: money(s.low),
      lowDown: function () { self.setState({ low: Math.max(0.5, Math.round((s.low - 0.1) * 10) / 10) }); },
      lowUp: function () { self.setState({ low: Math.min(Math.round((s.meta - 0.1) * 10) / 10, Math.round((s.low + 0.1) * 10) / 10) }); },
      metaDown: function () { self.setState({ meta: Math.max(Math.round((s.low + 0.1) * 10) / 10, Math.round((s.meta - 0.1) * 10) / 10) }); },
      metaUp: function () { self.setState({ meta: Math.round((s.meta + 0.1) * 10) / 10 }); },
      /* veículo */
      isVehDetail: sc === 'vehDetail', goVehDetail: function () { self.nav('vehDetail', {}); },
      vSub: veh ? [veh.year ? String(veh.year) : null, vCol ? vCol[1] : null, veh.plate || null].filter(Boolean).join(' · ') : '',
      vBodyFill: 'fill: ' + (vCol ? vCol[2] : '#C9C6D9'), vHasPhoto: !!vPhoto, vNoPhoto: !vPhoto, vPhotoSrc: vPhoto || '',
      vPhotoNote: vPhoto ? 'Foto ilustrativa do modelo ' + (veh ? veh.model : '') + '.' : 'Ilustração genérica na cor ' + (vCol ? vCol[1].toLowerCase() : 'padrão') + '. Foto do modelo ainda não disponível no aparelho.',
      vfColors: VEH_COLORS.map(function (c) { var on = vf.color === c[0]; return { n: c[1], pick: function () { setVf({ color: on ? '' : c[0] }); }, style: 'display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 12px 0 8px; border-radius: 999px; cursor: pointer; font: 600 13px Inter, sans-serif; color: #F3F1FF; background: ' + (on ? 'rgba(181,138,245,.22)' : 'rgba(255,255,255,.04)') + '; border: 1.5px solid ' + (on ? '#B58AF5' : 'rgba(181,138,245,.28)'), dot: 'width: 20px; height: 20px; border-radius: 50%; flex: none; border: 1px solid rgba(255,255,255,.35); background: ' + c[2] }; }),
      hasVeh: !!veh, noVeh: !veh, vName: veh ? veh.brand + ' ' + veh.model : '', vPlate: veh ? 'Placa: ' + (veh.plate || '—') + ' · ' + MOTORS[veh.motor].n : '', vYear: veh && veh.year ? 'Ano ' + veh.year : '', vOdoNow: km(ref), vehRows: vehRows,
      vConsNow: veh && motor.ice ? (cons ? dec(cons, 1) + ' km/L' : '—') : (ES.cons ? dec(ES.cons, 1) + ' km/kWh' : '—'),
      vConsHist: ch.avg ? 'Média histórica: ' + dec(ch.avg, 1) + ' km/L em ' + ch.cycles.length + ' ciclos' : '',
      vConsDelta: veh && cons && veh.refCons ? pctTxt((cons - veh.refCons) / veh.refCons) : '', hasConsDelta: !!(veh && motor.ice && cons && veh.refCons),
      vConsStyle: (function () { var d = veh && cons && veh.refCons ? (cons - veh.refCons) / veh.refCons : null, c = changeColor('up', d); return 'display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; font: 700 14px Inter, sans-serif; color: ' + c + '; background: ' + alpha(c, 0.16) + '; border: 1px solid ' + alpha(c, 0.5); })(),
      vRefText: veh && veh.refCons ? 'Comparado à referência (' + dec(veh.refCons, 1) + ' km/L) · último ciclo cheio → cheio' : '',
      goVehForm: function () { var v = veh || {}; self.nav('vehForm', { vf: { isNew: !veh, brand: v.brand || '', model: v.model || '', year: v.year ? String(v.year) : '', color: v.color || '', plate: v.plate || '', motor: v.motor || '', combFuel: v.combFuel || 'gasolina', tankL: v.tankL ? String(v.tankL) : '', batteryKwh: v.batteryKwh ? fmtNum(v.batteryKwh, 1) : '', odoStart: v.odoStart !== undefined ? fmtInt(v.odoStart) : '', refCons: v.refCons ? fmtNum(v.refCons, 1) : '', refConsEl: v.refConsEl ? fmtNum(v.refConsEl, 1) : '' } }); },
      simNoVeh: function () { self.setState({ vehicle: null }); }, simNoVehDisabled: !veh,
      vf: { brand: vf.brand || '', model: vf.model || '', year: vf.year || '', plate: vf.plate || '', tankL: vf.tankL || '', batteryKwh: vf.batteryKwh || '', odoStart: vf.odoStart || '', refCons: vf.refCons || '', refConsEl: vf.refConsEl || '',
        ice: !!(vfMotor && vfMotor.ice), el: !!(vfMotor && vfMotor.el), hyb: vf.motor === 'hibrido', elOnly: vf.motor === 'eletrico', hasMotor: !!vfMotor, isNew: !!vf.isNew,
        motorHint: vf.motor === 'flex' ? 'Flex: em cada abastecimento você escolhe gasolina ou etanol.' : (vf.motor === 'hibrido' ? 'Híbrido convencional: só abastecimento; consumo medido em km/L, sem custo elétrico.' : (vf.motor === 'eletrico' ? 'Elétrico: usa o fluxo de recarga (kWh).' : '')),
        err: s.vf && s.vf.err ? s.vf.err : '', hasErr: !!(s.vf && s.vf.err), saveLabel: vf.isNew ? 'Cadastrar veículo' : 'Salvar alterações' },
      vfMotors: Object.keys(MOTORS).map(function (k) { return { n: MOTORS[k].n, style: pillStyle(vf.motor === k, '#9B7BFF'), pick: function () { setVf({ motor: k, err: '' }); } }; }),
      vfComb: ['gasolina', 'etanol', 'flex'].map(function (k) { return { n: k === 'flex' ? 'Flex' : FUEL_N[k], style: pillStyle(vf.combFuel === k, '#9B7BFF'), pick: function () { setVf({ combFuel: k }); } }; }),
      vfOn: function (field) { return function (e) { var p = { err: '' }; p[field] = e.target.value; setVf(p); }; },
      onVfBrand: function (e) { setVf({ brand: e.target.value, err: '' }); }, onVfModel: function (e) { setVf({ model: e.target.value, err: '' }); }, onVfYear: function (e) { setVf({ year: e.target.value, err: '' }); }, onVfPlate: function (e) { setVf({ plate: e.target.value.toUpperCase(), err: '' }); },
      onVfTank: function (e) { setVf({ tankL: e.target.value, err: '' }); }, onVfBat: function (e) { setVf({ batteryKwh: e.target.value, err: '' }); }, onVfOdo: function (e) { setVf({ odoStart: e.target.value, err: '' }); },
      onVfRef: function (e) { setVf({ refCons: e.target.value, err: '' }); }, onVfRefEl: function (e) { setVf({ refConsEl: e.target.value, err: '' }); },
      saveVf: function () {
        if (vfErr) return setVf({ err: vfErr });
        var t = CLOCK.now(), m = MOTORS[vf.motor];
        var nv = { brand: vf.brand.trim(), model: vf.model.trim(), year: vf.year ? parseInt0(vf.year) : null, color: vf.color || null, plate: vf.plate.trim(), motor: vf.motor, combFuel: vf.motor === 'hibrido' ? vf.combFuel : (m.fuels && m.fuels.length === 1 ? m.fuels[0] : null),
          tankL: m.ice ? parseDec(vf.tankL) : null, batteryKwh: m.el && parseDec(vf.batteryKwh) > 0 ? parseDec(vf.batteryKwh) : null, odoStart: parseInt0(vf.odoStart),
          refCons: m.ice && parseDec(vf.refCons) > 0 ? parseDec(vf.refCons) : null, refConsEl: m.el && parseDec(vf.refConsEl) > 0 ? parseDec(vf.refConsEl) : null,
          ts: veh && veh.ts ? Object.assign({}, veh.ts, { updatedAt: t }) : stamp(t) };
        self.done({ vehicle: nv, vf: null });
      },
      /* combustível / energia */
      fuelOk: fuelOk, fuelNoVeh: !fuelOk, fuelIce: !!(motor && motor.ice), fuelEl: !!(motor && motor.el), fuelFlex: vFuels.length > 1,
      fuelCons: cons ? dec(cons, 1) : '—', fuelConsHist: ch.avg ? dec(ch.avg, 1) + ' km/L · média de ' + ch.cycles.length + ' ciclos' : 'sem ciclo completo', fuelCpk: cpk ? money(cpk) : '—',
      fuelUsingRef: !cyc2.length && !!(veh && veh.refCons), fuelCpkNote: 'Custo por km = gasto com combustível no ciclo ÷ km do ciclo (cheio → cheio). Sem ciclo no período, usa o último medido.', cycRows: cycRows, hasCyc: cycRows.length > 0,
      pmpAll: pmp(s.fuels) ? money(pmp(s.fuels)) + '/L' : '—',
      pmpTypes: vFuels.length > 1 ? vFuels.map(function (t) { var v = pmp(s.fuels, t); return { n: FUEL_N[t], v: v ? money(v) + '/L' : 'sem registros' }; }) : [],
      stockL: SN ? dec(SN.liters, 1) + ' L' : '—', stockCap: veh && veh.tankL ? 'de ' + veh.tankL + ' L' : '', stockAvg: SN ? money(SN.avg) + '/L' : '—',
      stockInitNote: 'Modelo iniciado em ' + (s.fuels.length ? ddmmyyyy(s.fuels[0].d) : '—') + ' assumindo tanque cheio ao preço do 1º abastecimento (premissa, sem despesa registrada).',
      stockFullNote: FS && !FS.est ? 'Recalibrado no último tanque cheio; desde então, descontado pelo consumo.' : 'Desde o último registro parcial: estimativa.',
      energyPmp: ES.pmpKwh ? money(ES.pmpKwh) + '/kWh' : '—', energyCons: ES.cons ? dec(ES.cons, 1) + ' km/kWh (' + (ES.measured ? 'medido entre cargas completas' : 'estimativa') + ')' : 'precisa de 2 recargas', energyN: String(ES.n), energyCpk: ES.cpk ? money(ES.cpk) + '/km' + (ES.measured ? '' : ' (estimado)') : '—',
      recRows: recRows, recEmpty: recRows.length === 0,
      goFuelForm: function () { self.nav('fuelForm', { ff: { odo: '', l: '', p: '5,89', full: true, fuel: vFuels[0] || 'gasolina', retro: false, date: '', time: '' } }); },
      goChargeForm: function () { self.nav('chargeForm', { ch: { odo: '', kwh: '', p: '', full: false, retro: false, date: '', time: '' } }); },
      chFullStyle: pillStyle(!!chf.full, '#3FE0A0'), chPartStyle: pillStyle(!chf.full, '#8D79D9'), setChFull: function () { self.setState({ ch: Object.assign({}, s.ch, { full: true }) }); }, setChPart: function () { self.setState({ ch: Object.assign({}, s.ch, { full: false }) }); },
      goVehFromFuel: function () { self.nav('veh', { tab: 'cfg' }); },
      ffOdo: ff.odo === '' ? fmtInt(ref) : ff.odo, ffL: ff.l || '', ffP: ff.p || '', ffWhen: whenBlock('ff', ff),
      onFfOdo: function (e) { self.setState({ ff: Object.assign({}, s.ff, { odo: e.target.value }) }); }, onFfL: function (e) { self.setState({ ff: Object.assign({}, s.ff, { l: e.target.value }) }); }, onFfP: function (e) { self.setState({ ff: Object.assign({}, s.ff, { p: e.target.value }) }); },
      ffTotal: (!isNaN(ffL) && !isNaN(ffP)) ? money(ffL * ffP) : '—', ffErr: ffErr, ffHasErr: ffErr !== '' && !!(s.ff && (s.ff.l !== '' || s.ff.retro)), ffInvalid: ffErr !== '',
      ffTypes: vFuels.map(function (t) { return { n: FUEL_N[t], style: pillStyle(ff.fuel === t, '#FF9F43'), pick: function () { self.setState({ ff: Object.assign({}, s.ff, { fuel: t }) }); } }; }),
      fullStyle: pillStyle(ff.full, '#3FE0A0'), partStyle: pillStyle(!ff.full, '#8D79D9'),
      setFull: function () { self.setState({ ff: Object.assign({}, s.ff, { full: true }) }); }, setPart: function () { self.setState({ ff: Object.assign({}, s.ff, { full: false }) }); },
      saveFuel: function () { if (ffErr) return; var t = CLOCK.now(), st2 = stamp(ffWhen); st2.retro = !!ff.retro; self.done({ fuels: s.fuels.concat([{ id: Math.max.apply(null, s.fuels.map(function (f) { return f.id; }).concat([0])) + 1, d: ffWhen, odo: ffOdo, l: ffL, p: ffP, full: ff.full, fuel: ff.fuel, ts: st2 }]), ff: null, flash: 'Abastecimento salvo em ' + dmyhm(t) + '.' }); },
      chOdo: chf.odo === '' ? fmtInt(ref) : chf.odo, chK: chf.kwh || '', chP: chf.p || '', chWhen: whenBlock('ch', chf),
      onChOdo: function (e) { self.setState({ ch: Object.assign({}, s.ch, { odo: e.target.value }) }); }, onChK: function (e) { self.setState({ ch: Object.assign({}, s.ch, { kwh: e.target.value }) }); }, onChP: function (e) { self.setState({ ch: Object.assign({}, s.ch, { p: e.target.value }) }); },
      chTotal: (!isNaN(chK) && !isNaN(chP)) ? money(chK * chP) : '—', chErr: chErr, chHasErr: chErr !== '' && !!(s.ch && s.ch.kwh !== ''), chInvalid: chErr !== '',
      saveCharge: function () { if (chErr) return; var st2 = stamp(chWhen); st2.retro = !!chf.retro; self.done({ charges: s.charges.concat([{ id: s.charges.length + 1, d: chWhen, odo: chOdo, kwh: chK, p: chP, full: !!chf.full, ts: st2 }]), ch: null, flash: 'Recarga salva em ' + dmyhm(CLOCK.now()) + '.' }); },
      dismissFlash: function () { self.setState({ flash: null }); },
      /* correção de data */
      edWhat: edRec ? (s.ed.coll === 'fuels' ? 'Abastecimento' : (s.ed.coll === 'charges' ? 'Recarga' : (s.ed.coll === 'mrecs' ? 'Manutenção' : 'Registro'))) + ' de ' + dmyhm(edRec.d) : '',
      edCreated: edRec && edRec.ts ? 'Criado em ' + dmyhm(edRec.ts.createdAt) + ' (' + (edRec.ts.off || '') + ')' : '',
      edDate: ed.date, edTime: ed.time, onEdDate: function (e) { self.setState({ ed: Object.assign({}, s.ed, { date: e.target.value }) }); }, onEdTime: function (e) { self.setState({ ed: Object.assign({}, s.ed, { time: e.target.value }) }); },
      edErr: edErr, edInvalid: edErr !== '',
      saveEd: function () { if (edErr || !edRec) return; var p = self.correctDate(s.ed.coll, s.ed.id, edWhen); p.ed = null; self.done(p); },
      /* manutenção */
      mTabs: [['res', 'Resumo'], ['ag', 'Agenda'], ['hi', 'Histórico'], ['co', 'Custos']].map(function (x) { return { n: x[1], style: tabBtn(s.mTab === x[0]), go: function () { self.setState({ mTab: x[0] }); } }; }),
      mtRes: s.mTab === 'res', mtAg: s.mTab === 'ag', mtHi: s.mTab === 'hi', mtCo: s.mTab === 'co',
      mCntOk: counts.emdia + (counts.emdia === 1 ? ' item' : ' itens'), mCntNext: counts.proxima + (counts.proxima === 1 ? ' item' : ' itens'), mCntLate: counts.vencida + (counts.vencida === 1 ? ' item' : ' itens'),
      mNext: nextList, mNextEmpty: nextList.length === 0, mForecast: money(forecast), mAgenda: agenda, mHist: mhist, mHistEmpty: mhist.length === 0,
      mCostTotal: money(mCostTotal), mCostByItem: mCostByItem, mKpd: kpd ? dec(kpd, 0) + ' km/dia (média recente)' : '—',
      goMaintReg: function () { self.nav('maintReg', { mf: { item: 'oleo', km: '', cost: '', obs: '', retro: false, date: '', time: '' }, mSaved: null }); }, goMaintItem: nav('maintItem'),
      mfItems: s.mitems.map(function (it) { return { v: it.id, n: it.n, style: pillStyle(mf.item === it.id, '#B58AF5'), pick: function () { setMf({ item: it.id }); } }; }),
      mfKm: mf.km === '' ? fmtInt(ref) : mf.km, onMfKm: function (e) { setMf({ km: e.target.value }); }, mfWhen: whenBlock('mf', mf),
      mfCost: mf.cost, onMfCost: function (e) { setMf({ cost: e.target.value }); }, mfObs: mf.obs, onMfObs: function (e) { setMf({ obs: e.target.value }); },
      mfErr: mfErr, mfHasErr: mfErr !== '' && (mf.cost !== '' || mf.km !== '' || mf.retro), mfInvalid: mfErr !== '',
      mfNext: mfIt && mfIt.intKm && !isNaN(mfKm) ? km(mfKm + mfIt.intKm) : (mfIt && mfIt.intMonths && mfWhen ? ddmmyyyy(addMonths(mfWhen, mfIt.intMonths)) : '—'),
      mfInterval: mfIt ? ((mfIt.intKm ? km(mfIt.intKm) : '') + (mfIt.intKm && mfIt.intMonths ? ' ou ' : '') + (mfIt.intMonths ? mfIt.intMonths + ' meses' : '')) : '—',
      mfForecast: !isNaN(mfCost) ? money(mfCost) : (mfIt ? money(mfIt.est) + ' (estimativa)' : '—'),
      mSavedMsg: s.mSaved || '', hasMSaved: !!s.mSaved,
      saveMaint: function () {
        if (mfErr) return; var st2 = stamp(mfWhen); st2.retro = !!mf.retro;
        self._snap = null;
        self.setState({ mrecs: s.mrecs.concat([{ id: CLOCK.now().getTime(), item: mf.item, d: mfWhen, km: mfKm, cost: mfCost, obs: mf.obs, ts: st2 }]), mSaved: 'Registrado em ' + dmyhm(CLOCK.now()) + '. Ciclo anterior encerrado e novo ciclo iniciado; histórico preservado.', mf: Object.assign({}, mf, { cost: '', obs: '', retro: false, date: '', time: '' }) });
      },
      miName: s.mi.name, miKm: s.mi.intKm, miMonths: s.mi.intMonths,
      onMiName: function (e) { self.setState({ mi: Object.assign({}, s.mi, { name: e.target.value }) }); }, onMiKm: function (e) { self.setState({ mi: Object.assign({}, s.mi, { intKm: e.target.value }) }); }, onMiMonths: function (e) { self.setState({ mi: Object.assign({}, s.mi, { intMonths: e.target.value }) }); },
      miInvalid: !s.mi.name.trim() || (!(parseInt0(s.mi.intKm) > 0) && !(parseInt0(s.mi.intMonths) > 0)),
      saveMi: function () { var k2 = parseInt0(s.mi.intKm), m2 = parseInt0(s.mi.intMonths); if (!s.mi.name.trim() || (!(k2 > 0) && !(m2 > 0))) return; self.done({ mitems: s.mitems.concat([{ id: 'i' + CLOCK.now().getTime(), n: s.mi.name.trim(), icon: 'wrench', intKm: k2 > 0 ? k2 : 0, intMonths: m2 > 0 ? m2 : 0, alertKm: k2 > 0 ? Math.round(k2 * 0.1) : 0, alertDays: m2 > 0 ? 15 : 0, safety: false, est: 0, baseDate: TODAY }]), mi: { name: '', intKm: '', intMonths: '' }, mTab: 'ag' }); },
      /* território */
      mapZones: mapZones, mapPlaces: mapPlaces, zCountV: String(zCount.verde), zCountA: String(zCount.amarela), zCountR: String(zCount.vermelha),
      queryChips: chips(s.query, function (k) { self.setState({ query: k }); }),
      queryResult: !s.online ? 'Sem internet: consulta de endereço indisponível' : PLACES[s.query].n + ': ' + ZT[qz.type].n.toLowerCase() + ' (' + ZT[qz.type].label + ')',
      queryColor: s.online ? ZT[qz.type].c : '#F6C445', queryHasDetail: s.online && (qz.hits.length > 1 || qz.tags.length > 0),
      queryDetail: (qz.hits.length > 1 ? 'Sobreposição: ' + qz.hits.map(function (h) { return h.name; }).join(', ') + ' · prevalece a mais restritiva. ' : '') + (qz.tags.length ? 'Motivo: ' + qz.tags.map(function (x) { return MOTIVOS[x]; }).join(' · ') : ''),
      zoneList: s.zones.map(function (z) { return { name: z.name, color: ZT[z.type].c, meta: ZT[z.type].n + ' · raio ' + dec(z.r, 1) + ' km' + (z.tags.length ? ' · ' + z.tags.map(function (x) { return MOTIVOS[x]; }).join(', ') : ''), del: function () { self.setState({ zones: self.state.zones.filter(function (x) { return x.id !== z.id; }) }); } }; }),
      goZoneForm: nav('zoneForm'),
      zfName: s.zf.name, onZfName: function (e) { self.setState({ zf: Object.assign({}, s.zf, { name: e.target.value }) }); },
      zfPlaces: chips(s.zf.place, function (k) { self.setState({ zf: Object.assign({}, s.zf, { place: k }) }); }),
      zfTypes: ['verde', 'amarela', 'vermelha'].map(function (k) { return { n: ZT[k].n, style: pillStyle(s.zf.type === k, ZT[k].c), pick: function () { self.setState({ zf: Object.assign({}, s.zf, { type: k, tags: k === 'verde' ? [] : s.zf.tags }) }); } }; }),
      zfShowTags: s.zf.type !== 'verde',
      zfTags: ZONE_TAGS.map(function (k) { var on = s.zf.tags.indexOf(k) >= 0; return { n: MOTIVOS[k], style: pillStyle(on, ZT[s.zf.type].c), pick: function () { self.setState({ zf: Object.assign({}, s.zf, { tags: on ? s.zf.tags.filter(function (x) { return x !== k; }) : s.zf.tags.concat([k]) }) }); } }; }),
      zfR: s.zf.r, onZfR: function (e) { self.setState({ zf: Object.assign({}, s.zf, { r: e.target.value }) }); }, zfErr: zfErr,
      saveZone: function () { if (zfErr) return; var name = s.zf.name.trim() || PLACES[s.zf.place].n; self.done({ zones: s.zones.concat([{ id: s.nextZoneId, name: name, place: s.zf.place, type: s.zf.type, r: zfR, tags: s.zf.type === 'verde' ? [] : s.zf.tags.slice(), ts: stamp(CLOCK.now()) }]), nextZoneId: s.nextZoneId + 1, zf: { name: '', place: s.zf.place, type: s.zf.type, r: s.zf.r, tags: s.zf.tags }, query: s.zf.place }); }
    };
  }
}
