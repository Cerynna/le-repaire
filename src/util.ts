// Échappe le HTML avant toute injection de contenu utilisateur (pseudos,
// commentaires…) dans le DOM via innerHTML. À utiliser systématiquement.
export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

// Étoiles pleines/vides pour une moyenne (0–5).
export function stars(avg: number): string {
  const full = Math.max(0, Math.min(5, Math.round(avg)));
  return `<span class="stars" aria-hidden="true">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span>`;
}
