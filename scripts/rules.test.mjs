// Tests des règles Firestore du Repaire, exécutés contre l'émulateur.
// Lancer avec :  npm run test:rules
// (firebase emulators:exec démarre l'émulateur, positionne FIRESTORE_EMULATOR_HOST,
//  exécute ce fichier, puis coupe l'émulateur.)

import { readFileSync } from 'node:fs';
import { test, before, after, beforeEach } from 'node:test';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'le-repaire-e3652',
    firestore: {
      rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

// Raccourcis de contextes.
const asUser = (uid) => env.authenticatedContext(uid).firestore();
const asAdmin = (uid) => env.authenticatedContext(uid, { admin: true }).firestore();
const asAnon = () => env.unauthenticatedContext().firestore();

// Amorce des données en contournant les règles (setup).
async function seed(fn) {
  await env.withSecurityRulesDisabled(async (ctx) => fn(ctx.firestore()));
}

// --- users ------------------------------------------------------------------

test('users: création de son propre profil (pseudo seul)', async () => {
  const db = asUser('alice');
  await assertSucceeds(setDoc(doc(db, 'users/alice'), { pseudo: 'Alice' }));
});

test('users: refuse un pseudo invalide et un champ en trop', async () => {
  const db = asUser('alice');
  await assertFails(setDoc(doc(db, 'users/alice'), { pseudo: '' }));
  await assertFails(setDoc(doc(db, 'users/alice'), { pseudo: 'Alice', solde: 99 }));
});

test('users: refuse d’écrire le profil d’un autre', async () => {
  const db = asUser('alice');
  await assertFails(setDoc(doc(db, 'users/bob'), { pseudo: 'Bob' }));
});

// --- ratings ----------------------------------------------------------------

test('ratings: crée sa note sur un jeu connu', async () => {
  const db = asUser('alice');
  await assertSucceeds(
    setDoc(doc(db, 'games/elan/ratings/alice'), { value: 4, ts: serverTimestamp() }),
  );
});

test('ratings: refuse note hors bornes, jeu inconnu, uid usurpé, agrégat direct', async () => {
  const db = asUser('alice');
  await assertFails(
    setDoc(doc(db, 'games/elan/ratings/alice'), { value: 6, ts: serverTimestamp() }),
  );
  await assertFails(
    setDoc(doc(db, 'games/zzz/ratings/alice'), { value: 4, ts: serverTimestamp() }),
  );
  await assertFails(
    setDoc(doc(db, 'games/elan/ratings/bob'), { value: 4, ts: serverTimestamp() }),
  );
  // écriture directe de l'agrégat public interdite
  await assertFails(setDoc(doc(db, 'games/elan'), { ratingCount: 99, ratingAvg: 5 }));
});

test('ratings: agrégat games/{id} lisible publiquement', async () => {
  await seed(async (db) => setDoc(doc(db, 'games/elan'), { ratingCount: 1, ratingAvg: 4 }));
  await assertSucceeds(getDoc(doc(asAnon(), 'games/elan')));
});

// --- comments ---------------------------------------------------------------

test('comments: création avec son pseudo officiel', async () => {
  await seed(async (db) => setDoc(doc(db, 'users/alice'), { pseudo: 'Alice' }));
  const db = asUser('alice');
  await assertSucceeds(
    addDoc(collection(db, 'games/elan/comments'), {
      uid: 'alice',
      pseudo: 'Alice',
      text: 'Super jeu !',
      ts: serverTimestamp(),
    }),
  );
});

test('comments: refuse pseudo usurpé, texte trop long, jeu inconnu', async () => {
  await seed(async (db) => setDoc(doc(db, 'users/alice'), { pseudo: 'Alice' }));
  const db = asUser('alice');
  await assertFails(
    addDoc(collection(db, 'games/elan/comments'), {
      uid: 'alice',
      pseudo: 'Bob',
      text: 'x',
      ts: serverTimestamp(),
    }),
  );
  await assertFails(
    addDoc(collection(db, 'games/elan/comments'), {
      uid: 'alice',
      pseudo: 'Alice',
      text: 'x'.repeat(501),
      ts: serverTimestamp(),
    }),
  );
  await assertFails(
    addDoc(collection(db, 'games/zzz/comments'), {
      uid: 'alice',
      pseudo: 'Alice',
      text: 'x',
      ts: serverTimestamp(),
    }),
  );
});

test('comments: lecture publique, pas de modification, suppression par auteur/admin', async () => {
  let id;
  await seed(async (db) => {
    await setDoc(doc(db, 'users/alice'), { pseudo: 'Alice' });
    const ref = await addDoc(collection(db, 'games/elan/comments'), {
      uid: 'alice',
      pseudo: 'Alice',
      text: 'coucou',
      ts: serverTimestamp(),
    });
    id = ref.id;
  });
  // lecture publique
  await assertSucceeds(getDocs(query(collection(asAnon(), 'games/elan/comments'), limit(20))));
  // pas d'update
  await assertFails(updateDoc(doc(asUser('alice'), `games/elan/comments/${id}`), { text: 'edit' }));
  // suppression : pas par un autre, oui par l'auteur
  await assertFails(deleteDoc(doc(asUser('bob'), `games/elan/comments/${id}`)));
  await assertSucceeds(deleteDoc(doc(asUser('alice'), `games/elan/comments/${id}`)));
});

// --- bugs -------------------------------------------------------------------

async function seedBug(uid, pseudo, over = {}) {
  let id;
  await seed(async (db) => {
    await setDoc(doc(db, `users/${uid}`), { pseudo });
    const ref = await addDoc(collection(db, 'games/elan/bugs'), {
      uid,
      pseudo,
      title: 'Titre',
      description: 'Description',
      status: 'open',
      ts: serverTimestamp(),
      ...over,
    });
    id = ref.id;
  });
  return id;
}

test('bugs: création (status open) ; refuse status arbitraire et jeu inconnu', async () => {
  await seed(async (db) => setDoc(doc(db, 'users/alice'), { pseudo: 'Alice' }));
  const db = asUser('alice');
  await assertSucceeds(
    addDoc(collection(db, 'games/elan/bugs'), {
      uid: 'alice',
      pseudo: 'Alice',
      title: 'Bug',
      description: 'ça plante',
      status: 'open',
      ts: serverTimestamp(),
    }),
  );
  await assertFails(
    addDoc(collection(db, 'games/elan/bugs'), {
      uid: 'alice',
      pseudo: 'Alice',
      title: 'Bug',
      description: 'ça plante',
      status: 'resolved',
      ts: serverTimestamp(),
    }),
  );
  await assertFails(
    addDoc(collection(db, 'games/zzz/bugs'), {
      uid: 'alice',
      pseudo: 'Alice',
      title: 'Bug',
      description: 'x',
      status: 'open',
      ts: serverTimestamp(),
    }),
  );
});

test('bugs: NON public — anon et autre user ne peuvent pas lire ; auteur et admin oui', async () => {
  const id = await seedBug('alice', 'Alice');
  await assertFails(getDoc(doc(asAnon(), `games/elan/bugs/${id}`)));
  await assertFails(getDoc(doc(asUser('bob'), `games/elan/bugs/${id}`)));
  await assertSucceeds(getDoc(doc(asUser('alice'), `games/elan/bugs/${id}`)));
  await assertSucceeds(getDoc(doc(asAdmin('boss'), `games/elan/bugs/${id}`)));
});

test('bugs: list — non-admin seulement les siens (filtré), admin tout', async () => {
  await seedBug('alice', 'Alice');
  await seedBug('bob', 'Bob');
  // non-admin sans filtre uid → refusé
  await assertFails(
    getDocs(query(collection(asUser('alice'), 'games/elan/bugs'), orderBy('ts', 'desc'), limit(50))),
  );
  // non-admin filtré sur son uid → ok
  await assertSucceeds(
    getDocs(
      query(
        collection(asUser('alice'), 'games/elan/bugs'),
        where('uid', '==', 'alice'),
        orderBy('ts', 'desc'),
        limit(50),
      ),
    ),
  );
  // non-admin filtré sur l'uid d'un AUTRE → refusé
  await assertFails(
    getDocs(
      query(collection(asUser('alice'), 'games/elan/bugs'), where('uid', '==', 'bob'), limit(50)),
    ),
  );
  // admin liste tout
  await assertSucceeds(
    getDocs(query(collection(asAdmin('boss'), 'games/elan/bugs'), orderBy('ts', 'desc'), limit(100))),
  );
});

test('bugs: triage — seul l’admin change status, et seulement status', async () => {
  const id = await seedBug('alice', 'Alice');
  // auteur ne peut pas changer le statut
  await assertFails(updateDoc(doc(asUser('alice'), `games/elan/bugs/${id}`), { status: 'resolved' }));
  // admin peut
  await assertSucceeds(updateDoc(doc(asAdmin('boss'), `games/elan/bugs/${id}`), { status: 'resolved' }));
  // admin ne peut PAS modifier un autre champ
  await assertFails(updateDoc(doc(asAdmin('boss'), `games/elan/bugs/${id}`), { title: 'hack' }));
  // status invalide refusé
  await assertFails(updateDoc(doc(asAdmin('boss'), `games/elan/bugs/${id}`), { status: 'nope' }));
});

test('bugs: suppression par auteur ou admin, pas par un tiers', async () => {
  const id1 = await seedBug('alice', 'Alice');
  await assertFails(deleteDoc(doc(asUser('bob'), `games/elan/bugs/${id1}`)));
  await assertSucceeds(deleteDoc(doc(asUser('alice'), `games/elan/bugs/${id1}`)));
  const id2 = await seedBug('alice', 'Alice');
  await assertSucceeds(deleteDoc(doc(asAdmin('boss'), `games/elan/bugs/${id2}`)));
});
