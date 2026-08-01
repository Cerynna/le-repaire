import type { User } from 'firebase/auth';

// État d'authentification partagé dans toute l'app. Module dédié (plutôt que
// dans main.ts) pour éviter les imports circulaires entre le shell et les pages.
export interface Session {
  user: User | null;
  pseudo: string | null;
  admin: boolean; // claim `admin` (UI de triage seulement ; la sécurité est dans les règles)
}

export const session: Session = { user: null, pseudo: null, admin: false };

type Listener = () => void;
const listeners = new Set<Listener>();

// S'abonner aux changements d'auth. Renvoie une fonction de désabonnement.
export function onSession(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function emitSession(): void {
  listeners.forEach((fn) => fn());
}
