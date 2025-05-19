import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os"; // 用于获取用户目录

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateNoteFiles() {
  const downloadsDir = path.join(os.homedir(), "Downloads");
  const notesDir = path.join(__dirname, "public", "notes");
  const outputFile = path.join(__dirname, "src", "utils", "noteFiles.js");

  try {
    // Step 1: Move note-*.html files from ~/Downloads to public/notes
    const downloadFiles = await fs.readdir(downloadsDir);
    const noteFilesToMove = downloadFiles.filter((file) =>
      /^note-\d{14}\.html$/.test(file)
    );

    for (const file of noteFilesToMove) {
      const sourcePath = path.join(downloadsDir, file);
      const destPath = path.join(notesDir, file);
      await fs.rename(sourcePath, destPath);
    }

    // Step 2: Read all files in public/notes/
    const files = await fs.readdir(notesDir);
    const noteFiles = files.filter((file) => /^note-\d{14}\.html$/.test(file));

    // Step 3: Generate JavaScript content
    const content = `export const noteFiles = ${JSON.stringify(
      noteFiles,
      null,
      2
    )};\n`;

    // Step 4: Write to src/utils/noteFiles.js
    await fs.writeFile(outputFile, content);
    console.log(`Generated ${outputFile} with ${noteFiles.length} notes`);
  } catch (error) {
    console.error("Error generating note files:", error);
    process.exit(1);
  }
}

generateNoteFiles();
