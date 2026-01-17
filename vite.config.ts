import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This creates a global 'process' object in the browser so that
    // code calling process.env.API_KEY doesn't crash.
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY || ''),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    // Also shim individual values for maximum compatibility
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  }
});