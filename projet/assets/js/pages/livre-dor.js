(function(){
function init(){
var racine=document.querySelector('.nt-livre');
if(!racine){return;}
var cartes=Array.prototype.slice.call(racine.querySelectorAll('.nt-av'));
var plus=racine.querySelector('.nt-lv-btn2');
var filtre='';
var PAS=6;
var visibles=PAS;
function maj(){
var n=0;var total=0;
cartes.forEach(function(c){
var ok=!filtre||c.getAttribute('data-profil')===filtre;
if(ok){total++;}
var montre=ok&&n<visibles;
if(montre){n++;}
c.hidden=!montre;
});
if(plus){plus.hidden=total<=visibles;}
}
var fs=racine.querySelectorAll('.nt-lv-filtres button');
Array.prototype.forEach.call(fs,function(b){
b.addEventListener('click',function(){
Array.prototype.forEach.call(fs,function(x){x.classList.remove('is-on');});
b.classList.add('is-on');
filtre=b.getAttribute('data-f')||'';
visibles=PAS;
maj();
});
});
if(plus){plus.addEventListener('click',function(){visibles+=PAS;maj();});}
maj();
var ouvrir=racine.querySelector('#nt-lv-ouvrir');
var form=racine.querySelector('#nt-lv-form');
if(ouvrir&&form){
ouvrir.addEventListener('click',function(){
var o=form.hidden;
form.hidden=!o;
ouvrir.setAttribute('aria-expanded',o?'true':'false');
if(o){var p=form.querySelector('input[name=prenom]');if(p){p.focus();}}
});
form.addEventListener('submit',function(e){
e.preventDefault();
var msg=form.querySelector('.nt-lv-msg');
function dire(t,c){msg.textContent=t;msg.className='nt-lv-msg '+(c||'');}
var f=new FormData(form);
var note=f.get('note');
var data={prenom:(f.get('prenom')||'').trim(),profil:f.get('profil')||'',sujet:f.get('sujet')||'',note:note?parseInt(note,10):0,message:(f.get('message')||'').trim(),accord:!!f.get('accord'),site:f.get('site')||''};
if(data.prenom.length<2){dire('Merci d’indiquer votre prénom.','is-err');return;}
if(!data.note){dire('Merci de choisir une note.','is-err');return;}
if(data.message.length<10){dire('Merci d’écrire quelques mots pour votre avis.','is-err');return;}
if(!data.accord){dire('Merci de cocher la case d’accord de publication.','is-err');return;}
var bt=form.querySelector('button[type=submit]');
bt.disabled=true;
dire('Envoi en cours…','');
fetch('/wp-json/neotisse/v1/avis',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
.then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
.then(function(res){
if(res.ok&&res.j&&res.j.ok){
form.classList.add('is-envoye');
dire('Merci ! Votre avis sera publié après relecture par l’association.','is-ok');
}else{
bt.disabled=false;
dire((res.j&&res.j.message)?res.j.message:'Une erreur est survenue. Merci de réessayer.','is-err');
}
})
.catch(function(){bt.disabled=false;dire('Une erreur est survenue. Vérifiez votre connexion et réessayez.','is-err');});
});
}
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
