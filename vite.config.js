import react from '@vitejs/plugin-react';
import GenerateNotesPlugin from './vite.plugin.generate-notes.js';

export default {
  plugins: [
    react(),
    GenerateNotesPlugin()
  ]
};