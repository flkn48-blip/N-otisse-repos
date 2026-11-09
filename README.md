# Néotisse : site vitrine (version vibecoding)

Site vitrine de l'association **Néotisse** (Montpellier), qui fait de la médiation scientifique autour des savoir-faire textiles anciens : filage, tissage, teinture végétale.

Projet réalisé par l'agence **Trace** (Flora Konan) pour la cliente Néotisse. Il existe en deux versions, WordPress et vibecoding, comparées selon la facilité de gestion par les deux fondatrices. Ce dépôt contient la version vibecoding.

Site en ligne : [à compléter : adresse Netlify]

## Ce que fait le site

- Présente l'association, ses ateliers, son équipe et ses partenaires.
- Reçoit les **demandes d'atelier** des structures (musées, associations, établissements scolaires, structures culturelles) via un formulaire dont la première question est le profil du visiteur. Les particuliers sont redirigés vers le calendrier.
- Affiche un **calendrier** des événements. Chaque événement a un bouton « Réserver sur le site de [structure] » qui renvoie vers la page de la structure organisatrice : aucune réservation ne passe par ce site.
- Publie un **livre d'or** : un avis n'apparaît qu'après validation par une fondatrice.
- Offre un **espace membres** (`/admin/`) où les fondatrices modèrent les avis et gèrent événements, actualités et partenaires, sans toucher au code.

## Technologies

| Rôle | Outil |
| --- | --- |
| Pages et design | HTML, CSS, JavaScript (sans framework) |
| Base de données et comptes | Supabase (avis, événements, actualités, partenaires) |
| Formulaire de contact | Netlify Forms |
| Hébergement | Netlify |
| Polices | Google Fonts (Cinzel, Cormorant Garamond, Manrope, Inter) |

## Structure du dépôt

```
index.html, ateliers.html, equipe.html, calendrier.html,
actualites.html, livre-dor.html, contact.html
mentions-legales.html, politique-de-confidentialite.html, gestion-des-cookies.html
admin/index.html           espace membres
assets/css/style.css       design du site
assets/js/config.js        adresse et clé Supabase (à remplir)
assets/js/data.js          lecture et écriture des données
assets/js/site.js          comportements du site public
assets/js/admin.js         espace membres
assets/img/                photos et logos
supabase-schema.sql        tables, règles de sécurité et contenu de départ
netlify.toml               configuration Netlify
```

## Lancer le site en local

1. Télécharge ou clone le dépôt.
2. Ouvre le dossier dans VS Code et lance `index.html` avec l'extension **Live Server** (ou ouvre le fichier dans le navigateur).
3. Tant que `assets/js/config.js` est vide, le site tourne en **mode démonstration** : les données restent dans le navigateur et rien n'est partagé.

## Mise en ligne

1. Crée un projet Supabase, exécute `supabase-schema.sql` dans l'éditeur SQL, puis crée un compte pour chaque fondatrice.
2. Renseigne `supabaseUrl` et `supabaseAnonKey` dans `assets/js/config.js`. La clé « anon » est publique par conception : la sécurité repose sur les règles du script SQL. Ne jamais publier la clé « service_role ».
3. Connecte le dépôt à Netlify (commande de build vide, dossier de publication `.`).
4. Dans Netlify, ajoute une notification e-mail pour le formulaire « demande-atelier ».

Le détail pas à pas est dans `GUIDE-MISE-EN-LIGNE.md`.

## Accessibilité et données personnelles

- Contrastes lisibles, navigation au clavier, formulaires avec étiquettes, lien d'évitement.
- Données collectées au minimum, information sous les formulaires, anti-spam (champ piège et limitation d'envoi).
- Aucun outil de mesure d'audience ni cookie publicitaire. Les pages légales contiennent des repères « [à compléter] » à remplir avant la mise en ligne définitive.

## Auteure

Flora Konan, agence Trace. Après la livraison, l'association Néotisse assure seule la gestion du site.
