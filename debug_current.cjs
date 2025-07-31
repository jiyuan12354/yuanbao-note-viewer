// 测试当前问题笔记的口诀提取
const fs = require('fs');

// 模拟当前的口诀提取逻辑
function extractMnemonic(htmlContent) {
  if (!htmlContent) return null;
  
  const triggerPosition = findTriggerPosition(htmlContent);
  if (triggerPosition === -1) return null;
  
  const afterTrigger = htmlContent.substring(triggerPosition);
  const quotedContent = findFirstQuotedContentInText(afterTrigger);
  if (!quotedContent) return null;
  
  return cleanHtmlTags(quotedContent);
}

function findTriggerPosition(htmlContent) {
  const h3Pattern = /<h3[^>]*>.*?(?:口诀|记忆技巧|核心要义).*?<\/h3>/is;
  let match = htmlContent.match(h3Pattern);
  if (match) {
    return match.index + match[0].length;
  }
  
  const h4Pattern = /<h4[^>]*>.*?(?:口诀|记忆技巧|核心要义).*?<\/h4>/is;
  match = htmlContent.match(h4Pattern);
  if (match) {
    return match.index + match[0].length;
  }
  
  const strongPattern = /<strong[^>]*>.*?(?:口诀|记忆技巧|核心要义).*?<\/strong>/is;
  match = htmlContent.match(strongPattern);
  if (match) {
    return match.index + match[0].length;
  }
  
  return -1;
}

function findFirstQuotedContentInText(text) {
  // 查找距离最近的引号对，不管类型
  let nearestQuote = null;
  let nearestDistance = Infinity;
  
  const quoteTypes = [
    { start: 34, end: 34, name: '标准双引号' },     
    { start: 8220, end: 8221, name: '智能引号' }, 
    { start: 12300, end: 12301, name: '中文引号' }, 
    { start: 65294, end: 65294, name: '全角引号' }, 
  ];
  
  for (const quoteType of quoteTypes) {
    let startIndex = -1;
    
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === quoteType.start) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex !== -1) {
      for (let i = startIndex + 1; i < text.length; i++) {
        if (text.charCodeAt(i) === quoteType.end) {
          if (startIndex < nearestDistance) {
            nearestDistance = startIndex;
            nearestQuote = text.substring(startIndex + 1, i);
            console.log(`找到 ${quoteType.name} 在位置 ${startIndex}: "${nearestQuote}"`);
          }
          break;
        }
      }
    }
  }
  
  console.log(`最终选择最近的引号内容: "${nearestQuote}"`);
  return nearestQuote;
}

function cleanHtmlTags(content) {
  if (!content) return '';
  
  let cleanText = content.replace(/<[^>]*>/g, '');
  cleanText = cleanText
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[\u200B\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleanText;
}

// 测试当前笔记
const noteContent = fs.readFileSync('./public/notes/note-20250725070237.html', 'utf-8');

console.log('分析当前笔记的口诀提取问题:');

const triggerPos = findTriggerPosition(noteContent);
console.log('触发位置:', triggerPos);

if (triggerPos !== -1) {
  const afterTrigger = noteContent.substring(triggerPos);
  console.log('触发位置后的内容（前300字符）:');
  console.log(afterTrigger.substring(0, 300));
  
  console.log('\n查找所有引号内容:');
  let pos = 0;
  let count = 0;
  while (pos < afterTrigger.length && count < 5) {
    let found = false;
    for (let i = pos; i < afterTrigger.length; i++) {
      const charCode = afterTrigger.charCodeAt(i);
      if (charCode === 8220) { // 左智能引号
        let endPos = -1;
        for (let j = i + 1; j < afterTrigger.length; j++) {
          if (afterTrigger.charCodeAt(j) === 8221) { // 右智能引号
            endPos = j;
            break;
          }
        }
        if (endPos !== -1) {
          const content = afterTrigger.substring(i + 1, endPos);
          console.log(`第${count + 1}个引号内容: "${content}"`);
          pos = endPos + 1;
          count++;
          found = true;
          break;
        }
      }
    }
    if (!found) break;
  }
  
  console.log('\n详细调试 findFirstQuotedContentInText:');
  const quoteTypes = [
    { start: 34, end: 34, name: '标准双引号' },
    { start: 8220, end: 8221, name: '智能引号' },
    { start: 12300, end: 12301, name: '中文引号' },
    { start: 65294, end: 65294, name: '全角引号' },
  ];
  
  for (const quoteType of quoteTypes) {
    console.log(`\n检查 ${quoteType.name}:`);
    let startIndex = -1;
    let endIndex = -1;
    
    for (let i = 0; i < afterTrigger.length; i++) {
      if (afterTrigger.charCodeAt(i) === quoteType.start) {
        startIndex = i;
        console.log(`找到开始引号位置: ${startIndex}`);
        break;
      }
    }
    
    if (startIndex !== -1) {
      for (let i = startIndex + 1; i < afterTrigger.length; i++) {
        if (afterTrigger.charCodeAt(i) === quoteType.end) {
          endIndex = i;
          console.log(`找到结束引号位置: ${endIndex}`);
          break;
        }
      }
      
      if (endIndex !== -1) {
        const content = afterTrigger.substring(startIndex + 1, endIndex);
        console.log(`提取的内容: "${content}"`);
        console.log(`这是第一个匹配，应该直接返回`);
        break;
      }
    }
  }
  
  const quotedContent = findFirstQuotedContentInText(afterTrigger);
  console.log('\n最终提取的内容:', quotedContent);
}

console.log('\n完整提取结果:', extractMnemonic(noteContent));
