import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function FolderTree({ folderStructure, currentPath, onClose }) {
  const navigate = useNavigate()
  const [expandedFolders, setExpandedFolders] = useState(() => {
    // 初始化时自动展开到当前路径
    const initialExpanded = new Set(['root'])
    if (currentPath) {
      const pathParts = currentPath.split('/')
      let currentKey = 'root'
      pathParts.forEach(part => {
        initialExpanded.add(currentKey)
        currentKey = `${currentKey}_${part}`
      })
    }
    return initialExpanded
  })

  const toggleFolder = (folderKey) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderKey)) {
      newExpanded.delete(folderKey)
    } else {
      newExpanded.add(folderKey)
    }
    setExpandedFolders(newExpanded)
  }

  const navigateToFolder = (folderPath) => {
    if (!folderPath || folderPath === '') {
      navigate('/')
    } else {
      navigate(`/${folderPath}`)
    }
    onClose()
  }

  const renderFolder = (folder, folderKey, level = 0) => {
    const isExpanded = expandedFolders.has(folderKey)
    const hasSubfolders = Object.keys(folder.folders || {}).length > 0
    const isCurrentFolder = folder.path === currentPath
    
    return (
      <div key={folderKey} className="select-none">
        <div 
          className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 rounded ${
            isCurrentFolder ? 'bg-blue-100 text-blue-800' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => navigateToFolder(folder.path)}
        >
          {hasSubfolders && (
            <button
              className="mr-1 p-1 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folderKey)
              }}
            >
              <span className={`inline-block transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}>
                ▶
              </span>
            </button>
          )}
          {!hasSubfolders && <span className="w-6"></span>}
          <span className="text-sm">
            📁 {folder.name}
            {folder.files && folder.files.length > 0 && (
              <span className="ml-1 text-xs text-gray-500">
                ({folder.files.length})
              </span>
            )}
          </span>
        </div>
        
        {hasSubfolders && isExpanded && (
          <div>
            {Object.entries(folder.folders).map(([subKey, subFolder]) =>
              renderFolder(subFolder, `${folderKey}_${subKey}`, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  if (!folderStructure || Object.keys(folderStructure).length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Loading folder structure...
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
      <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Folder Navigator</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="p-2">
        {Object.entries(folderStructure).map(([key, folder]) =>
          renderFolder(folder, key)
        )}
      </div>
    </div>
  )
}

export default FolderTree
