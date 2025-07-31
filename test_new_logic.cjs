const fs = require('fs');
const path = require('path');

// 查找触发词位置 - 使用优先级策略
function findTriggerPosition(htmlContent) {
  // 定义触发词的优先级（数字越小优先级越高）
  const triggerPatterns = [
    { pattern: /<(h[3-4]|strong)[^>]*>.*?(?:口诀).*?<\/\1>/gis, priority: 1, name: "口诀" },
    { pattern: /<(h[3-4]|strong)[^>]*>.*?(?:记忆技巧).*?<\/\1>/gis, priority: 2, name: "记忆技巧" },
    { pattern: /<(h[3-4]|strong)[^>]*>.*?(?:​记忆核心要义|记忆核心要义).*?<\/\1>/gis, priority: 3, name: "记忆核心要义" },
    { pattern: /<(h[3-4]|strong)[^>]*>.*?(?:核心要义).*?<\/\1>/gis, priority: 4, name: "核心要义" }
  ];
  
  let bestPosition = -1;
  let bestPriority = 999;
  let bestMatch = null;
  
  // 查找所有匹配项，选择优先级最高且后续内容有效的
  for (const { pattern, priority, name } of triggerPatterns) {
    let match;
    while ((match = pattern.exec(htmlContent)) !== null) {
      const position = match.index + match[0].length;
      const remainingContent = htmlContent.substring(position);
      
      // 检查后续内容是否包含有效的引号内容
      const hasValidQuote = checkForValidQuote(remainingContent);
      
      console.log(`找到 ${name} 触发词，位置: ${position}, 有效引号: ${hasValidQuote}`);
      
      if (hasValidQuote && priority < bestPriority) {
        bestPosition = position;
        bestPriority = priority;
        bestMatch = name;
        console.log(`更新最佳匹配: ${name}, 位置: ${position}`);
      }
    }
    // 重置正则表达式的lastIndex
    pattern.lastIndex = 0;
  }
  
  if (bestMatch) {
    console.log(`最终选择: ${bestMatch}, 位置: ${bestPosition}`);
  }
  
  return bestPosition;
}

// 检查文本中是否包含有效的引号内容（不是CSS类名等）
function checkForValidQuote(text) {
  const quotedContent = findFirstQuotedContentInText(text);
  if (!quotedContent) return false;
  
  console.log('检查引号内容:', quotedContent);
  
  // 先清理HTML标签再进行验证
  const cleanedContent = cleanHtmlTags(quotedContent);
  console.log('清理后内容:', cleanedContent);
  
  // 过滤掉CSS类名、HTML属性等明显不是口诀的内容
  const invalidPatterns = [
    /^[a-z-_]+(__[a-z-_]+)*$/i, // CSS类名模式
    /^[a-zA-Z0-9-_\/\.]+$/, // 文件路径、属性值等
    /^\d+(\.\d+)?%?$/, // 纯数字或百分比
    /^[<>\/=\s]+$/, // HTML标签内容
    /^[a-zA-Z\s]+$/ // 纯英文（通常不是中文口诀）
  ];
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(cleanedContent)) {
      console.log('匹配到无效模式:', pattern);
      return false;
    }
  }
  
  // 检查是否包含中文字符（口诀通常包含中文）
  const hasChinese = /[\u4e00-\u9fa5]/.test(cleanedContent);
  console.log('包含中文:', hasChinese, '长度:', cleanedContent.length);
  
  // 口诀应该至少4个字符且包含中文，且不能太长（避免整段文字）
  const isValid = hasChinese && cleanedContent.length >= 4 && cleanedContent.length < 200;
  console.log('验证结果:', isValid);
  
  return isValid;
}

function findFirstQuotedContentInText(text) {
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
    
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === quoteType.start) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex !== -1) {
      for (let i = startIndex + 1; i < text.length; i++) {
        if (text.charCodeAt(i) === quoteType.end) {
          const content = text.substring(startIndex + 1, i);
          
          if (startIndex < nearestDistance) {
            nearestDistance = startIndex;
            nearestQuote = content;
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

  console.log('开始提取口诀...');
  
  const triggerPosition = findTriggerPosition(htmlContent);
  if (triggerPosition === -1) return null;

  console.log('最终触发位置:', triggerPosition);
  
  const remainingContent = htmlContent.substring(triggerPosition);
  console.log('触发位置后内容长度:', remainingContent.length);
  
  const quotedContent = findFirstQuotedContentInText(remainingContent);
  
  if (!quotedContent) return null;

  const cleanContent = cleanHtmlTags(quotedContent);
  console.log('最终提取内容:', cleanContent);
  
  return cleanContent || null;
}

// 测试指定文件
const testFile = process.argv[2] || '/Users/dengjianyuan/work/projects/study/react/yuanbao-note-viewer/public/notes/note-20250723075406.html';

try {
  console.log('测试文件:', testFile);
  const content = fs.readFileSync(testFile, 'utf8');
  const result = extractMnemonic(content);
  
  console.log('\n=== 最终结果 ===');
  console.log('提取结果:', result);
  
} catch (error) {
  console.error('测试失败:', error.message);
}
