import { session, onSession } from '../session';
import { listComments, addComment, deleteComment } from '../data';
import { escapeHtml } from '../util';
import type { Comment } from '../types';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

const MAX = 500; // doit rester aligné avec la règle Firestore (text.size() <= 500)

type State = 'loading' | 'ready' | 'error';

// Panneau de commentaires : liste publique paginée + formulaire (si connecté) +
// suppression de ses propres commentaires. Renvoie un teardown.
export function mountComments(el: HTMLElement, gameId: string): () => void {
  let comments: Comment[] = [];
  let cursor: QueryDocumentSnapshot | null = null;
  let state: State = 'loading';
  let busy = false;
  let loadingMore = false;
  let loadGen = 0;
  let renderedLoggedIn = false;

  const unsub = onSession(() => {
    const loggedIn = !!session.user;
    // Le formulaire ET les boutons « supprimer » (sur ses propres commentaires)
    // dépendent de la connexion → rebuild complet seulement quand elle change.
    if (loggedIn !== renderedLoggedIn) {
      renderedLoggedIn = loggedIn;
      render();
      void load();
    }
  });

  async function load(): Promise<void> {
    const gen = ++loadGen;
    const page = await listComments(gameId);
    if (gen !== loadGen) return;
    if (page === null) {
      state = 'error';
      refreshList();
      return;
    }
    comments = page.items;
    cursor = page.last;
    state = 'ready';
    refreshList();
  }

  async function loadMore(): Promise<void> {
    if (!cursor || loadingMore) return;
    loadingMore = true;
    const page = await listComments(gameId, cursor);
    loadingMore = false;
    if (page) {
      comments = [...comments, ...page.items];
      cursor = page.last;
    }
    refreshList();
  }

  // Rebuild complet (formulaire + liste) — uniquement à la bascule connecté↔déco.
  function render(): void {
    const form = session.user
      ? `<form class="cmt-form" id="cmt-form">
           <textarea id="cmt-text" maxlength="${MAX}" rows="3" placeholder="Ton commentaire…"></textarea>
           <div class="cmt-form-row">
             <span class="cmt-count muted" id="cmt-count">0/${MAX}</span>
             <button class="btn" type="submit">Publier</button>
           </div>
           <p class="err" id="cmt-err"></p>
         </form>`
      : `<p class="muted">Connecte-toi pour commenter.</p>`;
    el.innerHTML = `${form}<ul class="cmt-list">${renderList()}</ul>`;
    if (session.user) wireForm();
    wireList();
  }

  // Rafraîchit uniquement la liste (préserve le formulaire et sa saisie).
  function refreshList(): void {
    const listEl = el.querySelector('.cmt-list');
    if (!listEl) return;
    listEl.innerHTML = renderList();
    wireList();
  }

  function renderList(): string {
    if (state === 'loading') return `<li class="muted cmt-empty">Chargement…</li>`;
    if (state === 'error' && comments.length === 0) {
      return `<li class="err cmt-empty">Impossible de charger les commentaires. Réessaie plus tard.</li>`;
    }
    if (comments.length === 0) {
      return `<li class="muted cmt-empty">Aucun commentaire pour l'instant.</li>`;
    }
    let html = comments.map(renderItem).join('');
    if (state === 'error') {
      html += `<li class="err cmt-empty">Rafraîchissement impossible — liste peut-être incomplète.</li>`;
    }
    if (state === 'ready' && cursor) {
      html += `<li class="cmt-more-li"><button class="btn ghost cmt-more" type="button">Charger plus</button></li>`;
    }
    return html;
  }

  function renderItem(c: Comment): string {
    const mine = !!session.user && c.uid === session.user.uid;
    return `<li class="cmt">
      <div class="cmt-head">
        <span class="cmt-author">${escapeHtml(c.pseudo)}</span>
        <span class="cmt-date muted">${formatDate(c.ts)}</span>
        ${mine ? `<button class="cmt-del" data-id="${escapeHtml(c.id)}" aria-label="Supprimer mon commentaire" title="Supprimer">✕</button>` : ''}
      </div>
      <p class="cmt-text">${escapeHtml(c.text)}</p>
    </li>`;
  }

  function wireForm(): void {
    const form = el.querySelector<HTMLFormElement>('#cmt-form')!;
    const text = el.querySelector<HTMLTextAreaElement>('#cmt-text')!;
    const count = el.querySelector<HTMLElement>('#cmt-count')!;
    const err = el.querySelector<HTMLElement>('#cmt-err')!;

    text.addEventListener('input', () => {
      count.textContent = `${text.value.length}/${MAX}`;
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (busy || !session.user) return;
      const value = text.value.trim();
      if (value.length < 1) return void (err.textContent = 'Ton commentaire est vide.');
      if (value.length > MAX) return void (err.textContent = `Maximum ${MAX} caractères.`);
      if (!session.pseudo) return void (err.textContent = "Choisis d'abord un pseudo.");
      busy = true;
      try {
        await addComment(gameId, session.user.uid, session.pseudo, value);
        comments = [
          { id: `tmp-${Date.now()}`, uid: session.user.uid, pseudo: session.pseudo, text: value, ts: null },
          ...comments,
        ];
        state = 'ready';
        text.value = '';
        count.textContent = `0/${MAX}`;
        err.textContent = '';
        refreshList();
        await load(); // réconcilie (repart de la 1re page)
      } catch (error) {
        err.textContent = 'Publication impossible.';
        console.error('Commentaire non publié', error);
      } finally {
        busy = false;
      }
    });
  }

  function wireList(): void {
    const more = el.querySelector<HTMLButtonElement>('.cmt-more');
    if (more) more.addEventListener('click', () => void loadMore());

    el.querySelectorAll<HTMLButtonElement>('.cmt-del').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (busy) return;
        const id = btn.dataset.id;
        if (!id) return;
        busy = true;
        comments = comments.filter((c) => c.id !== id);
        refreshList();
        try {
          await deleteComment(gameId, id);
        } catch (error) {
          console.error('Suppression impossible', error);
        } finally {
          await load();
          busy = false;
        }
      });
    });
  }

  render();
  renderedLoggedIn = !!session.user;
  void load();
  return unsub;
}

function formatDate(ms: number | null): string {
  if (!ms) return "à l'instant";
  return new Date(ms).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
