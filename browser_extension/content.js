(function () {
  // Check for target elements
  const checkElement = setInterval(() => {
    const targetDivs = document.querySelectorAll('div.hyc-component-reasoner__text');
    if (targetDivs.length > 0) {
      clearInterval(checkElement);
      targetDivs.forEach(div => {
        // Avoid adding duplicate buttons
        if (!div.parentNode.querySelector('.save-to-note-btn')) {
          const button = document.createElement('button');
          button.className = 'save-to-note-btn';
          button.textContent = 'Save to Note';
          button.onclick = () => saveAsHTML(div);
          div.insertAdjacentElement('afterend', button); // 添加为兄弟节点
        }
      });
    }
  }, 500);

  function saveAsHTML(div) {
    // Get content and styles
    const content = div.innerHTML;

    // Generate timestamp-based filename
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14); // YYYYMMDDHHMMSS
    const filename = `note-${timestamp}.html`;

    // Create HTML fragment
    const htmlContent = `
      <div class="hyc-component-reasoner__text">
        ${content}
      </div>
    `;

    // Download HTML file
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
})();