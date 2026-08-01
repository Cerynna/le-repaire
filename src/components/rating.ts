import { session, onSession } from '../session';
import { getMyRating, setMyRating } from '../data';

// Widget de notation : 5 étoiles cliquables. Nécessite d'être connecté.
// Renvoie une fonction de teardown (à appeler au démontage de la page) qui
// coupe l'abonnement onSession. La moyenne affichée ailleurs se met à jour
// toute seule via l'écoute temps réel de l'agrégat (watchGameStats).
export function mountRating(el: HTMLElement, gameId: string): () => void {
  let myRating: number | null = null;
  let busy = false;

  const unsub = onSession(() => {
    void load();
  });

  async function load(): Promise<void> {
    myRating = session.user ? await getMyRating(gameId, session.user.uid) : null;
    render();
  }

  function render(): void {
    if (!session.user) {
      el.innerHTML = `<p class="muted">Connecte-toi pour noter.</p>`;
      return;
    }
    el.innerHTML = `
      <div class="rate" role="group" aria-label="Noter ce jeu">
        ${[1, 2, 3, 4, 5]
          .map(
            (n) =>
              `<button class="star-btn" data-v="${n}" aria-label="${n} étoile${n > 1 ? 's' : ''}">★</button>`,
          )
          .join('')}
      </div>
      <p class="rate-msg muted">${myRating ? `Ta note : ${myRating}/5` : 'Clique pour noter'}</p>`;

    const buttons = [...el.querySelectorAll<HTMLButtonElement>('.star-btn')];
    const paint = (upTo: number): void =>
      buttons.forEach((b, i) => b.classList.toggle('on', i < upTo));
    paint(myRating ?? 0);

    buttons.forEach((b) => {
      const v = Number(b.dataset.v);
      b.addEventListener('mouseenter', () => paint(v));
      b.addEventListener('mouseleave', () => paint(myRating ?? 0));
      b.addEventListener('click', () => void submit(v));
    });
  }

  async function submit(value: number): Promise<void> {
    if (busy || !session.user) return;
    busy = true;
    const previous = myRating;
    myRating = value; // optimiste
    render();
    try {
      await setMyRating(gameId, session.user.uid, value);
    } catch (e) {
      myRating = previous; // rollback en cas d'échec
      render();
      console.error('Note non enregistrée', e);
    } finally {
      busy = false;
    }
  }

  void load();
  return unsub;
}
