import React from 'react'

function NoteContent({ note }) {
  if (!note) {
    return <div className="text-gray-500">Select a note to view</div>
  }

  return (
    <div className="bg-white p-6 rounded shadow h-full overflow-y-auto">
      <div
        className="note-content"
        style={{ maxWidth: '100%', boxSizing: 'border-box' }}
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
    </div>
  )
}

export default NoteContent