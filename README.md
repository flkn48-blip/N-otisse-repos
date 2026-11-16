# Néotisse : site vitrine

Site vitrine de l'association **Néotisse** (Montpellier), qui fait de la médiation scientifique autour des savoir-faire textiles anciens : filage, tissage, teinture végétale.

Projet réalisé par l'agence **Trace** (moi) pour la cliente Néotisse. Il existe en deux versions, **WordPress** et **vibecoding**, comparées selon la facilité de gestion par les deux fondatrices.

**Ce dépôt contient la version vibecoding.**

---

## Ce que fait le site

- **Une seule page** : on parcourt tout le site en défilant. Le menu fait glisser jusqu'à chaque partie : ateliers, équipe, calendrier, actualités, livre d'or, partenaires, contact.
- **Présente** l'association, ses ateliers, son équipe et ses partenaires.
- **Reçoit les demandes d'atelier** des structures (musées, associations, établissements scolaires, structures culturelles) via un formulaire. La première question est le profil du visiteur : les particuliers sont redirigés vers le calendrier.
- **Affiche un calendrier** des événements. Au survol (ou au toucher) d'un jour coloré, une fiche s'ouvre avec les détails et un lien « Réserver sur le site de [structure] ». Aucune réservation ne passe par ce site.
- **Publie un livre d'or** (avis). Un avis arrive en brouillon privé et n'apparaît qu'après validation par une fondatrice. Un avis refusé reste privé.
- **Se gère sans toucher au code** : les fondatrices modifient avis, événements, actualités et partenaires dans le **Studio Sanity**.

---

## Technologies

| Rôle | Outil |
|---|---|
| Pages et design | HTML, CSS, JavaScript |
| Contenus et espace de gestion | [Sanity](https://www.sanity.io) — Studio en ligne : https://neotisse.sanity.studio |
| Envoi des avis | Fonction Netlify (garde la clé Sanity à l'abri) |
| Formulaire de contact | Netlify Forms |
| Hébergement | Netlify |
| Défilement fluide | Lenis (hébergé sur le site) |
| Polices | Hébergées sur le site : Cinzel, Cormorant Garamond, Manrope, Inter |

---

## Structure du dépôt

```
projet/                    → le site (dossier publié sur Netlify)
├── index.html             → la page unique
├── 404.html               → page « introuvable »
├── mentions-legales/      → pages légales
├── politique-de-confidentialite/
├── gestion-des-cookies/
├── ateliers/, equipe/…    → anciennes adresses, renvoient vers la bonne partie
├── admin/                 → renvoie vers le Studio Sanity
└── assets/
    ├── css/               → design (commun.css + un fichier par partie)
    ├── js/                → comportements (commun.js, data.js, un fichier par partie)
    └── img/               → photos et logos

studio-neotisse/           → le Studio Sanity (rubriques, menu en français)
netlify/functions/avis.mjs → réception des avis du livre d'or
netlify.toml               → configuration Netlify
.env.exemple               → modèle pour la clé Sanity en local
```

---

## Lancer en local

**Le site**
Ouvrir le dossier `projet/` avec un petit serveur, par exemple Live Server dans VS Code.

**Tester l'envoi des avis**
Il faut la clé Sanity dans un fichier `.env` (voir `.env.exemple`), puis :

```bash
npx netlify-cli dev
```

et ouvrir http://localhost:8888.

**Le Studio Sanity**

```bash
cd studio-neotisse
npm run dev
```

puis ouvrir http://localhost:3333.
Pour remettre le Studio en ligne après une modification : `npm run deploy`.
