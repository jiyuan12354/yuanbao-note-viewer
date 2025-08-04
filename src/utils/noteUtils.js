export function extractTitle(htmlContent) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  const h3 = doc.querySelector('h3')
  // 如下开头的字符可以从 title 中去掉
  const unwantedPrefixes = ['法考知识点解析：', '核心知识点：', '总标题：', '考点']
  // 匹配前缀，忽略前后空白和零宽字符
  const unwantedRegex = new RegExp(`^[\\s\\u200B\\uFEFF]*(${unwantedPrefixes.map(p => p.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1')).join('|')})`)
  if (h3 && unwantedRegex.test(h3.textContent)) {
    h3.textContent = h3.textContent.replace(unwantedRegex, '')
  }
  return h3 ? h3.textContent.trim() : 'Untitled'
}