import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * 将 output.json 按第一级别拆分为单独的文件夹和文件
 * 并为每个法律大类生成对应的 XMind 和 Markdown 文件
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 输入文件路径
const inputFile = path.join(__dirname, 'output.json');
const outputBaseDir = path.join(__dirname, 'law_system');

// 确保输出目录存在
if (!fs.existsSync(outputBaseDir)) {
    fs.mkdirSync(outputBaseDir, { recursive: true });
}

// 清理文件名，移除特殊字符
function sanitizeFileName(name) {
    return name
        .replace(/[<>:"/\\|?*]/g, '') // 移除Windows不支持的字符
        .replace(/[\s]/g, '_') // 将空格替换为下划线
        .trim();
}

// 清理文本内容，移除XML特殊字符
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .trim();
}

// 生成XMind格式脑图
function generateXMindForCategory(categoryData, outputPath) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0" xmlns:fo="http://www.w3.org/1999/XSL/Format" version="2.0">
    <sheet id="sheet1" theme="resources/themes/default.xmt">
        <topic id="root" structure-class="org.xmind.ui.logic.right">
            <title>${cleanText(categoryData.content)}</title>
`;

    function addXMindNode(item, level = 1) {
        const nodeId = `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const text = cleanText(item.content || '未命名');
        
        if (level === 1) {
            xml += `            <children>
                <topics type="attached">
`;
        }

        xml += `                    <topic id="${nodeId}">
                        <title>${text}</title>
`;

        // 添加法律内容作为备注
        if (item.lawWebContent && item.lawWebContent.trim()) {
            const content = cleanText(item.lawWebContent);
            xml += `                        <notes>
                            <plain>${content}</plain>
                        </notes>
`;
        }

        // 递归添加子节点
        if (item.children && item.children.length > 0) {
            xml += `                        <children>
                            <topics type="attached">
`;
            item.children.forEach(child => {
                addXMindNode(child, level + 1);
            });
            xml += `                            </topics>
                        </children>
`;
        }

        xml += `                    </topic>
`;
    }

    // 添加子节点
    if (categoryData.children && categoryData.children.length > 0) {
        categoryData.children.forEach(child => {
            addXMindNode(child);
        });
        xml += `                </topics>
            </children>
`;
    }

    xml += `        </topic>
    </sheet>
</xmap-content>`;

    fs.writeFileSync(outputPath, xml, 'utf8');
}

// 生成Markdown格式
function generateMarkdownForCategory(categoryData, outputPath) {
    let markdown = `# ${categoryData.content}\n\n`;

    function addMarkdownNode(item, level = 2) {
        const prefix = '#'.repeat(level);
        const text = item.content || '未命名';
        
        markdown += `${prefix} ${text}\n\n`;
        
        // 添加法律内容
        if (item.lawWebContent && item.lawWebContent.trim()) {
            markdown += `${item.lawWebContent}\n\n`;
        }

        // 递归添加子节点
        if (item.children && item.children.length > 0) {
            item.children.forEach(child => {
                addMarkdownNode(child, level + 1);
            });
        }
    }

    // 添加根级别的法律内容
    if (categoryData.lawWebContent && categoryData.lawWebContent.trim()) {
        markdown += `> ${categoryData.lawWebContent}\n\n`;
    }

    // 添加子节点
    if (categoryData.children && categoryData.children.length > 0) {
        categoryData.children.forEach(child => {
            addMarkdownNode(child);
        });
    }

    fs.writeFileSync(outputPath, markdown, 'utf8');
}

// 统计节点数量
function countNodes(item) {
    let count = 1; // 当前节点
    if (item.children && item.children.length > 0) {
        count += item.children.reduce((sum, child) => sum + countNodes(child), 0);
    }
    return count;
}

// 主函数
async function main() {
    try {
        console.log('开始拆分法条系统...');
        console.log(`输入文件: ${inputFile}`);
        console.log(`输出目录: ${outputBaseDir}`);

        // 读取原始数据
        const rawData = fs.readFileSync(inputFile, 'utf8');
        const responseData = JSON.parse(rawData);

        // 检查数据结构
        if (!responseData.data || !Array.isArray(responseData.data)) {
            throw new Error('输入文件格式错误，应该包含data数组字段');
        }

        const lawData = responseData.data;
        console.log(`\n发现 ${lawData.length} 个法律大类:`);

        // 为每个法律大类创建文件夹和文件
        for (let i = 0; i < lawData.length; i++) {
            const category = lawData[i];
            const categoryName = category.content || `未命名_${i}`;
            
            console.log(`${i + 1}. ${categoryName}`);

            // 创建安全的文件夹名
            const safeFolderName = sanitizeFileName(categoryName);
            const categoryDir = path.join(outputBaseDir, safeFolderName);

            // 创建文件夹
            if (!fs.existsSync(categoryDir)) {
                fs.mkdirSync(categoryDir, { recursive: true });
            }

            // 生成JSON文件
            const jsonPath = path.join(categoryDir, `${safeFolderName}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify(category, null, 2), 'utf8');

            // 生成XMind文件
            const xmindPath = path.join(categoryDir, `${safeFolderName}.xmind`);
            generateXMindForCategory(category, xmindPath);

            // 生成Markdown文件
            const mdPath = path.join(categoryDir, `${safeFolderName}.md`);
            generateMarkdownForCategory(category, mdPath);

            const nodeCount = countNodes(category);
            console.log(`   └─ 已生成: ${safeFolderName}/`);
            console.log(`      ├─ ${safeFolderName}.json (${nodeCount} 个节点)`);
            console.log(`      ├─ ${safeFolderName}.xmind`);
            console.log(`      └─ ${safeFolderName}.md`);
        }

        // 生成总览文件
        const overviewPath = path.join(outputBaseDir, 'README.md');
        let overview = `# 中国法条系统分类目录\n\n`;
        overview += `本目录包含了中国法条系统的分类文件，共 ${lawData.length} 个法律大类。\n\n`;
        overview += `## 目录结构\n\n`;

        lawData.forEach((category, index) => {
            const categoryName = category.content || `未命名_${index}`;
            const safeFolderName = sanitizeFileName(categoryName);
            const childrenCount = category.children ? category.children.length : 0;
            const nodeCount = countNodes(category);
            
            overview += `### ${index + 1}. [${categoryName}](./${safeFolderName}/)\n`;
            overview += `- **包含**: ${childrenCount} 个直接子项，共 ${nodeCount} 个节点\n`;
            if (category.type) {
                overview += `- **类型**: ${category.type}\n`;
            }
            if (category.id) {
                overview += `- **ID**: ${category.id}\n`;
            }
            overview += `- **文件**: \n`;
            overview += `  - [JSON数据](./${safeFolderName}/${safeFolderName}.json)\n`;
            overview += `  - [XMind脑图](./${safeFolderName}/${safeFolderName}.xmind)\n`;
            overview += `  - [Markdown文档](./${safeFolderName}/${safeFolderName}.md)\n\n`;
        });

        overview += `## 数据说明\n\n`;
        overview += `### 原始数据结构\n`;
        overview += `- **msg**: ${responseData.msg}\n`;
        overview += `- **code**: ${responseData.code}\n`;
        overview += `- **current**: ${responseData.current}\n`;
        overview += `- **data**: 包含 ${lawData.length} 个法律大类的数组\n\n`;

        overview += `### 节点字段说明\n`;
        overview += `- **id**: 节点唯一标识符\n`;
        overview += `- **content**: 节点显示内容\n`;
        overview += `- **type**: 节点类型\n`;
        overview += `- **position**: 节点位置\n`;
        overview += `- **parentId**: 父节点ID\n`;
        overview += `- **lawWebContent**: 法律条文内容\n`;
        overview += `- **children**: 子节点数组\n`;
        overview += `- **showChild**: 是否显示子节点\n`;
        overview += `- **jsonUrl**: 相关JSON资源URL\n`;
        overview += `- **firstChildrenId**: 第一个子节点ID\n\n`;

        overview += `## 使用说明\n\n`;
        overview += `### XMind文件\n`;
        overview += `- 推荐使用 XMind 软件打开 .xmind 文件\n`;
        overview += `- 支持节点备注功能，包含完整的法律条文内容\n`;
        overview += `- 可以折叠/展开节点便于浏览\n\n`;
        overview += `### Markdown文件\n`;
        overview += `- 可以使用任何支持Markdown的编辑器打开\n`;
        overview += `- 推荐使用 Typora、Obsidian 等工具\n`;
        overview += `- 包含完整的层级结构和法律条文内容\n\n`;
        overview += `### JSON文件\n`;
        overview += `- 原始结构化数据\n`;
        overview += `- 可用于二次开发和数据分析\n`;
        overview += `- 保持完整的层级关系和所有元数据\n\n`;
        overview += `---\n`;
        overview += `*生成时间: ${new Date().toLocaleString('zh-CN')}*\n`;

        fs.writeFileSync(overviewPath, overview, 'utf8');

        // 生成使用说明文件
        const usageGuide = path.join(outputBaseDir, '使用说明.md');
        let guide = `# 使用说明\n\n`;
        guide += `## 文件结构\n\n`;
        guide += `每个法律大类包含三种格式的文件：\n\n`;
        guide += `1. **JSON文件** - 原始数据，适合程序处理\n`;
        guide += `2. **XMind文件** - 思维导图，适合可视化浏览\n`;
        guide += `3. **Markdown文件** - 文档格式，适合阅读和编辑\n\n`;
        guide += `## 推荐工具\n\n`;
        guide += `### XMind文件查看\n`;
        guide += `- **XMind**: 官方软件，功能最全\n`;
        guide += `- **FreeMind**: 免费开源替代品\n`;
        guide += `- **MindMaster**: 国产思维导图软件\n\n`;
        guide += `### Markdown文件查看\n`;
        guide += `- **Typora**: 所见即所得编辑器\n`;
        guide += `- **Obsidian**: 知识管理工具\n`;
        guide += `- **VS Code**: 程序员编辑器\n`;
        guide += `- **Mark Text**: 实时预览编辑器\n\n`;
        guide += `### JSON文件处理\n`;
        guide += `- **VS Code**: 支持语法高亮和格式化\n`;
        guide += `- **Postman**: API测试工具\n`;
        guide += `- **在线JSON查看器**: 网页版工具\n\n`;
        guide += `## 注意事项\n\n`;
        guide += `1. XMind文件可能较大，打开时需要一定时间\n`;
        guide += `2. 法律条文内容存储在XMind的备注中\n`;
        guide += `3. JSON文件保持了原始的所有字段信息\n`;
        guide += `4. Markdown文件按层级结构组织内容\n\n`;

        fs.writeFileSync(usageGuide, guide, 'utf8');

        console.log(`\n=== 拆分完成 ===`);
        console.log(`总共处理: ${lawData.length} 个法律大类`);
        console.log(`输出目录: ${outputBaseDir}`);
        console.log(`总览文件: README.md`);
        console.log(`使用说明: 使用说明.md`);
        console.log('\n每个法律大类包含:');
        console.log('├─ JSON原始数据文件');
        console.log('├─ XMind脑图文件');
        console.log('└─ Markdown文档文件');

    } catch (error) {
        console.error('处理过程中出错:', error.message);
        process.exit(1);
    }
}

// 运行主函数
main();