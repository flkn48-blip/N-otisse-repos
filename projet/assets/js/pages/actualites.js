/* Événements du calendrier. Ceux marqués « (exemple) » sont fictifs, pour montrer le rendu : à supprimer avant la mise en ligne. */
window.NT_EVTS=[{"t": "Atelier démonstratif de filage (exemple)", "ty": "ateliers", "d": "2026-11-21", "f": "2026-11-21", "h": "14 h – 17 h", "l": "Montpellier", "u": ""}, {"t": "Atelier enfant : tissage sur carton (exemple)", "ty": "enfant", "d": "2026-11-28", "f": "2026-11-28", "h": "10 h – 12 h", "l": "Médiathèque, Montpellier", "u": ""}, {"t": "Stage de tissage aux tablettes (exemple)", "ty": "tissages", "d": "2026-12-05", "f": "2026-12-06", "h": "9 h 30 – 17 h", "l": "Lattes", "u": ""}, {"t": "Démonstration de teinture végétale (exemple)", "ty": "ateliers", "d": "2026-12-16", "f": "2026-12-16", "h": "15 h – 18 h", "l": "Musée Henri Prades, Lattes", "u": ""}, {"t": "Atelier enfant : fusaïoles et filage (exemple)", "ty": "enfant", "d": "2027-01-23", "f": "2027-01-23", "h": "14 h – 16 h", "l": "Montpellier", "u": ""}, {"t": "Tissage sur métier vertical (exemple)", "ty": "tissages", "d": "2027-02-13", "f": "2027-02-14", "h": "10 h – 17 h", "l": "Montpellier", "u": ""}, {"t": "Festival d’Archéologie Expérimentale d’Occitanie", "ty": "festival", "d": "2027-10-09", "f": "2027-10-10", "h": "", "l": "", "u": ""}];
/* Jours colorés dans la grille, calculés à partir de la liste ci-dessus */
window.NT_EVENEMENTS=(function(){var m={};window.NT_EVTS.forEach(function(e){var d=new Date(e.d+'T12:00:00'),f=new Date(e.f+'T12:00:00');for(;d<=f;d.setDate(d.getDate()+1)){var k=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);if(!m[k]){m[k]=e.ty;}}});return m;})();

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
var EVENEMENTS=window.NT_EVENEMENTS||{};
var EVTS=window.NT_EVTS||[];
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
function ligne(e){return '<li><span class="nt-ev-pt nt-pt-'+e.ty+'"></span><div><strong>'+esc(e.t)+'</strong><span>'+dates(e)+(e.h?' · '+esc(e.h):'')+(e.l?' · '+esc(e.l):'')+'</span>'+(e.u?'<a href="'+esc(e.u)+'">En savoir plus</a>':'')+'</div></li>';}
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
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();

(function(){
function init(){
var l=document.querySelectorAll('.nt-lignes .nt-ligne');
Array.prototype.forEach.call(l,function(e){
e.setAttribute('tabindex','0');
e.addEventListener('click',function(ev){if(ev.target.closest('a')){return;}e.classList.toggle('is-open');});
e.addEventListener('keydown',function(ev){if((ev.key==='Enter'||ev.key===' ')&&ev.target===e){ev.preventDefault();e.classList.toggle('is-open');}});
});
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
