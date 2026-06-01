import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        work: resolve(__dirname, 'work.html'),
        services: resolve(__dirname, 'services.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        contact: resolve(__dirname, 'contact.html'),
        notfound: resolve(__dirname, '404.html')
      }
    }
  }
});
