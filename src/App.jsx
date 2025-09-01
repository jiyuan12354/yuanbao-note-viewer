import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NotesPage from './pages/NotesPage.jsx'

function App() {
  return (
    <Router basename="/yuanbao-note-viewer">
      <Routes>
        {/* 默认路由 - 显示根目录下的notes */}
        <Route path="/" element={<NotesPage />} />
        {/* 通配符路由 - 处理所有子文件夹路径 */}
        <Route path="/*" element={<NotesPage />} />
      </Routes>
    </Router>
  )
}

export default App