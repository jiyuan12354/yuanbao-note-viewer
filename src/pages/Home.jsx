import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import NoteContent from "../components/NoteContent.jsx";
import { useNotes } from "../hooks/useNotes.js";

function Home() {
  const { notes, selectedNote, selectNote } = useNotes();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="yb-layout agent-layout layout-pc flex flex-row">
      <Sidebar
        notes={notes}
        selectNote={selectNote}
        selectedNote={selectedNote}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <NoteContent note={selectedNote} onClick={() => setIsSidebarOpen(false)} />
    </div>
  );
}

export default Home;