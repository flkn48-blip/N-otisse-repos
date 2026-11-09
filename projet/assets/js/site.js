/* Néotisse : comportements du site public. */
(function () {
  'use strict';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function urlSure(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }
  function imageSure(u) { return urlSure(u) || (/^(assets\/|data:image\/)/.test(u || '') ? u : ''); }
  function paragraphes(t) { return String(t || '').split(/\n{2,}/).map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join(''); }
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function dateFr(iso) { var p = String(iso || '').slice(0, 10).split('-'); if (p.length < 3) return ''; return parseInt(p[2], 10) + (p[2] === '01' ? 'er' : '') + ' ' + MOIS[parseInt(p[1], 10) - 1] + ' ' + p[0]; }
  function periode(e) { if (!e.end_date || e.end_date === e.start_date) return dateFr(e.start_date); return 'Du ' + dateFr(e.start_date) + ' au ' + dateFr(e.end_date); }
  function etoiles(n) { n = Math.max(0, Math.min(5, n | 0)); var s = ''; for (var i = 0; i < 5; i++) s += i < n ? '★' : '<i>★</i>'; return '<span class="nt-et" role="img" aria-label="Note : ' + n + ' sur 5">' + s + '</span>'; }
  /* Utilisé aussi par l'espace membres (admin.js). */
  window.NTU = { esc: esc, urlSure: urlSure, dateFr: dateFr, periode: periode, etoiles: etoiles, paragraphes: paragraphes, MOIS: MOIS };

  /* ----- Menu ----- */
  function menu() {
    var tete = $('.nt-head'), burger = $('.nt-burger'), sous = $('.nt-has-sub'), btnSous = $('.nt-sub-btn');
    function fermerSous() { if (!sous) return; sous.classList.remove('is-open'); btnSous.setAttribute('aria-expanded', 'false'); }
    function basculer(ouvert) {
      tete.classList.toggle('is-open', ouvert);
      burger.setAttribute('aria-expanded', String(ouvert));
      burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    }
    if (burger) burger.addEventListener('click', function () { basculer(!tete.classList.contains('is-open')); });
    if (btnSous) {
      btnSous.addEventListener('click', function (e) { e.stopPropagation(); btnSous.setAttribute('aria-expanded', String(sous.classList.toggle('is-open'))); });
      document.addEventListener('click', function (e) { if (!sous.contains(e.target)) fermerSous(); });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      fermerSous();
      if (burger && tete.classList.contains('is-open')) { basculer(false); burger.focus(); }
    });
  }

  function bandeauDemo() {
    if (!window.NT || !NT.demo) return;
    var d = document.createElement('div');
    d.className = 'nt-demo';
    d.textContent = 'Mode démonstration : les données restent dans votre navigateur.';
    document.body.insertBefore(d, document.body.firstChild);
  }

  /* ----- Calendrier ----- */
  var TYPES = { festival: 'Festival d’archéologie expérimentale', ateliers: 'Ateliers explicatifs, démonstratifs, participatifs', tissages: 'Tissages', enfant: 'Atelier enfant' };
  function classeType(t) { return TYPES[t] ? 'nt-t-' + t : ''; }
  function boutonResa(e) {
    var u = urlSure(e.booking_url);
    if (!u) return '<span class="nt-resa-note">Informations auprès de la structure organisatrice.</span>';
    var nom = e.organizer ? 'Réserver sur le site de ' + esc(e.organizer) : 'Réserver sur le site de l’organisateur';
    return '<a class="nt-b nt-resa" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + nom + '<span class="sr-only"> (nouvel onglet, site externe)</span></a><span class="nt-resa-note">L’inscription se fait auprès de l’organisateur.</span>';
  }
  function calendrier() {
    var auj = new Date(), an = auj.getFullYear(), mo = auj.getMonth(), evts = [];
    function iso(y, m, d) { return y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + d).slice(-2); }
    function ligne(e) {
      var meta = [periode(e), e.time_text, e.place].filter(Boolean).join(' · ');
      return '<li><span class="nt-pt ' + classeType(e.type) + '"></span><div><strong>' + esc(e.title) + '</strong><span class="nt-ev-d">' + esc(meta) + '</span>' + (e.description ? '<span class="nt-ev-d">' + esc(e.description) + '</span>' : '') + boutonResa(e) + '</div></li>';
    }
    function dessiner() {
      $('#cal-mois').textContent = MOIS[mo] + ' ' + an;
      var decal = (new Date(an, mo, 1).getDay() + 6) % 7, nb = new Date(an, mo + 1, 0).getDate();
      var cases = Math.ceil((decal + nb) / 7) * 7, h = '';
      for (var i = 0; i < cases; i++) {
        if (i % 7 === 0) h += '<tr>';
        var d = i - decal + 1, hors = d < 1 || d > nb, dt = new Date(an, mo, d);
        var jour = iso(dt.getFullYear(), dt.getMonth(), dt.getDate());
        var cls = hors ? 'hors' : (dt.toDateString() === auj.toDateString() ? 'auj' : '');
        h += '<td class="' + cls + '"' + (hors ? ' aria-hidden="true"' : '') + '><span class="nt-j">' + dt.getDate() + '</span>';
        if (!hors) evts.forEach(function (e) {
          if (e.start_date <= jour && (e.end_date || e.start_date) >= jour) h += '<button type="button" class="nt-evt ' + classeType(e.type) + '" data-id="' + esc(e.id) + '" title="' + esc(e.title) + '" aria-label="' + esc(e.title) + '">' + esc(e.title) + '</button>';
        });
        h += '</td>';
        if (i % 7 === 6) h += '</tr>';
      }
      $('#cal-corps').innerHTML = h;
      $$('#cal-corps .nt-evt').forEach(function (b) { b.addEventListener('click', function () { detail(b.getAttribute('data-id')); }); });
      var debut = iso(an, mo, 1), fin = iso(an, mo, nb);
      var duMois = evts.filter(function (e) { return e.start_date <= fin && (e.end_date || e.start_date) >= debut; });
      $('#cal-liste').innerHTML = duMois.length ? '<ul>' + duMois.map(ligne).join('') + '</ul>' : '<p class="nt-ev-vide">Aucun événement ce mois-ci.</p>';
      $('#cal-detail').hidden = true;
    }
    function detail(id) {
      var e = evts.filter(function (x) { return String(x.id) === String(id); })[0], z = $('#cal-detail');
      if (!e) return;
      z.innerHTML = '<h3>Détail</h3><ul>' + ligne(e) + '</ul>';
      z.hidden = false;
      z.scrollIntoView({ block: 'nearest' });
    }
    $('#cal-prec').addEventListener('click', function () { if (--mo < 0) { mo = 11; an--; } dessiner(); });
    $('#cal-suiv').addEventListener('click', function () { if (++mo > 11) { mo = 0; an++; } dessiner(); });
    $('#cal-auj').addEventListener('click', function () { an = auj.getFullYear(); mo = auj.getMonth(); dessiner(); });
    $('#cal-legende').innerHTML = Object.keys(TYPES).map(function (k) { return '<li><span class="nt-pt nt-t-' + k + '"></span>' + esc(TYPES[k]) + '</li>'; }).join('');
    dessiner();
    NT.api.events().then(function (r) { evts = r || []; dessiner(); }).catch(function () {
      $('#cal-liste').innerHTML = '<p class="nt-ev-vide">Le calendrier est momentanément indisponible. Écrivez-nous à asso.neotisse@gmail.com.</p>';
    });
  }

  /* ----- Actualités : lignes numérotées, détail et image au survol ou au clic ----- */
  function actualites() {
    var z = $('#actus');
    NT.api.news().then(function (r) {
      if (!r.length) { z.innerHTML = '<p>Pas d’actualité pour le moment.</p>'; return; }
      z.innerHTML = r.map(function (n, i) {
        var img = imageSure(n.image_url), aDetail = n.body || img, id = 'actu-' + i;
        return '<article class="nt-actu"><p class="nt-actu-n">' + ('0' + (i + 1)).slice(-2) + '</p><div><h2>' + esc(n.title) + '</h2>' +
          (n.published_at ? '<p class="nt-actu-date">' + esc(dateFr(n.published_at)) + '</p>' : '') +
          '<p class="nt-actu-res">' + esc(n.summary) + '</p>' +
          (aDetail ? '<button type="button" class="nt-actu-btn" aria-expanded="false" aria-controls="' + id + '">Lire la suite</button><div class="nt-actu-plus" id="' + id + '"><div><div class="nt-actu-det"><div>' + paragraphes(n.body) + '</div>' + (img ? '<img src="' + esc(img) + '" alt="' + esc(n.title) + '" loading="lazy">' : '') + '</div></div></div>' : '') +
          '</div></article>';
      }).join('');
      $$('.nt-actu-btn', z).forEach(function (b) {
        b.addEventListener('click', function () {
          var o = b.closest('.nt-actu').classList.toggle('is-open');
          b.setAttribute('aria-expanded', String(o));
          b.textContent = o ? 'Refermer' : 'Lire la suite';
        });
      });
    }).catch(function () { z.innerHTML = '<p>Les actualités sont momentanément indisponibles.</p>'; });
  }

  /* ----- Partenaires ----- */
  function partenaires() {
    var z = $('#parts');
    NT.api.partners().then(function (r) {
      z.innerHTML = r.map(function (p) {
        var logo = imageSure(p.logo_url) ? '<img src="' + esc(p.logo_url) + '" alt="' + esc(p.name) + '" loading="lazy">' : '<span>' + esc(p.name) + '</span>';
        var u = urlSure(p.url);
        return u ? '<a class="nt-part" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + logo + '<span class="sr-only"> (nouvel onglet)</span></a>' : '<div class="nt-part">' + logo + '</div>';
      }).join('');
    }).catch(function () { z.innerHTML = '<p>La liste des partenaires est momentanément indisponible.</p>'; });
  }

  /* ----- Livre d'or ----- */
  var PAS = 6;
  function livre() {
    var avis = [], filtre = '', visibles = PAS;
    var mur = $('#lv-mur'), vedette = $('#lv-vedette'), filtres = $('#lv-filtres'), plus = $('#lv-plus');
    function tags(a) { var l = [a.subject, a.profile].filter(Boolean); return l.length ? '<ul class="nt-tags">' + l.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : ''; }
    function carte(a) {
      return '<article class="nt-av">' + etoiles(a.rating) + '<p class="nt-av-txt">' + esc(a.message).replace(/\n/g, '<br>') + '</p><p class="nt-av-qui"><strong>' + esc(a.first_name) + '</strong></p>' + tags(a) + '</article>';
    }
    function dessinerFiltres() {
      var sujets = avis.map(function (a) { return a.subject; }).filter(function (s, i, t) { return s && t.indexOf(s) === i; });
      if (sujets.length < 2) { filtres.hidden = true; return; }
      filtres.hidden = false;
      filtres.innerHTML = [''].concat(sujets).map(function (s) { return '<button type="button" data-f="' + esc(s) + '" aria-pressed="' + (s === filtre) + '">' + esc(s || 'Tous les avis') + '</button>'; }).join('');
      $$('button', filtres).forEach(function (b) { b.addEventListener('click', function () { filtre = b.getAttribute('data-f'); visibles = PAS; dessiner(); }); });
    }
    function dessiner() {
      var tete = $('#lv-note');
      if (!avis.length) {
        tete.innerHTML = ''; vedette.hidden = true; filtres.hidden = true; plus.hidden = true;
        mur.className = ''; mur.innerHTML = '<p class="nt-lv-vide">Le livre d’or attend ses premiers mots. Soyez la première ou le premier à le signer.</p>';
        return;
      }
      var somme = avis.reduce(function (s, a) { return s + (a.rating | 0); }, 0), moy = Math.round(somme / avis.length * 10) / 10;
      tete.innerHTML = '<span class="nt-lv-moy">' + String(moy).replace('.', ',') + '</span>' + etoiles(Math.round(moy)) + '<span class="nt-lv-nb">' + avis.length + ' avis</span>';
      dessinerFiltres();
      var liste = avis.filter(function (a) { return !filtre || a.subject === filtre; });
      var haut = liste.reduce(function (m, a) { return (a.rating | 0) > (m.rating | 0) ? a : m; }, liste[0]);
      vedette.hidden = false;
      vedette.innerHTML = etoiles(haut.rating) + '<blockquote>« ' + esc(haut.message) + ' »</blockquote><figcaption><strong>' + esc(haut.first_name) + '</strong>' + (haut.profile ? ', ' + esc(haut.profile) : '') + '</figcaption>';
      var reste = liste.filter(function (a) { return a !== haut; });
      mur.className = 'nt-lv-mur';
      mur.innerHTML = reste.slice(0, visibles).map(carte).join('');
      plus.hidden = reste.length <= visibles;
    }
    $('button', plus).addEventListener('click', function () { visibles += PAS; dessiner(); });
    NT.api.reviewsPublished().then(function (r) { avis = r || []; dessiner(); }).catch(function () { mur.innerHTML = '<p class="nt-lv-vide">Les avis sont momentanément indisponibles.</p>'; });

    var ouvrir = $('#lv-ouvrir'), form = $('#lv-form'), dernier = 0;
    ouvrir.addEventListener('click', function () {
      form.hidden = !form.hidden;
      ouvrir.setAttribute('aria-expanded', String(!form.hidden));
      if (!form.hidden) $('input[name=prenom]', form).focus();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('.nt-msg', form);
      function dire(t, c) { msg.textContent = t; msg.className = 'nt-msg ' + (c || ''); }
      var f = new FormData(form);
      if (f.get('site')) return;
      var d = { first_name: String(f.get('prenom') || '').trim(), profile: f.get('profil') || '', subject: f.get('sujet') || '', rating: parseInt(f.get('note'), 10) || 0, message: String(f.get('message') || '').trim() };
      if (d.first_name.length < 2) return dire('Merci d’indiquer votre prénom.', 'is-err');
      if (!d.rating) return dire('Merci de choisir une note.', 'is-err');
      if (d.message.length < 10) return dire('Merci d’écrire quelques mots pour votre avis.', 'is-err');
      if (d.message.length > 800) return dire('Votre message est trop long (800 caractères maximum).', 'is-err');
      if (/https?:\/\/|www\./i.test(d.message + ' ' + d.first_name)) return dire('Les liens ne sont pas acceptés dans un avis.', 'is-err');
      if (!f.get('accord')) return dire('Merci de cocher la case d’accord de publication.', 'is-err');
      if (Date.now() - dernier < 30000) return dire('Merci de patienter quelques secondes avant un nouvel envoi.', 'is-err');
      var bt = $('button[type=submit]', form);
      bt.disabled = true; dire('Envoi en cours…');
      NT.api.submitReview(d).then(function () {
        dernier = Date.now(); form.classList.add('is-envoye');
        dire('Merci ! Votre avis sera publié après relecture par l’association.', 'is-ok');
      }).catch(function () { bt.disabled = false; dire('Une erreur est survenue. Merci de réessayer.', 'is-err'); });
    });
  }

  /* ----- Contact : Netlify Forms, particuliers renvoyés vers le calendrier ----- */
  function contact() {
    var form = $('#form-contact'), profil = $('#c-profil'), champs = $('.nt-champs', form), part = $('.nt-avis-part', form), envoi = $('button[type=submit]', form);
    function maj() {
      var p = profil.value, estPart = p === 'Particulier';
      part.hidden = !estPart; champs.hidden = !p || estPart; envoi.hidden = !p || estPart;
      $$('[data-req]', champs).forEach(function (c) { c.required = !champs.hidden; });
    }
    profil.addEventListener('change', maj); maj();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var msg = $('.nt-msg', form);
      envoi.disabled = true; msg.textContent = 'Envoi en cours…'; msg.className = 'nt-msg';
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
        .then(function (r) {
          if (!r.ok) throw new Error('envoi');
          form.classList.add('is-envoye');
          var ok = $('.nt-form-ok', form); ok.setAttribute('tabindex', '-1'); ok.focus();
        })
        .catch(function () { envoi.disabled = false; msg.textContent = 'L’envoi n’a pas abouti. Vous pouvez écrire directement à asso.neotisse@gmail.com.'; msg.className = 'nt-msg is-err'; });
    });
  }

  function init() {
    menu();
    bandeauDemo();
    if (document.body.getAttribute('data-page') === 'admin') return;
    if ($('#cal')) calendrier();
    if ($('#actus')) actualites();
    if ($('#parts')) partenaires();
    if ($('#lv-mur')) livre();
    if ($('#form-contact')) contact();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
