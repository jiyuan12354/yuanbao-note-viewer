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

  function getComputedStyles(element) {
    const computedStyle = window.getComputedStyle(element);
    const styles = [
      'font-family',
      'font-size',
      'color',
      'line-height',
      'padding',
      'margin',
      'text-align',
      'font-weight',
      'font-style',
      'background-color',
      'border',
      'width',
      'white-space',
      'word-break',
      'display',
      'box-sizing'
    ].reduce((acc, prop) => {
      acc[prop] = computedStyle.getPropertyValue(prop);
      return acc;
    }, {});
    return styles;
  }

  function getAllStylesheets() {
    const stylesheets = Array.from(document.styleSheets)
      .filter(sheet => {
        try {
          return sheet.cssRules;
        } catch (e) {
          return false;
        }
      })
      .map(sheet => {
        return Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      })
      .join('\n');
    return stylesheets;
  }

  function saveAsHTML(div) {
    // Get content and styles
    const content = div.innerHTML;
    const styles = getComputedStyles(div);
    const globalStyles = getAllStylesheets();

    // Generate timestamp-based filename
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14); // YYYYMMDDHHMMSS
    const filename = `note-${timestamp}.html`;

    // Create HTML fragment
    const htmlContent = `
      <div class="hyc-component-reasoner__text" style="
        ${Object.entries(styles)
          .map(([key, value]) => `${key}: ${value};`)
          .join('\n')}
      ">
        ${content}
      </div>
      <style>
        ${globalStyles}
        .hyc-component-reasoner__text {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
        }
      </style>
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