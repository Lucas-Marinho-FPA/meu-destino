// Monta a pasta publicada (_site) apenas com o que o app precisa: index.html, src/ e assets/.
// Registra a versão (commit) em <meta name="app-version">. Sem dependências.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const out = process.argv[2] || '_site';
let version = process.env.APP_VERSION || '';
if (!version) { try { version = execSync('git rev-parse HEAD').toString().trim(); } catch { version = 'local'; } }

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const p of ['src', 'assets']) cpSync(p, `${out}/${p}`, { recursive: true });
const html = readFileSync('index.html', 'utf8');
if (!html.includes('<meta name="app-version" content="dev">')) throw new Error('marcador de versão ausente em index.html');
writeFileSync(`${out}/index.html`, html.replace('<meta name="app-version" content="dev">', `<meta name="app-version" content="${version}">`));
console.log(`Site montado em ${out}/ (versão ${version})`);
