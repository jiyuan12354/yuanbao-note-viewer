const fs = require('fs');

// 简单测试脚本
const testFile = '/Users/dengjianyuan/work/projects/study/react/yuanbao-note-viewer/public/notes/note-20250723075406.html';
const content = fs.readFileSync(testFile, 'utf8');

console.log('查找所有包含"口诀"的标签:');

// 查找所有匹配项
const pattern = /<(h[3-4]|strong)[^>]*>.*?(?:口诀).*?<\/\1>/gis;
let match;
let index = 0;

while ((match = pattern.exec(content)) !== null) {
  index++;
  console.log(`第${index}个匹配:`);
  console.log('位置:', match.index);
  console.log('内容:', match[0]);
  console.log('结束位置:', match.index + match[0].length);
  console.log('---');
}

// 重置并查找"秒记口诀"
console.log('\n直接查找"秒记口诀":');
const triggerIndex = content.indexOf('秒记口诀');
console.log('秒记口诀位置:', triggerIndex);

if (triggerIndex !== -1) {
  // 找到h4标签的结束位置
  const h4End = content.indexOf('</h4>', triggerIndex);
  console.log('h4结束位置:', h4End);
  
  if (h4End !== -1) {
    const afterTrigger = content.substring(h4End + 5); // 跳过</h4>
    console.log('触发词后内容（前200字符）:');
    console.log(afterTrigger.substring(0, 200));
    
    // 查找智能引号
    const smartQuoteStart = afterTrigger.indexOf('"');
    const smartQuoteEnd = afterTrigger.indexOf('"', smartQuoteStart + 1);
    
    if (smartQuoteStart !== -1 && smartQuoteEnd !== -1) {
      const quotedContent = afterTrigger.substring(smartQuoteStart + 1, smartQuoteEnd);
      console.log('\n找到的引号内容:');
      console.log(quotedContent);
    }
  }
}
