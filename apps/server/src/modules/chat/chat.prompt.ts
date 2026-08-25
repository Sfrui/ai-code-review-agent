import type { ChatHistory } from '@ai-review/shared';
import type { ChatContext } from './chat.types';

// ============================================================
// 对话专用 Prompt 模板
// 角色：资深代码审查专家，与开发者多轮对话
// ============================================================

/** 对话 System Prompt — 定义 AI 角色和回答规则 */
export const CHAT_SYSTEM_PROMPT = `你是一位拥有 10 年以上经验的资深软件工程师和代码审查专家。

你已经完成了对用户代码的全面审查，现在开发者就审查结果向你提问。你的职责是与开发者进行深入的技术对话，帮助他们理解问题并找到最佳解决方案。
你会根据代码的语言特性（如 TypeScript、Python、C、Java、Go 等）给出针对性建议。

## 你的背景信息

- 你已经完整阅读了用户提交的源代码
- 你已经完成审查并输出了评分和所有发现的问题
- 你现在拥有完整的审查上下文和对话历史

## 回答原则

1. **结合代码**：回答时引用具体的代码行号，让建议更有针对性
2. **避免重复**：不要重复审查报告中已有的内容，假设开发者已经看过
3. **具体可执行**：给出完整的修复代码，而不是伪代码或笼统的建议
4. **多种方案**：复杂问题提供多种解决方案，对比优缺点
5. **专业友好**：保持专业但友好的语气，像一位耐心的导师

## 回答格式

- 使用 Markdown 格式，代码用代码块包裹并标注语言
- 重要概念加粗强调
- 列表用于分步骤说明
- 简洁明了，避免废话

## 注意事项

- 如果开发者的问题与审查无关，礼貌地引导回代码审查主题
- 如果问题模糊，先澄清再回答
- 如果修复涉及多处改动，分步骤说明
- 优先解决严重问题（error > warning > info）`;

/** 构建对话 User Prompt */
export function buildChatUserPrompt(params: {
  codeName: string;
  codeContent: string;
  reviewSummary: string;
  issues: ChatContext['issues'];
  chatHistory: ChatHistory;
  currentQuestion: string;
  relatedIssueIndex?: number;
}): string {
  const {
    codeName,
    codeContent,
    reviewSummary,
    issues,
    chatHistory,
    currentQuestion,
    relatedIssueIndex,
  } = params;

  const issuesText =
    issues.length === 0
      ? '（审查未发现问题）'
      : issues
          .map(
            (issue, idx) =>
              `[${idx + 1}] 行 ${issue.line} [${issue.severity}] ${issue.category}: ${issue.message}`,
          )
          .join('\n');

  const historyText =
    chatHistory.length === 0
      ? '（这是第一轮对话，无历史记录）'
      : chatHistory
          .map((msg) => {
            const role = msg.role === 'user' ? '开发者' : '审查专家';
            return `${role}: ${msg.content}`;
          })
          .join('\n\n');

  const contextHint =
    relatedIssueIndex !== undefined
      ? `\n## 💡 上下文提示\n开发者正在就第 ${relatedIssueIndex + 1} 个问题进行追问，请重点关注该问题。\n`
      : '';

  return `## 📄 文件名
${codeName}

## 💻 源代码
\`\`\`
${codeContent}
\`\`\`

## 📊 审查摘要
${reviewSummary}

## 🔍 发现的问题
${issuesText}
${contextHint}
## 💬 对话历史
${historyText}

## ❓ 当前问题
${currentQuestion}

---

请根据以上信息回答开发者的问题。记住：结合代码行号、给出完整修复代码、避免重复审查报告内容。`;
}
