import { execSync } from "child_process";

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function GenerateNotesPlugin() {
  return {
    name: "generate-notes-plugin",
    configureServer(server) {
      console.log("GenerateNotesPlugin: configureServer called");
      try {
        execSync("node generateNoteFiles.js", { stdio: "inherit" });
      } catch (e) {}
    },
    buildStart() {
      console.log("GenerateNotesPlugin: buildStart called");
      try {
        execSync("node generateNoteFiles.js", { stdio: "inherit" });
      } catch (e) {}
    },
    async generateBundle(options, bundle) {
      console.log("GenerateNotesPlugin: Copy notes to dist");
      
      // 读取并复制所有笔记文件
      const notesDir = path.join(__dirname, "public", "notes");
      const files = fs.readdirSync(notesDir);
      const noteFiles = files.filter(file => /^note-\d{14}\.html$/.test(file));

      for (const file of noteFiles) {
        const content = fs.readFileSync(path.join(notesDir, file), 'utf-8');
        this.emitFile({
          type: 'asset',
          fileName: `notes/${file}`,
          source: content
        });
      }

      // 复制索引文件
      const indexContent = fs.readFileSync(path.join(notesDir, 'index.json'), 'utf-8');
      this.emitFile({
        type: 'asset',
        fileName: 'notes/index.json',
        source: indexContent
      });
    }
  };
}
