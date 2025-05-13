import React from 'react'
import Sidebar from '../components/Sidebar.jsx'
import NoteContent from '../components/NoteContent.jsx'
import { useNotes } from '../hooks/useNotes.js'

function Home() {
  const { notes, selectedNote, selectNote } = useNotes()

  return (
    <div className="flex h-screen">
      <Sidebar notes={notes} selectNote={selectNote} selectedNote={selectedNote} />
      <div className="flex-1 p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Yuanbao Notes</h1>
        <div className="flex-1">
          <NoteContent note={selectedNote} />
        </div>
      </div>
    </div>
  )
}

export default Home