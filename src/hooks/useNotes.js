import { useState, useEffect } from 'react'
import { extractTitle } from '../utils/noteUtils.js'
import { noteFiles } from '../utils/noteFiles.js'
import sanitizeHtml from 'sanitize-html'

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
            const cleanContent = sanitizeHtml(content, {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                'h3', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'ol', 'ul', 'li', 'blockquote',
                'pre', 'code', 'span', 'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'polygon',
                'foreignObject', 'marker', 'defs', 'style'
              ]),
              allowedAttributes: {
                '*': ['class', 'id', 'style'],
                div: ['style', 'data-*'],
                pre: ['class'],
                code: ['class'],
                span: ['class'],
                svg: ['width', 'height', 'viewBox', 'xmlns', 'role', 'aria-roledescription', 'xmlns:xlink', 'xmlns:ev'],
                g: ['id', 'class', 'transform'],
                path: ['d', 'class', 'style', 'fill', 'stroke', 'stroke-width', 'marker-end'],
                rect: ['x', 'y', 'width', 'height', 'class', 'style', 'fill', 'stroke', 'rx', 'ry'],
                circle: ['cx', 'cy', 'r', 'class', 'style', 'fill', 'stroke'],
                foreignObject: ['width', 'height'],
                marker: ['id', 'class', 'viewBox', 'refX', 'refY', 'markerUnits', 'markerWidth', 'markerHeight', 'orient'],
                table: ['style'],
                th: ['style'],
                td: ['style'],
              },
              allowedSchemes: ['http', 'https', 'data'],
              allowedStyles: {
                '*': {
                  'font-family': [/^.*$/],
                  'font-size': [/^.*$/],
                  'color': [/^.*$/],
                  'line-height': [/^.*$/],
                  'padding': [/^.*$/],
                  'margin': [/^.*$/],
                  'text-align': [/^.*$/],
                  'font-weight': [/^.*$/],
                  'font-style': [/^.*$/],
                  'background-color': [/^.*$/],
                  'border': [/^.*$/],
                  'width': [/^.*$/],
                  'height': [/^.*$/],
                  'max-width': [/^.*$/],
                  'max-height': [/^.*$/],
                  'white-space': [/^.*$/],
                  'word-break': [/^.*$/],
                  'display': [/^.*$/],
                  'box-sizing': [/^.*$/],
                  'position': [/^.*$/],
                  'top': [/^.*$/],
                  'left': [/^.*$/],
                  'right': [/^.*$/],
                  'bottom': [/^.*$/],
                  'transform': [/^.*$/],
                  'stroke': [/^.*$/],
                  'stroke-width': [/^.*$/],
                  'stroke-dasharray': [/^.*$/],
                  'fill': [/^.*$/],
                  'overflow': [/^.*$/],
                },
              },
              transformTags: {
                style: () => ({ tagName: '', attribs: {}, text: '' }),
              },
            })
            const title = extractTitle(cleanContent)
            const timestamp = parseTimestamp(file)
            return {
              id: file,
              title,
              content: cleanContent,
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
    const cleanContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h3', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'ol', 'ul', 'li', 'blockquote']),
      allowedAttributes: {
        '*': ['class'],
        div: ['style'],
        table: ['style'],
        th: ['style'],
        td: ['style'],
      },
      allowedStyles: {
        '*': {
          'font-family': [/^.*$/],
          'font-size': [/^.*$/],
          'color': [/^.*$/],
          'line-height': [/^.*$/],
          'padding': [/^.*$/],
          'margin': [/^.*$/],
          'text-align': [/^.*$/],
          'font-weight': [/^.*$/],
          'font-style': [/^.*$/],
          'background-color': [/^.*$/],
          'border': [/^.*$/],
          'width': [/^.*$/],
          'white-space': [/^.*$/],
          'word-break': [/^.*$/],
          'display': [/^.*$/],
          'box-sizing': [/^.*$/],
        },
      },
      transformTags: {
        style: () => ({ tagName: '', attribs: {}, text: '' }),
      },
    })
    const title = extractTitle(cleanContent)
    const timestamp = parseTimestamp(filename) || Date.now()
    const newNote = {
      id: filename,
      title,
      content: cleanContent,
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
  // 文件名中的时间是UTC时间，需要转换为Asia/Shanghai时区显示
  const dateStr = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
  const utcDate = new Date(dateStr)
  
  // 转换为Asia/Shanghai时区
  const shanghaiDate = new Date(utcDate.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}))
  return shanghaiDate.getTime()
}