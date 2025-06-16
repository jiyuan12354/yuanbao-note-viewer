(function () {
  function addSaveButtons() {
    const targetDivs = document.querySelectorAll('div.hyc-component-reasoner__text');
    targetDivs.forEach(div => {
      if (!div.parentNode.querySelector('.save-to-note-btn')) {
        const button = document.createElement('button');
        button.className = 'save-to-note-btn';
        button.textContent = 'Save to Note';
        button.onclick = () => saveAsHTML(div);
        div.insertAdjacentElement('afterend', button);
      }
    });
  }

  function saveAsHTML(div) {
    const content = div.innerHTML;
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const filename = `note-${timestamp}.html`;
    const htmlContent = `<div class="hyc-component-reasoner__text">${content}</div>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 初始插入
  addSaveButtons();

  // 监听 DOM 变化
  const observer = new MutationObserver(addSaveButtons);
  observer.observe(document.body, { childList: true, subtree: true });
})();