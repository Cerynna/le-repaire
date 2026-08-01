import { defineConfig } from 'vite';

// Le hub est une SPA : le fallback vers index.html est géré par Firebase Hosting
// (rewrites) en prod, et par Vite en dev via son historyApiFallback intégré.
export default defineConfig({
  build: {
    outDir: 'dist',
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          // firebase/app + firestore = chunk vendor stable (bon cache entre
          // déploiements). firebase/auth n'est PAS listé : il se retrouve dans
          // le chunk async créé par l'import dynamique de ./auth/auth.
          firebase: ['firebase/app', 'firebase/firestore'],
        },
      },
    },
  },
});
