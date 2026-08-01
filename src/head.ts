// Met à jour le titre de l'onglet et les meta (description + Open Graph/Twitter)
// selon la page. Les crawlers sans JS ne verront que les valeurs par défaut de
// index.html ; ceci améliore l'onglet du navigateur et les aperçus qui exécutent
// le JS. Une vraie prévisualisation par jeu nécessiterait du pré-rendu (Phase +).

const SUFFIX = 'Le Repaire';

function setTag(selector: string, attr: string, key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function setMeta(title: string, description: string): void {
  document.title = title;
  setTag('meta[name="description"]', 'name', 'description', description);
  setTag('meta[property="og:title"]', 'property', 'og:title', title);
  setTag('meta[property="og:description"]', 'property', 'og:description', description);
  setTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
}

// Titre de page depuis un libellé (« Élan » → « Élan — Le Repaire »).
export function pageTitle(label?: string): string {
  return label ? `${label} — ${SUFFIX}` : `${SUFFIX} — les jeux de Cerynna`;
}
