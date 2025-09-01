// 扫描public/notes文件夹结构并生成路由配置的工具
export async function scanFolderStructure() {
  try {
    // 获取index.json文件，这里应该包含所有文件信息
    const basePath = import.meta.env.BASE_URL || '/'
    const response = await fetch(`${basePath}notes/index.json`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch index.json')
    }
    
    const data = await response.json()
    
    // 构建文件夹结构
    const folderStructure = {
      root: {
        path: '',
        name: 'All Notes',
        files: [],
        folders: {}
      }
    }
    
    data.forEach(note => {
      // 检查note是否有folder属性
      if (!note.folder || note.folder === '') {
        // 文件直接在notes目录下
        folderStructure.root.files.push(note)
      } else {
        // 文件在子文件夹中
        const folderParts = note.folder.split('/')
        let current = folderStructure.root.folders
        let currentPath = ''
        
        // 遍历路径构建嵌套结构
        for (let i = 0; i < folderParts.length; i++) {
          const folderName = folderParts[i]
          currentPath = currentPath ? `${currentPath}/${folderName}` : folderName
          
          if (!current[folderName]) {
            current[folderName] = {
              path: currentPath,
              name: folderName,
              files: [],
              folders: {}
            }
          }
          
          // 如果是最后一个文件夹，添加文件
          if (i === folderParts.length - 1) {
            current[folderName].files.push(note)
          } else {
            current = current[folderName].folders
          }
        }
      }
    })
    
    return folderStructure
  } catch (error) {
    console.error('Error scanning folder structure:', error)
    return { 
      root: { 
        path: '', 
        name: 'All Notes', 
        files: [], 
        folders: {} 
      } 
    }
  }
}

// 根据路径获取文件夹信息
export function getFolderByPath(folderStructure, path) {
  if (!path || path === '' || path === '/') {
    return folderStructure.root || { path: '', name: 'All Notes', files: [], folders: {} }
  }
  
  const pathParts = path.split('/').filter(part => part !== '')
  let current = folderStructure.root.folders
  
  for (let i = 0; i < pathParts.length; i++) {
    const folderName = pathParts[i]
    if (current[folderName]) {
      if (i === pathParts.length - 1) {
        // 返回目标文件夹
        return current[folderName]
      } else {
        // 继续遍历
        current = current[folderName].folders
      }
    } else {
      // 文件夹不存在
      return null
    }
  }
  
  return null
}
