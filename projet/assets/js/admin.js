/* Néotisse — espace d'administration (avis, événements, actualités, partenaires). */
(function () {
  'use strict';
  var U = window.NTU, esc = U.esc;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var racine = $('#admin'), onglet = 'avis', cache = {};
  var STATUTS = { pending: 'À relire', published: 'Publié', rejected: 'Refusé' };
  var TYPES = { festival: 'Festival', ateliers: 'Ateliers explicatifs, démonstratifs, participatifs', tissages: 'Tissages', enfant: 'Atelier enfant' };

  function vueLogin(msg) {
    racine.innerHTML = '<form class="nt-login nt-form" id="login" novalidate><h1>Espace membres</h1><p class="nt-aide">Réservé aux fondatrices de l’association.</p>' +
      '<div class="nt-ch"><label for="l-mail">Adresse e-mail</label><input id="l-mail" type="email" autocomplete="username" required></div>' +
      '<div class="nt-ch"><label for="l-mdp">Mot de passe</label><input id="l-mdp" type="password" autocomplete="current-password" required></div>' +
      '<p class="nt-msg is-err" role="alert">' + esc(msg || '') + '</p><button class="nt-b" type="submit">Se connecter</button>' +
      (NT.demo ? '<p class="nt-aide">Mode démonstration : n’importe quelle adresse et n’importe quel mot de passe fonctionnent.</p>' : '') + '</form>';
    $('#login').addEventListener('submit', function (e) {
      e.preventDefault();
      NT.api.login($('#l-mail').value.trim(), $('#l-mdp').value).then(function () { vueAdmin(); }).catch(function (er) { vueLogin(er.message); });
    });
  }

  function vueAdmin() {
    NT.api.session().then(function (s) { if (!s) return vueLogin(); dessinerCadre(s); charger(); }).catch(function (e) { vueLogin(e.message); });
  }
  function dessinerCadre(s) {
    racine.innerHTML = '<div class="nt-admin"><div class="nt-ad-bar"><div><h1>Espace membres</h1><p class="nt-aide">Connectée : ' + esc(s.email) + '</p></div><div class="nt-btns"><a class="nt-b2" href="../index.html">Voir le site</a><button class="nt-b2" id="deco" type="button">Se déconnecter</button></div></div>' +
      '<div class="nt-onglets" role="tablist" aria-label="Rubriques"></div><div id="zone" aria-live="polite"></div></div>';
    $('#deco').addEventListener('click', function () { NT.api.logout().then(vueLogin); });
  }
  function onglets(nbAttente) {
    var defs = [['avis', 'Avis'], ['events', 'Événements'], ['news', 'Actualités'], ['partners', 'Partenaires']];
    $('.nt-onglets').innerHTML = defs.map(function (d) {
      return '<button type="button" role="tab" data-o="' + d[0] + '" aria-selected="' + (d[0] === onglet) + '">' + d[1] + (d[0] === 'avis' && nbAttente ? '<span class="nt-compte" aria-label="' + nbAttente + ' à relire">' + nbAttente + '</span>' : '') + '</button>';
    }).join('');
    $$('.nt-onglets button').forEach(function (b) { b.addEventListener('click', function () { onglet = b.getAttribute('data-o'); charger(); }); });
  }
  function erreur(e) { $('#zone').innerHTML = '<p class="nt-msg is-err" role="alert">' + esc(e.message || 'Une erreur est survenue.') + '</p>'; }
  function charger() {
    NT.api.reviewsAll().then(function (r) {
      cache.reviews = r; onglets(r.filter(function (x) { return x.status === 'pending'; }).length);
      if (onglet === 'avis') return listeAvis();
      return NT.api.list(onglet).then(function (l) { cache[onglet] = l; if (onglet === 'events') listeEvents(); else if (onglet === 'news') listeNews(); else listePartners(); });
    }).catch(erreur);
  }

  /* ----- Avis ----- */
  function listeAvis() {
    var r = cache.reviews, ordre = { pending: 0, published: 1, rejected: 2 };
    r = r.slice().sort(function (a, b) { return ordre[a.status] - ordre[b.status]; });
    $('#zone').innerHTML = r.length ? '<ul class="nt-ad-liste">' + r.map(function (a) {
      var acts = a.status === 'published' ? '<button type="button" data-act="rejected" data-id="' + esc(a.id) + '">Retirer de la page</button>' :
        '<button type="button" class="ok" data-act="published" data-id="' + esc(a.id) + '">Publier</button>' + (a.status === 'pending' ? '<button type="button" data-act="rejected" data-id="' + esc(a.id) + '">Refuser</button>' : '');
      return '<li class="nt-ad-carte"><h3>' + esc(a.first_name) + '<span class="nt-statut ' + esc(a.status) + '">' + esc(STATUTS[a.status] || a.status) + '</span></h3><p class="nt-ad-meta">' + esc([a.profile, a.subject, a.rating + ' sur 5', U.dateFr(a.created_at)].filter(Boolean).join(' · ')) + '</p><p>' + esc(a.message) + '</p><div class="nt-ad-actions">' + acts + '<button type="button" class="danger" data-act="del" data-id="' + esc(a.id) + '">Supprimer</button></div></li>';
    }).join('') + '</ul>' : '<p class="nt-ev-vide">Aucun avis pour le moment.</p>';
    $$('#zone [data-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-id'), a = b.getAttribute('data-act');
        if (a === 'del') { if (!window.confirm('Supprimer définitivement cet avis ? Cette action est irréversible.')) return; NT.api.remove('reviews', id).then(charger).catch(erreur); }
        else NT.api.setReviewStatus(id, a).then(charger).catch(erreur);
      });
    });
  }

  /* ----- Formulaires génériques ----- */
  function champ(id, label, type, val, opt) {
    opt = opt || {};
    var cl = 'nt-ch' + (opt.large ? ' large' : '');
    if (type === 'textarea') return '<div class="' + cl + '"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" name="' + id + '"' + (opt.req ? ' required' : '') + '>' + esc(val) + '</textarea></div>';
    if (type === 'select') return '<div class="' + cl + '"><label for="' + id + '">' + label + '</label><select id="' + id + '" name="' + id + '">' + Object.keys(opt.options).map(function (k) { return '<option value="' + esc(k) + '"' + (k === val ? ' selected' : '') + '>' + esc(opt.options[k]) + '</option>'; }).join('') + '</select></div>';
    return '<div class="' + cl + '"><label for="' + id + '">' + label + (opt.hint ? ' <span>(' + opt.hint + ')</span>' : '') + '</label><input id="' + id + '" name="' + id + '" type="' + type + '" value="' + esc(val) + '"' + (opt.req ? ' required' : '') + (opt.ph ? ' placeholder="' + esc(opt.ph) + '"' : '') + '></div>';
  }
  function boutons(item) { return '<div class="nt-btns large nt-ch"><button class="nt-b" type="submit">' + (item.id ? 'Enregistrer' : 'Ajouter') + '</button>' + (item.id ? '<button class="nt-b2" type="button" id="annuler">Annuler</button>' : '') + '</div><p class="nt-msg" role="status"></p>'; }
  function imageChamp(item, cle) {
    return '<div class="nt-ch large"><label for="f-img">Image <span>(facultatif)</span></label><input id="f-img" type="file" accept="image/*"><input type="hidden" name="' + cle + '" value="' + esc(item[cle] || '') + '">' + (item[cle] ? '<p class="nt-aide">Une image est déjà enregistrée. Choisissez-en une autre pour la remplacer.</p>' : '') + '</div>';
  }
  function lierFormulaire(type, item, rafraichir, fichiers) {
    var f = $('#zone form'); if (!f) return;
    var a = $('#annuler', f); if (a) a.addEventListener('click', function () { rafraichir(null); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('.nt-msg', f); if (msg) { msg.textContent = ''; msg.className = 'nt-msg'; }
      var d = {}; $$('input,select,textarea', f).forEach(function (c) { if (c.name) d[c.name] = c.value; });
      var o = item.id ? { id: item.id } : {};
      var mapped = fichiers.map(d);
      Object.keys(mapped).forEach(function (k) { o[k] = mapped[k]; });
      var err = fichiers.verif ? fichiers.verif(o) : '';
      if (err) { msg.textContent = err; msg.className = 'nt-msg is-err'; return; }
      var bt = $('button[type=submit]', f); bt.disabled = true;
      var fic = $('#f-img', f);
      var etape = fic && fic.files && fic.files[0] ? NT.api.upload(fic.files[0]).then(function (u) { o[fichiers.cleImage] = u; }) : Promise.resolve();
      etape.then(function () { return NT.api.save(type, o); }).then(function () { rafraichir(null, true); }).catch(function (er) { bt.disabled = false; msg.textContent = er.message || 'Erreur.'; msg.className = 'nt-msg is-err'; });
    });
  }
  function carteListe(titre, meta, extra, id, type) {
    return '<li class="nt-ad-carte"><h3>' + esc(titre) + '</h3><p class="nt-ad-meta">' + esc(meta) + '</p>' + (extra || '') + '<div class="nt-ad-actions"><button type="button" data-edit="' + esc(id) + '">Modifier</button><button type="button" class="danger" data-del="' + esc(id) + '">Supprimer</button></div></li>';
  }
  function brancherListe(type, liste, vue) {
    $$('#zone [data-edit]').forEach(function (b) { b.addEventListener('click', function () { var it = liste.filter(function (x) { return String(x.id) === b.getAttribute('data-edit'); })[0]; vue(it); window.scrollTo({ top: 0, behavior: 'smooth' }); }); });
    $$('#zone [data-del]').forEach(function (b) { b.addEventListener('click', function () { if (!window.confirm('Supprimer définitivement ? Cette action est irréversible.')) return; NT.api.remove(type, b.getAttribute('data-del')).then(charger).catch(erreur); }); });
  }

  /* ----- Événements ----- */
  function listeEvents(edit) {
    var l = cache.events, it = edit || {};
    var form = '<form class="nt-ad-form nt-form" novalidate><h2 class="large" style="grid-column:1/-1;font-family:var(--f-texte);font-size:20px;margin:0;text-transform:none;letter-spacing:0">' + (it.id ? 'Modifier l’événement' : 'Ajouter un événement') + '</h2>' +
      champ('title', 'Titre', 'text', it.title, { req: 1, large: 1 }) + champ('type', 'Type d’événement', 'select', it.type || 'ateliers', { options: TYPES }) + champ('time_text', 'Horaires', 'text', it.time_text, { hint: 'facultatif', ph: '14 h – 17 h' }) +
      champ('start_date', 'Date de début', 'date', it.start_date, { req: 1 }) + champ('end_date', 'Date de fin', 'date', it.end_date, { hint: 'laisser vide si un seul jour' }) +
      champ('place', 'Lieu', 'text', it.place, { hint: 'facultatif' }) + champ('organizer', 'Structure organisatrice', 'text', it.organizer, { hint: 'ex. nom du musée' }) +
      champ('booking_url', 'Lien de réservation', 'url', it.booking_url, { hint: 'page de la structure, commence par https://', large: 1 }) +
      champ('description', 'Description courte', 'textarea', it.description, { large: 1 }) + boutons(it) + '</form>';
    $('#zone').innerHTML = form + '<ul class="nt-ad-liste">' + (l.length ? l.map(function (e) { return carteListe(e.title, [U.periode(e), e.place, TYPES[e.type]].filter(Boolean).join(' · '), '', e.id); }).join('') : '<li class="nt-ev-vide">Aucun événement.</li>') + '</ul>';
    lierFormulaire('events', it, function (x, ok) { if (ok) charger(); else listeEvents(x); }, {
      map: function (d) { return { title: d.title.trim(), type: d.type, start_date: d.start_date, end_date: d.end_date || d.start_date, time_text: d.time_text.trim(), place: d.place.trim(), organizer: d.organizer.trim(), booking_url: d.booking_url.trim(), description: d.description.trim() }; },
      verif: function (o) { if (!o.title) return 'Merci d’indiquer un titre.'; if (!o.start_date) return 'Merci d’indiquer la date de début.'; if (o.end_date < o.start_date) return 'La date de fin ne peut pas être avant la date de début.'; if (o.booking_url && !/^https?:\/\//i.test(o.booking_url)) return 'Le lien doit commencer par https://'; return ''; }
    });
    brancherListe('events', l, listeEvents);
  }

  /* ----- Actualités ----- */
  function listeNews(edit) {
    var l = cache.news, it = edit || {};
    var form = '<form class="nt-ad-form nt-form" novalidate><h2 style="grid-column:1/-1;font-family:var(--f-texte);font-size:20px;margin:0;text-transform:none;letter-spacing:0">' + (it.id ? 'Modifier l’actualité' : 'Ajouter une actualité') + '</h2>' +
      champ('title', 'Titre', 'text', it.title, { req: 1, large: 1 }) + champ('published_at', 'Date', 'date', it.published_at ? String(it.published_at).slice(0, 10) : new Date().toISOString().slice(0, 10), { req: 1 }) +
      champ('summary', 'Résumé (une ou deux phrases)', 'textarea', it.summary, { large: 1, req: 1 }) + champ('body', 'Texte complet', 'textarea', it.body, { large: 1 }) + imageChamp(it, 'image_url') + boutons(it) + '</form>';
    $('#zone').innerHTML = form + '<ul class="nt-ad-liste">' + (l.length ? l.map(function (n) { return carteListe(n.title, U.dateFr(n.published_at), '<p>' + esc(n.summary) + '</p>', n.id); }).join('') : '<li class="nt-ev-vide">Aucune actualité.</li>') + '</ul>';
    lierFormulaire('news', it, function (x, ok) { if (ok) charger(); else listeNews(x); }, {
      cleImage: 'image_url',
      map: function (d) { return { title: d.title.trim(), published_at: d.published_at, summary: d.summary.trim(), body: d.body.trim(), image_url: d.image_url || null }; },
      verif: function (o) { return !o.title ? 'Merci d’indiquer un titre.' : !o.summary ? 'Merci d’écrire un résumé.' : ''; }
    });
    brancherListe('news', l, listeNews);
  }

  /* ----- Partenaires ----- */
  function listePartners(edit) {
    var l = cache.partners, it = edit || {};
    var form = '<form class="nt-ad-form nt-form" novalidate><h2 style="grid-column:1/-1;font-family:var(--f-texte);font-size:20px;margin:0;text-transform:none;letter-spacing:0">' + (it.id ? 'Modifier le partenaire' : 'Ajouter un partenaire') + '</h2>' +
      champ('name', 'Nom du partenaire', 'text', it.name, { req: 1 }) + champ('url', 'Site du partenaire', 'url', it.url, { hint: 'facultatif, commence par https://' }) +
      champ('sort_order', 'Ordre d’affichage', 'number', it.sort_order != null ? it.sort_order : (l.length + 1), {}) + imageChamp(it, 'logo_url') + boutons(it) + '</form>';
    $('#zone').innerHTML = form + '<p class="nt-aide">Ajoutez un logo seulement si le partenaire a donné son accord.</p><ul class="nt-ad-liste">' + (l.length ? l.map(function (p) { return carteListe(p.name, p.url || 'Sans lien', '', p.id); }).join('') : '<li class="nt-ev-vide">Aucun partenaire.</li>') + '</ul>';
    lierFormulaire('partners', it, function (x, ok) { if (ok) charger(); else listePartners(x); }, {
      cleImage: 'logo_url',
      map: function (d) { return { name: d.name.trim(), url: d.url.trim(), sort_order: parseInt(d.sort_order, 10) || 0, logo_url: d.logo_url || null }; },
      verif: function (o) { return !o.name ? 'Merci d’indiquer un nom.' : (o.url && !/^https?:\/\//i.test(o.url)) ? 'Le lien doit commencer par https://' : ''; }
    });
    brancherListe('partners', l, listePartners);
  }

  NT.api.session().then(function (s) { if (s) { dessinerCadre(s); charger(); } else vueLogin(); }).catch(function (e) { vueLogin(e.message); });
})();
