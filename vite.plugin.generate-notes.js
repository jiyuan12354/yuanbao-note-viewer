import { execSync } from "child_process";

export default function GenerateNotesPlugin() {
  return {
    name: "generate-notes-on-server-start",
    configureServer(server) {
      console.log("GenerateNotesPlugin: configureServer called");
      try {
        execSync("node generateNoteFiles.js", { stdio: "inherit" });
      } catch (e) {}
    },
  };
}
