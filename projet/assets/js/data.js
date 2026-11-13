/* Néotisse : lecture des contenus gérés dans le Studio Sanity (événements, actualités, partenaires, avis).
   Les fondatrices modifient les contenus dans le Studio ; le site les lit ici, sans clé (lecture publique).
   L'envoi d'un avis passe par la fonction Netlify « avis » (netlify/functions/avis.mjs), qui garde la clé
   d'écriture côté serveur : l'avis arrive « À relire » dans le Studio. */
(function () {
  'use strict';
  var cfg = window.NT_CONFIG || {};
  var NT = (window.NT = {});

  /* ---------- Chemins des images ----------
     Les images du site sont soit des adresses Sanity (https://cdn.sanity.io/…), soit « assets/img/… ».
     NT.img() ajoute le bon préfixe pour ces dernières. */
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

  /* ---------- Lecture Sanity (requêtes GROQ) ---------- */
  /* lecture directe (api.sanity.io, sans cache) : une modification faite dans le Studio apparaît tout de suite.
     Pour un site très fréquenté, on pourrait passer à « apicdn.sanity.io » (plus rapide, mais jusqu'à 1 minute de délai). */
  var base = 'https://' + cfg.sanityProjectId + '.api.sanity.io/v2025-02-19/data/query/' + (cfg.sanityDataset || 'production');
  function requete(groq) {
    if (!cfg.sanityProjectId) return Promise.reject(new Error('Sanity n’est pas configuré (assets/js/config.js).'));
    return fetch(base + '?query=' + encodeURIComponent(groq))
      .then(function (r) { if (!r.ok) throw new Error('Lecture Sanity impossible (' + r.status + ').'); return r.json(); })
      .then(function (j) { return j.result || []; });
  }
  /* les images Sanity sont redimensionnées et converties à la volée (format léger) */
  var IMG = '+"?w=1200&auto=format"';
  var LOGO = '+"?h=240&auto=format"';

  NT.api = {
    events: function () {
      return requete('*[_type=="evenement" && defined(debut)]|order(debut asc){"id":_id,"title":titre,"type":type,"start_date":debut,"end_date":coalesce(fin,debut),"time_text":horaires,"place":lieu,"organizer":organisateur,"booking_url":lienReservation,"description":description}');
    },
    news: function () {
      return requete('*[_type=="actualite"]|order(date desc){"id":_id,"title":titre,"summary":resume,"body":texte,"image_url":image.asset->url' + IMG + ',"image_alt":image.alt,"published_at":date}');
    },
    partners: function () {
      return requete('*[_type=="partenaire"]|order(ordre asc){"id":_id,"name":nom,"logo_url":logo.asset->url' + LOGO + ',"url":site,"sort_order":ordre}');
    },
    reviewsPublished: function () {
      /* sans clé, Sanity ne renvoie que les avis PUBLIÉS : les brouillons (à relire, refusés) restent privés */
      return requete('*[_type=="avis" && refuse != true]|order(envoyeLe desc){"id":_id,"first_name":prenom,"profile":profil,"subject":sujet,"rating":note,"message":message,"created_at":envoyeLe}');
    },
    /* envoi d'un avis : fonction Netlify (la clé d'écriture Sanity n'est jamais dans le navigateur) */
    submitReview: function (r) {
      return fetch('/.netlify/functions/avis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom: r.first_name, profil: r.profile, sujet: r.subject, note: r.rating, message: r.message, site: r.site || '' })
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (j) {
          if (!res.ok || !j.ok) throw new Error(j.message || 'L’envoi n’a pas abouti.');
          return j;
        });
      });
    }
  };
})();
