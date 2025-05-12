export function extractTitle(htmlContent) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  const h3 = doc.querySelector('h3')
  return h3 ? h3.textContent.trim() : 'Untitled'
}