'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const appHtml = read('app-phase2.html');
const loginHtml = read('index-phase2.html');
const dataJs = read('js/supabase-phase2.js');
const appJs = read('js/app-phase2.js');
const authJs = read('js/auth-phase2.js');
const vercelConfig = JSON.parse(read('vercel.json'));

test('HTML candidato referencia os ficheiros de Fase 2 presentes no repositório', () => {
  for (const file of [
    'css/app-phase2.css',
    'css/auth-phase2.css',
    'js/supabase-phase2.js',
    'js/app-phase2.js',
    'js/auth-phase2.js'
  ]) {
    assert.ok(fs.existsSync(path.join(root, file)), 'Falta asset: ' + file);
  }
  assert.match(appHtml, /href="css\/app-phase2\.css"/);
  assert.match(appHtml, /src="js\/supabase-phase2\.js"/);
  assert.match(appHtml, /src="js\/app-phase2\.js"/);
  assert.match(loginHtml, /href="css\/auth-phase2\.css"/);
  assert.match(loginHtml, /src="js\/auth-phase2\.js"/);
  assert.match(authJs, /app-phase2\.html/);
  assert.match(dataJs, /index-phase2\.html/);
});

test('rotas do preview apontam para as páginas candidatas da Fase 2', () => {
  const routes = vercelConfig.routes;
  assert.ok(routes.some((route) => route.src === '^/
  for (const file of ['js/supabase-phase2.js', 'js/app-phase2.js', 'js/auth-phase2.js']) {
    assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), file);
  }
});

test('dados do backlog usam apenas o SDK e filtram por utilizador', () => {
  assert.match(dataJs, /window\.supabase\.createClient/);
  assert.doesNotMatch(dataJs, /fetch\s*\(/);
  assert.doesNotMatch(dataJs, /REST API Direta|REST Fetch nativo/);
  assert.match(dataJs, /async selectAll[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /async update[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /async delete[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /const payload = \{ \.\.\.game, user_id: currentUser\.id \}/);
  assert.match(dataJs, /delete payload\.user_id/);
});

test('renderização da tabela não concatena dados do jogo em HTML ou JavaScript inline', () => {
  const start = appJs.indexOf('function renderTabela(list)');
  const end = appJs.indexOf('function criarEstrelasNode', start);
  assert.ok(start >= 0 && end > start, 'Função renderTabela deve existir.');
  const renderer = appJs.slice(start, end);
  assert.doesNotMatch(renderer, /\.innerHTML\s*=/);
  assert.doesNotMatch(renderer, /onclick\s*=/i);
  assert.match(renderer, /titleSpan\.textContent/);
  assert.match(renderer, /editButton\.addEventListener/);
  assert.match(renderer, /deleteButton\.addEventListener/);
});

test('mensagens de erro e diagnóstico são inseridos como texto', () => {
  assert.match(appJs, /detail\.textContent\s*=/);
  assert.match(appJs, /pre\.textContent\s*=/);
  assert.match(appJs, /messageSpan\.textContent\s*=/);
  assert.doesNotMatch(appJs, /\.innerHTML\s*=/);
});

test('utilitários de data e estado preservam resultados esperados', () => {
  const sandbox = {
    window: {},
    document: { addEventListener() {} },
    console: { error() {}, warn() {}, log() {} },
    performance: { now() { return 0; } },
    setTimeout() {},
    confirm() { return true; }
  };
  vm.createContext(sandbox);
  vm.runInContext(dataJs, sandbox, { filename: 'js/supabase-phase2.js' });
  vm.runInContext(appJs, sandbox, { filename: 'js/app-phase2.js' });

  const result = vm.runInContext("({ localDate: getLocalDateString(), formattedDate: formatDate('2024-02-09'), formattedTimestamp: formatDate('2024-12-31T23:00:00Z'), completedClass: getClassStatus('Zerado'), escaped: escapeHtml('<script>&' + String.fromCharCode(34, 39)) })", sandbox);

  const now = new Date();
  const expectedLocalDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  assert.equal(result.localDate, expectedLocalDate);
  assert.equal(result.formattedDate, '09/02/2024');
  assert.equal(result.formattedTimestamp, '31/12/2024');
  assert.equal(result.completedClass, 'bg-zerado');
  assert.equal(result.escaped, '&lt;script&gt;&amp;&quot;&#039;');
});

test('auth e interface usam nomes de ficheiros versionados para os redirecionamentos', () => {
  assert.match(authJs, /app-phase2\.html/);
  assert.match(dataJs, /index-phase2\.html/);
  assert.doesNotMatch(authJs, /window\.location\.href\s*=\s*['"]app\.html/);
  assert.doesNotMatch(dataJs, /window\.location\.href\s*=\s*['"]index\.html/);
});
 && route.dest === '/index-phase2.html'));
  assert.ok(routes.some((route) => route.src === '^/login/?
  for (const file of ['js/supabase-phase2.js', 'js/app-phase2.js', 'js/auth-phase2.js']) {
    assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), file);
  }
});

test('dados do backlog usam apenas o SDK e filtram por utilizador', () => {
  assert.match(dataJs, /window\.supabase\.createClient/);
  assert.doesNotMatch(dataJs, /fetch\s*\(/);
  assert.doesNotMatch(dataJs, /REST API Direta|REST Fetch nativo/);
  assert.match(dataJs, /async selectAll[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /async update[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /async delete[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /const payload = \{ \.\.\.game, user_id: currentUser\.id \}/);
  assert.match(dataJs, /delete payload\.user_id/);
});

test('renderização da tabela não concatena dados do jogo em HTML ou JavaScript inline', () => {
  const start = appJs.indexOf('function renderTabela(list)');
  const end = appJs.indexOf('function criarEstrelasNode', start);
  assert.ok(start >= 0 && end > start, 'Função renderTabela deve existir.');
  const renderer = appJs.slice(start, end);
  assert.doesNotMatch(renderer, /\.innerHTML\s*=/);
  assert.doesNotMatch(renderer, /onclick\s*=/i);
  assert.match(renderer, /titleSpan\.textContent/);
  assert.match(renderer, /editButton\.addEventListener/);
  assert.match(renderer, /deleteButton\.addEventListener/);
});

test('mensagens de erro e diagnóstico são inseridos como texto', () => {
  assert.match(appJs, /detail\.textContent\s*=/);
  assert.match(appJs, /pre\.textContent\s*=/);
  assert.match(appJs, /messageSpan\.textContent\s*=/);
  assert.doesNotMatch(appJs, /\.innerHTML\s*=/);
});

test('utilitários de data e estado preservam resultados esperados', () => {
  const sandbox = {
    window: {},
    document: { addEventListener() {} },
    console: { error() {}, warn() {}, log() {} },
    performance: { now() { return 0; } },
    setTimeout() {},
    confirm() { return true; }
  };
  vm.createContext(sandbox);
  vm.runInContext(dataJs, sandbox, { filename: 'js/supabase-phase2.js' });
  vm.runInContext(appJs, sandbox, { filename: 'js/app-phase2.js' });

  const result = vm.runInContext("({ localDate: getLocalDateString(), formattedDate: formatDate('2024-02-09'), formattedTimestamp: formatDate('2024-12-31T23:00:00Z'), completedClass: getClassStatus('Zerado'), escaped: escapeHtml('<script>&' + String.fromCharCode(34, 39)) })", sandbox);

  const now = new Date();
  const expectedLocalDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  assert.equal(result.localDate, expectedLocalDate);
  assert.equal(result.formattedDate, '09/02/2024');
  assert.equal(result.formattedTimestamp, '31/12/2024');
  assert.equal(result.completedClass, 'bg-zerado');
  assert.equal(result.escaped, '&lt;script&gt;&amp;&quot;&#039;');
});

test('auth e interface usam nomes de ficheiros versionados para os redirecionamentos', () => {
  assert.match(authJs, /app-phase2\.html/);
  assert.match(dataJs, /index-phase2\.html/);
  assert.doesNotMatch(authJs, /window\.location\.href\s*=\s*['"]app\.html/);
  assert.doesNotMatch(dataJs, /window\.location\.href\s*=\s*['"]index\.html/);
});
 && route.dest === '/index-phase2.html'));
  assert.ok(routes.some((route) => route.src === '^/app/?
  for (const file of ['js/supabase-phase2.js', 'js/app-phase2.js', 'js/auth-phase2.js']) {
    assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), file);
  }
});

test('dados do backlog usam apenas o SDK e filtram por utilizador', () => {
  assert.match(dataJs, /window\.supabase\.createClient/);
  assert.doesNotMatch(dataJs, /fetch\s*\(/);
  assert.doesNotMatch(dataJs, /REST API Direta|REST Fetch nativo/);
  assert.match(dataJs, /async selectAll[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /async update[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /async delete[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /const payload = \{ \.\.\.game, user_id: currentUser\.id \}/);
  assert.match(dataJs, /delete payload\.user_id/);
});

test('renderização da tabela não concatena dados do jogo em HTML ou JavaScript inline', () => {
  const start = appJs.indexOf('function renderTabela(list)');
  const end = appJs.indexOf('function criarEstrelasNode', start);
  assert.ok(start >= 0 && end > start, 'Função renderTabela deve existir.');
  const renderer = appJs.slice(start, end);
  assert.doesNotMatch(renderer, /\.innerHTML\s*=/);
  assert.doesNotMatch(renderer, /onclick\s*=/i);
  assert.match(renderer, /titleSpan\.textContent/);
  assert.match(renderer, /editButton\.addEventListener/);
  assert.match(renderer, /deleteButton\.addEventListener/);
});

test('mensagens de erro e diagnóstico são inseridos como texto', () => {
  assert.match(appJs, /detail\.textContent\s*=/);
  assert.match(appJs, /pre\.textContent\s*=/);
  assert.match(appJs, /messageSpan\.textContent\s*=/);
  assert.doesNotMatch(appJs, /\.innerHTML\s*=/);
});

test('utilitários de data e estado preservam resultados esperados', () => {
  const sandbox = {
    window: {},
    document: { addEventListener() {} },
    console: { error() {}, warn() {}, log() {} },
    performance: { now() { return 0; } },
    setTimeout() {},
    confirm() { return true; }
  };
  vm.createContext(sandbox);
  vm.runInContext(dataJs, sandbox, { filename: 'js/supabase-phase2.js' });
  vm.runInContext(appJs, sandbox, { filename: 'js/app-phase2.js' });

  const result = vm.runInContext("({ localDate: getLocalDateString(), formattedDate: formatDate('2024-02-09'), formattedTimestamp: formatDate('2024-12-31T23:00:00Z'), completedClass: getClassStatus('Zerado'), escaped: escapeHtml('<script>&' + String.fromCharCode(34, 39)) })", sandbox);

  const now = new Date();
  const expectedLocalDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  assert.equal(result.localDate, expectedLocalDate);
  assert.equal(result.formattedDate, '09/02/2024');
  assert.equal(result.formattedTimestamp, '31/12/2024');
  assert.equal(result.completedClass, 'bg-zerado');
  assert.equal(result.escaped, '&lt;script&gt;&amp;&quot;&#039;');
});

test('auth e interface usam nomes de ficheiros versionados para os redirecionamentos', () => {
  assert.match(authJs, /app-phase2\.html/);
  assert.match(dataJs, /index-phase2\.html/);
  assert.doesNotMatch(authJs, /window\.location\.href\s*=\s*['"]app\.html/);
  assert.doesNotMatch(dataJs, /window\.location\.href\s*=\s*['"]index\.html/);
});
 && route.dest === '/app-phase2.html'));
  assert.ok(routes.some((route) => route.src === '^/app\\.html
  for (const file of ['js/supabase-phase2.js', 'js/app-phase2.js', 'js/auth-phase2.js']) {
    assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), file);
  }
});

test('dados do backlog usam apenas o SDK e filtram por utilizador', () => {
  assert.match(dataJs, /window\.supabase\.createClient/);
  assert.doesNotMatch(dataJs, /fetch\s*\(/);
  assert.doesNotMatch(dataJs, /REST API Direta|REST Fetch nativo/);
  assert.match(dataJs, /async selectAll[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /async update[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /async delete[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /const payload = \{ \.\.\.game, user_id: currentUser\.id \}/);
  assert.match(dataJs, /delete payload\.user_id/);
});

test('renderização da tabela não concatena dados do jogo em HTML ou JavaScript inline', () => {
  const start = appJs.indexOf('function renderTabela(list)');
  const end = appJs.indexOf('function criarEstrelasNode', start);
  assert.ok(start >= 0 && end > start, 'Função renderTabela deve existir.');
  const renderer = appJs.slice(start, end);
  assert.doesNotMatch(renderer, /\.innerHTML\s*=/);
  assert.doesNotMatch(renderer, /onclick\s*=/i);
  assert.match(renderer, /titleSpan\.textContent/);
  assert.match(renderer, /editButton\.addEventListener/);
  assert.match(renderer, /deleteButton\.addEventListener/);
});

test('mensagens de erro e diagnóstico são inseridos como texto', () => {
  assert.match(appJs, /detail\.textContent\s*=/);
  assert.match(appJs, /pre\.textContent\s*=/);
  assert.match(appJs, /messageSpan\.textContent\s*=/);
  assert.doesNotMatch(appJs, /\.innerHTML\s*=/);
});

test('utilitários de data e estado preservam resultados esperados', () => {
  const sandbox = {
    window: {},
    document: { addEventListener() {} },
    console: { error() {}, warn() {}, log() {} },
    performance: { now() { return 0; } },
    setTimeout() {},
    confirm() { return true; }
  };
  vm.createContext(sandbox);
  vm.runInContext(dataJs, sandbox, { filename: 'js/supabase-phase2.js' });
  vm.runInContext(appJs, sandbox, { filename: 'js/app-phase2.js' });

  const result = vm.runInContext("({ localDate: getLocalDateString(), formattedDate: formatDate('2024-02-09'), formattedTimestamp: formatDate('2024-12-31T23:00:00Z'), completedClass: getClassStatus('Zerado'), escaped: escapeHtml('<script>&' + String.fromCharCode(34, 39)) })", sandbox);

  const now = new Date();
  const expectedLocalDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  assert.equal(result.localDate, expectedLocalDate);
  assert.equal(result.formattedDate, '09/02/2024');
  assert.equal(result.formattedTimestamp, '31/12/2024');
  assert.equal(result.completedClass, 'bg-zerado');
  assert.equal(result.escaped, '&lt;script&gt;&amp;&quot;&#039;');
});

test('auth e interface usam nomes de ficheiros versionados para os redirecionamentos', () => {
  assert.match(authJs, /app-phase2\.html/);
  assert.match(dataJs, /index-phase2\.html/);
  assert.doesNotMatch(authJs, /window\.location\.href\s*=\s*['"]app\.html/);
  assert.doesNotMatch(dataJs, /window\.location\.href\s*=\s*['"]index\.html/);
});
 && route.dest === '/app-phase2.html'));
});

test('todos os ficheiros JavaScript têm sintaxe válida', () => {
  for (const file of ['js/supabase-phase2.js', 'js/app-phase2.js', 'js/auth-phase2.js']) {
    assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), file);
  }
});

test('dados do backlog usam apenas o SDK e filtram por utilizador', () => {
  assert.match(dataJs, /window\.supabase\.createClient/);
  assert.doesNotMatch(dataJs, /fetch\s*\(/);
  assert.doesNotMatch(dataJs, /REST API Direta|REST Fetch nativo/);
  assert.match(dataJs, /async selectAll[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /async update[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /async delete[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', currentUser\.id\)/);
  assert.match(dataJs, /const payload = \{ \.\.\.game, user_id: currentUser\.id \}/);
  assert.match(dataJs, /delete payload\.user_id/);
});

test('renderização da tabela não concatena dados do jogo em HTML ou JavaScript inline', () => {
  const start = appJs.indexOf('function renderTabela(list)');
  const end = appJs.indexOf('function criarEstrelasNode', start);
  assert.ok(start >= 0 && end > start, 'Função renderTabela deve existir.');
  const renderer = appJs.slice(start, end);
  assert.doesNotMatch(renderer, /\.innerHTML\s*=/);
  assert.doesNotMatch(renderer, /onclick\s*=/i);
  assert.match(renderer, /titleSpan\.textContent/);
  assert.match(renderer, /editButton\.addEventListener/);
  assert.match(renderer, /deleteButton\.addEventListener/);
});

test('mensagens de erro e diagnóstico são inseridos como texto', () => {
  assert.match(appJs, /detail\.textContent\s*=/);
  assert.match(appJs, /pre\.textContent\s*=/);
  assert.match(appJs, /messageSpan\.textContent\s*=/);
  assert.doesNotMatch(appJs, /\.innerHTML\s*=/);
});

test('utilitários de data e estado preservam resultados esperados', () => {
  const sandbox = {
    window: {},
    document: { addEventListener() {} },
    console: { error() {}, warn() {}, log() {} },
    performance: { now() { return 0; } },
    setTimeout() {},
    confirm() { return true; }
  };
  vm.createContext(sandbox);
  vm.runInContext(dataJs, sandbox, { filename: 'js/supabase-phase2.js' });
  vm.runInContext(appJs, sandbox, { filename: 'js/app-phase2.js' });

  const result = vm.runInContext("({ localDate: getLocalDateString(), formattedDate: formatDate('2024-02-09'), formattedTimestamp: formatDate('2024-12-31T23:00:00Z'), completedClass: getClassStatus('Zerado'), escaped: escapeHtml('<script>&' + String.fromCharCode(34, 39)) })", sandbox);

  const now = new Date();
  const expectedLocalDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  assert.equal(result.localDate, expectedLocalDate);
  assert.equal(result.formattedDate, '09/02/2024');
  assert.equal(result.formattedTimestamp, '31/12/2024');
  assert.equal(result.completedClass, 'bg-zerado');
  assert.equal(result.escaped, '&lt;script&gt;&amp;&quot;&#039;');
});

test('auth e interface usam nomes de ficheiros versionados para os redirecionamentos', () => {
  assert.match(authJs, /app-phase2\.html/);
  assert.match(dataJs, /index-phase2\.html/);
  assert.doesNotMatch(authJs, /window\.location\.href\s*=\s*['"]app\.html/);
  assert.doesNotMatch(dataJs, /window\.location\.href\s*=\s*['"]index\.html/);
});
