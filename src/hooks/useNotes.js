import { useState, useEffect } from 'react'
import { extractTitle } from '../utils/noteUtils.js'
import { noteFiles } from '../utils/noteFiles.js'

export function useNotes() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)

  useEffect(() => {
    // Load notes from public/notes/
    const loadNotes = async () => {
      try {
        const loadedNotes = await Promise.all(
          noteFiles.map(async (file) => {
            const response = await fetch(`/notes/${file}`)
            const content = await response.text()
            const title = extractTitle(content)
            const timestamp = parseTimestamp(file)
            return {
              id: file,
              title,
              content,
              createdAt: timestamp,
            }
          })
        )

        // Sort notes by createdAt (descending)
        const sortedNotes = loadedNotes.sort(
          (a, b) => b.createdAt - a.createdAt
        )
        setNotes(sortedNotes)

        // Select the most recent note by default
        if (sortedNotes.length > 0) {
          setSelectedNote(sortedNotes[0])
        }
      } catch (error) {
        console.error('Error loading notes:', error)
      }
    }

    loadNotes()
  }, [])

  const selectNote = (note) => {
    setSelectedNote(note)
  }

  const addNote = (filename, content) => {
    const title = extractTitle(content)
    const timestamp = parseTimestamp(filename) || Date.now()
    const newNote = {
      id: filename,
      title,
      content,
      createdAt: timestamp,
    }
    setNotes((prevNotes) => {
      const updatedNotes = [newNote, ...prevNotes].sort(
        (a, b) => b.createdAt - a.createdAt
      )
      setSelectedNote(newNote)
      return updatedNotes
    })
  }

  return { notes, selectedNote, selectNote, addNote }
}

// Parse timestamp from filename (e.g., note-20250512123045.html)
function parseTimestamp(filename) {
  const match = filename.match(/note-(\d{14})\.html/)
  if (!match) return Date.now()
  const [year, month, day, hour, minute, second] = [
    match[1].slice(0, 4),
    match[1].slice(4, 6),
    match[1].slice(6, 8),
    match[1].slice(8, 10),
    match[1].slice(10, 12),
    match[1].slice(12, 14),
  ]
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`).getTime()
}