import { session, onSession } from '../session';
import { listMyBugs, listAllBugs, reportBug, setBugStatus, deleteBug } from '../data';
import { escapeHtml } from '../util';
import type { Bug, BugStatus } from '../types';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

const TITLE_MAX = 100;
const DESC_MAX = 2000;

type State = 'loading' | 'ready' | 'error';

const STATUS_LABEL: Record<BugStatus, string> = {
  open: 'Ouvert',
  in_progress: 'En cours',
  resolved: 'Résolu',
  wontfix: 'Non retenu',
};
const STATUS_ORDER: BugStatus[] = ['open', 'in_progress', 'resolved', 'wontfix'];

// Panneau de signalement de bugs. L'auteur voit/gère les siens ; l'admin voit
// tout et fait le triage (change le statut). Renvoie un teardown.
export function mountBugs(el: HTMLElement, gameId: string): () => void {
  let bugs: Bug[] = [];
  let cursor: QueryDocumentSnapshot | null = null;
  let state: State = 'loading';
  let busy = false;
  let loadingMore = false;
  let loadGen = 0; // seul le chargement le plus récent a le droit de peindre
  let renderedLoggedIn = false;

  const unsub = onSession(() => {
    const loggedIn = !!session.user;
    // On ne reconstruit le formulaire QUE si l'état de connexion change (il
    // apparaît/disparaît) — jamais lors d'un simple rafraîchissement de liste,
    // pour ne pas effacer une saisie en cours.
    if (loggedIn !== renderedLoggedIn) {
      renderedLoggedIn = loggedIn;
      render();
    }
    void load();
  });

  async function load(): Promise<void> {
    const gen = ++loadGen;
    if (!session.user) {
      bugs = [];
      state = 'ready';
      return; // render() (déclenché par le changement de connexion) montre l'invite
    }
    const page = session.admin
      ? await listAllBugs(gameId)
      : await listMyBugs(gameId, session.user.uid);
    if (gen !== loadGen) return; // un chargement plus récent a pris la main
    if (page === null) state = 'error';
    else {
      bugs = page.items;
      cursor = page.last;
      state = 'ready';
    }
    refreshList();
  }

  async function loadMore(): Promise<void> {
    if (!cursor || loadingMore || !session.user) return;
    loadingMore = true;
    const page = session.admin
      ? await listAllBugs(gameId, cursor)
      : await listMyBugs(gameId, session.user.uid, cursor);
    loadingMore = false;
    if (page) {
      bugs = [...bugs, ...page.items];
      cursor = page.last;
    }
    refreshList();
  }

  // Rebuild complet (formulaire + liste) — uniquement à la bascule connecté↔déco.
  function render(): void {
    if (!session.user) {
      el.innerHTML = `<p class="muted">Connecte-toi pour signaler un bug.</p>`;
      return;
    }
    el.innerHTML = `
      <form class="bug-form" id="bug-form">
        <input id="bug-title" maxlength="${TITLE_MAX}" autocomplete="off" placeholder="Titre du bug" />
        <textarea id="bug-desc" maxlength="${DESC_MAX}" rows="3" placeholder="Décris le problème : étapes, ce qui se passe, navigateur…"></textarea>
        <div class="bug-form-row">
          <span class="muted" id="bug-count">0/${DESC_MAX}</span>
          <button class="btn" type="submit">Signaler</button>
        </div>
        <p class="err" id="bug-err"></p>
      </form>
      <p class="bug-scope muted">${session.admin ? 'Tous les signalements (admin)' : 'Mes signalements'}</p>
      <ul class="bug-list">${renderList()}</ul>`;
    wireForm();
    wireList();
  }

  // Rafraîchit UNIQUEMENT la liste, en préservant le formulaire (et sa saisie).
  function refreshList(): void {
    const listEl = el.querySelector('.bug-list');
    if (!listEl) return;
    listEl.innerHTML = renderList();
    wireList();
  }

  function renderList(): string {
    if (state === 'loading') return `<li class="muted bug-empty">Chargement…</li>`;
    if (state === 'error' && bugs.length === 0) {
      return `<li class="err bug-empty">Impossible de charger les signalements.</li>`;
    }
    if (bugs.length === 0) {
      return `<li class="muted bug-empty">${session.admin ? 'Aucun signalement.' : "Tu n'as signalé aucun bug."}</li>`;
    }
    let html = bugs.map(renderItem).join('');
    if (state === 'error') {
      html += `<li class="err bug-empty">Rafraîchissement impossible — liste peut-être incomplète.</li>`;
    }
    if (state === 'ready' && cursor) {
      html += `<li class="bug-more-li"><button class="btn ghost bug-more" type="button">Charger plus</button></li>`;
    }
    return html;
  }

  function renderItem(b: Bug): string {
    const control = session.admin
      ? `<select class="bug-status-select" data-id="${escapeHtml(b.id)}" aria-label="Changer le statut">
           ${STATUS_ORDER.map(
             (s) =>
               `<option value="${s}"${s === b.status ? ' selected' : ''}>${STATUS_LABEL[s]}</option>`,
           ).join('')}
         </select>`
      : `<span class="badge bug-badge bug-${b.status}">${STATUS_LABEL[b.status]}</span>`;
    return `<li class="bug">
      <div class="bug-head">
        <span class="bug-title-txt">${escapeHtml(b.title)}</span>
        ${control}
        <button class="bug-del" data-id="${escapeHtml(b.id)}" aria-label="Supprimer" title="Supprimer">✕</button>
      </div>
      <p class="bug-desc-txt">${escapeHtml(b.description)}</p>
      <div class="bug-meta muted">${session.admin ? `par ${escapeHtml(b.pseudo)} · ` : ''}${formatDate(b.ts)}</div>
    </li>`;
  }

  function wireForm(): void {
    const form = el.querySelector<HTMLFormElement>('#bug-form')!;
    const title = el.querySelector<HTMLInputElement>('#bug-title')!;
    const desc = el.querySelector<HTMLTextAreaElement>('#bug-desc')!;
    const count = el.querySelector<HTMLElement>('#bug-count')!;
    const err = el.querySelector<HTMLElement>('#bug-err')!;

    desc.addEventListener('input', () => {
      count.textContent = `${desc.value.length}/${DESC_MAX}`;
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (busy || !session.user) return;
      const t = title.value.trim();
      const d = desc.value.trim();
      if (t.length < 1) return void (err.textContent = 'Donne un titre au bug.');
      if (t.length > TITLE_MAX) return void (err.textContent = `Titre : ${TITLE_MAX} caractères max.`);
      if (d.length < 1) return void (err.textContent = 'Décris le problème.');
      if (d.length > DESC_MAX) return void (err.textContent = `Description : ${DESC_MAX} caractères max.`);
      if (!session.pseudo) return void (err.textContent = "Choisis d'abord un pseudo.");
      busy = true;
      try {
        await reportBug(gameId, session.user.uid, session.pseudo, t, d);
        bugs = [
          {
            id: `tmp-${Date.now()}`,
            uid: session.user.uid,
            pseudo: session.pseudo,
            title: t,
            description: d,
            status: 'open',
            ts: null,
          },
          ...bugs,
        ];
        state = 'ready';
        // Vider explicitement plutôt que reconstruire le formulaire.
        title.value = '';
        desc.value = '';
        count.textContent = `0/${DESC_MAX}`;
        err.textContent = '';
        refreshList();
        await load();
      } catch (error) {
        err.textContent = 'Envoi impossible.';
        console.error('Bug non signalé', error);
      } finally {
        busy = false;
      }
    });
  }

  // (Re)câble les contrôles de la liste. Appelé après chaque refreshList.
  function wireList(): void {
    const more = el.querySelector<HTMLButtonElement>('.bug-more');
    if (more) more.addEventListener('click', () => void loadMore());

    el.querySelectorAll<HTMLButtonElement>('.bug-del').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (busy) return;
        const id = btn.dataset.id;
        if (!id) return;
        busy = true;
        bugs = bugs.filter((b) => b.id !== id);
        refreshList();
        try {
          await deleteBug(gameId, id);
        } catch (error) {
          console.error('Suppression impossible', error);
        } finally {
          await load(); // resynchronise (réapparaît si non supprimé), avec garde de génération
          busy = false;
        }
      });
    });

    if (!session.admin) return;

    el.querySelectorAll<HTMLSelectElement>('.bug-status-select').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const id = sel.dataset.id;
        if (!id) return;
        const status = sel.value as BugStatus;
        if (busy) {
          // Ne jamais laisser le select afficher un statut non enregistré.
          const cur = bugs.find((b) => b.id === id);
          if (cur) sel.value = cur.status;
          return;
        }
        busy = true;
        bugs = bugs.map((b) => (b.id === id ? { ...b, status } : b));
        try {
          await setBugStatus(gameId, id, status);
        } catch (error) {
          console.error('Statut non mis à jour', error);
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
