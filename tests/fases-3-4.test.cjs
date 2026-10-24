'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
for(const file of ['app-phase3.html','index-phase3.html','app-phase4.html','index-phase4.html','css/app-phase3.css','css/app-phase4.css','js/app-phase3.js','js/app-phase4.js','js/auth-phase3.js','js/auth-phase4.js'])if(!fs.existsSync(path.join(__dirname,'..',file)))throw Error('Falta '+file);
for(const file of ['js/app-phase3.js','js/app-phase4.js','js/auth-phase3.js','js/auth-phase4.js'])new vm.Script(read(file),{filename:file});
const h3=read('app-phase3.html'),h4=read('app-phase4.html'),j3=read('js/app-phase3.js'),j4=read('js/app-phase4.js');
assert.match(h3,/js\/app-phase2\.js/);assert.match(h3,/js\/app-phase3\.js/);assert.doesNotMatch(h3,/js\/app-phase4\.js/);
assert.match(h4,/js\/app-phase2\.js/);assert.match(h4,/js\/app-phase3\.js/);assert.match(h4,/js\/app-phase4\.js/);
assert.match(j3,/Math\.random/);assert.match(j3,/p3-metrics/);assert.doesNotMatch(j3,/\.innerHTML\s*=/);
assert.match(j4,/meu-backlog:phase4:/);assert.match(j4,/currentUser\?\.id/);assert.match(j4,/confirm\('Adicionar '/);assert.match(j4,/db\.insert\(g\)/);assert.doesNotMatch(j4,/\.innerHTML\s*=/);
assert.match(read('js/auth-phase3.js'),/app-phase3\.html/);assert.match(read('js/auth-phase4.js'),/app-phase4\.html/);

const supabase=read('js/supabase-phase2.js');
assert.match(supabase,/function getLoginRedirectPath\(\)/);
assert.doesNotMatch(supabase,/window\.location\.href\s*=\s*['"]index-phase2\.html['"]/);
assert.match(supabase,/index-phase3\.html/);assert.match(supabase,/index-phase4\.html/);
const v=JSON.parse(read('vercel.json'));
const routeDest=pattern=>v.routes.find(r=>r.src===pattern)?.dest;
assert.equal(routeDest('^/$'),'/index-phase4.html');
assert.equal(routeDest('^/app/?$'),'/app-phase4.html');
assert.equal(routeDest('^/fase4/?$'),'/index-phase4.html');
assert.equal(routeDest('^/app-fase4/?$'),'/app-phase4.html');

// Contratos adicionais da Fase 4: importação, exportação e recursos locais.
assert.match(j4,/schema:'meu-backlog-export'/);
assert.match(j4,/version:1/);
assert.match(j4,/URL\.createObjectURL/);
assert.match(j4,/file\.accept='\.json,application\/json'/);
assert.match(j4,/JSON\.parse\(await file\.text\(\)\)/);
assert.match(j4,/typeof g!=='object'/);
assert.match(j4,/!titulo\|\|!plataforma/);
assert.match(j4,/Math\.max\(0,Math\.min\(5,Number\(g\.nota\)\|\|0\)\)/);
assert.match(j4,/n<1\|\|n>1440/);
assert.match(j4,/save\('wishlist',wishlist\)/);
assert.match(j4,/save\('sessions',sessions\)/);
assert.match(j4,/currentUser\?\.id/);
assert.match(j4,/Não serão apagados nem atualizados registos existentes/);
assert.match(j4,/não alteram automaticamente as horas no Supabase/);
assert.match(j4,/localStorage\.setItem\(key\(type\),JSON\.stringify\(data\)\)/);
assert.match(j4,/function renderCardButtons\(\)/);
assert.match(j4,/observe\(cards,\{childList:true,subtree:true\}\)/);
assert.match(j3,/id='p3-cards'/);
assert.match(j3,/cardMode=!cardMode/);

console.log('Testes estáticos Fases 3 e 4 aprovados');