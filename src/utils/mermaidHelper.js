// 测试Mermaid代码提取的工具
export function testMermaidExtraction() {
  // 模拟真实的复杂HTML结构（基于用户提供的样本，包含<br>标签）
  const testHTML = `
    <code class="language-mermaid">
      <span class="hljs-selector-tag">graph</span> <span class="hljs-selector-tag">LR</span>  
      <span class="hljs-selector-tag">A</span><span class="hljs-selector-attr">[可能性]</span> <span class="hljs-comment">--&gt;|最低| D[高度可能性]&lt;br&gt;（50%+）</span>
      <span class="hljs-selector-tag">A</span> <span class="hljs-comment">--&gt;|中级| E[排除合理怀疑]&lt;br&gt;（90%+）</span>
      <span class="hljs-selector-tag">A</span> <span class="hljs-comment">--&gt;|最高| F[排除一切怀疑]&lt;br&gt;（100%）</span>
    </code>
  `;

  console.log('=== 开始测试 Mermaid 提取 (包含<br>标签) ===');
  console.log('测试HTML:', testHTML);
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(testHTML, 'text/html');
  const mermaidElement = doc.querySelector('.language-mermaid');
  
  if (mermaidElement) {
    console.log('找到 mermaid 元素，开始提取...');
    
    // 直接使用我们的cleanMermaidCode函数
    const mermaidCode = cleanMermaidCode(mermaidElement.innerHTML);
    
    console.log('=== 提取完成 ===');
    console.log('提取的 Mermaid 代码:');
    console.log(mermaidCode);
    console.log('预期结果应该是干净的 Mermaid 语法，无 HTML 标签，<br>应转换为换行');
    
    return mermaidCode;
  } else {
    console.log('未找到 mermaid 元素');
  }
  
  return null;
}

// 直接在浏览器控制台中可调用的测试函数
if (typeof window !== 'undefined') {
  window.testMermaidHelper = testMermaidExtraction;
  console.log('已注册全局测试函数: window.testMermaidHelper()');
}

// 清理Mermaid代码的函数
export function cleanMermaidCode(rawCode) {
  console.log('=== cleanMermaidCode 开始处理 ===');
  console.log('Raw Mermaid code input:', rawCode);
  console.log('Raw code type:', typeof rawCode);
  console.log('Raw code length:', rawCode?.length);
  
  if (!rawCode || typeof rawCode !== 'string') {
    console.log('Invalid input, returning empty string');
    return '';
  }
  
  let cleanCode = rawCode;
  
  // 如果代码包含HTML标签，先提取纯文本
  if (rawCode.includes('<') && rawCode.includes('>')) {
    console.log('检测到HTML标签，开始去除...');
    
    // 首先处理特殊的HTML实体，确保箭头语法正确
    let preprocessed = rawCode
      // 处理HTML实体
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // 将 <br> 标签转换为空格
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/&lt;br\s*\/?&gt;/gi, ' ');
    
    console.log('HTML实体处理后:', preprocessed);
    
    // 创建DOM元素来提取纯文本，这会自动去除所有HTML标签
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = preprocessed;
    cleanCode = tempDiv.textContent || tempDiv.innerText || '';
    console.log('HTML标签去除后:', cleanCode);
  }
  
  // 进一步清理和格式化
  const finalCode = cleanCode
    // 清理多余的空白字符
    .replace(/[ \t]+/g, ' ')  // 将多个空格/制表符替换为单个空格
    .replace(/\r\n/g, '\n')   // 统一换行符
    .replace(/\r/g, '\n')     // 统一换行符
    // 按行处理，修复语法
    .split('\n')
    .map(line => {
      let trimmedLine = line.trim();
      if (trimmedLine.length === 0) return null;
      
      console.log('处理行:', trimmedLine);
      
      // 特别处理序列图的箭头语法
      if (trimmedLine.includes('sequenceDiagram') || 
          trimmedLine.includes('->') || 
          trimmedLine.includes('--') ||
          trimmedLine.includes('loop') ||
          trimmedLine.includes('end')) {
        
        // 修复序列图的箭头语法
        trimmedLine = trimmedLine
          // 处理 ->>+ 语法
          .replace(/\s*-\s*>\s*>\s*\+/g, '->>+')
          // 处理 ->> 语法
          .replace(/\s*-\s*>\s*>/g, '->>')
          // 处理 -->> 语法
          .replace(/\s*-\s*-\s*>\s*>/g, '-->>');
        
        console.log('序列图语法修复后:', trimmedLine);
      }
      
      return trimmedLine;
    })
    .filter(line => line !== null && line.length > 0)
    .join('\n')
    .trim();
  
  console.log('最终清理后的 Mermaid 代码:');
  console.log(finalCode);
  console.log('最终代码长度:', finalCode.length);
  
  // 验证清理后的代码是否还包含HTML标签
  if (finalCode.includes('<') || finalCode.includes('>')) {
    console.warn('警告：清理后的代码仍包含HTML标签:', finalCode);
  }
  
  console.log('=== cleanMermaidCode 处理完成 ===');
  return finalCode;
}
