import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

const MermaidDiagram = React.memo(({ chart, id }) => {
  const mermaidRef = useRef(null);

  // 转义特殊字符的函数
  const escapeSpecialChars = (text) => {
    if (!text) return text;

    return (
      text
        // 转义双引号
        .replace(/"/g, "&quot;")
        // 转义单引号（在某些上下文中可能有问题）
        .replace(/'/g, "&#39;")
        // 转义反斜杠
        .replace(/\\/g, "\\\\")
        // 转义其他可能影响 Mermaid 语法的字符
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // 转义换行符（在节点标签中可能有问题）
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
    );
  };

  useEffect(() => {
    // 初始化 Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      fontFamily: '"trebuchet ms", verdana, arial, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "linear",
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        useMaxWidth: true,
        rightAngles: false,
        showSequenceNumbers: false,
        actorFontSize: 14,
        actorFontFamily: '"trebuchet ms", verdana, arial, sans-serif',
        noteFontSize: 12,
        noteFontFamily: '"trebuchet ms", verdana, arial, sans-serif',
        messageFontSize: 12,
        messageFontFamily: '"trebuchet ms", verdana, arial, sans-serif',
      },
    });
  }, []);

  useEffect(() => {
    if (!chart || !mermaidRef.current) return;

    // 防止重复渲染的标记
    const container = mermaidRef.current;
    if (container.dataset.rendering === "true") {
      return;
    }
    container.dataset.rendering = "true";

    const renderDiagram = async () => {
      try {
        console.log("Rendering Mermaid chart:", chart);

        // 清空容器
        container.innerHTML = "";

        // 创建唯一的ID
        const diagramId = `mermaid-${
          id || Math.random().toString(36).substr(2, 9)
        }`;

        // 预处理图表内容，确保语法正确
        let processedChart = chart.trim();

        // 如果是序列图，进行特殊处理
        if (processedChart.startsWith("sequenceDiagram")) {
          console.log("Processing sequence diagram");

          // 对序列图进行行处理，确保每行语法正确
          const lines = processedChart
            .split("\n")
            .map((line) => {
              let cleanLine = line.trim();
              if (!cleanLine) return "";

              // 清理可能存在的HTML实体
              cleanLine = cleanLine
                .replace(/&gt;/g, ">")
                .replace(/&lt;/g, "<")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");

              // 确保箭头语法正确
              cleanLine = cleanLine
                .replace(/\s*-\s*>\s*>\s*\+/g, "->>+")
                .replace(/\s*-\s*>\s*>/g, "->>")
                .replace(/\s*-\s*-\s*>\s*>/g, "-->>");

              return cleanLine;
            })
            .filter((line) => line.length > 0);

          processedChart = lines.join("\n");
          console.log("Processed sequence diagram:", processedChart);
        } else {
          // 对其他类型的图表进行通用处理
          processedChart = processedChart.replace(
            /(\[)([^\]]*?)(\])/g,
            (match, leftBracket, content, rightBracket) => {
              return leftBracket + escapeSpecialChars(content) + rightBracket;
            }
          );

          // 处理圆形节点 (内容)
          processedChart = processedChart.replace(
            /(\()([^)]*?)(\))/g,
            (match, leftParen, content, rightParen) => {
              return leftParen + escapeSpecialChars(content) + rightParen;
            }
          );

          // 处理连接线上的标签 |标签|
          processedChart = processedChart.replace(
            /(\|)([^|]*?)(\|)/g,
            (match, leftPipe, content, rightPipe) => {
              return leftPipe + escapeSpecialChars(content) + rightPipe;
            }
          );
        }

        // 如果是 flowchart/graph 类型且是单行格式，需要添加适当的换行
        if (
          (processedChart.startsWith("graph ") ||
            processedChart.startsWith("flowchart ")) &&
          !processedChart.includes("\n")
        ) {
          // 将单行图表代码转换为多行格式
          // 在每个箭头连接前添加换行
          processedChart = processedChart
            // 在每个新的节点定义前添加换行（除了第一个图表类型声明）
            .replace(
              /(graph\s+\w+|flowchart\s+\w+)\s+(.+)/,
              (match, graphDecl, content) => {
                // 处理连接部分，在每个箭头前添加换行
                const formattedContent = content
                  .replace(
                    /\s+([A-Z0-9]+(?:\[[^\]]+\]|\([^)]+\))?)\s+-->/g,
                    "\n    $1 -->"
                  )
                  .replace(
                    /-->\s*\|([^|]+)\|\s*([A-Z0-9]+(?:\[[^\]]+\]|\([^)]+\))?)/g,
                    "-->|$1| $2"
                  );

                return graphDecl + formattedContent;
              }
            );
        }

        console.log("Processed chart:", processedChart);

        // 验证图表语法（新版本的mermaid.parse可能是同步的）
        try {
          await mermaid.parse(processedChart);
          console.log("Mermaid parse validation successful");
        } catch (parseError) {
          console.warn(
            "Mermaid parse validation failed, but continuing with render:",
            parseError
          );
          // 对于序列图，尝试简单的语法修复
          if (processedChart.includes("sequenceDiagram")) {
            console.log("Attempting to fix sequence diagram syntax");
            processedChart = processedChart
              .replace(/：/g, ":") // 替换中文冒号
              .replace(/（/g, "(") // 替换中文括号
              .replace(/）/g, ")")
              .replace(/≥/g, ">=") // 替换特殊符号
              .replace(/《/g, '"') // 替换书名号
              .replace(/》/g, '"');
            console.log("Fixed sequence diagram:", processedChart);
          }
        }

        // 渲染图表
        const { svg } = await mermaid.render(diagramId, processedChart);

        console.log("Mermaid render successful, SVG length:", svg.length);

        // 插入SVG
        container.innerHTML = svg;

        // 添加调试信息
        console.log("Container after SVG insertion:", container);
        console.log("Container innerHTML length:", container.innerHTML.length);

        // 确保SVG响应式
        const svgElement = container.querySelector("svg");
        if (svgElement) {
          svgElement.style.maxWidth = "100%";
          svgElement.style.height = "auto";
          svgElement.style.display = "block";
          svgElement.style.visibility = "visible";
          console.log("SVG element configured successfully");
          console.log("SVG dimensions:", {
            width: svgElement.getAttribute("width"),
            height: svgElement.getAttribute("height"),
            viewBox: svgElement.getAttribute("viewBox"),
          });
        } else {
          console.error("SVG element not found after insertion");
        }

        // 渲染完成，移除标记
        container.dataset.rendering = "false";
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        console.error("Original chart content:", chart);
        console.error("Processed chart content:", processedChart || chart);

        // 渲染失败，移除标记
        container.dataset.rendering = "false";

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
            ${error.message
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")}
            <details style="margin-top: 8px;">
              <summary>Show original diagram code</summary>
              <pre style="margin-top: 8px; white-space: pre-wrap;">${chart
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")}</pre>
            </details>
            <details style="margin-top: 8px;">
              <summary>Show processed diagram code</summary>
              <pre style="margin-top: 8px; white-space: pre-wrap;">${(
                processedChart || chart
              )
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")}</pre>
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
        textAlign: "center",
        maxWidth: "100%",
        overflow: "auto",
        margin: "20px 0",
        minHeight: "100px",
      }}
    />
  );
});

export default MermaidDiagram;
