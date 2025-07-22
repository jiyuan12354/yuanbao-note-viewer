// 解析HTML内容并提取Mermaid图表代码
export const extractMermaidFromHTML = (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // 查找所有包含mermaid代码的元素
  const mermaidElements = doc.querySelectorAll('.language-mermaid, code.language-mermaid');
  
  const mermaidCharts = [];
  
  mermaidElements.forEach((element, index) => {
    let mermaidCode = element.textContent || element.innerText;
    
    // 清理代码，移除多余的空白和HTML实体
    mermaidCode = mermaidCode
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .trim();
    
    if (mermaidCode) {
      mermaidCharts.push({
        id: `chart-${index}`,
        code: mermaidCode,
        element: element
      });
    }
  });
  
  return mermaidCharts;
};

// 替换HTML中的Mermaid代码块为占位符
export const replaceMermaidWithPlaceholders = (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // 查找所有包含mermaid代码的父容器
  const mermaidContainers = doc.querySelectorAll(
    '.hyc-common-markdown__code-mermaid, .hyc-common-markdown__code.hyc-common-markdown__code-mermaid'
  );
  
  mermaidContainers.forEach((container, index) => {
    // 创建占位符
    const placeholder = doc.createElement('div');
    placeholder.className = 'mermaid-placeholder';
    placeholder.setAttribute('data-chart-id', `chart-${index}`);
    placeholder.style.cssText = 'min-height: 200px; text-align: center; padding: 20px;';
    placeholder.innerHTML = '<div>Loading diagram...</div>';
    
    // 替换原始容器
    container.parentNode.replaceChild(placeholder, container);
  });
  
  return doc.documentElement.outerHTML;
};

// 清理HTML内容，保持基本结构但移除复杂的Mermaid容器
export const cleanHTMLContent = (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // 移除所有带有data-click等属性的元素（这些是交互按钮）
  const interactiveElements = doc.querySelectorAll('[dt-click], [dt-ext1], [dt-exposure]');
  interactiveElements.forEach(el => el.remove());
  
  // 简化mermaid容器结构
  const mermaidContainers = doc.querySelectorAll('.hyc-common-markdown__code-mermaid');
  mermaidContainers.forEach((container, index) => {
    // 查找代码块
    const codeElement = container.querySelector('.language-mermaid');
    if (codeElement) {
      const mermaidCode = codeElement.textContent || codeElement.innerText;
      
      // 创建简化的容器
      const newContainer = doc.createElement('div');
      newContainer.className = 'mermaid-container';
      newContainer.setAttribute('data-chart-id', `chart-${index}`);
      newContainer.setAttribute('data-mermaid-code', mermaidCode.trim());
      
      // 替换原始容器
      container.parentNode.replaceChild(newContainer, container);
    }
  });
  
  return doc.body.innerHTML;
};
