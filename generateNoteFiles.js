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

    // Step 3: Read and process note files
    const processedNotes = await Promise.all(
      noteFiles.map(async (file) => {
        const filePath = path.join(notesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        // Extract title from HTML content (assuming it's in a specific format)
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1] : file;
        // Extract date from filename
        const dateMatch = file.match(/note-(\d{14})/);
        const date = dateMatch ? dateMatch[1] : '';
        return {
          file,
          title,
          date,
          path: `/notes/${file}`
        };
      })
    );

    // Sort notes by date, newest first
    processedNotes.sort((a, b) => b.date.localeCompare(a.date));

    // Step 4: Generate JavaScript content
    const content = `export default ${JSON.stringify(processedNotes, null, 2)};\n`;

    // Step 5: Write to src/utils/noteFiles.js
    await fs.writeFile(outputFile, content);
    console.log(`Generated ${outputFile} with ${noteFiles.length} notes`);

    // Step 6: Write notes index for build
    const notesIndexPath = path.join(notesDir, 'index.json');
    await fs.writeFile(notesIndexPath, JSON.stringify(processedNotes, null, 2));
    console.log(`Generated ${notesIndexPath}`);
  } catch (error) {
    console.error("Error generating note files:", error);
    process.exit(1);
  }
}

generateNoteFiles();
