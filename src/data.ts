import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  serverTimestamp,
  type Query,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { GameStats, Comment, Bug, BugStatus } from './types';

// Une page de résultats paginés. `last` est le curseur pour la page suivante
// (null quand il n'y a plus rien à charger, càd page incomplète).
export interface Page<T> {
  items: T[];
  last: QueryDocumentSnapshot | null;
}

// Curseur de page suivante : le dernier doc si la page est pleine (donc peut-être
// suivie d'autres), sinon null.
function nextCursor(
  docs: QueryDocumentSnapshot[],
  pageSize: number,
): QueryDocumentSnapshot | null {
  return docs.length === pageSize ? docs[docs.length - 1] : null;
}

// Convertit un Firestore Timestamp (ou sentinelle non résolue) en millisecondes.
function tsToMillis(ts: unknown): number | null {
  return ts && typeof (ts as { toMillis?: unknown }).toMillis === 'function'
    ? (ts as { toMillis: () => number }).toMillis()
    : null;
}

// Nombre max de commentaires chargés (aligné avec la règle Firestore : <= 100).
export const COMMENTS_LIMIT = 50;

// Lit les agrégats publics d'un jeu (moyenne des notes, compteurs).
// Dégrade proprement si Firebase n'est pas encore configuré / hors-ligne :
// renvoie null plutôt que de casser l'affichage du catalogue.
export async function getGameStats(id: string): Promise<GameStats | null> {
  try {
    const snap = await getDoc(doc(db, 'games', id));
    return snap.exists() ? (snap.data() as GameStats) : null;
  } catch {
    return null;
  }
}

// Écoute en temps réel l'agrégat d'un jeu : le callback est rappelé dès que la
// Cloud Function réécrit ratingAvg/commentCount (donc le badge se met à jour
// quel que soit le délai, cold start compris — pas de pari temporel). Renvoie
// la fonction de désabonnement. En cas d'erreur (Firebase non configuré / hors-
// ligne), on rappelle avec null pour dégrader proprement.
export function watchGameStats(id: string, cb: (stats: GameStats | null) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'games', id),
    (snap) => cb(snap.exists() ? (snap.data() as GameStats) : null),
    () => cb(null),
  );
}

// Lit la note du joueur pour un jeu (null s'il n'a pas encore noté).
export async function getMyRating(gameId: string, uid: string): Promise<number | null> {
  try {
    const snap = await getDoc(doc(db, 'games', gameId, 'ratings', uid));
    return snap.exists() ? (snap.data().value as number) : null;
  } catch {
    return null;
  }
}

// Enregistre/modifie la note du joueur. L'agrégat public est ensuite recalculé
// par la Cloud Function `aggregateRatings`. `serverTimestamp()` satisfait la
// règle `ts == request.time`.
export async function setMyRating(gameId: string, uid: string, value: number): Promise<void> {
  await setDoc(doc(db, 'games', gameId, 'ratings', uid), { value, ts: serverTimestamp() });
}

// --- Commentaires -----------------------------------------------------------

// Liste une page de commentaires (du plus récent au plus ancien, COMMENTS_LIMIT
// par page — la règle Firestore refuse au-delà de 100). Passer `after` (curseur
// d'une page précédente) pour charger la suivante.
// Renvoie `null` en cas d'ÉCHEC de lecture (à distinguer d'une page vide) : ainsi
// l'appelant conserve sa liste plutôt que d'effacer un commentaire fraîchement publié.
export async function listComments(
  gameId: string,
  after?: QueryDocumentSnapshot | null,
): Promise<Page<Comment> | null> {
  try {
    const q = query(
      collection(db, 'games', gameId, 'comments'),
      orderBy('ts', 'desc'),
      ...(after ? [startAfter(after)] : []),
      limit(COMMENTS_LIMIT),
    );
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid: data.uid as string,
        pseudo: data.pseudo as string,
        text: data.text as string,
        // `ts` peut être null juste après l'ajout (serverTimestamp pas encore résolu).
        ts: tsToMillis(data.ts),
      };
    });
    return { items, last: nextCursor(snap.docs, COMMENTS_LIMIT) };
  } catch {
    return null;
  }
}

export async function addComment(
  gameId: string,
  uid: string,
  pseudo: string,
  text: string,
): Promise<void> {
  await addDoc(collection(db, 'games', gameId, 'comments'), {
    uid,
    pseudo,
    text,
    ts: serverTimestamp(),
  });
}

export async function deleteComment(gameId: string, commentId: string): Promise<void> {
  await deleteDoc(doc(db, 'games', gameId, 'comments', commentId));
}

// --- Signalements de bugs ---------------------------------------------------

function mapBug(id: string, data: DocumentData): Bug {
  return {
    id,
    uid: data.uid as string,
    pseudo: data.pseudo as string,
    title: data.title as string,
    description: data.description as string,
    status: data.status as BugStatus,
    ts: tsToMillis(data.ts),
  };
}

// Exécute une requête bugs paginée. Renvoie null en cas d'échec (distingué d'une
// page vide) pour ne pas effacer une liste existante à l'affichage.
async function runBugQuery(
  q: Query<DocumentData>,
  pageSize: number,
): Promise<Page<Bug> | null> {
  try {
    const snap = await getDocs(q);
    return { items: snap.docs.map((d) => mapBug(d.id, d.data())), last: nextCursor(snap.docs, pageSize) };
  } catch {
    return null;
  }
}

export async function reportBug(
  gameId: string,
  uid: string,
  pseudo: string,
  title: string,
  description: string,
): Promise<void> {
  await addDoc(collection(db, 'games', gameId, 'bugs'), {
    uid,
    pseudo,
    title,
    description,
    status: 'open',
    ts: serverTimestamp(),
  });
}

export const MY_BUGS_LIMIT = 50;
export const ALL_BUGS_LIMIT = 100;

// Une page des signalements de l'utilisateur (nécessite l'index composite
// uid+ts). La règle Firestore n'autorise cette requête que parce qu'elle filtre
// sur uid == le sien.
export function listMyBugs(
  gameId: string,
  uid: string,
  after?: QueryDocumentSnapshot | null,
): Promise<Page<Bug> | null> {
  return runBugQuery(
    query(
      collection(db, 'games', gameId, 'bugs'),
      where('uid', '==', uid),
      orderBy('ts', 'desc'),
      ...(after ? [startAfter(after)] : []),
      limit(MY_BUGS_LIMIT),
    ),
    MY_BUGS_LIMIT,
  );
}

// Une page de tous les signalements d'un jeu — réservé à l'admin (la règle
// `list` refuse un non-admin qui ne filtre pas sur son uid).
export function listAllBugs(
  gameId: string,
  after?: QueryDocumentSnapshot | null,
): Promise<Page<Bug> | null> {
  return runBugQuery(
    query(
      collection(db, 'games', gameId, 'bugs'),
      orderBy('ts', 'desc'),
      ...(after ? [startAfter(after)] : []),
      limit(ALL_BUGS_LIMIT),
    ),
    ALL_BUGS_LIMIT,
  );
}

export async function setBugStatus(
  gameId: string,
  bugId: string,
  status: BugStatus,
): Promise<void> {
  await updateDoc(doc(db, 'games', gameId, 'bugs', bugId), { status });
}

export async function deleteBug(gameId: string, bugId: string): Promise<void> {
  await deleteDoc(doc(db, 'games', gameId, 'bugs', bugId));
}
