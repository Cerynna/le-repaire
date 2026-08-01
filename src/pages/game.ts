import { getGame } from '../games';
import { watchGameStats } from '../data';
import { escapeHtml, stars } from '../util';
import { navigate } from '../router';
import { mountRating } from '../components/rating';
import { mountComments } from '../components/comments';
import { mountBugs } from '../components/bugs';
import { setMeta, pageTitle } from '../head';

// Renvoie une fonction de teardown (démontage) appelée par le routeur à la
// navigation, ou rien si le jeu n'existe pas.
export function renderGame(view: HTMLElement, id: string): void | (() => void) {
  const g = getGame(id);
  if (!g) {
    navigate('/');
    return;
  }

  setMeta(pageTitle(g.title), g.tagline);

  view.innerHTML = `
    <a class="back" href="/" data-link>← Tous les jeux</a>
    <article class="detail" style="--accent:${g.accent}">
      <header class="detail-head">
        <span class="badge badge-${g.status}">${g.status === 'live' ? 'En ligne' : g.status === 'wip' ? 'En chantier' : 'Archivé'}</span>
        <h1>${escapeHtml(g.title)}</h1>
        <p class="lede">${escapeHtml(g.tagline)}</p>
      </header>

      <p class="detail-desc">${escapeHtml(g.description)}</p>

      <div class="detail-tags">
        ${g.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </div>

      <div class="detail-actions">
        ${
          g.url
            ? `<a class="btn play" href="${escapeHtml(g.url)}" target="_blank" rel="noopener noreferrer">▶ Jouer</a>`
            : `<button class="btn play" disabled>Bientôt jouable</button>`
        }
      </div>

      <section class="community">
        <div class="panel">
          <h3>Note</h3>
          <div id="rating-stats" class="muted">Chargement…</div>
          <div id="rating-widget"></div>
        </div>
        <div class="panel">
          <h3>Signaler un bug</h3>
          <div id="bugs"></div>
        </div>
      </section>

      <section class="panel comments-panel">
        <h3>Commentaires <span id="cmt-badge" class="muted"></span></h3>
        <div id="comments"></div>
      </section>
    </article>`;

  const statsEl = view.querySelector<HTMLElement>('#rating-stats')!;
  const badgeEl = view.querySelector<HTMLElement>('#cmt-badge')!;

  // Écoute temps réel de l'agrégat : la note moyenne et le badge de commentaires
  // se mettent à jour dès que la Cloud Function recalcule (aucun pari sur un
  // délai fixe, cold start compris).
  const unwatch = watchGameStats(g.id, (s) => {
    statsEl.innerHTML =
      s && s.ratingCount > 0
        ? `${stars(s.ratingAvg)} <strong>${s.ratingAvg.toFixed(1)}</strong> · ${s.ratingCount} vote${s.ratingCount > 1 ? 's' : ''}`
        : 'Pas encore de note — sois le premier&nbsp;!';
    badgeEl.textContent = s?.commentCount ? `· ${s.commentCount}` : '';
  });

  const unmountRating = mountRating(view.querySelector<HTMLElement>('#rating-widget')!, g.id);
  const unmountComments = mountComments(view.querySelector<HTMLElement>('#comments')!, g.id);
  const unmountBugs = mountBugs(view.querySelector<HTMLElement>('#bugs')!, g.id);

  return () => {
    unwatch();
    unmountRating();
    unmountComments();
    unmountBugs();
  };
}
