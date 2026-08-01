# Le Repaire

Hub / portfolio regroupant les jeux de **Cerynna**. Les jeux sont déployés à part ; le
Repaire est la vitrine qui pointe vers eux et permet aux visiteurs connectés (Google) de
**noter**, **commenter** et **signaler des bugs**.

> Titre de travail : « Le Repaire ». Se change en une ligne (`index.html` + `src/main.ts` +
> `src/pages/home.ts`).

## Stack

- **Vite + TypeScript** (vanilla, sans framework) — comme Flux & Élan
- **Firebase** — Hosting, Firestore, Auth (Google), Cloud Functions

## Démarrage

```bash
npm install
npm run dev
```

### Configuration Firebase (obligatoire avant tout usage réel)

1. Crée un projet dans la [console Firebase](https://console.firebase.google.com/)
   (id proposé : `cerynna-hub`) et une application **Web**.
2. Colle la config web dans [`src/firebase.ts`](src/firebase.ts) (remplace les `REMPLACE_MOI`).
3. Active le fournisseur **Google** dans Authentication.
4. Renseigne l'id du projet dans [`.firebaserc`](.firebaserc).
5. En dev, lance les émulateurs : `firebase emulators:start` (le code s'y branche
   automatiquement en mode dev).

### Catalogue des jeux

Les jeux sont déclarés dans [`src/games.ts`](src/games.ts). Pour en ajouter un : une entrée
dans le tableau + redéploiement. ⚠️ Pense à renseigner les vraies `url` (Flux notamment).

## Déploiement

```bash
npm run deploy   # build + firebase deploy
```

## Feuille de route

- [x] **Phase 1** — squelette : catalogue, accueil, fiche jeu, auth Google + pseudo
- [x] **Phase 2** — notes (1 par joueur) + agrégat via Cloud Function `aggregateRatings`
- [x] **Phase 3** — commentaires (liste + ajout + suppression du sien) + `commentCount` via `countComments`
- [x] **Phase 4** — signalement de bugs (privés auteur/admin) + triage admin (claim `admin`)
- [x] **Phase 5** — finitions : SEO/meta + favicon, bundle allégé (auth en différé), pagination « Charger plus » (commentaires + bugs), CI GitHub

### Performance / bundle

Le SDK Firebase est séparé en chunks : `firebase` (app + firestore, ~89 kB gzip, cache
stable) chargé au démarrage, `auth` (~24 kB gzip) **chargé en différé** (hors chemin
critique), et le code app (~7 kB gzip) isolé. Configuré via `manualChunks` + import
dynamique de `./auth/auth`.

### Tests automatisés (émulateurs Firebase)

```bash
npm run test:rules       # règles Firestore des 4 phases (14 cas)
npm run test:functions   # agrégats via Cloud Functions (transactions)
```

Nécessite Java (émulateur Firestore). Voir `scripts/rules.test.mjs` et
`scripts/functions.test.mjs`.

### Admin

Le triage des bugs et la suppression de commentaires réservés à l'admin reposent
sur le **claim custom `admin`**. À poser une fois sur ton compte, côté backend
(Admin SDK) : `admin.auth().setCustomUserClaims(uid, { admin: true })`.

### Notes de sécurité / exploitation

- **Catalogue = source de vérité des `gameId`.** `firestore.rules` (`isKnownGame`) n'autorise
  les notes/commentaires que sous les jeux connus. **En ajoutant un jeu, mets à jour cette liste**
  en plus de `src/games.ts`.
- **Anti-abus.** Les règles bloquent les `gameId` inexistants, mais un compte connecté peut
  toujours spammer des commentaires sous un vrai jeu. Pour s'en prémunir, activer **Firebase
  App Check** (console) — non couvert par le code.
- **Agrégats concurrents.** `aggregateRatings` / `countComments` recalculent dans une
  **transaction** (lecture de `games/{id}` pour sérialiser) afin d'éviter les pertes de mise à
  jour. À valider au premier déploiement des Functions (`firebase deploy --only functions`).

### Tester les notes en local (émulateurs)

```bash
firebase emulators:start --only auth,firestore,functions
npm run dev   # dans un autre terminal (le client se branche sur les émulateurs)
```

Connecte-toi (Google), va sur une fiche jeu, clique une étoile : ta note est écrite
dans `games/{gameId}/ratings/{uid}` et la Function recalcule `ratingAvg`/`ratingCount`
sur `games/{gameId}`. En prod : `firebase deploy --only firestore:rules,functions`.
