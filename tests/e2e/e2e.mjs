/*
 * Meu Destino — testes de ponta a ponta no navegador (Playwright).
 *
 * Uso:
 *   BASE_URL=http://localhost:8080/ node tests/e2e/e2e.mjs        (local)
 *   BASE_URL=https://<usuario>.github.io/meu-destino/ node tests/e2e/e2e.mjs   (publicado)
 * Variáveis opcionais:
 *   EXPECT_VERSION  versão (commit) que a página publicada deve exibir em <meta name="app-version">
 *   CHROME_PATH     executável do Chrome/Chromium (se não usar o navegador baixado pelo Playwright)
 *   OUT_DIR         pasta para capturas e relatório (padrão: test-results)
 *
 * As jornadas usam a interface real (cliques e digitação), em viewport de celular.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:8080/';
const OUT = process.env.OUT_DIR || 'test-results';
const EXPECT_VERSION = process.env.EXPECT_VERSION || '';
mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0; const log = []; const limits = [];
const eq = (name, got, exp) => { const ok = got === exp; ok ? pass++ : fail++; log.push(`${ok ? 'OK   ' : 'FALHA'} ${name} → ${got}${ok ? '' : `  (esperado ${exp})`}`); };
const truthy = (name, got) => eq(name, !!got, true);
const sec = t => log.push(`\n## ${t}`);

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] } : {});
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' };

async function newPage(ctx) {
  const page = await ctx.newPage();
  page._errors = []; page._failed = []; page._external = [];
  page.on('pageerror', e => page._errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') page._errors.push('console: ' + m.text()); });
  page.on('requestfailed', r => page._failed.push(r.url()));
  page.on('response', r => { if (r.status() >= 400) page._failed.push(r.status() + ' ' + r.url()); });
  page.on('request', r => { const u = new URL(r.url()); if (u.origin !== new URL(BASE).origin && !u.protocol.startsWith('data')) page._external.push(r.url()); });
  return page;
}
const S = page => page.evaluate(() => window.app.state);
const nav = (page, name) => page.locator('nav').getByRole('button', { name }).click();
const settle = page => page.waitForTimeout(120);
async function startShift(page) {
  await page.getByRole('button', { name: 'Fotografar hodômetro' }).click();
  await page.getByRole('button', { name: 'Capturar e ler' }).click();
  await page.getByRole('button', { name: 'Confirmar e iniciar expediente' }).click();
  await settle(page);
}
/* Recebe uma oferta simulada e toca no botão do app simulado da plataforma (o Meu Destino não detecta o aceite). */
async function receiveOffer(page, platformButton) {
  await page.getByRole('button', { name: /Receber oferta/ }).click(); await settle(page);
  await page.getByRole('button', { name: platformButton, exact: true }).click(); await settle(page);
}
/* Conferência: marca o primeiro cartão com o status indicado usando o botão de ação desse cartão. */
async function markFirst(page, status, action) {
  const card = page.locator('.card', { has: page.locator('.chip', { hasText: new RegExp('^' + status + '$') }) }).first();
  await card.getByRole('button', { name: action, exact: true }).click(); await settle(page);
}
const sumRealized = st => st.rides.filter(r => r.st === 'concluida').reduce((t, r) => t + r.recv, 0);
const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',');
const tileVal = (page, label) => page.locator('div', { has: page.locator('span,p', { hasText: new RegExp('^' + label + '$') }) }).last().innerText();

/* ---------------- A. Integridade ---------------- */
sec('A. Integridade da página publicada');
const ctx = await browser.newContext(MOBILE);
const page = await newPage(ctx);
const resp = await page.goto(BASE, { waitUntil: 'networkidle' });
eq('endereço responde 200', resp.status(), 200);
truthy('app montado', await page.locator('#app .md').count());
const version = await page.locator('meta[name="app-version"]').getAttribute('content');
log.push(`     versão publicada: ${version}`);
if (EXPECT_VERSION) eq('versão publicada = commit esperado', version, EXPECT_VERSION);
const fontsOk = await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('600 16px "Space Grotesk"') && document.fonts.check('500 16px Inter'); });
truthy('fontes locais carregadas (Inter, Space Grotesk)', fontsOk);
eq('sem recursos com erro', page._failed.join(' | '), '');
eq('sem requisições externas', page._external.join(' | '), '');
const box = await page.locator('#app .md').boundingBox();
eq('ocupa a largura do celular', Math.round(box.width), 390);

/* ---------------- B. Veículo ---------------- */
sec('B. Veículo: cartão → detalhes → cor → editar → salvar → reabrir');
await nav(page, 'Configurações'); await page.getByRole('button', { name: /^Veículo/ }).first().click(); await settle(page);
eq('tela Veículo', (await S(page)).screen, 'veh');
eq('sem botão separado "Editar dados do veículo"', await page.getByRole('button', { name: 'Editar dados do veículo' }).count(), 0);
await page.getByRole('button', { name: 'Ver detalhes do veículo' }).click(); await settle(page);
eq('cartão abre detalhes', (await S(page)).screen, 'vehDetail');
truthy('ilustração identificada como tal (não é foto real)', await page.getByText('Ilustração genérica', { exact: false }).count());
await page.screenshot({ path: `${OUT}/B1_veiculo_detalhes.png` });
await page.getByRole('button', { name: 'Editar dados' }).click(); await settle(page);
await page.getByRole('button', { name: 'Vermelho' }).click();
await page.locator('#vp').fill('QWE-1A23');
await page.getByRole('button', { name: /Salvar/ }).click(); await settle(page);
eq('volta aos detalhes', (await S(page)).screen, 'vehDetail');
truthy('cor exibida', await page.getByText('Vermelho', { exact: true }).count());
await page.screenshot({ path: `${OUT}/B2_veiculo_vermelho.png` });
await page.reload({ waitUntil: 'networkidle' });
const vAfter = (await S(page)).vehicle;
eq('reabrir: cor persistida', vAfter.color, 'vermelho'); eq('reabrir: placa persistida', vAfter.plate, 'QWE-1A23');

/* ---------------- C. Operação ---------------- */
sec('C. Operação: ofertas sem classificar durante o expediente (D-27)');
await nav(page, 'Operação'); await startShift(page);
truthy('expediente iniciado', (await S(page)).shift);
await receiveOffer(page, 'Aceitar'); await receiveOffer(page, 'Aceitar'); await receiveOffer(page, 'Aceitar'); await receiveOffer(page, 'Recusar');
eq('sem pergunta de aceite/recusa no Meu Destino', await page.getByRole('button', { name: /^Aceitei$|^Não aceitei$/ }).count(), 0);
eq('sem botão "Registrar corrida" na Operação', await page.getByRole('button', { name: 'Registrar corrida' }).count(), 0);
eq('4 ofertas no expediente, nenhuma é receita', (await S(page)).rides.filter(r => r.st === 'oferta').length, 4);
truthy('Operação avisa a conferência no STOP', await page.getByText('4 ofertas para conferir no STOP').count());
await page.screenshot({ path: `${OUT}/C1_operacao.png` });

/* ---------------- D. Financeiro durante o expediente ---------------- */
sec('D. Financeiro durante o expediente (marcação antecipada opcional, custos e tempo)');
await nav(page, 'Financeiro'); await settle(page);
truthy('aviso de expediente em andamento', await page.getByText('Expediente em andamento').count());
truthy('explica conferência e fechamento no STOP', await page.getByText(/fechamento definitivo acontecem quando você encerrar/).count());
truthy('ganhos zerados antes da conferência', await page.getByText('R$ 0,00').count());
await page.getByRole('button', { name: /Detalhamento das corridas|Corridas do expediente/ }).click(); await settle(page);
await page.locator('button.card').first().click(); await settle(page);
await page.getByRole('button', { name: 'Realizada', exact: true }).click(); await settle(page);
const stD = await S(page); const r1 = sumRealized(stD);
eq('marcada como realizada antes do STOP', stD.rides.filter(r => r.st === 'concluida').length, 1);
await nav(page, 'Financeiro'); await settle(page);
truthy('ganhos atualizados', await page.getByText(brl(r1)).count());
truthy('combustível estimado em linha própria', await page.getByText('(−) Combustível · estimado').count());
truthy('fixos rateados em linha própria', await page.getByText(/Custos fixos rateados · estimado/).count());
truthy('registrados em linha própria', await page.getByText('(−) Despesas e manutenção · registrado').count());
truthy('resultado parcial', await page.getByText('Resultado parcial (estimado)').count());
truthy('tempo total, útil e não útil', (await page.getByText('Tempo total do expediente').count()) && (await page.getByText(/^Operação útil/).count()) && (await page.getByText('Operação não útil').count()));
truthy('ganho por hora útil separado do de expediente', (await page.getByText('Ganho por hora útil').count()) && (await page.getByText('Ganho por hora de expediente').count()));
await page.screenshot({ path: `${OUT}/D1_financeiro_em_andamento.png` });
await page.getByRole('button', { name: 'Ver memória de cálculo' }).click(); await settle(page);
eq('memória de cálculo aberta', (await S(page)).screen, 'costDay');
truthy('componentes com tipo (estimado/registrado)', (await page.locator('.chip', { hasText: 'Estimado' }).count()) === 2 && (await page.locator('.chip', { hasText: 'Registrado' }).count()) === 2);
truthy('base de cálculo do combustível', await page.getByText(/\/km × [0-9,]+ km/).count());
truthy('base de cálculo dos fixos', await page.getByText(/\/mês ÷ \d+ dias/).count());
await page.screenshot({ path: `${OUT}/D2_memoria_de_calculo.png` });

/* ---------------- E. Encerramento ---------------- */
sec('E. Encerramento: conferir todas as ofertas, corrigir, confirmar, histórico');
await nav(page, 'Operação'); await page.getByRole('button', { name: 'Encerrar' }).click(); await settle(page);
eq('tela de conferência', (await S(page)).screen, 'close');
eq('lista as 4 ofertas do expediente', await page.locator('.card .chip', { hasText: /^(A conferir|Realizada|Cancelada)$/ }).count(), 4);
await markFirst(page, 'A conferir', 'Realizada');
await markFirst(page, 'A conferir', 'Cancelada');
truthy('alerta da oferta sem marcação', await page.getByText(/1 oferta ainda sem marcação/).count());
await page.screenshot({ path: `${OUT}/E1_conferencia.png` });
await markFirst(page, 'Realizada', 'Corrigir valores');
await page.locator('#rfv').fill('30,00'); await page.getByRole('button', { name: 'Salvar' }).click(); await settle(page);
eq('correção volta à conferência', (await S(page)).screen, 'close');
const stE = await S(page); const recE = sumRealized(stE);
truthy('ganhos conferidos', await page.getByText(brl(recE)).count());
const nDays = stE.days.length;
await page.getByRole('button', { name: 'Confirmar conferência e registrar hodômetro final' }).click();
await page.getByRole('button', { name: 'Capturar e ler' }).click();
await page.getByRole('button', { name: 'Confirmar e encerrar' }).click(); await settle(page);
const st3 = await S(page);
eq('um registro do dia (sem duplicar)', st3.days.length, nDays + 1);
const d = st3.days[st3.days.length - 1]; eq('dia consolidado = realizadas conferidas', d.rec, recE); eq('2 realizadas', d.rides, 2);
eq('classificações finais', st3.rides.map(r => r.st).sort().join(','), 'cancelada,concluida,concluida,nao_aceita');
await nav(page, 'Financeiro'); await settle(page);
truthy('fechado e conferido', await page.getByText('Fechado e conferido').count());
await nav(page, 'Histórico'); await page.getByText('Expedientes', { exact: true }).click(); await settle(page);
truthy('histórico de expedientes', await page.getByText(/Expediente \d\d\/\d\d/).count());
await page.screenshot({ path: `${OUT}/E2_historico.png` });

/* ---------------- F. Persistência e offline ---------------- */
sec('F. Persistência e funcionamento sem conexão');
await page.reload({ waitUntil: 'networkidle' });
const st4 = await S(page);
eq('recarregar: dia preservado', st4.days.length, nDays + 1);
eq('recarregar: classificações preservadas', st4.rides.map(r => r.st).sort().join(','), 'cancelada,concluida,concluida,nao_aceita');
const p2 = await newPage(ctx); await p2.goto(BASE, { waitUntil: 'networkidle' });
eq('reabrir em outra aba: dados preservados', (await S(p2)).days.length, nDays + 1); await p2.close();
/* sem conexão: contexto novo (armazenamento limpo), página carregada e depois a rede é cortada */
const cOff = await browser.newContext(MOBILE); const pOff = await newPage(cOff);
await pOff.goto(BASE, { waitUntil: 'networkidle' }); await cOff.setOffline(true);
await startShift(pOff); await receiveOffer(pOff, 'Aceitar'); await pOff.getByRole('button', { name: 'Encerrar' }).click(); await settle(pOff); await markFirst(pOff, 'A conferir', 'Realizada');
const stOff = await S(pOff);
eq('sem conexão: confere e calcula', stOff.rides.filter(r => r.st === 'concluida').length, 1);
truthy('sem conexão: ganhos atualizados', await pOff.getByText(brl(sumRealized(stOff))).count());
let offlineReload = 'ok';
try { await pOff.reload({ timeout: 8000 }); offlineReload = (await pOff.locator('#app .md').count()) ? 'ok' : 'página não montou'; } catch (e) { offlineReload = 'falhou (' + e.message.split('\n')[0].slice(0, 60) + ')'; }
log.push(`     recarregar SEM conexão: ${offlineReload}`);
if (offlineReload !== 'ok') limits.push('Recarregar a página sem conexão depende do cache do navegador: não há Service Worker (não existia no protótipo; adicioná-lo é decisão pendente).');
else { eq('recarregado sem conexão: dados preservados', (await S(pOff)).rides.filter(r => r.st === 'concluida').length, 1); }
await cOff.close();

/* ---------------- G. Varredura visual em larguras de celular ---------------- */
sec('G. Varredura visual 320/360/390/412 px');
const FLOW = [
  ['op_inicio', `app.setState({screen:'home',tab:'op',stack:[],shift:null,dayDone:false,rides:[]})`],
  ['op_expediente', `V().goCameraStart();V().capture();V().confirmOdo()`],
  ['oferta', `V().nextOffer()`], ['op_apos_oferta', `V().closeOffer();V().nextOffer();V().closeOffer();V().nextOffer();V().closeOffer()`],
  ['corridas_expediente', `V().tabFin();V().goRides()`], ['oferta_detalhe', `V().rideRows[2].open()`], ['marcada_realizada', `V().rd.acts[0].go()`],
  ['taxa', `V().goBack();V().rideRows[1].open();V().rd.acts[1].go();V().rd.acts.find(a=>a.n==='Informar taxa').go()`],
  ['fin', `V().onRfFee({target:{value:'4,00'}});V().saveRf();V().tabFin()`], ['memoria_calculo', `V().goCostDay()`],
  ['dre', `V().goBack();V().openDre()`], ['detalhamento', `V().goBack();V().goRides()`], ['registro', `V().rideRows[0].open()`],
  ['conferencia', `V().tabOp();V().goClose()`], ['encerrado', `V().goCameraFinal();V().capture();V().confirmOdo()`], ['fin_fechado', `V().goFinDetail()`],
  ['hist_evo', `V().tabHist();app.setState({hSeg:'evo',evoKey:'custos',evoPer:'mes',evoHi:null,evoPt:null})`],
  ['hist_exp', `app.setState({hSeg:'ex'})`], ['custos', `V().tabCfg();V().cfgGroups[3].go()`],
  ['combustivel', `V().tabCfg();V().cfgGroups[4].go()`], ['veiculo', `V().tabCfg();V().cfgGroups[0].go()`],
  ['veiculo_detalhes', `V().goVehDetail()`], ['veiculo_editar', `V().goVehForm()`],
];
const CHECK = `(()=>{const r=document.querySelector('.md').getBoundingClientRect();const bad=[];
document.querySelectorAll('.md *').forEach(e=>{const b=e.getBoundingClientRect();if(!b.width)return;if(e.closest('.tabs')||e.closest('[style*="position: absolute"]')||e.closest('svg'))return;if(b.right>r.right+1||b.left<r.left-1)bad.push('FORA '+e.tagName+' '+(e.textContent||'').trim().slice(0,24));});
document.querySelectorAll('.navb,[role=tab],.pill,.btn,.btn2,.chip,.num,button').forEach(e=>{if(e.scrollWidth>e.clientWidth+1)bad.push('CORTE '+(e.textContent||'').trim().slice(0,24));});
if(/undefined|NaN/.test(document.querySelector('.md').textContent))bad.push('undefined/NaN');return bad.slice(0,4);})()`;
for (const W of [320, 360, 390, 412]) {
  const c2 = await browser.newContext({ ...MOBILE, viewport: { width: W, height: 780 } });
  const pg = await newPage(c2); await pg.goto(BASE, { waitUntil: 'networkidle' });
  await pg.evaluate(() => { window.V = () => window.app.renderVals(); });
  const problems = [];
  for (const [name, code] of FLOW) {
    try { await pg.evaluate(code); } catch (e) { problems.push(name + ': ' + e.message.split('\n')[0]); continue; }
    await settle(pg);
    const bad = await pg.evaluate(CHECK); if (bad.length) problems.push(name + ': ' + bad.join('; '));
    if (W === 390) await pg.screenshot({ path: `${OUT}/G_${String(FLOW.findIndex(f => f[0] === name) + 1).padStart(2, '0')}_${name}.png` });
  }
  eq(`${W}px: ${FLOW.length} telas sem corte, sobreposição ou erro`, problems.join(' | '), '');
  eq(`${W}px: console sem erros`, pg._errors.join(' | '), '');
  await c2.close();
}
eq('console sem erros (jornadas)', page._errors.filter(e => !/ERR_INTERNET_DISCONNECTED|net::ERR/.test(e)).join(' | '), '');

await browser.close();
const report = log.join('\n') + `\n\nLIMITAÇÕES OBSERVADAS:\n${limits.length ? limits.map(l => '- ' + l).join('\n') : '- nenhuma'}\n\nTOTAL: ${pass} passaram, ${fail} falharam (${BASE})\n`;
writeFileSync(`${OUT}/e2e-report.txt`, report);
console.log(report);
process.exit(fail ? 1 : 0);
