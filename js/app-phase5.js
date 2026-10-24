(function(){
'use strict';
const $=id=>document.getElementById(id);
const safeImage=value=>{try{const u=new URL(String(value||''),window.location.origin);return u.protocol==='https:'?u.href:''}catch(_){return ''}};
let searchTimer=null,searchAbort=null,lastSelectedTitle='',activeSuggestions=[];
function make(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n}
function userInfo(){const u=window.currentUser||null,meta=u?.user_metadata||{};return {name:meta.full_name||meta.global_name||meta.name||meta.username||(u?.email||'Jogador').split('@')[0],email:u?.email||'',avatar:safeImage(meta.avatar_url||meta.picture||meta.avatar)}}
function setupLayout(){
 const container=document.querySelector('.container');if(!container)return;
 if(document.querySelector('.p5-layout')){refreshProfile();activateTab('overview');return;}
 const shell=make('div','p5-layout'),sidebar=make('aside','p5-sidebar'),brand=make('div','p5-brand','PLAYER ONE');brand.append(make('small','','YOUR GAMING HUB'));
 const nav=make('nav','p5-nav');nav.setAttribute('aria-label','Navegação principal');
 [['overview','▦  Visão Geral'],['library','▣  Minha Biblioteca'],['settings','⚙  Configurações']].forEach(([id,label])=>{const b=make('button','',label);b.type='button';b.dataset.tab=id;b.addEventListener('click',()=>activateTab(id));nav.append(b)});
 sidebar.append(brand,nav,make('p','p5-sidebar-note','Seu backlog, suas regras. Sincronizado com Supabase.'));
 const main=make('main','p5-main');container.parentNode.insertBefore(shell,container);main.append(container);shell.append(sidebar,main);
 const header=container.querySelector('header'),actions=header?.querySelector('.header-actions');
 if(actions&&!$('p5-profile')){
  const info=userInfo(),profile=make('button','p5-profile');profile.id='p5-profile';profile.type='button';profile.setAttribute('aria-expanded','false');
  if(info.avatar){const img=make('img','p5-avatar');img.src=info.avatar;img.alt='';img.referrerPolicy='no-referrer';profile.append(img)}else profile.append(make('span','p5-avatar',info.name.slice(0,1).toUpperCase()));
  profile.append(make('span','p5-profile-name',info.name),make('span','','⌄'));
  const menu=make('div','p5-profile-menu');menu.id='p5-profile-menu';menu.hidden=true;menu.append(make('strong','',info.name),make('small','',info.email||'Conta autenticada'));
  const settings=make('button','','Ver configurações do perfil');settings.type='button';settings.addEventListener('click',()=>activateTab('settings'));
  const logout=make('button','','Sair da conta');logout.type='button';logout.addEventListener('click',()=>window.fazerLogout?.());
  menu.append(settings,logout);profile.addEventListener('click',()=>{menu.hidden=!menu.hidden;profile.setAttribute('aria-expanded',String(!menu.hidden))});
  document.addEventListener('click',e=>{if(!profile.contains(e.target)&&!menu.contains(e.target)){menu.hidden=true;profile.setAttribute('aria-expanded','false')}});
  actions.insertBefore(profile,actions.lastElementChild||null);actions.append(menu);
 }
 const p4=$('p4-root');if(p4){const info=userInfo(),panel=make('section','p5-settings-profile');if(info.avatar){const img=make('img','');img.src=info.avatar;img.alt='Avatar do perfil';img.referrerPolicy='no-referrer';panel.append(img)}const details=make('div','');details.append(make('strong','',info.name),make('small','',info.email||'Conta autenticada via Supabase'));panel.append(details);p4.insertBefore(panel,p4.children[1]||null);const note=make('p','p5-note','Integrações: o login Discord depende de ativar o provider no Supabase; a busca RAWG depende da variável RAWG_API_KEY na Vercel. Consulte SETUP-DISCORD-RAWG.md.');p4.append(note)}
 const toggle=container.querySelector('.p3-root .p3-heading:nth-child(2) button');if(toggle&&$('p3-cards')?.hidden)toggle.click();
 activateTab('overview');
}
function refreshProfile(){
 const info=userInfo(),profile=$('p5-profile'),menu=$('p5-profile-menu');
 if(profile){profile.replaceChildren();if(info.avatar){const img=make('img','p5-avatar');img.src=info.avatar;img.alt='';img.referrerPolicy='no-referrer';profile.append(img)}else profile.append(make('span','p5-avatar',info.name.slice(0,1).toUpperCase()));profile.append(make('span','p5-profile-name',info.name),make('span','','⌄'));}
 if(menu){menu.replaceChildren(make('strong','',info.name),make('small','',info.email||'Conta autenticada'));const settings=make('button','','Ver configurações do perfil');settings.type='button';settings.addEventListener('click',()=>activateTab('settings'));const logout=make('button','','Sair da conta');logout.type='button';logout.addEventListener('click',()=>window.fazerLogout?.());menu.append(settings,logout);}
 const panel=document.querySelector('.p5-settings-profile');if(panel){panel.replaceChildren();if(info.avatar){const img=make('img','');img.src=info.avatar;img.alt='Avatar do perfil';img.referrerPolicy='no-referrer';panel.append(img)}const details=make('div','');details.append(make('strong','',info.name),make('small','',info.email||'Conta autenticada via Supabase'));panel.append(details)}
}
function activateTab(id){
 document.querySelectorAll('.p5-nav button').forEach(b=>{if(b.dataset.tab===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 const show=(selector,on)=>document.querySelectorAll(selector).forEach(n=>{n.hidden=!on});
 show('.kpi-grid',id==='overview');show('#p3-insights',id==='overview');show('.p3-chooser',id==='overview');
 show('.filter-section',id==='library');show('.table-container',id==='library'&&!!document.querySelector('.table-container')&&!document.querySelector('.table-container').dataset.cardsMode);
 show('#p3-cards',id==='library');show('.p4-root',id==='settings');
 const root=$('p3-root');if(root){root.hidden=false;const heads=root.querySelectorAll(':scope > .p3-heading');if(heads[0])heads[0].hidden=id==='settings';if(heads[1])heads[1].hidden=id!=='library';}
 const kpi=document.querySelector('.kpi-grid');if(kpi)kpi.hidden=id!=='overview';
 const table=document.querySelector('.table-container'),cards=$('p3-cards');if(id==='library'){if(cards)cards.hidden=false;if(table){table.hidden=true;table.dataset.cardsMode='true'}}else if(table){table.hidden=true}
 const chooser=document.querySelector('.p3-chooser');if(chooser)chooser.hidden=id!=='overview';
 const insights=$('p3-insights');if(insights)insights.hidden=id!=='overview';
 const p4=$('p4-root');if(p4)p4.hidden=id!=='settings';
}
function ensureAutocomplete(){
 const title=$('form-titulo');if(!title||title.dataset.p5Bound)return;title.dataset.p5Bound='1';
 const group=title.closest('.form-group');if(!group)return;
 group.classList.add('p5-autocomplete');title.setAttribute('autocomplete','off');title.setAttribute('aria-autocomplete','list');
 const list=make('div','p5-suggestions');list.id='p5-suggestions';list.hidden=true;list.setAttribute('role','listbox');group.append(list);
 const hidden=make('input','');hidden.type='hidden';hidden.id='form-capa-url';hidden.name='capa_url';group.append(hidden);
 const preview=make('div','p5-cover-preview');preview.id='p5-cover-preview';preview.hidden=true;group.append(preview);
 title.addEventListener('input',()=>{
  if(title.value.trim()!==lastSelectedTitle){hidden.value='';preview.replaceChildren();preview.hidden=true}
  clearTimeout(searchTimer);if(searchAbort)searchAbort.abort();
  const q=title.value.trim();if(q.length<2){list.hidden=true;list.replaceChildren();return}
  searchTimer=setTimeout(()=>searchGames(q,list,title,hidden,preview),300);
 });
 title.addEventListener('keydown',e=>{if(e.key==='Escape')list.hidden=true;if(e.key==='ArrowDown'&&!list.hidden){e.preventDefault();list.querySelector('button')?.focus()}});
 document.addEventListener('click',e=>{if(!group.contains(e.target))list.hidden=true});
}
async function searchGames(q,list,title,hidden,preview){
 try{
  searchAbort=new AbortController();const response=await fetch('/api/rawg?q='+encodeURIComponent(q),{signal:searchAbort.signal,headers:{Accept:'application/json'}});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Busca indisponível.');
  if(title.value.trim()!==q)return;
  activeSuggestions=Array.isArray(data.results)?data.results:[];list.replaceChildren();
  if(!activeSuggestions.length){const empty=make('div','p5-suggestion','Nenhum jogo encontrado.');list.append(empty);list.hidden=false;return}
  activeSuggestions.forEach(game=>{
   const b=make('button','p5-suggestion');b.type='button';b.setAttribute('role','option');
   const src=safeImage(game.background_image);if(src){const img=make('img','');img.src=src;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';b.append(img)}else b.append(make('span','p5-suggestion-placeholder','🎮'));
   const text=make('span','',game.name);const details=[(game.platforms||[]).slice(0,3).join(', '),(game.genres||[]).join(', '),game.released].filter(Boolean).join(' · ');text.append(make('small','',details||'Selecionar jogo'));b.append(text);
   b.addEventListener('click',()=>{title.value=game.name;lastSelectedTitle=game.name;hidden.value=src;$('form-genero').value=(game.genres||[]).join(', ');const platform=(game.platforms||[]).find(p=>/PC|PlayStation|Xbox|Nintendo Switch|Android|iOS/i.test(p))||(game.platforms||[])[0];if(platform)$('form-plat').value=normalizePlatform(platform);preview.replaceChildren();if(src){const img=make('img','');img.src=src;img.alt='Capa de '+game.name;img.referrerPolicy='no-referrer';preview.append(img)}preview.append(make('span','',src?'Capa selecionada do catálogo RAWG':'Jogo selecionado; sem capa disponível'));preview.hidden=false;list.hidden=true});
   list.append(b);
  });list.hidden=false;
 }catch(error){if(error.name==='AbortError')return;list.replaceChildren(make('div','p5-suggestion',error.message||'Busca indisponível.'));list.hidden=false}
}
function normalizePlatform(name){const p=String(name||'');if(/windows|pc|linux|mac/i.test(p))return 'PC';if(/switch/i.test(p))return 'Switch';if(/playstation 5/i.test(p))return 'PS5';if(/playstation 4/i.test(p))return 'PS4';if(/playstation/i.test(p))return 'PlayStation';if(/xbox/i.test(p))return 'Xbox';if(/android|ios/i.test(p))return 'Mobile';return p.toUpperCase().slice(0,80)}
function renderCovers(){
 const host=$('p3-cards');if(!host)return;
 host.querySelectorAll('.p3-card').forEach(card=>{
  const game=(window.biblioteca||[]).find(g=>String(g.id)===card.dataset.gameId),cover=card.querySelector('.p3-cover');if(!game||!cover)return;
  const src=safeImage(game.capaUrl);const old=cover.querySelector('.p5-cover-art');
  if(!src){if(old)old.remove();return}
  if(old&&old.src===src)return;if(old)old.remove();
  const img=make('img','p5-cover-art');img.src=src;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';img.addEventListener('error',()=>img.remove(),{once:true});cover.prepend(img);
 });
}
function initObservers(){
 const cards=$('p3-cards');if(cards&&window.MutationObserver)new MutationObserver(renderCovers).observe(cards,{childList:true,subtree:true});
 ensureAutocomplete();renderCovers();
}
document.addEventListener('DOMContentLoaded',()=>{setupLayout();initObservers()});
document.addEventListener('backlog:session-ready',()=>{setupLayout();refreshProfile();initObservers()});
window.addEventListener('load',()=>{renderCovers()});
})();