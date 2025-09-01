export function extractTitle(htmlContent) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  const h3 = doc.querySelector('h3')
  
  if (!h3) return 'Untitled'
  
  let title = h3.textContent.trim()
  
  // 如下开头的字符可以从 title 中去掉
  const unwantedPrefixes = [
    '法考知识点解析：', // 中文冒号
    '法考知识点解析:', // 英文冒号
    '法考知识点解析', // 无冒号
    '核心知识点：', 
    '核心知识点:', 
    '总标题：', 
    '总标题:', 
    '考点'
  ]
  
  // 使用更鲁棒的方式去除前缀
  for (const prefix of unwantedPrefixes) {
    // 先清理可能的不可见字符，然后检查是否以该前缀开头
    const cleanTitle = title.replace(/^[\s\u200B\uFEFF\u00A0]+/, '') // 移除开头的各种空白字符
    if (cleanTitle.startsWith(prefix)) {
      title = cleanTitle.substring(prefix.length).trim()
      break // 找到一个匹配的前缀后就停止
    }
  }
  
  return title || 'Untitled'
}