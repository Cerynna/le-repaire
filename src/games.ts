import type { Game } from './types';

// Catalogue des jeux du Repaire (curaté depuis les dossiers de D:/Le Devs).
// EN AJOUTANT UN JEU : ajoute aussi son `id` a `isKnownGame()` dans
// firestore.rules (sinon notes/commentaires/bugs y seront refuses).
// Les jeux 'wip' (url vide) affichent un bouton "Bientot jouable".
export const games: Game[] = [
  {
    id: "catane",
    title: "Catane",
    tagline: "Le jeu de societe, en famille : sur un meme ecran ou chacun chez soi.",
    description:
      "Adaptation web du celebre jeu de societe, avec les regles completes du jeu de base : ressources, routes, colonies, villes, voleur, cartes developpement et ports. De 2 a 4 joueurs, sur un meme ecran ou en ligne via un code a 4 lettres synchronise en temps reel.",
    url: "https://catane-19b35.web.app",
    cover: "/covers/catane.jpg",
    accent: "#e8a33d",
    tags: ["societe","multijoueur","famille"],
    status: "live",
  },
  {
    id: "contrepoids",
    title: "Contrepoids",
    tagline: "Un 2048 où tu ne choisis pas le sens : tu poses le poids, le plateau penche.",
    description:
      "Un 2048 où l'on ne choisit jamais la direction : on pose la tuile, et c'est son poids qui fait pencher le plateau du côté où tout va glisser et fusionner. Les grosses tuiles tirent le point d'équilibre vers elles, ce qui dicte le prochain mouvement. Thème de poids de balance en laiton sur un plateau de bois.",
    url: "https://contrepoids-jeu.web.app",
    cover: "/covers/contrepoids.jpg",
    accent: "#e9c46a",
    tags: ["puzzle","2048","réflexion"],
    status: "live",
  },
  {
    id: "doublons",
    title: "Doublons",
    tagline: "Un coffre par ile, par ligne et par colonne, et jamais deux qui se touchent.",
    description:
      "Un casse-tete de pirates sur le principe du Star Battle. Place un coffre par ile, par ligne et par colonne, sans que deux coffres ne se touchent jamais, pas meme en diagonale. De la deduction pure sur une grille a resoudre.",
    url: "https://doublons-jeu.web.app",
    cover: "/covers/doublons.png",
    accent: "#e0a94e",
    tags: ["puzzle","logique","pirates"],
    status: "live",
  },
  {
    id: "elan",
    title: "Élan",
    tagline: "Accroche-toi, balance-toi, relâche au bon moment — un défi d'arcade par jour.",
    description:
      "Un jeu d'arcade réflexe à une seule touche : tu t'accroches au point le plus proche, tu tournes autour et tu relâches au bon moment pour te lancer sans sortir de l'écran. Chaque jour propose le même parcours pour tout le monde, avec un classement remis à zéro à minuit UTC et trois objectifs quotidiens. Tout se joue au timing du relâcher, qui déclenche des boosts et fait monter un combo multipliant le score.",
    url: "https://elan-jeu.web.app",
    cover: "/covers/elan.jpg",
    accent: "#ff9f1c",
    tags: ["arcade","une touche","défi quotidien"],
    status: "live",
  },
  {
    id: "emprise",
    title: "Emprise",
    tagline: "Capture, Accord, Somme, Cascade : un roguelite de cartes sur damier 3×3.",
    description:
      "Un jeu de capture sur damier 3×3 en roguelite : cinq cartes en main, neuf cases et une échelle de cinq adversaires, où une défaite met fin à la run. Le moteur de capture complet — capture simple, Accord, Somme, Cascade — s'appuie sur quarante et une cartes réparties en quatre familles (Réseau, Fusion, Vide, Culte), dans un univers d'espace profond et de dieux-machines. Entre deux duels, on retouche son deck de cinq cartes et on récupère deux cartes de butin par victoire.",
    url: "https://emprise-jeu.web.app",
    cover: "/covers/emprise.png",
    accent: "#9b7bff",
    tags: ["roguelite","cartes","tactique"],
    status: "live",
  },
  {
    id: "encre",
    title: "Encre",
    tagline: "Pose les gouttes, verse, et l'encre doit redessiner le modèle.",
    description:
      "Un casse-tête d'aquarelle à solution unique : on pose des gouttes d'encre rouge, bleue et jaune, puis on verse, et toutes s'étalent en même temps pour reproduire exactement le modèle. Deux couleurs qui se rejoignent forment un mélange qui cesse de s'étendre, et c'est l'indice principal pour déduire le bon placement. Niveaux infinis de plus en plus durs, avec un classement en ligne.",
    url: "https://encre-jeu.web.app",
    cover: "/covers/encre.jpg",
    accent: "#a855f7",
    tags: ["casse-tête","couleurs","classement"],
    status: "live",
  },
  {
    id: "facettes",
    title: "Facettes",
    tagline: "Colle des faces sur tes dés, sculpte tes probas et atteins la cible du jour.",
    description:
      "Un roguelite de dés quotidien façon deckbuilder : ton deck, ce sont les faces de tes 5 dés, que tu modifies entre les manches en collant de nouvelles faces pour sculpter tes propres probabilités. La résolution se fait de gauche à droite avec des effets de voisinage — recopies, re-déclenchements, conditions sur le dé d'à côté — dans une mise en scène très juicy inspirée de Balatro. Une run du jour à graine partagée, un mutateur quotidien tiré de la date et un classement complètent la boucle.",
    url: "https://facettes-jeu.web.app",
    cover: "/covers/facettes.png",
    accent: "#ff4fa0",
    tags: ["roguelite","dés","deckbuilder"],
    status: "live",
  },
  {
    id: "flux",
    title: "Flux",
    tagline: "Pioche, pose, fusionne : defends 5 voies contre des vagues sans fin.",
    description:
      "Flux est une lane-defense minimaliste et addictive qui tient en trois gestes : piocher une tour (draft roguelite), la poser sur une voie, et fusionner deux tours identiques pour monter en puissance. Des vagues geometriques neon deferlent sans fin pendant que les tours tirent automatiquement, avec vitesse reglable et leaderboard.",
    url: "https://flux-jeu.web.app",
    cover: "/covers/flux.png",
    accent: "#4c7cff",
    tags: ["tower-defense","roguelite","fusion"],
    status: "live",
  },
  {
    id: "le-casse",
    title: "Le Casse",
    tagline: "Chaque nuit, cambriolez la même maison ; le matin, démasquez les casses des autres.",
    description:
      "Jeu de déduction asynchrone quotidien : chaque nuit, tout le monde cambriole la même maison, en sachant exactement quelles traces chaque geste laisse. Le matin, on enquête sur les casses des autres pour retrouver par où ils sont entrés, sortis et quelles pièces ils ont traversées, pendant que Mme Michu, insomniaque, note tout dans son carnet. Chaque joueur fabrique ainsi le piège des autres.",
    url: "https://le-casse-jeu.web.app",
    cover: "/covers/le-casse.jpg",
    accent: "#ffc247",
    tags: ["déduction","enquête","quotidien"],
    status: "live",
  },
  {
    id: "mamie-bastonne",
    title: "Mamie Bastonne",
    tagline: "Demarcheurs, pigeons, influenceurs : personne ne passe.",
    description:
      "Mamie Ginette defend son lotissement contre des hordes de demarcheurs, de pigeons et d'influenceurs, a coups de sac a main, de dentier et de charentaises. Un survivor-like plein d'humour qui monte en puissance vague apres vague.",
    url: "https://mamie-bastonne.web.app",
    cover: "/covers/mamie-bastonne.webp",
    accent: "#ff5fa6",
    tags: ["survivor-like","action","humour"],
    status: "live",
  },
  {
    id: "orbite",
    title: "Orbite",
    tagline: "Roguelite circulaire : posez vos symboles, le curseur se bat seul.",
    description:
      "Orbite est un roguelite circulaire quotidien jouable dans le navigateur : vous posez des symboles sur un anneau de 12 cases qu'un curseur active a son passage, tandis que les ennemis convergent pour briser les cases. Pendant une vague la machine se bat seule ; toutes les decisions se prennent entre les vagues, ou l'adjacence est temporelle.",
    url: "https://orbite-jeu.web.app",
    cover: "/covers/orbite.png",
    accent: "#3df2ff",
    tags: ["roguelite","quotidien","strategie"],
    status: "live",
  },
  {
    id: "petanque-apocalypse",
    title: "Papy Grognon",
    tagline: "Papy Jacques défend son terrain de pétanque à coups de boules qui ricochent partout.",
    description:
      "Casse-briques roguelite façon Ball x Pit : en bas du terrain, Papy Jacques lance ses boules sur les hordes du lotissement qui descendent vers lui, et elles ricochent partout avant de revenir dans son cabas. À chaque niveau il gagne de nouvelles boules (enflammées, glacées, qui se divisent, qui fusionnent) jusqu'à saturer l'écran de ferraille. Arbre de talents, classement en ligne et appli installable jouable hors ligne.",
    url: "https://papy-grognon.web.app",
    cover: "/covers/petanque-apocalypse.png",
    accent: "#B57BFF",
    tags: ["casse-briques","roguelite","arcade"],
    status: "live",
  },
  {
    id: "petition",
    title: "Pétition",
    tagline: "Une feuille contre un nid-de-poule. Ça ne peut pas dégénérer.",
    description:
      "Un incrémental qui commence par une pétition de quartier contre le trou de la rue des Lilas et finit par faire signer l'univers observable. On recrute des bénévoles, on achète de l'encre, on fonde un ministère, puis on lâche un essaim d'émissaires en papier plié sur les galaxies. Cinq échelles, cinq habillages, et le trou rebouché au dernier écran.",
    url: "https://petition-jeu.web.app",
    cover: "/covers/petition.jpg",
    accent: "#8b6fd4",
    tags: ["incrémental","clicker","absurde"],
    status: "live",
  },
  {
    id: "profondeurs",
    title: "Profondeurs",
    tagline: "Un héros, dix étages, un Seigneur du Feu réveillé trop tôt.",
    description:
      "RPG rogue-lite au tour par tour. Un héros descend un donjon de dix étages pour affronter un Seigneur du Feu réveillé trop tôt. Tu meurs, tu gardes tout, et tu y retournes.",
    url: "https://profondeurs-jeu.web.app",
    cover: "/covers/profondeurs.png",
    accent: "#ff6a3d",
    tags: ["RPG","rogue-lite","tour par tour"],
    status: "live",
  },
  {
    id: "recidive",
    title: "Récidive",
    tagline: "Du placard de ton appart au cartel mondial — en passant par la case prison.",
    description:
      "Jeu de gestion en roguelite où tu bâtis ton empire, du premier plant caché dans un placard jusqu'au cartel mondial. La police rôde, les voisins reniflent, et la case prison n'est jamais bien loin. Gère ton temps, ton téléphone et ton carnet d'adresses pour prospérer sans te faire pincer.",
    url: "https://recidive-jeu.web.app",
    cover: "/covers/recidive.jpg",
    accent: "#4ade80",
    tags: ["gestion","roguelite","simulation"],
    status: "live",
  },
  {
    id: "retraite-active",
    title: "Retraite Active",
    tagline: "Mamie Ginette et sa bande de retraités tapent les hordes du quartier, clic après clic.",
    description:
      "Jeu de clic incrémental façon Clicker Heroes qui réunit Mamie Bastonne et Papy Grognon : Mamie Ginette tape les hordes du quartier à coups de sac à main. Avec les biscuits ramassés, elle recrute toute la bande des retraités, qui frappent tout seuls même jeu fermé, et part en cure à Vichy pour revenir plus forte. Version complète avec Club des Aînés, brocante, succès, histoire en dix chapitres, boss final et classement en ligne.",
    url: "https://retraite-active-jeu.web.app",
    cover: "/covers/retraite-active.png",
    accent: "#F4B740",
    tags: ["incrémental","clicker","idle"],
    status: "live",
  },
  {
    id: "trace",
    title: "Tracé",
    tagline: "Un puzzle par jour : relie tous les points par la boucle la plus courte.",
    description:
      "Chaque jour, la même grille de points pour tous les joueurs : trace la boucle fermée la plus courte qui les relie tous et mesure ton efficacité face à l'optimum mathématique exact, sans jamais voir la solution. Trois essais par difficulté, classements mondiaux anonymes, série de jours et une campagne qui remonte le temps depuis 1950. Application installable (PWA) en dix langues, jouable au clavier comme à la souris.",
    url: "https://trace-5e6d3.web.app",
    cover: "/covers/trace.png",
    accent: "#2dd4bf",
    tags: ["puzzle","quotidien","réflexion"],
    status: "live",
  },
  {
    id: "butin",
    title: "Butin",
    tagline: "100 pieces, 10 tresors, 6 duels : mise en secret et rafle le butin chaque jour.",
    description:
      "Jeu quotidien d'encheres aveugles inspire du Colonel Blotto. Chaque jour, repartis secretement 100 pieces entre 10 tresors, puis ta repartition affronte 6 adversaires en duels 1v1 ou la plus grosse mise rafle les points. Revelation theatrale, streak et grille de resultats partageable, dont un duel contre La Foule.",
    url: "",
    accent: "#f5c542",
    tags: ["quotidien","encheres","strategie"],
    status: "wip",
  },
  {
    id: "fouille",
    title: "Fouille",
    tagline: "Démineur-RPG dans la tombe du pharaon : abats les monstres, terrasse Toutankhanon.",
    description:
      "Un démineur-RPG inspiré de Dragonsweeper : archéologue stagiaire du Musée, tu explores la tombe du pharaon Toutankhanon où le chiffre d'une case donne la somme des niveaux des monstres voisins. Chaque combat coûte des PV égaux au niveau du monstre, et il faut monter de niveau au bon moment pour aller abattre le Pharaon de niveau 13 au centre. Fouille du jour à graine quotidienne, revanche, fouille libre et suivi de série.",
    url: "",
    accent: "#ffcc33",
    tags: ["démineur","RPG","déduction"],
    status: "wip",
  },
  {
    id: "frole",
    title: "Frôle",
    tagline: "Un serpent de lumière qui ne marque qu'en frôlant sa propre traînée sans la toucher.",
    description:
      "Jeu d'arcade sombre et néon : un serpent de lumière laisse une traînée mortelle, et on ne marque des points qu'en la frôlant au plus près sans jamais la toucher. Plus on passe près, plus ça rapporte, tandis que l'arène rétrécit et pousse le joueur contre sa propre trace. Une partie dure de 30 à 90 secondes, et un seul contact suffit pour tout recommencer.",
    url: "",
    accent: "#ff4de1",
    tags: ["arcade","néon","réflexes"],
    status: "wip",
  },
  {
    id: "aldoria",
    title: "Les Échos d'Aldoria",
    tagline: "Un jeu de rôle coop joué à la voix, avec une IA comme Maître du Jeu.",
    description:
      "Jeu de rôle coopératif heroic fantasy qui se joue à la voix, où une IA tient le rôle de Maître du Jeu pour un groupe de 3 à 5 joueurs réunis dans une salle vocale. Le frisson d'un raid de MMO et la liberté d'un jeu de rôle sur table, sans écran à fixer ni MJ à trouver : chaque héros n'a qu'une seule vie, et les tombés entrent au Panthéon. Projet en phase de cadrage, jouable pour l'instant en prototype texte sur un serveur local.",
    url: "",
    accent: "#f0b840",
    tags: ["JDR","coop","fantasy"],
    status: "wip",
  },
  {
    id: "octet",
    title: "Octet",
    tagline: "Un 2048 qui remonte l'histoire de l'informatique, de la carte perforée au quantique.",
    description:
      "Une variante de 2048 qui raconte l'histoire de l'informatique : fusionnez les cartes perforées jusqu'à l'ordinateur quantique, et au-delà. Chaque fusion fait progresser les technologies à travers les grandes étapes du calcul.",
    url: "",
    cover: "/covers/octet.png",
    accent: "#4ff08a",
    tags: ["puzzle","2048","informatique"],
    status: "wip",
  },
  {
    id: "ossuaire",
    title: "Ossuaire",
    tagline: "Un roguelike où le donjon se souvient de tes morts.",
    description:
      "Chaque personnage mort reste dans le donjon : la run suivante retrouve son cadavre et le monstre qui l'a tué, qui porte désormais son équipement. Combat déterministe au tour par tour en vue de dessus, sans aucun soin dans le monde — on ne récupère des PV qu'en fouillant ses propres morts. Le donjon ne repart jamais de zéro.",
    url: "",
    accent: "#f0c674",
    tags: ["roguelike","tour par tour","donjon"],
    status: "wip",
  },
  {
    id: "perihelie",
    title: "Périhélie",
    tagline: "Construis ta station spatiale et veille sur la vie de ses colons.",
    description:
      "City-builder / tycoon de station spatiale en vue du dessus. Tu bâtis la station et gères ses habitants : ils dorment en habitation, mangent à l'hydroponie et travaillent au laboratoire pour des crédits. Fournis-leur énergie, oxygène, logement et nourriture — le moindre manque se répercute aussitôt sur leur santé.",
    url: "",
    accent: "#4cc9f0",
    tags: ["city-builder","gestion","spatial"],
    status: "wip",
  },
  {
    id: "releve",
    title: "Relève",
    tagline: "Football Manager d'aventuriers : recrutez, envoyez au donjon, et regardez-les vieillir.",
    description:
      "Un Football Manager d'aventuriers : vous recrutez et équipez vos héros, les envoyez en donjon, et pendant qu'ils vieillissent, vous, vous restez. Jeu de gestion au style dark fantasy, clin d'oeil assumé à l'univers de World of Warcraft jusque dans le choix des polices. Encore en développement, jouable en local.",
    url: "",
    accent: "#D9534F",
    tags: ["gestion","dark fantasy","RPG"],
    status: "wip",
  },
];

export function getGame(id: string): Game | undefined {
  return games.find((g) => g.id === id);
}
