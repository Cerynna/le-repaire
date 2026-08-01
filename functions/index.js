// Cloud Functions du Repaire.
//
// À chaque écriture d'une note ou d'un commentaire, on recalcule l'agrégat
// public games/{gameId} (ratingCount, ratingAvg, commentCount). L'agrégat est
// écrit avec l'Admin SDK (qui ignore les règles Firestore), donc aucun client
// ne peut le falsifier — il ne peut qu'écrire SA note / SON commentaire.
//
// ⚠️ Concurrence : le recalcul lit-puis-écrit. Sans sérialisation, deux
// invocations concurrentes (deux joueurs quasi simultanés) peuvent se marcher
// dessus — celle qui a lu une valeur périmée écrit en dernier et l'agrégat
// reste faux DÉFINITIVEMENT (aucun autre déclencheur ne le corrige). On
// enveloppe donc lecture + écriture dans une transaction qui lit games/{gameId} :
// deux transactions concurrentes qui lisent+écrivent ce doc entrent en conflit,
// la perdante réessaie et relit la valeur fraîche. (Une transaction protège
// contre la concurrence ; l'idempotence au retry, elle, vient du recalcul
// complet plutôt que d'un increment.)

import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

export const aggregateRatings = onDocumentWritten(
  'games/{gameId}/ratings/{uid}',
  async (event) => {
    const { gameId } = event.params;
    const gameRef = db.doc(`games/${gameId}`);

    await db.runTransaction(async (tx) => {
      // Lire d'abord le doc cible : sérialise les invocations concurrentes.
      await tx.get(gameRef);

      // Relire toutes les notes du jeu (1 par joueur, volume borné) et recalculer.
      const snap = await tx.get(db.collection(`games/${gameId}/ratings`));
      let sum = 0;
      let count = 0;
      snap.forEach((doc) => {
        const value = doc.get('value');
        if (typeof value === 'number') {
          sum += value;
          count += 1;
        }
      });
      const ratingAvg = count > 0 ? sum / count : 0;

      // merge:true → on ne touche pas à commentCount.
      tx.set(gameRef, { ratingCount: count, ratingAvg }, { merge: true });
    });
  },
);

// commentCount, maintenu de la même façon (transaction sérialisée sur games/{gameId}).
// On compte via une requête d'agrégation count() (pas de lecture de tous les
// docs : peu coûteux même pour un jeu très commenté).
export const countComments = onDocumentWritten(
  'games/{gameId}/comments/{commentId}',
  async (event) => {
    const before = event.data?.before.exists ?? false;
    const after = event.data?.after.exists ?? false;
    if (before === after) return; // ni création ni suppression → rien à faire

    const { gameId } = event.params;
    const gameRef = db.doc(`games/${gameId}`);

    await db.runTransaction(async (tx) => {
      await tx.get(gameRef); // sérialise les invocations concurrentes sur ce doc
      const agg = await tx.get(db.collection(`games/${gameId}/comments`).count());
      tx.set(gameRef, { commentCount: agg.data().count }, { merge: true });
    });
  },
);
