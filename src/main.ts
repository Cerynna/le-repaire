import './styles/main.css';
import { route, startRouter } from './router';
import { renderHome } from './pages/home';
import { renderGame } from './pages/game';
import { session, emitSession } from './session';
import { escapeHtml } from './util';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="/" data-link><span class="brand-mark">◆</span> Le Repaire</a>
    <nav class="account" id="account"></nav>
  </header>
  <main id="view"></main>
  <footer class="foot">Les jeux de Cerynna · fait avec ✦</footer>`;

const view = document.querySelector<HTMLElement>('#view')!;
const account = document.querySelector<HTMLElement>('#account')!;

// --- Authentification (chargée en différé) ----------------------------------
// Le SDK firebase/auth vit dans ./auth/auth, importé dynamiquement : il forme
// son propre chunk async et reste hors du chargement critique (accueil + notes).
type AuthModule = typeof import('./auth/auth');
let authMod: AuthModule | null = null;

async function ensureAuth(): Promise<AuthModule> {
  if (!authMod) authMod = await import('./auth/auth');
  return authMod;
}

function renderAccount(): void {
  if (!session.user) {
    account.innerHTML = `<button class="btn" id="login">Connexion Google</button>`;
    account.querySelector('#login')!.addEventListener('click', async () => {
      const m = await ensureAuth();
      m.signIn().catch((e) => console.error('Connexion impossible', e));
    });
    return;
  }
  account.innerHTML = `
    <span class="who">${escapeHtml(session.pseudo ?? '…')}</span>
    <button class="btn ghost" id="logout">Déconnexion</button>`;
  account.querySelector('#logout')!.addEventListener('click', () => {
    authMod?.logOut().catch((e) => console.error('Déconnexion impossible', e));
  });
}

// Modale de choix du pseudo au premier login (appelée après le chargement auth).
function promptPseudo(): void {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="pseudo-title">
      <h2 id="pseudo-title">Choisis ton pseudo</h2>
      <p class="muted">Il apparaîtra à côté de tes notes et commentaires (1–16 caractères).</p>
      <input id="pseudo-input" maxlength="16" autocomplete="off" placeholder="Ton pseudo" />
      <p class="err" id="pseudo-err"></p>
      <button class="btn" id="pseudo-save">Valider</button>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector<HTMLInputElement>('#pseudo-input')!;
  const err = overlay.querySelector<HTMLElement>('#pseudo-err')!;
  input.focus();

  const save = async (): Promise<void> => {
    const value = input.value.trim();
    const m = await ensureAuth();
    if (!m.isPseudoValid(value)) {
      err.textContent = 'Pseudo invalide (1–16 caractères : lettres, chiffres, espaces).';
      return;
    }
    if (!session.user) return;
    try {
      await m.setPseudo(session.user.uid, value);
      session.pseudo = value;
      renderAccount();
      emitSession();
      overlay.remove();
    } catch {
      err.textContent = "Impossible d'enregistrer (Firebase non configuré ?).";
    }
  };

  overlay.querySelector('#pseudo-save')!.addEventListener('click', () => void save());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') void save();
  });
}

// --- Routes -----------------------------------------------------------------

route('/', () => renderHome(view));
route('/jeu/:id', (params) => renderGame(view, params.id));

renderAccount();
startRouter();

// Démarre l'observation de l'auth une fois le module chargé.
void ensureAuth().then((mod) => {
  mod.watchAuth(async (user) => {
    session.user = user;
    if (user) {
      // Profil et claim admin en parallèle.
      const [profile, admin] = await Promise.all([mod.getProfile(user.uid), mod.checkAdmin(user)]);
      session.pseudo = profile?.pseudo ?? null;
      session.admin = admin;
    } else {
      session.pseudo = null;
      session.admin = false;
    }
    renderAccount();
    emitSession();
    // Connecté mais sans pseudo → on invite à en choisir un.
    if (user && !session.pseudo) promptPseudo();
  });
});
