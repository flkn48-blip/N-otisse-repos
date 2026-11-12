/* Livre d'or : avis publiés en cartes inclinées dans un carrousel, filtre par atelier,
   et formulaire « Laisser un avis » (publié seulement après relecture dans l'espace d'administration).
   Les données passent par NT.api (assets/js/data.js), comme l'espace d'administration. */
(function(){
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function etoiles(n){n=Math.max(0,Math.min(5,n|0));var s='';for(var i=0;i<5;i++){s+=i<n?'★':'<i>★</i>';}return '<span class="nt-et" role="img" aria-label="Note : '+n+' sur 5">'+s+'</span>';}

function init(){
var racine=$('.nt-lv-page');
if(!racine||!window.NT||!NT.api){return;}
var piste=$('#nt-lv-piste'),nav=$('.nt-lv-nav',racine),points=$('.nt-lv-points',racine),filtres=$('#nt-lv-filtres'),note=$('#nt-lv-note');
var avis=[],filtre='';

function carte(a){
var qui=[a.profile,a.subject].filter(Boolean).map(esc).join(' · ');
return '<article class="nt-av">'+etoiles(a.rating)+
'<p class="nt-av-txt">'+esc(a.message).replace(/\n/g,'<br>')+'</p>'+
'<p class="nt-av-qui"><strong>'+esc(a.first_name)+'</strong>'+(qui?'<span>'+qui+'</span>':'')+'</p></article>';
}

function dessinerFiltres(){
var sujets=avis.map(function(a){return a.subject;}).filter(function(s,i,t){return s&&t.indexOf(s)===i;});
if(sujets.length<2){filtres.hidden=true;return;}
filtres.hidden=false;
filtres.innerHTML=[''].concat(sujets).map(function(s){return '<button type="button" data-f="'+esc(s)+'" aria-pressed="'+(s===filtre)+'">'+esc(s||'Tous les avis')+'</button>';}).join('');
$$('button',filtres).forEach(function(b){b.addEventListener('click',function(){filtre=b.getAttribute('data-f');dessiner();});});
}

/* Points de navigation : une page = ce qui tient dans la largeur visible */
function pages(){return Math.max(1,Math.ceil((piste.scrollWidth-4)/piste.clientWidth));}
function pageCourante(){var n=pages();if(n<2){return 0;}var max=piste.scrollWidth-piste.clientWidth;return Math.round(piste.scrollLeft/max*(n-1));}
function aller(i){var n=pages();var max=piste.scrollWidth-piste.clientWidth;piste.scrollTo({left:n<2?0:max*i/(n-1),behavior:'smooth'});}
function majPoints(){
var n=pages();
nav.hidden=n<2;
if(points.children.length!==n){
var h='';for(var i=0;i<n;i++){h+='<button type="button" aria-label="Page '+(i+1)+' sur '+n+'"></button>';}
points.innerHTML=h;
$$('button',points).forEach(function(b,i){b.addEventListener('click',function(){aller(i);});});
}
var c=pageCourante();
$$('button',points).forEach(function(b,i){b.setAttribute('aria-current',i===c?'true':'false');});
}
$$('.nt-lv-fl',racine).forEach(function(b){b.addEventListener('click',function(){
aller(Math.max(0,Math.min(pages()-1,pageCourante()+parseInt(b.getAttribute('data-dir'),10))));
});});
var att=null;
piste.addEventListener('scroll',function(){clearTimeout(att);att=setTimeout(majPoints,80);});
window.addEventListener('resize',majPoints);

function dessiner(){
if(!avis.length){
note.innerHTML='';filtres.hidden=true;nav.hidden=true;
piste.innerHTML='<p class="nt-lv-vide">Le livre d’or attend ses premiers mots. Soyez la première ou le premier à le signer.</p>';
return;
}
var somme=avis.reduce(function(s,a){return s+(a.rating|0);},0),moy=Math.round(somme/avis.length*10)/10;
note.innerHTML='<span class="nt-lv-moy">'+String(moy).replace('.',',')+'</span>'+etoiles(Math.round(moy))+'<span class="nt-lv-nb">'+avis.length+' avis</span>';
dessinerFiltres();
var liste=avis.filter(function(a){return !filtre||a.subject===filtre;});
piste.innerHTML=liste.map(carte).join('');
piste.scrollLeft=0;
majPoints();
}

NT.api.reviewsPublished().then(function(r){avis=r||[];dessiner();}).catch(function(){
piste.innerHTML='<p class="nt-lv-vide">Les avis sont momentanément indisponibles.</p>';
});
var demo=$('.nt-lv-demo',racine);
if(demo&&NT.demo){demo.hidden=false;}

/* ----- Laisser un avis ----- */
var ouvrir=$('#nt-lv-ouvrir'),form=$('#nt-lv-form'),dernier=0;
if(!ouvrir||!form){return;}
ouvrir.addEventListener('click',function(){
var o=form.hidden;
form.hidden=!o;
ouvrir.setAttribute('aria-expanded',o?'true':'false');
if(o){var p=$('input[name=prenom]',form);if(p){p.focus();}}
});
form.addEventListener('submit',function(e){
e.preventDefault();
var msg=$('.nt-lv-msg',form);
function dire(t,c){msg.textContent=t;msg.className='nt-lv-msg '+(c||'');}
var f=new FormData(form);
if(f.get('site')){return;}
var d={first_name:String(f.get('prenom')||'').trim(),profile:f.get('profil')||'',subject:f.get('sujet')||'',rating:parseInt(f.get('note'),10)||0,message:String(f.get('message')||'').trim()};
if(d.first_name.length<2){return dire('Merci d’indiquer votre prénom.','is-err');}
if(!d.rating){return dire('Merci de choisir une note.','is-err');}
if(d.message.length<10){return dire('Merci d’écrire quelques mots pour votre avis.','is-err');}
if(d.message.length>800){return dire('Votre message est trop long (800 caractères maximum).','is-err');}
if(/https?:\/\/|www\./i.test(d.message+' '+d.first_name)){return dire('Les liens ne sont pas acceptés dans un avis.','is-err');}
if(!f.get('accord')){return dire('Merci de cocher la case d’accord de publication.','is-err');}
if(Date.now()-dernier<30000){return dire('Merci de patienter quelques secondes avant un nouvel envoi.','is-err');}
var bt=$('button[type=submit]',form);
bt.disabled=true;dire('Envoi en cours…','');
NT.api.submitReview(d).then(function(){
dernier=Date.now();form.classList.add('is-envoye');
dire('Merci ! Votre avis sera publié après relecture par l’association.','is-ok');
}).catch(function(){bt.disabled=false;dire('Une erreur est survenue. Merci de réessayer.','is-err');});
});
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
