import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import NoteContent from "../components/NoteContent.jsx";
import { useNotesWithFolders } from "../hooks/useNotesWithFolders.js";

function NotesPage() {
  const { 
    notes, 
    selectedNote, 
    selectNote, 
    folderStructure, 
    currentFolder, 
    isLoading,
    currentPath
  } = useNotesWithFolders();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="yb-layout agent-layout layout-pc flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  // Debug info - 可以在开发时启用
  const showDebug = false;
  
  if (showDebug) {
    return (
      <div style={{ padding: '20px', background: 'white', fontFamily: 'monospace' }}>
        <h2>Debug Info</h2>
        <p><strong>Current Path:</strong> {currentPath || 'root'}</p>
        <p><strong>Notes Count:</strong> {notes.length}</p>
        <p><strong>Current Folder:</strong> {currentFolder ? currentFolder.name : 'none'}</p>
        <p><strong>Folder Structure:</strong></p>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '300px' }}>
          {JSON.stringify(folderStructure, null, 2)}
        </pre>
        <p><strong>Notes:</strong></p>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(notes.map(n => ({ id: n.id, title: n.title, folder: n.folder })), null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="yb-layout agent-layout layout-pc flex flex-row">
      <Sidebar
        notes={notes}
        selectNote={selectNote}
        selectedNote={selectedNote}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        folderStructure={folderStructure}
        currentFolder={currentFolder}
        currentPath={currentPath}
      />
      <NoteContent note={selectedNote} onClick={() => setIsSidebarOpen(false)} />
    </div>
  );
}

export default NotesPage;
