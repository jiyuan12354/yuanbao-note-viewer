import React, { useState } from "react";

function Sidebar({
  notes,
  selectNote,
  isSidebarOpen,
  selectedNote,
  setIsSidebarOpen,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    const title = note.title || "Untitled";
    const content = note.content || "";
    const query = searchQuery.toLowerCase();
    return (
      title.toLowerCase().includes(query) ||
      content.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      {/* Floating button */}
      <button
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-500 text-white rounded-full shadow-lg md:hidden"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? "Close" : "Open"}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform ${
          isSidebarOpen ? "translate-x-0 z-10" : "-translate-x-full"
        } md:translate-x-0 md:relative md:block`}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold">Notes</h2>
          {/* Search input */}
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full mt-2 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ul className="overflow-y-auto h-[calc(100vh-120px)]">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <li
                key={note.id}
                className={`p-4 cursor-pointer hover:bg-gray-100 ${
                  selectedNote && selectedNote.id === note.id ? "bg-gray-200" : ""
                }`}
                onClick={() => selectNote(note)}
              >
                <span className="text-sm">{note.title || "Untitled"}</span>
                <p className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </li>
            ))
          ) : (
            <li className="p-4 text-sm text-gray-500">No notes found</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;