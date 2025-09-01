import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractMnemonic } from "../utils/extractMnemonic.js";
import FolderTree from "./FolderTree.jsx";

function Sidebar({
  notes,
  selectNote,
  isSidebarOpen,
  selectedNote,
  setIsSidebarOpen,
  folderStructure,
  currentFolder,
  currentPath
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMnemonicMode, setIsMnemonicMode] = useState(true);
  const [showFolderTree, setShowFolderTree] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
  };

  const navigateToParent = () => {
    if (!currentPath) return;
    
    const pathParts = currentPath.split('/');
    if (pathParts.length > 1) {
      pathParts.pop(); // 移除最后一个文件夹
      const parentPath = pathParts.join('/');
      navigate(`/${parentPath}`);
    } else {
      // 返回根目录
      navigate(`/`);
    }
  };

  const renderBreadcrumb = () => {
    if (!currentPath) {
      return (
        <div className="mb-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
          📂 <span className="font-medium">根目录</span>
        </div>
      );
    }

    const pathParts = currentPath.split('/');
    const breadcrumbItems = [];
    
    // 添加根目录
    breadcrumbItems.push(
      <button
        key="root"
        onClick={() => navigate('/')}
        className="hover:text-blue-600 underline"
      >
        根目录
      </button>
    );

    // 添加路径中的每个部分
    let currentBreadcrumbPath = '';
    pathParts.forEach((part, index) => {
      currentBreadcrumbPath = currentBreadcrumbPath ? `${currentBreadcrumbPath}/${part}` : part;
      const isLast = index === pathParts.length - 1;
      
      breadcrumbItems.push(
        <span key={`separator-${index}`} className="text-gray-400 mx-1">/</span>
      );
      
      if (isLast) {
        breadcrumbItems.push(
          <span key={part} className="font-medium text-blue-600">{part}</span>
        );
      } else {
        const pathToNavigate = currentBreadcrumbPath;
        breadcrumbItems.push(
          <button
            key={part}
            onClick={() => navigate(`/${pathToNavigate}`)}
            className="hover:text-blue-600 underline"
          >
            {part}
          </button>
        );
      }
    });

    return (
      <div className="mb-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
        📂 {breadcrumbItems}
      </div>
    );
  };

  // Filter notes based on search query only (不根据口诀模式过滤)
  const filteredNotes = notes.filter((note) => {
    const title = note.title || "Untitled";
    const content = note.content || "";
    const query = searchQuery.toLowerCase();
    
    // 只根据搜索条件过滤，不管是否有口诀都显示
    return title.toLowerCase().includes(query) || content.toLowerCase().includes(query);
  });

  // 获取口诀内容的函数
  const getMnemonicContent = (note) => {
    if (!isMnemonicMode) return null;
    return extractMnemonic(note.content);
  };

  // 统计有口诀的笔记数量
  const mnemonicNotesCount = notes.filter(note => extractMnemonic(note.content)).length;

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
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Notes</h2>
            <div className="flex items-center space-x-1">
              {/* 返回上级按钮 */}
              {currentPath && (
                <button
                  onClick={navigateToParent}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="返回上级文件夹"
                >
                  ⬆️
                </button>
              )}
              {/* 文件夹树状图按钮 */}
              <button
                onClick={() => setShowFolderTree(!showFolderTree)}
                className="p-1 hover:bg-gray-200 rounded"
                title="文件夹导航"
              >
                📁
              </button>
            </div>
          </div>
          
          {/* 显示当前文件夹路径 */}
          {renderBreadcrumb()}
          
          {/* 文件夹树状图 */}
          {showFolderTree && (
            <div className="absolute top-16 left-0 right-0 z-20 mx-4">
              <FolderTree
                folderStructure={folderStructure}
                currentPath={currentPath}
                onClose={() => setShowFolderTree(false)}
              />
            </div>
          )}
          
          {/* 显示笔记统计信息 */}
          <div className="mt-1 text-xs text-gray-500">
            总共 {notes.length} 条笔记
            {isMnemonicMode && (
              <span> | 包含口诀: {mnemonicNotesCount} 条</span>
            )}
          </div>
          
          {/* 口诀模式切换按钮 */}
          <button
            onClick={() => setIsMnemonicMode(!isMnemonicMode)}
            className={`w-full mt-2 p-2 rounded-md text-sm font-medium transition-colors ${
              isMnemonicMode 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isMnemonicMode ? '🧠 口诀模式 (开启)' : '🧠 口诀模式 (关闭)'}
          </button>
          
          {/* Search input */}
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full mt-2 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ul className="overflow-y-auto h-[calc(100vh-200px)]">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => {
              const mnemonicContent = getMnemonicContent(note);
              return (
                <li
                  key={note.id}
                  className={`p-4 cursor-pointer hover:bg-gray-100 ${
                    selectedNote && selectedNote.id === note.id ? "bg-gray-200" : ""
                  }`}
                  onClick={() => selectNote(note)}
                >
                  <span className="text-sm">{note.title || "Untitled"}</span>
                  
                  {/* 显示口诀内容 */}
                  {mnemonicContent && (
                    <div className="mt-2 p-2 bg-yellow-50 border-l-3 border-yellow-400 rounded">
                      <p className="text-xs text-yellow-800 font-medium">
                        {mnemonicContent}
                      </p>
                    </div>
                  )}<p className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </li>
              );
            })
          ) : (
            <li className="p-4 text-sm text-gray-500">
              {isMnemonicMode ? "No notes with mnemonics found" : "No notes found"}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;