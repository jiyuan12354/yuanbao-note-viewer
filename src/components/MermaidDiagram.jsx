import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MermaidDiagram = React.memo(({ chart, id }) => {
  const mermaidRef = useRef(null);

  useEffect(() => {
    // 初始化 Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: '"trebuchet ms", verdana, arial, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'linear'
      }
    });
  }, []);

  useEffect(() => {
    if (!chart || !mermaidRef.current) return;

    // 防止重复渲染的标记
    const container = mermaidRef.current;
    if (container.dataset.rendering === 'true') {
      return;
    }
    container.dataset.rendering = 'true';

    const renderDiagram = async () => {
      try {
        console.log('Rendering Mermaid chart:', chart);
        
        // 清空容器
        container.innerHTML = '';
        
        // 创建唯一的ID
        const diagramId = `mermaid-${id || Math.random().toString(36).substr(2, 9)}`;
        
        // 预处理图表内容，确保语法正确
        let processedChart = chart.trim();
        
        // 如果是 flowchart/graph 类型且是单行格式，需要添加适当的换行
        if ((processedChart.startsWith('graph ') || processedChart.startsWith('flowchart ')) && !processedChart.includes('\n')) {
          // 将单行图表代码转换为多行格式
          // 在每个箭头连接前添加换行
          processedChart = processedChart
            // 在每个新的节点定义前添加换行（除了第一个图表类型声明）
            .replace(/(graph\s+\w+|flowchart\s+\w+)\s+(.+)/, (match, graphDecl, content) => {
              // 处理连接部分，在每个箭头前添加换行
              const formattedContent = content
                .replace(/\s+([A-Z0-9]+(?:\[[^\]]+\]|\([^)]+\))?)\s+-->/g, '\n    $1 -->')
                .replace(/-->\s*\|([^|]+)\|\s*([A-Z0-9]+(?:\[[^\]]+\]|\([^)]+\))?)/g, '-->|$1| $2');
              
              return graphDecl + formattedContent;
            });
        }
        
        console.log('Processed chart:', processedChart);
        
        try {
          // 验证图表语法（新版本的mermaid.parse可能是同步的）
          await mermaid.parse(processedChart);
        } catch (parseError) {
          console.warn('Mermaid parse validation failed, but continuing with render:', parseError);
        }
        
        // 渲染图表
        const { svg } = await mermaid.render(diagramId, processedChart);
        
        console.log('Mermaid render successful, SVG length:', svg.length);
        
        // 插入SVG
        container.innerHTML = svg;
        
        // 添加调试信息
        console.log('Container after SVG insertion:', container);
        console.log('Container innerHTML length:', container.innerHTML.length);
        
        // 确保SVG响应式
        const svgElement = container.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.display = 'block';
          svgElement.style.visibility = 'visible';
          console.log('SVG element configured successfully');
          console.log('SVG dimensions:', {
            width: svgElement.getAttribute('width'),
            height: svgElement.getAttribute('height'),
            viewBox: svgElement.getAttribute('viewBox')
          });
        } else {
          console.error('SVG element not found after insertion');
        }
        
        // 渲染完成，移除标记
        container.dataset.rendering = 'false';
        
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        console.error('Original chart content:', chart);
        console.error('Processed chart content:', processedChart);
        
        // 渲染失败，移除标记
        container.dataset.rendering = 'false';
        
        container.innerHTML = `
          <div style="
            color: #d73a49; 
            background: #ffeef0; 
            border: 1px solid #fdaeb7; 
            border-radius: 6px; 
            padding: 16px; 
            margin: 10px 0;
            font-family: monospace;
          ">
            <strong>Diagram Error:</strong><br/>
            ${error.message}
            <details style="margin-top: 8px;">
              <summary>Show original diagram code</summary>
              <pre style="margin-top: 8px; white-space: pre-wrap;">${chart}</pre>
            </details>
            <details style="margin-top: 8px;">
              <summary>Show processed diagram code</summary>
              <pre style="margin-top: 8px; white-space: pre-wrap;">${processedChart || chart}</pre>
            </details>
          </div>
        `;
      }
    };

    renderDiagram();
  }, [chart, id]);

  return (
    <div 
      ref={mermaidRef} 
      className="mermaid-diagram"
      style={{ 
        textAlign: 'center',
        maxWidth: '100%',
        overflow: 'auto',
        margin: '20px 0',
        minHeight: '100px'
      }}
    />
  );
});

export default MermaidDiagram;
