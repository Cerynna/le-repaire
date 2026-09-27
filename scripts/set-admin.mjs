// Pose (ou retire) le claim custom `admin` sur un compte Firebase Auth.
// L'admin peut trier TOUS les bugs signalés et modérer les commentaires ;
// sans ce claim, un utilisateur ne voit que ses propres signalements.
//
// PRÉREQUIS
//   1. Tu t'es déjà connecté au moins une fois sur le site (ton compte existe).
//      → l'UID se trouve dans Console Firebase → Authentication → Users.
//   2. Une clé de service : Console → ⚙ Paramètres du projet → Comptes de
//      service → « Générer une nouvelle clé privée » (télécharge un .json).
//      ⚠️ NE LA COMMITE JAMAIS — elle est déjà couverte par .gitignore.
//
// USAGE (PowerShell)
//   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\chemin\vers\cle.json"
//   npm run set-admin -- <TON_UID>
// Pour retirer l'admin :
//   npm run set-admin -- <TON_UID> --off

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const uid = process.argv[2];
const remove = process.argv.includes('--off');

if (!uid || uid.startsWith('--')) {
  console.error('Usage : npm run set-admin -- <UID> [--off]');
  process.exit(1);
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    'Manque GOOGLE_APPLICATION_CREDENTIALS : pointe-le vers ta clé de service .json.\n' +
      'PowerShell : $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\chemin\\vers\\cle.json"',
  );
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });
const auth = getAuth();

// getUser échoue clairement si l'UID est faux ; on fusionne avec les claims
// existants pour ne pas en écraser d'éventuels autres.
const user = await auth.getUser(uid);
const claims = { ...(user.customClaims ?? {}) };
if (remove) delete claims.admin;
else claims.admin = true;
await auth.setCustomUserClaims(uid, claims);

console.log(`OK — ${user.email ?? uid} : admin ${remove ? 'RETIRÉ' : 'ACTIVÉ'}.`);
console.log('Déconnecte-toi puis reconnecte-toi pour rafraîchir ton token.');
process.exit(0);
