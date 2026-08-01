// Micro-routeur SPA basé sur l'History API. Les liens internes portent
// l'attribut `data-link` et sont interceptés globalement.
// Un handler peut renvoyer une fonction de nettoyage (teardown) appelée avant
// de rendre la route suivante — c'est là qu'on démonte les abonnements (ex.
// onSession, onSnapshot) pour éviter les fuites à la navigation.
type Handler = (params: Record<string, string>) => void | (() => void);

interface Entry {
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

const routes: Entry[] = [];

// Nettoyage de la page courante, à exécuter avant d'en afficher une autre.
let currentCleanup: (() => void) | null = null;

// Déclare une route. Les segments `:param` deviennent des paramètres nommés.
export function route(path: string, handler: Handler): void {
  const keys: string[] = [];
  const source = path.replace(/:([^/]+)/g, (_, key: string) => {
    keys.push(key);
    return '([^/]+)';
  });
  routes.push({ pattern: new RegExp(`^${source}$`), keys, handler });
}

export function navigate(to: string): void {
  history.pushState({}, '', to);
  resolve();
}

export function resolve(): void {
  const path = location.pathname || '/';
  for (const entry of routes) {
    const match = path.match(entry.pattern);
    if (match) {
      const params: Record<string, string> = {};
      entry.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(match[i + 1]);
      });
      // Démonter la page précédente avant de rendre la nouvelle.
      currentCleanup?.();
      currentCleanup = entry.handler(params) ?? null;
      window.scrollTo(0, 0);
      return;
    }
  }
  // Route inconnue → retour à l'accueil (qui, lui, est toujours déclaré).
  if (path !== '/') navigate('/');
}

export function startRouter(): void {
  window.addEventListener('popstate', resolve);
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest<HTMLAnchorElement>('a[data-link]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) navigate(href);
    }
  });
  resolve();
}
