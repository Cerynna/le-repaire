import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA5qG1IMleHCsj2pUP3AXxAQ2LA7qY_qYo",
  authDomain: "le-repaire-e3652.firebaseapp.com",
  projectId: "le-repaire-e3652",
  storageBucket: "le-repaire-e3652.firebasestorage.app",
  messagingSenderId: "344489007641",
  appId: "1:344489007641:web:844a5aed843d181b8f6888",
  measurementId: "G-JJLDMWCQ13"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// En dev, on se branche sur l'émulateur Firestore (le module auth branche le
// sien de son côté, car il est chargé en différé). Ne touche jamais la prod.
// Lance les émulateurs avec : firebase emulators:start
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  } catch {
    // déjà branché (rechargement à chaud de Vite) — on ignore
  }
}
