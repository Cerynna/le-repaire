// Statut d'un jeu dans le Repaire.
export type GameStatus = 'live' | 'wip' | 'archived';

// Métadonnées d'un jeu. Source de vérité = le catalogue statique (games.ts),
// versionné dans le code : ajouter un jeu = éditer ce fichier + redéployer.
export interface Game {
  id: string; // identifiant stable, relie le jeu à ses données communautaires
  title: string;
  tagline: string;
  description: string;
  url: string; // URL externe du jeu déployé à part
  cover?: string; // visuel optionnel (chemin dans public/)
  accent: string; // couleur d'accent de la carte/fiche
  tags: string[];
  status: GameStatus;
}

// Agrégats publics d'un jeu, recalculés côté backend.
// `commentCount` n'apparaît qu'à partir de la phase 3 (commentaires).
export interface GameStats {
  ratingCount: number;
  ratingAvg: number;
  commentCount?: number;
}

// Un commentaire posté sur un jeu.
export interface Comment {
  id: string;
  uid: string;
  pseudo: string;
  text: string;
  ts: number | null; // millisecondes epoch ; null tant que le serveur n'a pas résolu l'horodatage
}

// Cycle de vie d'un signalement de bug (triage par l'admin).
export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'wontfix';

// Un signalement de bug sur un jeu (privé : visible par l'auteur et l'admin).
export interface Bug {
  id: string;
  uid: string;
  pseudo: string;
  title: string;
  description: string;
  status: BugStatus;
  ts: number | null;
}
