// 测试Mermaid代码提取的工具
export function testMermaidExtraction() {
  // 模拟note-20250721102718.html中的Mermaid代码
  const testHTML = `
    <code class="language-mermaid">
      <span class="hljs-selector-tag">graph</span> <span class="hljs-selector-tag">LR</span>
      <span class="hljs-selector-tag">A</span><span class="hljs-selector-attr">[一审判决]</span> <span class="hljs-selector-tag">--</span>&gt;|<span class="hljs-number">10</span>日内| <span class="hljs-selector-tag">B</span>(上诉期内)
      <span class="hljs-selector-tag">B</span> <span class="hljs-selector-tag">--</span>&gt; <span class="hljs-selector-tag">C1</span><span class="hljs-selector-attr">[自由撤回→一审生效]</span>
      <span class="hljs-selector-tag">B</span> <span class="hljs-selector-tag">--</span>&gt; <span class="hljs-selector-tag">C2</span><span class="hljs-selector-attr">[不撤回→进入二审]</span>
      <span class="hljs-selector-tag">A</span> <span class="hljs-selector-tag">--</span>&gt;|<span class="hljs-number">10</span>日后| <span class="hljs-selector-tag">D</span>(上诉期满)
      <span class="hljs-selector-tag">D</span> <span class="hljs-selector-tag">--</span>&gt; <span class="hljs-selector-tag">E1</span><span class="hljs-selector-attr">[无上诉→一审生效]</span>
      <span class="hljs-selector-tag">D</span> <span class="hljs-selector-tag">--</span>&gt; <span class="hljs-selector-tag">E2</span><span class="hljs-selector-attr">[补交上诉→法院审查]</span>
    </code>
  `;

  const parser = new DOMParser();
  const doc = parser.parseFromString(testHTML, 'text/html');
  const mermaidElement = doc.querySelector('.language-mermaid');
  
  if (mermaidElement) {
    let mermaidCode = mermaidElement.textContent || mermaidElement.innerText;
    mermaidCode = mermaidCode
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .trim();
    
    console.log('Extracted Mermaid code:');
    console.log(mermaidCode);
    return mermaidCode;
  }
  
  return null;
}

// 清理Mermaid代码的函数
export function cleanMermaidCode(rawCode) {
  console.log('Raw Mermaid code input:', rawCode);
  
  // 如果代码包含HTML标签，先提取纯文本
  let cleanCode = rawCode;
  
  // 如果包含HTML标签，创建DOM元素来提取纯文本
  if (rawCode.includes('<') && rawCode.includes('>')) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawCode;
    cleanCode = tempDiv.textContent || tempDiv.innerText || '';
    console.log('After HTML tag removal:', cleanCode);
  }
  
  const finalCode = cleanCode
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')  // 只替换空格和制表符，保留换行符
    .trim()
    .split('\n')  // 按行分割
    .map(line => line.trim())  // 清理每行的空白
    .filter(line => line.length > 0)  // 过滤空行
    .join('\n');  // 重新组合
  
  console.log('Final cleaned Mermaid code:', finalCode);
  return finalCode;
}
