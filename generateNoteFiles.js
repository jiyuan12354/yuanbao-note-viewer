import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os"; // 用于获取用户目录

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 递归扫描文件夹
async function scanNotesRecursively(dir, basePath = '/notes') {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const allNotes = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    const relativePath = `${basePath}/${file.name}`;

    if (file.isDirectory()) {
      // 递归扫描子文件夹
      const subNotes = await scanNotesRecursively(fullPath, relativePath);
      allNotes.push(...subNotes);
    } else if (file.isFile() && /^note-\d{14}\.html$/.test(file.name)) {
      // 处理note文件
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1] : file.name;
        const dateMatch = file.name.match(/note-(\d{14})/);
        const date = dateMatch ? dateMatch[1] : '';
        
        allNotes.push({
          file: file.name,
          title,
          date,
          path: relativePath,
          folder: basePath === '/notes' ? '' : basePath.replace('/notes/', '')
        });
      } catch (error) {
        console.error(`Error processing file ${fullPath}:`, error);
      }
    }
  }

  return allNotes;
}

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

    // Step 2: 递归扫描所有文件夹中的note文件
    const processedNotes = await scanNotesRecursively(notesDir);

    // Sort notes by date, newest first
    processedNotes.sort((a, b) => b.date.localeCompare(a.date));

    // Step 3: Generate JavaScript content
    const content = `export default ${JSON.stringify(processedNotes, null, 2)};\n`;

    // Step 4: Write to src/utils/noteFiles.js
    await fs.writeFile(outputFile, content);
    console.log(`Generated ${outputFile} with ${processedNotes.length} notes`);

    // Step 5: Write notes index for build
    const notesIndexPath = path.join(notesDir, 'index.json');
    await fs.writeFile(notesIndexPath, JSON.stringify(processedNotes, null, 2));
    console.log(`Generated ${notesIndexPath}`);
  } catch (error) {
    console.error("Error generating note files:", error);
    process.exit(1);
  }
}

generateNoteFiles();
