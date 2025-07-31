const fs = require('fs');
const path = require('path');

// 读取extractMnemonic函数
const extractMnemonicPath = path.join(__dirname, 'src', 'utils', 'extractMnemonic.js');
const extractMnemonicContent = fs.readFileSync(extractMnemonicPath, 'utf8');

// 简化版本，不依赖ES6模块
function findTriggerPosition(htmlContent) {
  const pattern = /<(h[3-4]|strong)[^>]*>.*?(?:口诀|记忆技巧|核心要义).*?<\/\1>/is;
  let match = htmlContent.match(pattern);
  
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
  let nearestQuote = null;
  let nearestDistance = Infinity;
  
  const quoteTypes = [
    { start: 34, end: 34 },
    { start: 8220, end: 8221 },
    { start: 12300, end: 12301 },
    { start: 65294, end: 65294 },
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
          }
          break;
        }
      }
    }
  }
  
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

  const triggerPosition = findTriggerPosition(htmlContent);
  if (triggerPosition === -1) return null;

  const remainingContent = htmlContent.substring(triggerPosition);
  const quotedContent = findFirstQuotedContentInText(remainingContent);
  
  if (!quotedContent) return null;

  const cleanContent = cleanHtmlTags(quotedContent);
  return cleanContent || null;
}

// 测试问题案例
const testFile = process.argv[2] || '/Users/dengjianyuan/work/projects/study/react/yuanbao-note-viewer/public/notes/note-20250725070237.html';

try {
  const content = fs.readFileSync(testFile, 'utf8');
  const result = extractMnemonic(content);
  
  console.log('测试文件:', testFile);
  console.log('提取结果:', result);
  
  // 检查是否提取到了正确的口诀
  if (result === '再审审限无独立，穿何程序走何路') {
    console.log('✅ 修复成功！提取到正确的口诀');
  } else if (result === '3+3个月') {
    console.log('❌ 仍有问题，提取了错误的内容');
  } else {
    console.log('⚠️ 提取到其他内容，需要检查');
  }
  
} catch (error) {
  console.error('测试失败:', error.message);
}
