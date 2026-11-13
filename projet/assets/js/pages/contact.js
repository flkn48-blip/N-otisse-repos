(function(){
function init(){
var f=document.querySelector('.nt-form');
if(!f){return;}
var sel=f.querySelector('#nt-profil');
var btn=f.querySelector('button[type=submit]');
var err=f.querySelector('.nt-erreur');
function afficherErreur(t){err.textContent=t;err.classList.add('is-visible');}
function maj(){
var p=sel.value==='Particulier';
f.classList.toggle('is-particulier',p);
btn.textContent=p?'Voir le calendrier et les actualités':'Envoyer';
err.classList.remove('is-visible');
}
sel.addEventListener('change',maj);
maj();
try{
var q=new URLSearchParams(window.location.search).get('atelier');
if(q){
q=q.replace(/[\r\n]+/g,' ').trim().slice(0,100);
var ta=f.elements.message;
if(q&&ta&&!ta.value){ta.value='Atelier souhaité : '+q+'\n\n';}
}
}catch(e){}
/* Page unique : les boutons « Demander cet atelier » (section Ateliers) préremplissent le message */
document.addEventListener('click',function(e){
var l=e.target.closest&&e.target.closest('a[data-atelier]');
if(!l){return;}
var nom=(l.getAttribute('data-atelier')||'').replace(/[\r\n]+/g,' ').trim().slice(0,100);
var ta=f.elements.message;
if(nom&&ta&&(!ta.value||/^Atelier souhaité : /.test(ta.value))){ta.value='Atelier souhaité : '+nom+'\n\n';}
});
f.addEventListener('submit',function(e){
e.preventDefault();
if(sel.value==='Particulier'){var cal=document.getElementById('calendrier');if(cal){if(window.ntLenis){window.ntLenis.scrollTo(cal,{offset:-80});}else{cal.scrollIntoView({behavior:'smooth'});}}else{window.location.href='../index.html#calendrier';}return;}
if(!f.reportValidity()){return;}
var nom=f.elements.nom.value.trim();
var mail=f.elements.email.value.trim();
var msg=f.elements.message.value.trim();
if(!nom||!mail||!msg){afficherErreur('Merci de renseigner votre nom, votre adresse e-mail et votre message.');return;}
err.classList.remove('is-visible');
btn.disabled=true;
btn.textContent='Envoi en cours…';
/* Envoi par Netlify Forms : le message arrive dans Netlify (onglet Forms) et par e-mail à l'association.
   Le champ piège « site » est ignoré par Netlify (netlify-honeypot), ce qui écarte les robots. */
fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()})
.then(function(r){return {ok:r.ok,d:{}};})
.then(function(res){
if(res.ok){f.classList.add('is-envoye');return;}
btn.disabled=false;maj();
afficherErreur((res.d&&res.d.message)||'Le message n’a pas pu être envoyé. Merci de réessayer plus tard.');
})
.catch(function(){
btn.disabled=false;maj();
afficherErreur('Le message n’a pas pu être envoyé. Vérifiez votre connexion et réessayez.');
});
});
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
