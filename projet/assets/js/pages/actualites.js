/* Calendrier et actualités : le contenu vient de l'espace membres (NT.api, voir assets/js/data.js).
   Ce qui est écrit dans la page sert de version de secours si les données ne se chargent pas. */
function ntEnEvts(l){return (l||[]).map(function(e){return {t:e.title||'',ty:e.type||'ateliers',d:e.start_date,f:e.end_date||e.start_date,h:e.time_text||'',l:e.place||'',o:e.organizer||'',u:e.booking_url||'',desc:e.description||''};}).filter(function(e){return e.d;}).sort(function(x,y){return x.d<y.d?-1:x.d>y.d?1:0;});}
/* Jours colorés dans la grille, calculés à partir de la liste des événements */
function ntJours(evts){var m={};evts.forEach(function(e){var d=new Date(e.d+'T12:00:00'),f=new Date(e.f+'T12:00:00');for(;d<=f;d.setDate(d.getDate()+1)){var k=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);if(!m[k]){m[k]=e.ty;}}});return m;}
/* Version de secours : le Festival, déjà présent dans la page */
window.NT_EVTS=ntEnEvts([{title:'Festival d’Archéologie Expérimentale d’Occitanie',type:'festival',start_date:'2027-10-09',end_date:'2027-10-10',place:'Musée de l’Aurignacien'}]);

(function(){var m={};window.NT_EVTS.forEach(function(e){var d=new Date(e.d+'T12:00:00'),f=new Date(e.f+'T12:00:00');for(;d<=f;d.setDate(d.getDate()+1)){var k=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);if(!m[k]){m[k]=e.ty;}}});return m;})();

(function(){
function init(){
var racine=document.querySelector('.nt-calendrier')||document;
var corps=racine.querySelector('.nt-grille tbody');
if(!corps){return;}
var sel=racine.querySelector('.nt-mois-sel');
var bouton=sel?sel.querySelector('.nt-pill'):null;
var nomMois=sel?sel.querySelector('.nt-pill-nom'):null;
var menu=sel?sel.querySelector('.nt-mois-menu'):null;
var MOIS=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
var NOMS={festival:'Festival d’archéologie expérimentale',ateliers:'Atelier',tissages:'Tissage',enfant:'Atelier enfant'};
var EVTS=window.NT_EVTS||[];
var EVENEMENTS=ntJours(EVTS);
var courant=0;
var auj=new Date();
var an0=auj.getFullYear();
var m0=auj.getMonth();
var liste=[];
for(var i=0;i!==12;i++){var d=new Date(an0,m0+i,1);liste.push({a:d.getFullYear(),m:d.getMonth()});}
function libelle(o){return MOIS[o.m]+(o.a!==an0?' '+o.a:'');}
function pad(n){return (n<10?'0':'')+n;}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function jourFr(iso){var p=iso.split('-');return parseInt(p[2],10)+' '+MOIS[parseInt(p[1],10)-1].toLowerCase()+' '+p[0];}
function dates(e){return e.d===e.f?jourFr(e.d):'du '+jourFr(e.d)+' au '+jourFr(e.f);}
function titresDuJour(iso){return EVTS.filter(function(e){return e.d<=iso&&iso<=e.f;}).map(function(e){return esc(e.t);}).join(' · ');}
/* Bouton de réservation : renvoie vers le site de la structure organisatrice (aucune réservation sur ce site) */
function resa(e){if(!/^https?:\/\//i.test(e.u)){return '';}return '<a class="nt-resa" href="'+esc(e.u)+'" target="_blank" rel="noopener noreferrer">Réserver sur le site '+(e.o?'de '+esc(e.o):'de l’organisateur')+'<span class="nt-sr"> (nouvel onglet)</span></a>';}
function ligne(e){return '<li><span class="nt-ev-pt nt-pt-'+e.ty+'"></span><div><strong>'+esc(e.t)+'</strong><span>'+dates(e)+(e.h?' · '+esc(e.h):'')+(e.l?' · '+esc(e.l):'')+'</span>'+(e.desc?'<span>'+esc(e.desc)+'</span>':'')+resa(e)+'</div></li>';}
function detail(o){
var carte=racine.querySelector('.nt-cal-carte');
if(!carte){return;}
var cont=racine.querySelector('.nt-ev-liste');
if(!cont){cont=document.createElement('div');cont.className='nt-ev-liste';carte.appendChild(cont);}
var debut=o.a+'-'+pad(o.m+1)+'-01';
var fin=o.a+'-'+pad(o.m+1)+'-'+pad(new Date(o.a,o.m+1,0).getDate());
var evs=EVTS.filter(function(e){return e.d<=fin&&e.f>=debut;});
if(evs.length){cont.innerHTML='<ul>'+evs.map(ligne).join('')+'</ul>';return;}
var suite=EVTS.filter(function(e){return e.d>fin;})[0];
cont.innerHTML='<p class="nt-ev-vide">Aucun événement prévu ce mois-ci.'+(suite?' Prochain rendez-vous : <strong>'+esc(suite.t)+'</strong>, '+dates(suite)+'.':'')+'</p>';
}
function ouvrir(o){if(!sel||!bouton){return;}sel.classList.toggle('is-open',o);bouton.setAttribute('aria-expanded',o?'true':'false');}
function afficher(i){
courant=i;
var o=liste[i];
if(nomMois){nomMois.textContent=libelle(o);}
var decal=(new Date(o.a,o.m,1).getDay()+6)%7;
var nb=new Date(o.a,o.m+1,0).getDate();
var lignes=Math.ceil((decal+nb)/7);
var html='';
var jour=1-decal;
for(var l=0;l!==lignes;l++){
html+='<tr>';
for(var c=0;c!==7;c++,jour++){
if(jour<1||jour>nb){html+='<td></td>';continue;}
var iso=o.a+'-'+pad(o.m+1)+'-'+pad(jour);
var t=EVENEMENTS[iso];
var cls=[];
if(t&&NOMS[t]){cls.push('nt-c-'+t);}
if(i===0&&jour===auj.getDate()){cls.push('nt-auj');}
var tit=t?titresDuJour(iso):'';
html+='<td'+(cls.length?' class="'+cls.join(' ')+'"':'')+(tit?' title="'+tit+'"':'')+'>'+jour+(t&&NOMS[t]?'<span class="nt-sr"> : '+(tit||NOMS[t])+'</span>':'')+'</td>';
}
html+='</tr>';
}
corps.innerHTML=html;
detail(o);
if(menu){Array.prototype.forEach.call(menu.querySelectorAll('button'),function(b,k){b.setAttribute('aria-selected',k===i?'true':'false');});}
}
if(menu&&sel&&bouton){
liste.forEach(function(o,i){
var li=document.createElement('li');
li.setAttribute('role','presentation');
var b=document.createElement('button');
b.type='button';
b.setAttribute('role','option');
b.setAttribute('aria-selected','false');
b.textContent=libelle(o);
b.addEventListener('click',function(){afficher(i);ouvrir(false);bouton.focus();});
li.appendChild(b);
menu.appendChild(li);
});
bouton.addEventListener('click',function(){ouvrir(!sel.classList.contains('is-open'));});
document.addEventListener('click',function(e){if(!sel.contains(e.target)){ouvrir(false);}});
sel.addEventListener('keydown',function(e){
var bs=Array.prototype.slice.call(menu.querySelectorAll('button'));
if(e.key==='Escape'){ouvrir(false);bouton.focus();return;}
if(e.key==='ArrowDown'||e.key==='ArrowUp'){
e.preventDefault();
if(!sel.classList.contains('is-open')){ouvrir(true);}
var k=bs.indexOf(document.activeElement);
k=e.key==='ArrowDown'?(k+1)%bs.length:(k<=0?bs.length-1:k-1);
bs[k].focus();
}
});
}
afficher(0);
/* Chargement des événements saisis dans l'espace membres */
if(window.NT&&NT.api){NT.api.events().then(function(r){EVTS=ntEnEvts(r);EVENEMENTS=ntJours(EVTS);afficher(courant);}).catch(function(){});}
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();

/* Actualités : une ligne par actualité saisie dans l'espace membres.
   La dernière ligne de la page (« Envie de participer ? ») reste toujours à la fin. */
(function(){
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function lier(e){
if(e.getAttribute('data-lie')){return;}
e.setAttribute('data-lie','1');
e.setAttribute('tabindex','0');
e.addEventListener('click',function(ev){if(ev.target.closest('a')){return;}e.classList.toggle('is-open');});
e.addEventListener('keydown',function(ev){if((ev.key==='Enter'||ev.key===' ')&&ev.target===e){ev.preventDefault();e.classList.toggle('is-open');}});
}
function ligne(n,num){
var pars=String(n.body||'').split(/\n{2,}/).filter(function(x){return x.trim();});
var txt=pars.map(function(x,i){return '<p class="wp-block-paragraph'+(i===pars.length-1&&pars.length>1?' nt-fin':'')+'">'+esc(x).replace(/\n/g,'<br>')+'</p>';}).join('');
var img=window.NT&&NT.img?NT.img(n.image_url):'';
var detail=(txt||img)?'<div class="wp-block-group nt-detail"><div class="wp-block-group nt-detail-in"><div class="wp-block-group nt-detail-txt">'+txt+'</div>'+(img?'<figure class="wp-block-image nt-ligne-img"><img src="'+esc(img)+'" alt="'+esc(n.title)+'" loading="lazy"></figure>':'')+'</div></div>':'';
return '<div class="wp-block-group nt-ligne"><p class="nt-num wp-block-paragraph">'+num+'</p><h3 class="wp-block-heading nt-ligne-titre">'+esc(n.title)+'</h3><p class="nt-resume wp-block-paragraph">'+esc(n.summary)+'</p>'+detail+'</div>';
}
function deux(i){return (i<10?'0':'')+i;}
function init(){
var zone=document.querySelector('.nt-lignes');
if(!zone){return;}
Array.prototype.forEach.call(zone.querySelectorAll('.nt-ligne'),lier);
if(!window.NT||!NT.api){return;}
var lignes=zone.querySelectorAll('.nt-ligne');
var fin=lignes.length?lignes[lignes.length-1].cloneNode(true):null;
NT.api.news().then(function(r){
r=r||[];
var h=r.map(function(n,i){return ligne(n,deux(i+1));}).join('');
zone.innerHTML=h;
if(fin){fin.removeAttribute('data-lie');fin.classList.remove('is-open');var num=fin.querySelector('.nt-num');if(num){num.textContent=deux(r.length+1);}zone.appendChild(fin);}
Array.prototype.forEach.call(zone.querySelectorAll('.nt-ligne'),lier);
}).catch(function(){});
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
