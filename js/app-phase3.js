(function(){
'use strict';
const $=id=>document.getElementById(id);
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
function games(){
 const q=($('search-input')?.value||'').toLowerCase().trim(),st=$('status-select')?.value||'',pl=$('plat-select')?.value||'',sort=$('sort-select')?.value||'recentes';
 const a=(biblioteca||[]).filter(g=>(!q||[g.titulo,g.genero,g.plataforma,g.obs].some(v=>String(v||'').toLowerCase().includes(q)))&&(!st||g.status===st)&&(!pl||g.plataforma===pl));
 a.sort((x,y)=>sort==='nome_asc'?x.titulo.localeCompare(y.titulo):sort==='nome_desc'?y.titulo.localeCompare(x.titulo):sort==='nota_desc'?(y.nota||0)-(x.nota||0):sort==='horas_desc'?(y.horas||0)-(x.horas||0):sort==='antigos'?(x.id||0)-(y.id||0):(y.id||0)-(x.id||0));return a;
}
function render(){
 const host=$('p3-insights'),cards=$('p3-cards');if(!host||!cards)return;const list=games();host.replaceChildren();cards.replaceChildren();
 const done=list.filter(g=>g.status==='Zerado').length,hrs=list.reduce((s,g)=>s+(Number(g.horas)||0),0),rated=list.filter(g=>g.status==='Zerado'&&Number(g.nota)>0),avg=rated.length?rated.reduce((s,g)=>s+Number(g.nota),0)/rated.length:0;
 const metrics=make('div','p3-metrics');
 [['Jogos',list.length],['Concluídos',done],['Horas',hrs.toFixed(1)+'h'],['Nota média',avg.toFixed(1)+'/5']].forEach(([k,v])=>{const c=make('article','p3-metric');c.append(make('span','p3-muted',k),make('strong','',v));metrics.append(c)});host.append(metrics);
 const status=make('div','p3-status');status.append(make('h3','','Distribuição por status'));
 ['Jogando','Na Fila','Pausado','Zerado','Abandonado'].forEach(s=>{const n=list.filter(g=>g.status===s).length,row=make('div','p3-status-row');row.append(make('span','',s));const track=make('span','p3-track'),bar=make('span','p3-bar');bar.style.width=(list.length?n/list.length*100:0)+'%';track.append(bar);row.append(track,make('b','',n));status.append(row)});host.append(status);
 if(!list.length)cards.append(make('p','p3-muted','Nenhum jogo corresponde aos filtros atuais.'));
 list.forEach((g,i)=>{const c=make('article','p3-card');c.dataset.gameId=String(g.id);const cover=make('div','p3-cover');cover.style.setProperty('--hue',(i*51+String(g.titulo).length*11)%360);cover.append(make('small','','PLAYER ONE'),make('strong','',g.titulo||'Sem título'),make('small','',g.plataforma||''));const body=make('div','p3-card-body');body.append(make('span','p3-pill',g.status),make('span','p3-muted',g.genero||'Género não informado'),make('span','p3-muted',(Number(g.horas)||0)+' horas'));const actions=make('div','p3-actions'),edit=make('button','btn btn-outline','Editar');edit.type='button';edit.addEventListener('click',()=>abrirModal(g.id));actions.append(edit);body.append(actions);c.append(cover,body);cards.append(c)});
}
function setup(){
 const container=document.querySelector('.container'),filters=document.querySelector('.filter-section');if(!container||!filters||$('p3-root'))return;
 const root=make('section','p3-root');root.id='p3-root';const head=make('div','p3-heading');head.append(make('h2','','Painel de descoberta'),make('span','p3-muted','Fase 3 · métricas e biblioteca visual'));
 const insights=make('div','');insights.id='p3-insights';
 const chooser=make('div','p3-chooser');chooser.append(make('strong','','Não sabe o que jogar?'),make('span','p3-muted','Escolhe aleatoriamente um jogo na fila ou pausado.'));
 const pick=make('button','btn btn-primary','🎲 Escolher por mim');pick.type='button';const result=make('div','p3-pick-result');pick.addEventListener('click',()=>{const options=games().filter(g=>['Na Fila','Pausado'].includes(g.status));if(!options.length){showToast('Não há jogos na fila ou pausados nos filtros atuais.','info');return}const g=options[Math.floor(Math.random()*options.length)];result.replaceChildren(make('strong','',g.titulo));const b=make('button','btn btn-outline','Abrir');b.type='button';b.addEventListener('click',()=>abrirModal(g.id));result.append(b)});chooser.append(pick,result);
 const switcher=make('div','p3-heading');switcher.append(make('h3','','Biblioteca visual'));const toggle=make('button','btn btn-outline','Alternar tabela/cartões');toggle.type='button';let cardMode=false;toggle.addEventListener('click',()=>{cardMode=!cardMode;const table=document.querySelector('.table-container');if(table)table.hidden=cardMode;$('p3-cards').hidden=!cardMode;toggle.textContent=cardMode?'Mostrar tabela':'Mostrar cartões';});switcher.append(toggle);
 const cards=make('div','p3-cards');cards.id='p3-cards';cards.hidden=true;root.append(head,insights,chooser,switcher,cards);container.insertBefore(root,filters);
 ['search-input','status-select','plat-select','sort-select'].forEach(id=>$(id)?.addEventListener('input',render));
 ['search-input','status-select','plat-select','sort-select'].forEach(id=>$(id)?.addEventListener('change',render));
 const tbody=$('table-body');if(tbody&&window.MutationObserver)new MutationObserver(render).observe(tbody,{childList:true,subtree:true});
 render();
}
document.addEventListener('DOMContentLoaded',setup);
})();