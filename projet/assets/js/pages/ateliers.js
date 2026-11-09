window.NT_EVENEMENTS={"2027-10-09":"festival","2027-10-10":"festival"};window.NT_EVTS=[{"t":"Festival d\u2019Arch\u00e9ologie Exp\u00e9rimentale d\u2019Occitanie","ty":"festival","d":"2027-10-09","f":"2027-10-10","h":"","l":"","u":""}];

(function(){
function init(){
var root=document.querySelector('.nt-at');
if(!root||root.getAttribute('data-ok')){return;}
root.setAttribute('data-ok','1');
var det=root.querySelector('.nt-at-detail');
var panneaux=root.querySelectorAll('.nt-at-panneau');
var fig=document.querySelector('.nt-at-img');
var img=fig?fig.querySelector('img'):null;
var ul=document.createElement('ul');
ul.className='nt-at-liste';ul.setAttribute('role','tablist');ul.setAttribute('aria-label','Liste des ateliers');
var tabs=[];
Array.prototype.forEach.call(panneaux,function(p,i){
var h=p.querySelector('h3');
var li=document.createElement('li');
var b=document.createElement('button');
b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected','false');
b.textContent=h?h.textContent:'Atelier '+(i+1);
b.addEventListener('click',function(){choisir(i);});
li.appendChild(b);ul.appendChild(li);tabs.push(b);
});
root.appendChild(ul);
function choisir(i){
for(var j=0;j!==tabs.length;j++){tabs[j].setAttribute('aria-selected',j===i?'true':'false');panneaux[j].hidden=(j!==i);}
var ph=panneaux[i].querySelector('.nt-at-photo img');
if(img&&ph){img.removeAttribute('srcset');img.removeAttribute('sizes');img.src=ph.getAttribute('src');img.alt=ph.getAttribute('alt')||'';}
det.classList.remove('nt-at-anim');
if(fig){fig.classList.remove('nt-img-anim');}
void det.offsetWidth;
det.classList.add('nt-at-anim');
if(fig){fig.classList.add('nt-img-anim');}
}
choisir(0);
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
