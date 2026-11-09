# Contexte du projet
Je suis l'agence web Trace (étudiante en école de commerce et de digital). Je réponds à un appel d'offres pour mon client Néotisse.
Néotisse est une association loi 1901 fondée en mai 2024 à Montpellier. Elle
mène des actions de médiation scientifique autour des savoir-faire textiles
anciens, notamment la teinture végétale ou animale, le filage et le tissage.

L'association est portée par deux fondatrices, Émilie Roma Sert et Marie-
Salomé Perrichon, avec une équipe bénévole.
 
La problématique est comment permettre à Neotisse de présenter clairement ses savoir-faire textiles et ses ateliers, tout en facilitant les demandes d'atelier?

L'action principale du site est l'accès à une demande d'atelier sur mesure pour
les structures professionnelles.

Les deux fondatrices gèrent les contenus du site. Elles ne sont pas très à l'aise
avec la tech.

# Attendus
Un site vitrine clair, naturel et professionnel pour :

présenter les activités et l'expertise de l'équipe ;
recevoir des demandes d'ateliers sur mesure (action principale, visible à plusieurs endroits) ;
permettre aux deux fondatrices de gérer elles-mêmes les contenus, sans code.

Le site doit s'adapter correctement à tous les écrans : ordinateur, tablette et
téléphone. Les contenus, les images, les menus et les formulaires doivent
rester lisibles et utilisables.

Navigation claire : menu principal, burger pour les sous-pages, adaptation mobile.
SEO : une expression-clé par page, un titre et une description qui la reprennent, des liens, des images avec texte alternatif.
Accessibilité : contrastes lisibles, navigation au clavier, images de taille raisonnable.


Le visiteur doit comprendre vite : qui est Néotisse, ce qu'elle propose, à quels publics, l'expertise des fondatrices, et comment demander un atelier.

# Stack technique
Le site est un site vitrine. Aucun compte utilisateur ni espace personnel ne sera
proposé aux visiteurs, associations, musées ou autres structures.

Un site adapté au mobile (responsive), accessible et optimisé pour le SEO.
Un dépôt de code sur GitHub et un hébergement pour la mise en ligne.

Les utilisateurs

Musées, associations, établissements scolaires, structures culturelles : clients principaux. Ils envoient une demande d'atelier personnalisée.
Grand public : découvre l'univers, consulte les événements, les actualités et les avis. Il ne peut pas demander directement un atelier. Il ne peut ni réserver ni s'inscrire sur le site de Néotisse : depuis le calendrier, le bouton d'un événement l'envoie sur le site de la structure organisatrice, où se fait l'inscription.
Les deux fondatrices (administratrices) : peu à l'aise avec la tech . L'interface d'administration doit être très simple.


 Site hébergé sur Netlify ; formulaire de demande d'atelier via Netlify Forms (e-mail à l'association, anti-spam intégré) ; avis, événements, actualités et partenaires stockés dans Supabase (gratuit) ; page /admin protégée par connexion (Supabase Auth, un compte par fondatrice) où elles publient ou refusent un avis et ajoutent, modifient ou suppriment un événement, une actualité, un partenaire, sans jamais voir la base de données. Le site public lit ces données en direct.

# Arborescence
Accueil → Ateliers → Équipe → Partenaires → Calendrier → Actualités → Avis → Contact

Cette disposition met en avant l'objectif principal : présenter les activités et
faciliter les demandes d'ateliers et aussi de réassurer en présentant l'équipe qualifiée ainsi que les partenaires 

Accueil (/)
├── Ateliers (/ateliers/)
├── Équipe (/equipe/)
│   └── Partenaires (/equipe/#partenaires)
├── Calendrier (/actualites/#calendrier)
│   └── Actualités (/actualites/#actualites)
├── Avis (/avis/)           
└── Contact (/contact/)

# Deja effectué
déjà les maquettes du site ainsi que les couleurs 

# Contraintes
Responsive et accessible : contrastes lisibles, navigation au clavier, formulaires accessibles, textes simples et compréhensibles par tous (pas de jargon d'archéologue).
Budget nul : outils gratuits, hébergement gratuit ou léger.
RGPD : collecter le minimum ; mention d'information sous les formulaires ; pas de cookies de suivi ni de mesure d'audience ; polices hébergées sur le site (pas de chargement depuis Google) ; durée de conservation et suppression à définir ; pages légales (voir §11).
Administration utilisable sans aucune compétence technique.