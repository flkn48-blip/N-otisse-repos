/* Néotisse — comportements du site public. */
(function () {
  'use strict';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function urlSure(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }
  function paragraphes(t) { return String(t || '').split(/\n{2,}/).map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join(''); }
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function dateFr(iso) { var p = String(iso || '').slice(0, 10).split('-'); if (p.length < 3) return ''; return parseInt(p[2], 10) + (p[2] === '01' ? 'er' : '') + ' ' + MOIS[parseInt(p[1], 10) - 1] + ' ' + p[0]; }
  function periode(e) { if (!e.end_date || e.end_date === e.start_date) return dateFr(e.start_date); return 'Du ' + dateFr(e.start_date) + ' au ' + dateFr(e.end_date); }
  function etoiles(n) { n = Math.max(0, Math.min(5, n | 0)); var s = ''; for (var i = 0; i < 5; i++) s += i < n ? '★' : '<i>★</i>'; return '<span class="nt-et" role="img" aria-label="Note : ' + n + ' sur 5">' + s + '</span>'; }
  window.NTU = { esc: esc, urlSure: urlSure, dateFr: dateFr, periode: periode, etoiles: etoiles, paragraphes: paragraphes, MOIS: MOIS };

  /* ----- Commun ----- */
  function commun() {
    var h = $('.nt-head');
    var b = $('.nt-burger');
    if (b && h) {
      b.addEventListener('click', function () {
        var o = h.classList.toggle('is-open');
        b.setAttribute('aria-expanded', o ? 'true' : 'false');
        b.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu');
      });
      $$('.nt-nav a').forEach(function (a) { a.addEventListener('click', function () { h.classList.remove('is-open'); b.setAttribute('aria-expanded', 'false'); }); });
    }
    var sub = $('.nt-has-sub'), sb = $('.nt-sub-btn');
    if (sub && sb) {
      sb.addEventListener('click', function (e) { e.stopPropagation(); var o = sub.classList.toggle('is-open'); sb.setAttribute('aria-expanded', o ? 'true' : 'false'); });
      document.addEventListener('click', function (e) { if (!sub.contains(e.target)) { sub.classList.remove('is-open'); sb.setAttribute('aria-expanded', 'false'); } });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { sub.classList.remove('is-open'); sb.setAttribute('aria-expanded', 'false'); } });
    }
    if (window.NT && NT.demo) {
      var d = document.createElement('div');
      d.className = 'nt-demo';
      d.textContent = 'Mode démonstration : les données restent dans votre navigateur. Pour les rendre réelles, branchez Supabase (voir le guide).';
      document.body.insertBefore(d, document.body.firstChild);
    }
    $$('.nt-pilule').forEach(function (p, _, all) {
      p.addEventListener('click', function () { var o = p.classList.contains('is-ouvert'); all.forEach(function (q) { q.classList.remove('is-ouvert'); }); if (!o) p.classList.add('is-ouvert'); });
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.click(); } });
    });
  }

  /* ----- Ateliers ----- */
  function ateliers() {
    var btns = $$('.nt-at-liste button'), panneaux = $$('.nt-at-detail');
    function choisir(i) {
      btns.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      panneaux.forEach(function (p, k) { p.hidden = k !== i; });
    }
    btns.forEach(function (b, i) { b.addEventListener('click', function () { choisir(i); }); });
    choisir(0);
  }

  /* ----- Calendrier ----- */
  var TYPES = { festival: 'Festival d’archéologie expérimentale', ateliers: 'Ateliers explicatifs, démonstratifs, participatifs', tissages: 'Tissages', enfant: 'Atelier enfant' };
  function boutonResa(e) {
    var u = urlSure(e.booking_url);
    if (u) {
      var nom = e.organizer ? 'Réserver sur le site de ' + esc(e.organizer) : 'Réserver sur le site de l’organisateur';
      return '<a class="nt-b nt-resa" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + nom + '<span class="sr-only"> (nouvel onglet, site externe)</span></a><span class="nt-resa-note">L’inscription se fait auprès de l’organisateur.</span>';
    }
    return '<span class="nt-resa-note">Informations auprès de la structure organisatrice.</span>';
  }
  function calendrier() {
    var zone = $('#cal'); if (!zone) return;
    var auj = new Date(), an = auj.getFullYear(), mo = auj.getMonth(), evts = [];
    function iso(y, m, d) { return y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + d).slice(-2); }
    function dessiner() {
      $('#cal-mois').textContent = MOIS[mo] + ' ' + an;
      var premier = new Date(an, mo, 1), decal = (premier.getDay() + 6) % 7, nb = new Date(an, mo + 1, 0).getDate(), h = '';
      var cases = Math.ceil((decal + nb) / 7) * 7;
      for (var i = 0; i < cases; i++) {
        if (i % 7 === 0) h += '<tr>';
        var d = i - decal + 1, hors = d < 1 || d > nb, dt = new Date(an, mo, d), cls = hors ? 'hors' : '';
        var s = iso(dt.getFullYear(), dt.getMonth(), dt.getDate());
        if (!hors && dt.toDateString() === auj.toDateString()) cls += ' auj';
        h += '<td class="' + cls + '"' + (hors ? ' aria-hidden="true"' : '') + '><span class="nt-j">' + dt.getDate() + '</span>';
        if (!hors) evts.forEach(function (e) {
          if (e.start_date <= s && (e.end_date || e.start_date) >= s) h += '<button type="button" class="nt-evt nt-t-' + esc(e.type) + '" data-id="' + esc(e.id) + '" title="' + esc(e.title) + '">' + esc(e.title) + '</button>';
        });
        h += '</td>'; if (i % 7 === 6) h += '</tr>';
      }
      $('#cal-corps').innerHTML = h;
      $$('#cal-corps .nt-evt').forEach(function (b) { b.addEventListener('click', function () { detail(b.getAttribute('data-id')); }); });
      liste();
      $('#cal-detail').innerHTML = ''; $('#cal-detail').hidden = true;
    }
    function duMois() { var d = iso(an, mo, 1), f = iso(an, mo, new Date(an, mo + 1, 0).getDate()); return evts.filter(function (e) { return e.start_date <= f && (e.end_date || e.start_date) >= d; }); }
    function ligne(e, details) {
      var meta = [periode(e), e.time_text, e.place].filter(Boolean).join(' · ');
      return '<li><span class="nt-pt nt-t-' + esc(e.type) + '"></span><div><strong>' + esc(e.title) + '</strong><span class="d">' + esc(meta) + '</span>' + (details && e.description ? '<span class="d">' + esc(e.description) + '</span>' : '') + boutonResa(e) + '</div></li>';
    }
    function liste() {
      var m = duMois();
      $('#cal-liste').innerHTML = m.length ? '<ul>' + m.map(function (e) { return ligne(e, true); }).join('') + '</ul>' : '<p class="nt-ev-vide">Aucun événement ce mois-ci.</p>';
    }
    function detail(id) {
      var e = evts.filter(function (x) { return String(x.id) === String(id); })[0]; if (!e) return;
      var z = $('#cal-detail'); z.hidden = false; z.className = 'nt-ev-liste';
      z.innerHTML = '<h3>Détail</h3><ul>' + ligne(e, true) + '</ul>'; z.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    $('#cal-prec').addEventListener('click', function () { mo--; if (mo < 0) { mo = 11; an--; } dessiner(); });
    $('#cal-suiv').addEventListener('click', function () { mo++; if (mo > 11) { mo = 0; an++; } dessiner(); });
    $('#cal-auj').addEventListener('click', function () { an = auj.getFullYear(); mo = auj.getMonth(); dessiner(); });
    $('#cal-legende').innerHTML = Object.keys(TYPES).map(function (k) { return '<li><span class="nt-pt nt-t-' + k + '"></span>' + esc(TYPES[k]) + '</li>'; }).join('');
    NT.api.events().then(function (r) { evts = r || []; dessiner(); }).catch(function () { $('#cal-liste').innerHTML = '<p class="nt-ev-vide">Le calendrier est momentanément indisponible. Écrivez-nous à asso.neotisse@gmail.com.</p>'; });
  }

  /* ----- Actualités ----- */
  function actualites() {
    var z = $('#actus'); if (!z) return;
    NT.api.news().then(function (r) {
      if (!r.length) { z.innerHTML = '<p class="nt-ev-vide">Pas d’actualité pour le moment.</p>'; return; }
      z.innerHTML = r.map(function (n, i) {
        var num = ('0' + (i + 1)).slice(-2);
        return '<article class="nt-actu"><p class="nt-n">' + num + '</p><div><h3>' + esc(n.title) + '</h3>' + (n.published_at ? '<p class="nt-date">' + esc(dateFr(n.published_at)) + '</p>' : '') + '<p class="nt-resume">' + esc(n.summary) + '</p>' + (n.body ? '<details><summary>Lire la suite</summary><div class="nt-corps-actu">' + paragraphes(n.body) + (urlSure(n.image_url) || /^(assets\/|data:image\/)/.test(n.image_url || '') ? '<img src="' + esc(n.image_url) + '" alt="" loading="lazy">' : '') + '</div></details>' : '') + '</div></article>';
      }).join('');
    }).catch(function () { z.innerHTML = '<p class="nt-ev-vide">Les actualités sont momentanément indisponibles.</p>'; });
  }

  /* ----- Partenaires (page Équipe) ----- */
  function partenaires() {
    var z = $('#parts'); if (!z) return;
    NT.api.partners().then(function (r) {
      z.innerHTML = r.map(function (p) {
        var logo = p.logo_url ? '<img src="' + esc(p.logo_url) + '" alt="' + esc(p.name) + '" loading="lazy">' : '<span>' + esc(p.name) + '</span>';
        var u = urlSure(p.url);
        return u ? '<a class="nt-part" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(p.name) + ' (nouvel onglet)">' + logo + '</a>' : '<div class="nt-part" role="img" aria-label="' + esc(p.name) + '">' + logo + '</div>';
      }).join('');
      $$('.nt-part', z).forEach(function (el, i) { el.style.setProperty('--i', i); });
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { z.classList.add('is-visible'); io.disconnect(); } }); }, { threshold: 0.2 });
        io.observe(z);
      } else { z.classList.add('is-visible'); }
    });
  }

  /* ----- Livre d'or ----- */
  var PAS = 4;
  function livre() {
    var mur = $('#lv-mur'); if (!mur) return;
    var avis = [], visibles = PAS;
    function dessiner() {
      var tete = $('#lv-note'), plus = $('#lv-plus');
      if (!avis.length) { mur.innerHTML = '<p class="nt-lv-vide">Le livre d’or attend ses premiers mots. Soyez la première ou le premier à le signer.</p>'; mur.className = ''; tete.innerHTML = ''; plus.hidden = true; return; }
      mur.className = 'nt-lv-mur';
      var somme = avis.reduce(function (s, a) { return s + (a.rating | 0); }, 0), moy = Math.round(somme / avis.length * 10) / 10;
      tete.innerHTML = '<span class="nt-lv-moy">' + String(moy).replace('.', ',') + '</span>' + etoiles(Math.round(moy)) + '<span class="nt-lv-nb">' + avis.length + ' avis</span>';
      mur.innerHTML = avis.slice(0, visibles).map(function (a) {
        return '<article class="nt-av">' + (a.subject ? '<p class="nt-av-sujet">' + esc(a.subject) + '</p>' : '') + etoiles(a.rating) + '<p class="nt-av-txt">' + esc(a.message).replace(/\n/g, '<br>') + '</p><p class="nt-av-qui"><strong>' + esc(a.first_name) + '</strong>' + (a.profile ? '<span>' + esc(a.profile) + '</span>' : '') + '</p></article>';
      }).join('');
      plus.hidden = avis.length <= visibles;
    }
    $('#lv-plus button').addEventListener('click', function () { visibles += PAS; dessiner(); });
    NT.api.reviewsPublished().then(function (r) { avis = r || []; dessiner(); }).catch(function () { mur.innerHTML = '<p class="nt-lv-vide">Les avis sont momentanément indisponibles.</p>'; });

    var ouvrir = $('#lv-ouvrir'), form = $('#lv-form');
    ouvrir.addEventListener('click', function () {
      var ferme = form.hidden; form.hidden = !ferme; ouvrir.setAttribute('aria-expanded', ferme ? 'true' : 'false');
      if (ferme) { var p = $('input[name=prenom]', form); if (p) p.focus(); }
    });
    var dernier = 0;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('.nt-msg', form);
      function dire(t, c) { msg.textContent = t; msg.className = 'nt-msg ' + (c || ''); }
      var f = new FormData(form);
      if (f.get('site')) { return; }
      var d = { first_name: String(f.get('prenom') || '').trim(), profile: f.get('profil') || '', subject: f.get('sujet') || '', rating: parseInt(f.get('note'), 10) || 0, message: String(f.get('message') || '').trim() };
      if (d.first_name.length < 2) return dire('Merci d’indiquer votre prénom.', 'is-err');
      if (!d.rating) return dire('Merci de choisir une note.', 'is-err');
      if (d.message.length < 10) return dire('Merci d’écrire quelques mots pour votre avis.', 'is-err');
      if (d.message.length > 800) return dire('Votre message est trop long (800 caractères maximum).', 'is-err');
      if (/https?:\/\/|www\./i.test(d.message + ' ' + d.first_name)) return dire('Les liens ne sont pas acceptés dans un avis.', 'is-err');
      if (!f.get('accord')) return dire('Merci de cocher la case d’accord de publication.', 'is-err');
      if (Date.now() - dernier < 30000) return dire('Merci de patienter quelques secondes avant un nouvel envoi.', 'is-err');
      var bt = $('button[type=submit]', form); bt.disabled = true; dire('Envoi en cours…');
      NT.api.submitReview(d).then(function () { dernier = Date.now(); form.classList.add('is-envoye'); dire('Merci ! Votre avis sera publié après relecture par l’association.', 'is-ok'); })
        .catch(function () { bt.disabled = false; dire('Une erreur est survenue. Merci de réessayer.', 'is-err'); });
    });
  }

  /* ----- Contact ----- */
  function contact() {
    var form = $('#form-contact'); if (!form) return;
    var profil = $('#c-profil'), champs = $('.nt-champs', form), part = $('.nt-avis-part', form), envoi = $('button[type=submit]', form);
    function maj() {
      var p = profil.value, estPart = p === 'Particulier';
      part.hidden = !estPart; champs.hidden = !p || estPart; envoi.hidden = !p || estPart;
      $$('[data-req]', champs).forEach(function (c) { c.required = !champs.hidden; });
    }
    profil.addEventListener('change', maj); maj();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('.nt-msg', form);
      function dire(t, c) { msg.textContent = t; msg.className = 'nt-msg ' + (c || ''); }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      envoi.disabled = true; dire('Envoi en cours…');
      var corps = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: corps })
        .then(function (r) { if (!r.ok) throw new Error('x'); form.classList.add('is-envoye'); $('.nt-form-ok', form).setAttribute('tabindex', '-1'); $('.nt-form-ok', form).focus(); })
        .catch(function () { envoi.disabled = false; dire('L’envoi n’a pas abouti. Vous pouvez écrire directement à asso.neotisse@gmail.com.', 'is-err'); });
    });
  }

  function init() {
    commun();
    if (document.body.getAttribute('data-page') === 'admin') return;
    if ($('.nt-at')) ateliers();
    if ($('#cal')) calendrier();
    if ($('#actus')) actualites();
    if ($('#parts')) partenaires();
    if ($('#lv-mur')) livre();
    if ($('#form-contact')) contact();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
