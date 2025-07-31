// 简单测试新的口诀提取逻辑
const fs = require('fs');

// 模拟extractMnemonic函数（不使用DOM）
function extractMnemonic(htmlContent) {
  if (!htmlContent) return null;
  
  // 步骤1: 先定位包含关键词的触发位置
  const triggerPosition = findTriggerPosition(htmlContent);
  if (triggerPosition === -1) return null;
  
  // 步骤2: 从触发位置切分，把后半部分当作纯文本处理
  const afterTrigger = htmlContent.substring(triggerPosition);
  
  // 步骤3: 在纯文本中找第一个双引号包围的内容
  const quotedContent = findFirstQuotedContentInText(afterTrigger);
  if (!quotedContent) return null;
  
  // 步骤4: 清理HTML标签，返回纯文本口诀
  return cleanHtmlTags(quotedContent);
}

function findTriggerPosition(htmlContent) {
  // 查找包含关键词的h3、h4或strong标签
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
  // 先找英文双引号
  let startIndex = text.indexOf('"');
  if (startIndex !== -1) {
    let endIndex = text.indexOf('"', startIndex + 1);
    if (endIndex !== -1) {
      return text.substring(startIndex + 1, endIndex);
    }
  }
  
  // 再找中文双引号
  startIndex = text.indexOf('"');
  if (startIndex !== -1) {
    let endIndex = text.indexOf('"', startIndex + 1);
    if (endIndex !== -1) {
      return text.substring(startIndex + 1, endIndex);
    }
  }
  
  return null;
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
const noteContent = fs.readFileSync('./public/notes/note-20250725082331.html', 'utf-8');
console.log('测试当前笔记:');
console.log('提取的口诀:', extractMnemonic(noteContent));

// 测试另一个笔记
try {
  const note2Content = fs.readFileSync('./public/notes/note-20250721015120.html', 'utf-8');
  console.log('\n测试另一个笔记:');
  console.log('提取的口诀:', extractMnemonic(note2Content));
} catch (e) {
  console.log('第二个笔记文件不存在');
}
