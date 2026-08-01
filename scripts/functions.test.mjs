// Test d'intégration des Cloud Functions d'agrégation, contre les émulateurs
// firestore + functions. Valide que :
//  - les fonctions se chargent (ESM, firebase-functions v6, firebase-admin v13) ;
//  - aggregateRatings recalcule ratingCount/ratingAvg (transaction + lecture docs) ;
//  - countComments recalcule commentCount (transaction + requête count()).
// Lancer avec :  npm run test:functions

import { test, before, after } from 'node:test';
import assert from 'node:assert';
import {
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'le-repaire-e3652',
    firestore: { host: '127.0.0.1', port: 8080 },
  });
  await env.clearFirestore();
});

after(async () => {
  await env.cleanup();
});

// Écrit en contournant les règles (déclenche quand même les triggers Functions).
function seed(fn) {
  return env.withSecurityRulesDisabled((ctx) => fn(ctx.firestore()));
}

// Attend qu'une condition sur games/{id} devienne vraie (la Function s'exécute
// de façon asynchrone après l'écriture). Lecture publique via contexte anon.
async function waitForStats(gameId, predicate, timeoutMs = 10000) {
  const db = env.unauthenticatedContext().firestore();
  const start = Date.now();
  for (;;) {
    const snap = await getDoc(doc(db, 'games', gameId));
    const data = snap.exists() ? snap.data() : null;
    if (data && predicate(data)) return data;
    if (Date.now() - start > timeoutMs) {
      throw new Error(`timeout — dernier état: ${JSON.stringify(data)}`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
}

test('aggregateRatings : ratingCount/ratingAvg recalculés', async () => {
  await seed((db) => addDoc(collection(db, 'games/elan/ratings'), { value: 5, ts: serverTimestamp() }));
  let stats = await waitForStats('elan', (d) => d.ratingCount === 1);
  assert.equal(stats.ratingAvg, 5);

  await seed((db) => addDoc(collection(db, 'games/elan/ratings'), { value: 3, ts: serverTimestamp() }));
  stats = await waitForStats('elan', (d) => d.ratingCount === 2);
  assert.equal(stats.ratingAvg, 4);
});

test('countComments : commentCount recalculé (count() en transaction)', async () => {
  await seed((db) =>
    addDoc(collection(db, 'games/flux/comments'), {
      uid: 'x',
      pseudo: 'X',
      text: 'a',
      ts: serverTimestamp(),
    }),
  );
  let stats = await waitForStats('flux', (d) => d.commentCount === 1);
  assert.equal(stats.commentCount, 1);

  await seed((db) =>
    addDoc(collection(db, 'games/flux/comments'), {
      uid: 'y',
      pseudo: 'Y',
      text: 'b',
      ts: serverTimestamp(),
    }),
  );
  stats = await waitForStats('flux', (d) => d.commentCount === 2);
  assert.equal(stats.commentCount, 2);
});
