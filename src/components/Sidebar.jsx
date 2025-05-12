import React from 'react'

function Sidebar({ notes, selectNote, selectedNote }) {
  return (
    <div className="w-64 bg-white shadow-md h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Notes</h2>
      </div>
      <ul>
        {notes.map((note) => (
          <li
            key={note.id}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${
              selectedNote && selectedNote.id === note.id ? 'bg-gray-200' : ''
            }`}
            onClick={() => selectNote(note)}
          >
            <span className="text-sm">{note.title || 'Untitled'}</span>
            <p className="text-xs text-gray-500">
              {new Date(note.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar