import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { app, db } from '../firebase';

// L'instance auth est créée ICI (et non dans firebase.ts) pour que tout le SDK
// `firebase/auth` reste dans ce module, chargé en différé (import dynamique
// depuis main.ts) — hors du chunk critique.
const auth = getAuth(app);
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  } catch {
    // déjà branché (HMR) — on ignore
  }
}

const provider = new GoogleAuthProvider();

export interface Profile {
  pseudo: string;
}

// Réagit aux changements d'état de connexion (login/logout/refresh).
export function watchAuth(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

export function signIn(): Promise<unknown> {
  return signInWithPopup(auth, provider);
}

export function logOut(): Promise<void> {
  return signOut(auth);
}

// Le profil (users/{uid}) est la source de vérité du pseudo affiché.
// Dégrade en null en cas d'échec de lecture (comme les lecteurs de data.ts) :
// sinon un rejet ferait avorter tout le handler d'auth et laisserait la session
// incohérente (utilisateur connecté mais UI figée sur l'état déconnecté).
export async function getProfile(uid: string): Promise<Profile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as Profile) : null;
  } catch {
    return null;
  }
}

export async function setPseudo(uid: string, pseudo: string): Promise<void> {
  await setDoc(doc(db, 'users', uid), { pseudo }, { merge: true });
}

// Même contrainte que la règle Firestore `pseudoValide` : 1–16 caractères,
// lettres (toutes langues) / marques / chiffres / espace / ' . _ -
const PSEUDO_RE = /^[\p{L}\p{M}\p{N} '._-]{1,16}$/u;
export function isPseudoValid(p: string): boolean {
  return PSEUDO_RE.test(p);
}

// Vrai si l'utilisateur porte le claim custom `admin` (posé côté backend).
// Sert uniquement à afficher l'UI de triage — la sécurité repose sur les règles.
export async function checkAdmin(user: User): Promise<boolean> {
  try {
    const token = await user.getIdTokenResult();
    return token.claims.admin === true;
  } catch {
    return false;
  }
}
