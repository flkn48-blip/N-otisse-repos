(function () {
  'use strict';
  var cfg = window.NT_CONFIG || {};
  var enLigne = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  var NT = (window.NT = { enLigne: enLigne, demo: !enLigne });
 
  /* ---------- Outils ---------- */
  function uid() { return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function trier(a, k, desc) { return a.slice().sort(function (x, y) { return (x[k] > y[k] ? 1 : x[k] < y[k] ? -1 : 0) * (desc ? -1 : 1); }); }
  NT.uid = uid;
 
  /* ---------- Chemins des images ----------
     Les images du site sont enregistrées sous la forme « assets/img/… » (depuis la racine du site).
     NT.img() ajoute le bon préfixe selon la page (« ../ » pour les pages rangées dans un dossier). */
  var racineSite = (function () {
    var sc = document.currentScript && document.currentScript.src;
    return sc ? sc.replace(/assets\/js\/data\.js(\?.*)?$/, '') : '';
  })();
  NT.img = function (u) {
    if (!u) return '';
    if (/^(https?:|data:image\/)/i.test(u)) return u;
    if (/^assets\//.test(u)) return racineSite + u;
    return '';
  };

  /* ---------- Données de départ du mode démonstration ----------
     Les événements « (exemple) » sont fictifs : ils montrent le rendu du calendrier
     et peuvent être supprimés depuis l'espace membres. */
  function seed() {
    return {
      events: [
        { id: 'e1', title: 'Atelier démonstratif de filage (exemple)', type: 'ateliers', start_date: '2026-11-21', end_date: '2026-11-21', time_text: '14 h – 17 h', place: 'Montpellier', organizer: '', booking_url: '', description: '' },
        { id: 'e2', title: 'Atelier enfant : tissage sur carton (exemple)', type: 'enfant', start_date: '2026-11-28', end_date: '2026-11-28', time_text: '10 h – 12 h', place: 'Médiathèque, Montpellier', organizer: '', booking_url: '', description: '' },
        { id: 'e3', title: 'Stage de tissage aux tablettes (exemple)', type: 'tissages', start_date: '2026-12-05', end_date: '2026-12-06', time_text: '9 h 30 – 17 h', place: 'Lattes', organizer: 'Musée exemple', booking_url: 'https://example.org/reservation', description: '' },
        { id: 'e4', title: 'Démonstration de teinture végétale (exemple)', type: 'ateliers', start_date: '2026-12-16', end_date: '2026-12-16', time_text: '15 h – 18 h', place: 'Musée Henri Prades, Lattes', organizer: '', booking_url: '', description: '' },
        { id: 'e5', title: 'Atelier enfant : fusaïoles et filage (exemple)', type: 'enfant', start_date: '2027-01-23', end_date: '2027-01-23', time_text: '14 h – 16 h', place: 'Montpellier', organizer: '', booking_url: '', description: '' },
        { id: 'e6', title: 'Tissage sur métier vertical (exemple)', type: 'tissages', start_date: '2027-02-13', end_date: '2027-02-14', time_text: '10 h – 17 h', place: 'Montpellier', organizer: '', booking_url: '', description: '' },
        { id: 'e7', title: 'Festival d’Archéologie Expérimentale d’Occitanie', type: 'festival', start_date: '2027-10-09', end_date: '2027-10-10', time_text: '', place: 'Musée de l’Aurignacien', organizer: 'Musée de l’Aurignacien', booking_url: '', description: 'Démonstrations, expérimentations et échanges.' }
      ],
      news: [
        { id: 'n1', title: 'Festival d’Archéologie Expérimentale d’Occitanie', summary: '9 et 10 octobre 2027, avec le musée de l’Aurignacien. Démonstrations, expérimentations et échanges.', body: 'Les 9 et 10 octobre 2027, l’association Néotisse et le musée de l’Aurignacien s’associent pour vous faire découvrir la richesse de l’archéologie expérimentale à l’occasion du tout premier Festival d’Archéologie Expérimentale d’Occitanie.\n\nPendant deux jours, venez à la rencontre d’étudiants, de chercheurs et d’artisans passionnés qui vous feront découvrir cette discipline essentielle à la compréhension des sociétés du passé. Démonstrations, expérimentations et échanges vous permettront d’explorer les techniques et les savoir-faire anciens, de comprendre les gestes de nos ancêtres et de découvrir comment l’expérimentation contribue à faire avancer la recherche archéologique.\n\nUn rendez-vous inédit pour petits et grands, curieux, passionnés d’histoire ou simples visiteurs, qui souhaitent découvrir l’archéologie autrement, au plus près des gestes, des matières et des expériences.\n\nRendez-vous les 9 et 10 octobre 2027 pour faire revivre les savoir-faire du passé et expérimenter l’archéologie autrement !', image_url: 'assets/img/photo-atelier.jpg', published_at: '2026-11-01' }
      ],
      partners: [
        { id: 'p1', name: 'Festival du Lin et de la fibre artistique', logo_url: 'assets/img/ff69a.png', url: '', sort_order: 1 },
        { id: 'p2', name: 'Université Paul-Valéry Montpellier 3', logo_url: 'assets/img/cf882.png', url: '', sort_order: 2 },
        { id: 'p3', name: 'Site archéologique Lattara, Musée Henri Prades', logo_url: 'assets/img/5f752.jpg', url: '', sort_order: 3 },
        { id: 'p4', name: 'Musée de Préhistoire de Tautavel', logo_url: 'assets/img/89c2d.png', url: '', sort_order: 4 },
        { id: 'p5', name: 'Musée archéologique de la bataille de Gergovie', logo_url: 'assets/img/logo-musee-gergovie.jpg', url: '', sort_order: 5 },
        { id: 'p6', name: 'CERAC', logo_url: 'assets/img/logo-cerac.webp', url: '', sort_order: 6 },
        { id: 'p7', name: 'Lozère Tourisme', logo_url: 'assets/img/logo-lozere-tourisme.png', url: '', sort_order: 7 }
      ],
      reviews: [
        { id: 'r1', created_at: '2026-11-02T10:00:00Z', first_name: 'Camille D.', profile: 'Établissement scolaire', subject: 'Atelier démonstratif', rating: 5, message: 'Une matinée passionnante : les élèves ont filé, tissé et posé mille questions. Les gestes sont expliqués avec une vraie rigueur scientifique, sans jamais perdre les enfants.', status: 'published' },
        { id: 'r2', created_at: '2026-11-03T10:00:00Z', first_name: 'Julien M.', profile: 'Musée ou institution', subject: 'Atelier participatif', rating: 4, message: 'Une équipe à l’écoute, qui adapte l’atelier à notre public et à nos contraintes. Les visiteurs sont repartis enchantés.', status: 'published' },
        { id: 'r3', created_at: '2026-11-08T10:00:00Z', first_name: 'Inès B.', profile: 'Particulier', subject: 'Atelier enfant', rating: 5, message: 'Mon fils a adoré tisser sur carton. Avis en attente de relecture (exemple).', status: 'pending' }
      ]
    };
  }
 
  /* ---------- Mode démonstration ---------- */
  function Demo() {
    var KEY = 'nt_demo_v2'; /* changer ce numéro recharge les données de départ */
    function lire() { try { var s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {} var d = seed(); ecrire(d); return d; }
    function ecrire(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
    var mem = null;
    function db() { if (!mem) mem = lire(); return mem; }
    function save() { ecrire(mem); }
    var SES = 'nt_demo_session';
    var api = {
      events: function () { return Promise.resolve(trier(db().events, 'start_date')); },
      news: function () { return Promise.resolve(trier(db().news, 'published_at', true)); },
      partners: function () { return Promise.resolve(trier(db().partners, 'sort_order')); },
      reviewsPublished: function () { return Promise.resolve(trier(db().reviews.filter(function (r) { return r.status === 'published'; }), 'created_at', true)); },
      submitReview: function (r) { var d = db(); d.reviews.push({ id: uid(), created_at: new Date().toISOString(), first_name: r.first_name, profile: r.profile, subject: r.subject, rating: r.rating, message: r.message, status: 'pending' }); save(); return Promise.resolve(); },
      session: function () { var ok = false; try { ok = sessionStorage.getItem(SES) === '1'; } catch (e) {} return Promise.resolve(ok ? { email: 'demo@neotisse.local' } : null); },
      login: function (email, mdp) { if (!email || !mdp) return Promise.reject(new Error('Merci de remplir les deux champs.')); try { sessionStorage.setItem(SES, '1'); } catch (e) {} return Promise.resolve({ email: email }); },
      logout: function () { try { sessionStorage.removeItem(SES); } catch (e) {} return Promise.resolve(); },
      reviewsAll: function () { return Promise.resolve(trier(db().reviews, 'created_at', true)); },
      setReviewStatus: function (id, st) { db().reviews.forEach(function (r) { if (r.id === id) r.status = st; }); save(); return Promise.resolve(); },
      list: function (t) { return api[t === 'events' ? 'events' : t === 'news' ? 'news' : 'partners'](); },
      save: function (t, o) { var a = db()[t]; if (o.id) { for (var i = 0; i < a.length; i++) if (a[i].id === o.id) a[i] = o; } else { o.id = uid(); a.push(o); } save(); return Promise.resolve(o); },
      remove: function (t, id) { var d = db(); d[t] = d[t].filter(function (x) { return x.id !== id; }); save(); return Promise.resolve(); },
      upload: function (file) {
        return new Promise(function (ok, ko) {
          var fr = new FileReader();
          fr.onerror = function () { ko(new Error('Lecture de l’image impossible.')); };
          fr.onload = function () {
            var img = new Image();
            img.onload = function () { var m = 900, s = Math.min(1, m / Math.max(img.width, img.height)); var c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', .8)); };
            img.onerror = function () { ko(new Error('Ce fichier n’est pas une image lisible.')); };
            img.src = fr.result;
          };
          fr.readAsDataURL(file);
        });
      },
      reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} mem = null; return Promise.resolve(); }
    };
    return api;
  }
 
  /* ---------- Supabase ---------- */
  function Supa() {
    var client = null;
    var charge = null;
    function pret() {
      if (charge) return charge;
      charge = new Promise(function (ok, ko) {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
        s.onload = function () { client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey); ok(client); };
        s.onerror = function () { ko(new Error('Connexion impossible au service de données.')); };
        document.head.appendChild(s);
      });
      return charge;
    }
    function q(f) { return pret().then(function (c) { return f(c); }).then(function (r) { if (r.error) throw new Error(r.error.message); return r.data; }); }
    var api = {
      events: function () { return q(function (c) { return c.from('events').select('*').order('start_date'); }); },
      news: function () { return q(function (c) { return c.from('news').select('*').order('published_at', { ascending: false }); }); },
      partners: function () { return q(function (c) { return c.from('partners').select('*').order('sort_order'); }); },
      reviewsPublished: function () { return q(function (c) { return c.from('reviews').select('*').eq('status', 'published').order('created_at', { ascending: false }); }); },
      submitReview: function (r) { return q(function (c) { return c.from('reviews').insert({ first_name: r.first_name, profile: r.profile, subject: r.subject, rating: r.rating, message: r.message, status: 'pending' }); }); },
      session: function () { return pret().then(function (c) { return c.auth.getSession(); }).then(function (r) { return r.data && r.data.session ? { email: r.data.session.user.email } : null; }); },
      login: function (email, mdp) { return pret().then(function (c) { return c.auth.signInWithPassword({ email: email, password: mdp }); }).then(function (r) { if (r.error) throw new Error('Adresse e-mail ou mot de passe incorrect.'); return { email: r.data.user.email }; }); },
      logout: function () { return pret().then(function (c) { return c.auth.signOut(); }); },
      reviewsAll: function () { return q(function (c) { return c.from('reviews').select('*').order('created_at', { ascending: false }); }); },
      setReviewStatus: function (id, st) { return q(function (c) { return c.from('reviews').update({ status: st }).eq('id', id); }); },
      list: function (t) { return api[t === 'events' ? 'events' : t === 'news' ? 'news' : 'partners'](); },
      save: function (t, o) {
        var copie = {}; Object.keys(o).forEach(function (k) { if (o[k] !== undefined) copie[k] = o[k]; });
        if (copie.id) { var id = copie.id; delete copie.id; return q(function (c) { return c.from(t).update(copie).eq('id', id); }); }
        delete copie.id; return q(function (c) { return c.from(t).insert(copie); });
      },
      remove: function (t, id) { return q(function (c) { return c.from(t).delete().eq('id', id); }); },
      upload: function (file) {
        return pret().then(function (c) {
          var ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
          var chemin = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
          return c.storage.from('images').upload(chemin, file, { contentType: file.type }).then(function (r) {
            if (r.error) throw new Error(r.error.message);
            return c.storage.from('images').getPublicUrl(chemin).data.publicUrl;
          });
        });
      },
      reset: function () { return Promise.resolve(); }
    };
    return api;
  }
 
  NT.api = enLigne ? Supa() : Demo();
})();
 