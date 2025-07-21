// 口诀提取工具函数
export function extractMnemonic(htmlContent) {
  if (!htmlContent) return null;
  
  // 创建一个临时的DOM元素来解析HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // 查找所有的strong和h4标签
  const targetTags = tempDiv.querySelectorAll('strong, h4');
  
  // 遍历标签，找到包含"口诀"二字的
  for (let i = 0; i < targetTags.length; i++) {
    const targetTag = targetTags[i];
    const text = targetTag.textContent || targetTag.innerText || '';
    
    // 如果包含"口诀"二字
    if (text.includes('口诀') || text.includes('记忆技巧​')) {
      // 查找后面最接近的strong标签
      let nextStrong = null;
      
      // 从当前标签开始往后找
      let currentElement = targetTag;
      while (currentElement) {
        currentElement = currentElement.nextElementSibling;
        if (currentElement && currentElement.tagName === 'STRONG') {
          nextStrong = currentElement;
          break;
        }
        // 如果当前元素有子元素，也要检查
        if (currentElement) {
          const childStrong = currentElement.querySelector('strong');
          if (childStrong) {
            nextStrong = childStrong;
            break;
          }
        }
      }
      
      // 如果没有找到后续的strong标签，检查父级元素的后续兄弟元素
      if (!nextStrong) {
        let parentElement = targetTag.parentElement;
        while (parentElement && parentElement !== tempDiv) {
          let sibling = parentElement.nextElementSibling;
          while (sibling) {
            const siblingStrong = sibling.querySelector('strong');
            if (siblingStrong) {
              nextStrong = siblingStrong;
              break;
            }
            sibling = sibling.nextElementSibling;
          }
          if (nextStrong) break;
          parentElement = parentElement.parentElement;
        }
      }
      
      if (nextStrong) {
        const mnemonicText = nextStrong.textContent || nextStrong.innerText || '';
        return mnemonicText.trim();
      }
    }
  }
  
  return null;
}
