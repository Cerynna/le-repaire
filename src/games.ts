import type { Game } from './types';

// Catalogue des jeux du Repaire (généré/curaté depuis les dossiers de D:Le Devs).
// ⚠️ EN AJOUTANT UN JEU : ajoute aussi son `id` à `isKnownGame()` dans
// firestore.rules (sinon les notes/commentaires/bugs y seront refusés).
// Les jeux 'wip' (url vide) affichent un bouton « Bientôt jouable ».
export const games: Game[] = [
  {
    id: "catane",
    title: "Catane",
    tagline: "Le jeu de plateau culte, en famille : sur un même écran ou chacun chez soi.",
    description:
      "Le jeu de société Catan complet : ressources, routes, colonies et villes, voleur, cartes développement, ports, plus longue route et armée la plus grande, victoire à 10 points, de 2 à 4 joueurs. Jouable à plusieurs sur un même écran, ou en ligne chacun sur son appareil via un code à 4 lettres et une synchronisation en temps réel. Le moteur de jeu est pur et déterministe, testé de bout en bout par des parties simulées.",
    url: "https://catane-19b35.web.app",
    accent: "#b8763e",
    tags: ["plateau","famille","multijoueur"],
    status: "live",
  },
  {
    id: "doublons",
    title: "Doublons",
    tagline: "Casse-tête pirate : un coffre par île, ligne et colonne, sans jamais deux qui se touchent.",
    description:
      "Un casse-tête de logique à la Queens sur le thème des pirates : une carte découpée en îles où il faut enterrer un coffre par île, par ligne et par colonne, jamais deux côte à côte. Mode infini de plus en plus dur, trois cœurs par niveau et une roue de fortune tous les dix paliers qui distribue longue-vue, carte au trésor et rhum. Habillage SVG dessiné main, sons synthétisés et sauvegarde locale.",
    url: "https://doublons-jeu.web.app",
    accent: "#e0a94e",
    tags: ["casse-tête","pirates","logique"],
    status: "live",
  },
  {
    id: "elan",
    title: "Élan",
    tagline: "Accroche-toi, balance-toi, relâche pile au bon moment : un seul geste, un défi chaque jour.",
    description:
      "Jeu d'arcade réflexe à une seule touche : accroche-toi à un point, balance-toi et relâche au bon moment pour te lancer sans sortir de l'écran. Chaque jour, le même parcours pour tout le monde, avec un classement remis à zéro à minuit UTC et trois objectifs quotidiens. Le timing du relâcher déclenche un boost et fait grimper ton combo.",
    url: "https://elan-jeu.web.app",
    cover: "/covers/elan.jpg",
    accent: "#ff9f1c",
    tags: ["arcade","réflexe","quotidien"],
    status: "live",
  },
  {
    id: "emprise",
    title: "Emprise",
    tagline: "Duel de cartes sur damier 3×3 : capture, cascade et une run de cinq adversaires.",
    description:
      "Un roguelite de capture sur damier 3×3 : cinq cartes en main, neuf cases et une échelle de cinq adversaires qu'il faut renverser sans perdre. Le moteur enchaîne capture simple, Accord, Somme et Cascade, avec un deck retouchable entre les combats et deux cartes de butin par victoire. Univers cosmique et cyber, cartes sans illustration qui se lisent à leurs valeurs et à leur rareté.",
    url: "https://emprise-jeu.web.app",
    accent: "#7c5cff",
    tags: ["cartes","roguelite","duel"],
    status: "live",
  },
  {
    id: "facettes",
    title: "Facettes",
    tagline: "Colle des faces sur tes 5 dés et sculpte tes propres probabilités.",
    description:
      "Un deckbuilder de dés où ton deck, ce sont les faces de tes cinq dés : lance-les pour atteindre une cible qui grimpe à chaque manche, puis colle de nouvelles faces entre les manches. La résolution se joue de gauche à droite avec des effets de voisinage (recopies, re-déclenchements) et une mise en scène très juicy à la Balatro. Une run du jour, un mutateur quotidien et un classement complètent le tout.",
    url: "https://facettes-jeu.web.app",
    accent: "#ff4fa0",
    tags: ["roguelite","dés","quotidien"],
    status: "live",
  },
  {
    id: "flux",
    title: "Flux",
    tagline: "Pioche, pose, fusionne : défends cinq voies contre des vagues sans fin.",
    description:
      "Lane-defense minimaliste où tu ne fais que trois gestes : piocher une tour (draft roguelite), la poser sur une voie et fusionner deux tours identiques pour monter en puissance. Des vagues géométriques déferlent sans fin sur cinq voies, avec son procédural et leaderboard mondial.",
    url: "https://flux-jeu.web.app",
    accent: "#4c7cff",
    tags: ["tower-defense","roguelite","minimaliste"],
    status: "live",
  },
  {
    id: "mamie-bastonne",
    title: "Mamie Bastonne",
    tagline: "Mamie Ginette défend son lotissement à coups de sac à main contre démarcheurs, pigeons et influenceurs.",
    description:
      "Un survivor-like plein de charentaises où Mamie Ginette défend son lotissement contre des hordes de démarcheurs, de pigeons et d'influenceurs. On enchaîne les vagues à coups de sac à main, de dentier et d'armes improbables, on ramasse des passifs et on passe à la boutique entre deux assauts. Personnages, défis, mode sans fin et classements en ligne sont de la partie.",
    url: "https://mamie-bastonne.web.app",
    accent: "#7a3fa8",
    tags: ["survivor-like","humour","vagues"],
    status: "live",
  },
  {
    id: "orbite",
    title: "Orbite",
    tagline: "Un roguelite circulaire quotidien : posez vos symboles, le curseur fait le reste.",
    description:
      "Posez des symboles sur un anneau de 12 cases : un curseur le parcourt en continu et active chaque symbole à son passage, pendant que les ennemis convergent et brisent les cases. Vous ne touchez à rien pendant une vague — la machine se bat seule, toutes les décisions se prennent entre les vagues. L'adjacence est temporelle : le même build dans un autre ordre donne un tout autre résultat.",
    url: "https://orbite-jeu.web.app",
    accent: "#3df2ff",
    tags: ["roguelite","quotidien","stratégie"],
    status: "live",
  },
  {
    id: "profondeurs",
    title: "Profondeurs",
    tagline: "Un héros, dix étages, un Seigneur du Feu réveillé trop tôt.",
    description:
      "RPG rogue-lite au tour par tour, dark fantasy parodique et très drôle façon World of Warcraft. Un héros descend les dix étages des Profondeurs de Rochemolle jusqu'au Seigneur du Feu réveillé trop tôt. Tu meurs, tu gardes tout — niveau, objets, or — et tu y retournes.",
    url: "https://profondeurs-jeu.web.app",
    accent: "#d9531e",
    tags: ["rogue-lite","rpg","tour par tour"],
    status: "live",
  },
  {
    id: "recidive",
    title: "Récidive",
    tagline: "Du placard de ton appart au cartel mondial — en passant (souvent) par la case prison.",
    description:
      "Jeu de gestion en roguelite où tu fais grossir ton business, du placard de ton studio jusqu'au cartel mondial. Chaque run passe (souvent) par la case prison, et tu jongles entre téléphone, Bon Plan et carnet d'adresses au rythme que tu choisis. Pause, vitesse x1/x2/x3 : tout se pilote au clavier.",
    url: "https://recidive-jeu.web.app",
    accent: "#6ab04c",
    tags: ["gestion","roguelite","humour"],
    status: "live",
  },
  {
    id: "trace",
    title: "Tracé",
    tagline: "Trace chaque jour la boucle la plus courte reliant tous les points.",
    description:
      "Chaque jour, la même disposition de points pour tous : trace la boucle fermée la plus courte qui les relie tous (problème du voyageur de commerce) et obtiens ton pourcentage d'efficacité face à l'optimum mathématique exact. Trois essais par difficulté, campagne remontant le temps depuis 1950, classements en ligne et dix langues, le tout en PWA installable.",
    url: "https://trace-5e6d3.web.app",
    accent: "#2dd4bf",
    tags: ["puzzle","quotidien","classement"],
    status: "live",
  },
  {
    id: "butin",
    title: "Butin",
    tagline: "Enchères aveugles quotidiennes : 100 pièces, 10 trésors, 6 duels par jour.",
    description:
      "Un jeu quotidien d'enchères aveugles inspiré du Colonel Blotto : chaque jour, dix trésors à se partager, tu répartis secrètement cent pièces puis ta mise affronte six adversaires en duels 1v1. Le sixième duel oppose ta répartition à La Foule, et lire l'histogramme des mises de la veille rapporte réellement des points. Une mise par jour, révélation théâtrale, streak et grille de résultats partageable.",
    url: "",
    accent: "#d4af37",
    tags: ["quotidien","enchères","stratégie"],
    status: "wip",
  },
  {
    id: "ossuaire",
    title: "Ossuaire",
    tagline: "Un roguelike où le donjon se souvient de tes morts.",
    description:
      "Roguelike tour par tour en vue de dessus, tout en canvas 2D. Chaque personnage mort reste dans le donjon : la run suivante retrouve son cadavre, sa trace et le monstre qui l'a tué — qui porte désormais son équipement. Le donjon ne repart jamais de zéro, il s'alourdit de tes échecs.",
    url: "",
    accent: "#f0c674",
    tags: ["roguelike","donjon","tour par tour"],
    status: "wip",
  },
  {
    id: "perihelie",
    title: "Périhélie",
    tagline: "Bâtis ta station spatiale et garde tes colons en vie.",
    description:
      "City-builder / tycoon de station spatiale vue du dessus (canvas 2D). Tu poses tes modules — habitation, hydroponie, réacteur, laboratoire — et tu gères tes colons qui dorment, mangent et travaillent pour des crédits. Fournis énergie, oxygène, logement et nourriture, sinon leur santé s'effondre à l'écran.",
    url: "",
    accent: "#4fb0d4",
    tags: ["city-builder","spatial","gestion"],
    status: "wip",
  },
];

export function getGame(id: string): Game | undefined {
  return games.find((g) => g.id === id);
}
