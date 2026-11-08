/* Executa as suítes unitárias (Node, sem navegador) e consolida o resultado. */
const { spawnSync } = require('child_process');
const path = require('path');
const suites = ['journeys.test.js', 'regression-127.test.js', 'regression-92.test.js', 'validacao-manual.test.js'];
let failed = 0;
for (const s of suites) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'unit', s)], { encoding: 'utf8' });
  const lines = (r.stdout || '').trim().split('\n');
  const total = lines.filter(l => /passaram/.test(l)).pop() || '(sem resumo)';
  console.log(`${s.padEnd(26)} ${total.replace('TOTAL: ', '')}`);
  if (r.status !== 0) { failed++; console.log(lines.filter(l => /FALHA|=>/.test(l)).join('\n')); if (r.stderr) console.log(r.stderr); }
}
if (failed) { console.log(`\n${failed} suíte(s) com falha.`); process.exit(1); }
console.log('\nTodas as suítes unitárias passaram.');
