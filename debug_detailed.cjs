const fs = require('fs');
const path = require('path');

// 简化版本的提取逻辑
function findTriggerPosition(htmlContent) {
  const pattern = /<(h[3-4])[^>]*>.*?(?:口诀|记忆技巧|核心要义).*?<\/\1>/is;
  let match = htmlContent.match(pattern);
  
  if (match) {
    console.log('找到 H3/H4 触发标签:', match[0].substring(0, 100) + '...');
    return match.index + match[0].length;
  }
  
  const strongPattern = /<strong[^>]*>.*?(?:口诀|记忆技巧|核心要义).*?<\/strong>/is;
  match = htmlContent.match(strongPattern);
  if (match) {
    console.log('找到 strong 触发标签:', match[0].substring(0, 100) + '...');
    return match.index + match[0].length;
  }
  
  console.log('未找到触发标签');
  return -1;
}

function findFirstQuotedContentInText(text) {
  console.log('\n=== 开始查找引号内容 ===');
  console.log('文本长度:', text.length);
  console.log('前500字符:', text.substring(0, 500));
  
  let nearestQuote = null;
  let nearestDistance = Infinity;
  
  const quoteTypes = [
    { name: '标准双引号', start: 34, end: 34 },
    { name: '智能引号', start: 8220, end: 8221 },
    { name: '中文双引号', start: 12300, end: 12301 },
    { name: '全角双引号', start: 65294, end: 65294 },
  ];
  
  for (const quoteType of quoteTypes) {
    let startIndex = -1;
    
    // 查找开始引号
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === quoteType.start) {
        startIndex = i;
        console.log(`找到 ${quoteType.name} 开始位置: ${startIndex}, 字符: "${text[i]}"`);
        break;
      }
    }
    
    // 如果找到开始引号，查找结束引号
    if (startIndex !== -1) {
      for (let i = startIndex + 1; i < text.length; i++) {
        if (text.charCodeAt(i) === quoteType.end) {
          const content = text.substring(startIndex + 1, i);
          console.log(`找到 ${quoteType.name} 结束位置: ${i}, 内容: "${content}"`);
          
          // 检查是否比当前最近的更近
          if (startIndex < nearestDistance) {
            nearestDistance = startIndex;
            nearestQuote = content;
            console.log(`更新最近引号: "${content}"`);
          }
          break;
        }
      }
    }
  }
  
  console.log('最终选择的引号内容:', nearestQuote);
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

function extractMnemonic(htmlContent) {
  if (!htmlContent) return null;

  console.log('开始提取口诀...');
  
  const triggerPosition = findTriggerPosition(htmlContent);
  if (triggerPosition === -1) return null;

  console.log('触发位置:', triggerPosition);
  
  const remainingContent = htmlContent.substring(triggerPosition);
  console.log('触发位置后内容长度:', remainingContent.length);
  
  const quotedContent = findFirstQuotedContentInText(remainingContent);
  
  if (!quotedContent) return null;

  const cleanContent = cleanHtmlTags(quotedContent);
  console.log('清理后的内容:', cleanContent);
  
  return cleanContent || null;
}

// 测试指定文件
const testFile = process.argv[2] || '/Users/dengjianyuan/work/projects/study/react/yuanbao-note-viewer/public/notes/note-20250723105115.html';

try {
  console.log('测试文件:', testFile);
  const content = fs.readFileSync(testFile, 'utf8');
  const result = extractMnemonic(content);
  
  console.log('\n=== 最终结果 ===');
  console.log('提取结果:', result);
  
} catch (error) {
  console.error('测试失败:', error.message);
}
