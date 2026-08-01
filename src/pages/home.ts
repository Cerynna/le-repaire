import { games } from '../games';
import { getGameStats } from '../data';
import { escapeHtml, stars } from '../util';
import { setMeta, pageTitle } from '../head';
import type { Game } from '../types';

const STATUS_LABEL: Record<Game['status'], string> = {
  live: 'En ligne',
  wip: 'En chantier',
  archived: 'Archivé',
};

export function renderHome(view: HTMLElement): void {
  setMeta(pageTitle(), 'Les petits jeux de Cerynna. Joue, note, commente — et signale les bugs.');
  view.innerHTML = `
    <section class="hero">
      <h1>Le Repaire</h1>
      <p class="lede">Les petits jeux de Cerynna. Joue, note, commente — et signale-moi les bugs.</p>
    </section>
    <section class="grid">
      ${games.map(card).join('')}
    </section>`;

  // Si un fichier de cover est absent/cassé, on retire l'image et le glyphe
  // (dessous) réapparaît — repli propre sans image cassée.
  view.querySelectorAll<HTMLImageElement>('.card-img').forEach((img) => {
    img.addEventListener('error', () => img.remove());
  });

  // Les stats se chargent en asynchrone, sans bloquer l'affichage des cartes.
  for (const g of games) {
    getGameStats(g.id).then((s) => {
      const el = view.querySelector(`#stats-${g.id}`);
      if (!el) return;
      if (s && s.ratingCount > 0) {
        el.innerHTML = `${stars(s.ratingAvg)} <span class="muted">${s.ratingAvg.toFixed(1)} · ${s.commentCount ?? 0} 💬</span>`;
      }
    });
  }
}

function card(g: Game): string {
  return `
    <a class="card" href="/jeu/${encodeURIComponent(g.id)}" data-link style="--accent:${g.accent}">
      <div class="card-cover">
        <span class="card-glyph">${escapeHtml(g.title[0])}</span>
        ${g.cover ? `<img class="card-img" src="${escapeHtml(g.cover)}" alt="" />` : ''}
      </div>
      <div class="card-body">
        <div class="card-head">
          <h2>${escapeHtml(g.title)}</h2>
          <span class="badge badge-${g.status}">${STATUS_LABEL[g.status]}</span>
        </div>
        <p class="card-tagline">${escapeHtml(g.tagline)}</p>
        <div class="card-stats" id="stats-${escapeHtml(g.id)}">
          <span class="muted">Pas encore de note</span>
        </div>
      </div>
    </a>`;
}
