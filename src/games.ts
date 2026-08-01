import type { Game } from './types';

// Catalogue des jeux du Repaire.
// ⚠️ À COMPLÉTER : renseigne l'`url` réelle de chaque jeu (déploiement externe)
// et, plus tard, un visuel dans public/ (champ `cover`).
// ⚠️ EN AJOUTANT UN JEU : ajoute aussi son `id` à `isKnownGame()` dans
// firestore.rules (sinon les notes/commentaires y seront refusés).
export const games: Game[] = [
  {
    id: 'elan',
    title: 'Élan',
    tagline: "Jeu d'arcade réflexe à une touche.",
    description:
      "Un jeu d'arcade nerveux qui se joue d'un seul doigt : timing, réflexes et un classement quotidien. Chaque jour, un nouveau défi.",
    url: 'https://elan-jeu.web.app',
    cover: '/covers/elan.jpg', // repli automatique sur le glyphe si le fichier est absent
    accent: '#f59e0b',
    tags: ['arcade', 'réflexe', 'une touche'],
    status: 'live',
  },
  {
    id: 'flux',
    title: 'Flux',
    tagline: 'Lane-defense minimaliste : piocher, poser, fusionner.',
    description:
      'Un tower-defense épuré en couloirs : pioche des unités, pose-les sur la bonne voie, fusionne-les pour tenir la vague. Simple à prendre en main, exigeant à maîtriser.',
    url: '', // pas encore déployé : bouton « Bientôt jouable » (voir game.ts)
    accent: '#3b82f6',
    tags: ['tower-defense', 'stratégie'],
    status: 'wip',
  },
];

export function getGame(id: string): Game | undefined {
  return games.find((g) => g.id === id);
}
