import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'tslib'],
  },
  server: {
    hmr: {
      overlay: false, // Disables the red overlay so we can see the console errors better
    }
  }
});
