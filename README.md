# Sondage officiel — Que pensez-vous de Thibaut ?

Un petit site web humoristique, présenté comme un sondage sérieux, dont les
questions et les interactions deviennent progressivement absurdes. Le clou du
spectacle : le bouton **« Non »** rétrécit à chaque clic, affiche des messages
de plus en plus étranges, puis finit par disparaître complètement.

Aucun paiement réel n'est effectué et aucune donnée bancaire n'est demandée :
la question sur le virement de 2 500 € est entièrement fictive et à but
humoristique.

## 1. Ce qu'est le projet

- Un site statique en **HTML + CSS + JavaScript vanilla**, sans dépendance
  externe ni framework.
- Une apparence moderne (fond sombre, cartes en glassmorphism, animations
  fluides) qui imite un vrai questionnaire au premier abord.
- 5 questions avec deux réponses possibles (« Oui » / « Non »), une barre de
  progression, un compteur `Question X / 5`, et un écran de résultat final.

## 2. Structure des fichiers

.
├── index.html → structure de la page (écran sondage + écran résultat)
├── style.css → design, animations, responsive
├── script.js → logique du sondage (questions, bouton Non, résultat)
└── README.md → ce fichier


Le projet ne contient aucune dépendance externe : il n'y a rien à installer,
aucun `npm install`, aucune build étape.

## 3. Utiliser le projet en local

1. Télécharge ou clone les fichiers du dépôt.
2. Ouvre simplement `index.html` dans un navigateur (double-clic, ou
   glisser-déposer dans une fenêtre de navigateur).

Aucun serveur n'est requis, mais tu peux aussi utiliser une extension type
« Live Server » (VS Code) pour un rechargement automatique pendant que tu
modifies les fichiers.

## 4. Publier avec GitHub Pages

1. Crée un dépôt GitHub (public de préférence, pour que GitHub Pages soit
   gratuit) et pousse les 4 fichiers (`index.html`, `style.css`, `script.js`,
   `README.md`) à la racine du dépôt.
2. Va dans **Settings → Pages** du dépôt.
3. Dans **Build and deployment**, choisis la source **Deploy from a branch**.
4. Sélectionne la branche (généralement `main`) et le dossier `/ (root)`.
5. Clique sur **Save**. GitHub Pages te donnera une URL du type
   `https://ton-utilisateur.github.io/nom-du-depot/` après quelques minutes.

## 5. Modifier les questions

Toutes les questions sont regroupées dans `script.js`, dans le tableau
`QUESTIONS` :

```javascript
const QUESTIONS = [
  "Thibaut est-il la personne la plus intelligente que vous ayez connue ?",
  "Thibaut est-il la personne la plus gentille que vous ayez connue ?",
  "Thibaut est-il la personne la plus drôle que vous ayez connue ?",
  "Thibaut est-il la meilleure personne que vous ayez rencontrée ?",
  "Souhaitez-vous effectuer un virement de 2 500 € à Thibaut dès maintenant ?"
];
```

- Pour changer le texte d'une question, modifie directement la chaîne de
  caractères correspondante.
- Pour ajouter ou retirer une question, ajoute/retire une ligne dans ce
  tableau : le compteur (`Question X / 5`) et la barre de progression
  s'adaptent automatiquement au nombre total de questions.
- Le tableau `OUI_LABELS` (juste en dessous) permet de personnaliser le texte
  du bouton « Oui » pour chaque question, dans le même ordre.

## 6. Modifier les messages du bouton « Non »

Deux tableaux de messages existent dans `script.js` :

```javascript
// Pour les questions 1 à 4
const MESSAGES_NON_STANDARD = [
  "Euh... tu as dû te tromper.",
  "Tu es sûr de ton choix ?",
  "Réfléchis encore un peu...",
  "Cette réponse semble incorrecte.",
  "Dernière chance.",
  "Le bouton commence à perdre confiance en lui.",
  "Bon... tu refuses vraiment ?",
  "Très bien."
];

// Pour la dernière question (les 2 500 €)
const MESSAGES_NON_ARGENT = [
  "Erreur : cette réponse semble indisponible.",
  "Le service comptabilité aimerait discuter avec vous.",
  "Vous avez probablement mal lu la question.",
  "Dernière chance."
];
```

- Chaque message correspond à un clic sur le bouton « Non ».
- Le nombre de messages dans un tableau détermine le nombre de clics
  nécessaires avant que le bouton ne disparaisse : ajoute ou retire des
  lignes pour rendre la progression plus longue ou plus courte.
- Le rétrécissement du bouton est calculé automatiquement en fonction du
  nombre total de messages, donc aucune autre modification n'est nécessaire
  si tu changes la longueur des tableaux.

## Accessibilité

- Les boutons sont de vrais éléments `<button>`, donc accessibles au clavier
  (Tab + Entrée/Espace) et possèdent des `aria-label`.
- Les contrastes de texte ont été choisis pour rester lisibles sur fond
  sombre.
- Le sens du sondage (question, réponse, progression) reste compréhensible
  même sans les animations, qui ne sont que des décorations.
