import React, { useEffect, useRef, useState } from "react";
import MermaidDiagram from "./MermaidDiagram.jsx";
import { cleanMermaidCode } from "../utils/mermaidHelper.js";

function NoteContent({ note, onClick }) {
  const [processedContent, setProcessedContent] = useState("");
  const [mermaidCharts, setMermaidCharts] = useState([]);

  useEffect(() => {
    if (!note || !note.content) {
      setProcessedContent("");
      setMermaidCharts([]);
      return;
    }

    // 解析HTML内容，提取Mermaid代码
    const parser = new DOMParser();
    const doc = parser.parseFromString(note.content, 'text/html');
    
    // 查找所有Mermaid代码块
    const mermaidCodeElements = doc.querySelectorAll('.language-mermaid');
    const charts = [];
    
    mermaidCodeElements.forEach((element, index) => {
      // 提取代码文本，去除HTML标签
      let mermaidCode = element.textContent || element.innerText;
      
      // 使用辅助函数清理代码
      mermaidCode = cleanMermaidCode(mermaidCode);

      if (mermaidCode) {
        const chartId = `mermaid-chart-${index}`;
        charts.push({
          id: chartId,
          code: mermaidCode
        });
        
        console.log(`Found Mermaid chart ${chartId}:`, mermaidCode);
        
        // 找到最外层的Mermaid容器并替换为占位符
        let container = element.closest('.hyc-common-markdown__code-mermaid');
        if (!container) {
          container = element.closest('pre');
        }
        
        if (container) {
          const placeholder = doc.createElement('div');
          placeholder.className = 'mermaid-placeholder';
          placeholder.setAttribute('data-chart-id', chartId);
          placeholder.style.cssText = 'min-height: 200px; text-align: center; padding: 20px; border: 1px solid #e1e5e9; border-radius: 6px; margin: 20px 0; background-color: #f6f8fa;';
          placeholder.innerHTML = `<div style="color: #666;">Loading diagram ${index + 1}...</div>`;
          container.parentNode.replaceChild(placeholder, container);
        }
      }
    });
    
    console.log(`Found ${charts.length} Mermaid charts in total`);
    
    // 只在图表数据真正变化时才更新状态
    setMermaidCharts(prevCharts => {
      const hasChanged = prevCharts.length !== charts.length || 
        prevCharts.some((chart, index) => 
          charts[index] && (chart.id !== charts[index].id || chart.code !== charts[index].code)
        );
      return hasChanged ? charts : prevCharts;
    });
    
    setProcessedContent(doc.body.innerHTML);
  }, [note]);

  const renderMermaidCharts = () => {
    return mermaidCharts.map((chart) => (
      <div key={chart.id} id={chart.id} style={{ margin: '20px 0' }}>
        <MermaidDiagram chart={chart.code} id={chart.id} />
      </div>
    ));
  };

  // 解析处理后的内容，插入Mermaid图表
  const renderContentWithMermaid = () => {
    if (!processedContent) {
      return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
    }

    // 如果没有Mermaid图表，直接渲染原始内容
    if (mermaidCharts.length === 0) {
      return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
    }

    // 创建一个临时DOM来解析内容
    const parser = new DOMParser();
    const doc = parser.parseFromString(processedContent, 'text/html');
    
    // 查找所有占位符并替换为React组件
    const placeholders = doc.querySelectorAll('.mermaid-placeholder');
    const elements = [];
    
    if (placeholders.length === 0) {
      // 如果没有占位符，在内容后面添加所有图表
      elements.push(
        <div key="main-content" dangerouslySetInnerHTML={{ __html: processedContent }} />
      );
      elements.push(...renderMermaidCharts());
    } else {
      // 将内容分割并插入图表
      let currentHTML = processedContent;
      
      mermaidCharts.forEach((chart, index) => {
        const placeholderRegex = new RegExp(
          `<div[^>]*class="[^"]*mermaid-placeholder[^"]*"[^>]*data-chart-id="${chart.id}"[^>]*>.*?</div>`,
          'g'
        );
        
        if (placeholderRegex.test(currentHTML)) {
          const parts = currentHTML.split(placeholderRegex);
          
          // 添加图表前的内容
          if (parts[0]) {
            elements.push(
              <div key={`content-before-${index}`} dangerouslySetInnerHTML={{ __html: parts[0] }} />
            );
          }
          
          // 添加Mermaid图表
          elements.push(
            <div key={chart.id} style={{ margin: '20px 0' }}>
              <MermaidDiagram chart={chart.code} id={chart.id} />
            </div>
          );
          
          // 更新剩余内容
          currentHTML = parts.slice(1).join('');
        }
      });
      
      // 添加剩余内容
      if (currentHTML) {
        elements.push(
          <div key="remaining-content" dangerouslySetInnerHTML={{ __html: currentHTML }} />
        );
      }
    }
    
    return elements;
  };

  if (!note) {
    return (
      <div className="text-gray-500" onClick={onClick}>
        Select a note to view
      </div>
    );
  }

  return (
    <div
      className="yb-layout__content agent-layout__content"
      onClick={onClick}
    >
      <div className="agent-dialogue">
        <div className="agent-dialogue__content-wrapper">
          <div className="agent-dialogue__content">
            <div className="agent-dialogue__content--common">
              <div
                className="agent-dialogue__content--common__content"
                id="chat-content"
              >
                <div className="agent-chat__list">
                  <div className="agent-chat__list__content-wrapper">
                    <div
                      className="agent-chat__list__content"
                      style={{ marginRight: "0px" }}
                    >
                      <div
                        className="agent-chat__list__item agent-chat__list__item--ai agent-chat__list__item--last p-0"
                        data-conv-idx="158"
                        data-conv-speaker="ai"
                        data-conv-speech-mode="0"
                        data-conv-sensitive="false"
                        data-conv-id="b5e1d739-7f95-4221-bc59-0c8cf5dda717_158"
                      >
                        <div className="agent-chat__list__item__content">
                          <div className="agent-chat__bubble agent-chat__bubble--ai">
                            <div className="agent-chat__bubble__content">
                              <div
                                className="agent-chat__conv--ai__speech_show"
                                data-conv-index="79"
                                data-speech-index="0"
                              >
                                <div className="hyc-component-reasoner">
                                  {renderContentWithMermaid()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="agent-chat__list__placeholder"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteContent;