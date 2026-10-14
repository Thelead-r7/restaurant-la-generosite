# Chez Tantie — Site vitrine (MVP)

Maquis ivoirien fictif à Abidjan. **Projet de démonstration** —
coordonnées, avis et photos sont fictifs.

## Aperçu

Site statique (HTML5 / CSS3 / JS natif). Aucun backend, aucune
dépendance framework. Hébergement cible : Vercel.

## Pages

- `index.html` — Accueil : hero, histoire, catégories, plats à l'honneur, avis démo.
- `menu.html` — Menu-livre animé (6 catégories).
- `galerie.html` — Grille filtrable + lightbox (placeholders CSS).
- `reservation.html` — Formulaire → ouverture WhatsApp pré-remplie.
- `contact.html` — Coordonnées fictives, horaires, plan stylisé.

## Fonctionnalités

- Bilingue **FR / Nouchi** (sélecteur dans le header, préférence persistée).
- **Sélecteur d'ambiance** manuel : 🌿 Calme / 🔥 Ambiance / 🎉 Fête.
- Menu-livre 3D (rotation `rotateY`) avec navigation boutons + swipe.
- Formulaire de réservation avec validation + envoi via `wa.me`.
- Bouton WhatsApp flottant sur toutes les pages.
- `prefers-reduced-motion` respecté (animations désactivées proprement).

## Arborescence
  le-restaurant/
  ├── index.html, menu.html, galerie.html, reservation.html, contact.html
  ├── css/   (style.css + 5 fichiers dédiés)
  ├── js/    (i18n, main, menu-livre, galerie, reservation)
  ├── data/  (configuration.json, plats.json)
  ├── lang/  (fr.json, nouchi.json)
  └── img/   (logo.svg, hero.svg)

## Configuration WhatsApp

Dans `data/configuration.json` :

  {
    "whatsapp": "225XXXXXXXXXX",
    "whatsapp_est_placeholder": true
  }

- **Placeholder** : le bouton affiche un message au clic, aucune redirection.
- **Réel** : mettre le numéro au format international sans espace
  (ex. `2250700000000`) et passer `whatsapp_est_placeholder` à `false`.

## Langues

Les textes sont dans `lang/fr.json` et `lang/nouchi.json`. Si une clé
manque en Nouchi, le code bascule automatiquement sur le français.
**Aucune traduction Nouchi n'est inventée.**

## Hors périmètre (V1)

Ce MVP n'inclut **pas** : backend, base de données, authentification,
commandes en ligne, paiement, administration, moteur de thèmes
automatique. Ces éléments sont prévus pour une phase ultérieure.

## Licence

Projet fictif — démonstration pédagogique.

## Lancer en local

Depuis la racine du projet :

  python -m http.server 8000

Puis ouvrir http://localhost:8000 dans un navigateur.

**Important** : ne pas ouvrir les `.html` en `file:///` — les `fetch()`
des JSON seraient bloqués. Un serveur local est requis.

## Autres valeurs de configuration

`nom_site`, `slogan_fr`, `slogan_nouchi`, `adresse`, `horaires`, `email`.
