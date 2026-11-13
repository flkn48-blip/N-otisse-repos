Néotisse : site vitrine

Site vitrine de l'association Néotisse (Montpellier), qui fait de la médiation scientifique autour des savoir-faire textiles anciens : filage, tissage, teinture végétale.

Projet réalisé par l'agence Trace (moi) pour la cliente Néotisse. Il existe en deux versions, WordPress et vibecoding, comparées selon la facilité de gestion par les deux fondatrices. Ce dépôt contient la version vibecoding.
Le site tient sur une seule page : on le parcourt en défilant et le menu fait glisser jusqu'à chaque partie (ateliers, équipe, calendrier, actualités, livre d'or, partenaires, contact). Les anciennes adresses (/ateliers/, /equipe/...) renvoient vers la bonne partie;
Le site présente l'association, ses ateliers, son équipe et ses partenaires;
Reçoit les demandes d'atelier des structures (musées, associations, établissements scolaires, structures culturelles) via un formulaire dont la première question est le profil du visiteur. Les particuliers sont redirigés vers le calendrier.
Le calendrier sur le site affiche des événements. En survolant (ou en touchant) un jour coloré, une fiche s'ouvre avec les détails et un lien « Réserver sur le site de [structure] » qui renvoie vers la page de la structure organisatrice : aucune réservation ne passe par ce site.
Le site publie aussi un livre d'or(avis) : un avis arrive en brouillon privé et n'apparaît qu'après validation par une fondatrice. Un avis refusé reste privé, on en garde la trace.
Les fondatrices gèrent avis, événements, actualités et partenaires dans le Studio Sanity (https://neotisse.sanity.studio), sans toucher au code.
Technologies
Rôle et Outil
Pages et design	HTML, CSS, JavaScript
Contenus et espace membres	Sanity (avis, événements, actualités, partenaires), Studio dans studio-neotisse/
Envoi des avis	Fonction Netlify (netlify/functions/avis.mjs), qui garde la clé d'écriture Sanity côté serveur
Formulaire de contact	Netlify Forms
Hébergement	Netlify
Défilement fluide	Lenis (assets/js/lenis.min.js, hébergé sur le site)
Polices	Hébergées sur le site, assets/fonts (Cinzel, Cormorant Garamond, Manrope, Inter)

Structure du depôt
projet/                              le site (dossier publié sur Netlify)
projet/index.html                    la page unique
projet/ateliers/ equipe/ actualites/ livre-dor/ contact/   anciennes adresses, renvoient vers la bonne partie
projet/mentions-legales/ politique-de-confidentialite/ gestion-des-cookies/   pages légales
projet/admin/index.html              renvoie vers le Studio Sanity
projet/_redirects                    redirections des anciennes adresses (Netlify)
projet/assets/css/commun.css         design commun à tout le site
projet/assets/css/pages/             design de chaque partie
projet/assets/js/config.js           identifiant du projet Sanity (pas secret)
projet/assets/js/data.js             lecture des contenus dans Sanity
projet/assets/js/commun.js           menu, défilement, apparitions, bandeau cookies
projet/assets/js/pages/              comportements de chaque partie (calendrier, livre d'or, contact...)
projet/assets/img/                   photos et logos
studio-neotisse/                     Studio Sanity (rubriques, menu en français)
netlify/functions/avis.mjs           réception des avis du livre d'or
netlify.toml                         configuration Netlify
.env.exemple                         modèle pour la clé Sanity en local (le vrai .env n'est jamais publié)

Lancer en local
Le site : ouvrir projet/ avec un petit serveur (ex. Live Server). Pour tester l'envoi des avis : npx netlify-cli dev, puis http://localhost:8888 (il faut la clé dans .env).
Le Studio : dans studio-neotisse/, npm run dev puis http://localhost:3333. Pour le remettre en ligne après une modification : npm run deploy.
