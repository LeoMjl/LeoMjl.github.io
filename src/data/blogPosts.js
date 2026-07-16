import agentHarnessRaw from "../content/blog/agent-harness.md?raw";
import agentLoopPatternsRaw from "../content/blog/agent-loop-patterns.md?raw";
import agentToolDiscoveryRaw from "../content/blog/agent-tool-discovery.md?raw";
import aiMeetingMinutesRaw from "../content/blog/ai-meeting-minutes.md?raw";
import deepseekDsparkRaw from "../content/blog/deepseek-dspark.md?raw";
import dynamicAgentToolsRaw from "../content/blog/dynamic-agent-tools.md?raw";
import googleMultiAgentSafetyRaw from "../content/blog/google-multi-agent-safety.md?raw";
import loopEngineeringRaw from "../content/blog/loop-engineering.md?raw";
import multiAgentOrchestrationRaw from "../content/blog/multi-agent-orchestration.md?raw";

const definitions = [
  { slug: "ai-meeting-minutes", raw: aiMeetingMinutesRaw, category: "AI Productivity", tags: ["Enterprise AI", "Meeting", "Workflow"], publishedAt: "2026-07-06", featured: true },
  { slug: "multi-agent-orchestration", raw: multiAgentOrchestrationRaw, category: "Agent Architecture", tags: ["Multi-Agent", "Orchestration", "MCP"], publishedAt: "2026-07-06", featured: true },
  { slug: "agent-loop-patterns", raw: agentLoopPatternsRaw, category: "Agent Architecture", tags: ["Agent Loop", "ReAct", "LangGraph"], publishedAt: "2026-07-06", featured: true },
  { slug: "google-multi-agent-safety", raw: googleMultiAgentSafetyRaw, category: "AI Research", tags: ["Multi-Agent", "Safety", "Research"], publishedAt: "2026-07-02", featured: false },
  { slug: "agent-tool-discovery", raw: agentToolDiscoveryRaw, category: "Agent Architecture", tags: ["Tool Discovery", "Registry", "MCP"], publishedAt: "2026-07-01", featured: true },
  { slug: "dynamic-agent-tools", title: "别再把 Agent 工具写死了", raw: dynamicAgentToolsRaw, category: "Agent Engineering", tags: ["Tools", "Architecture", "Hermes"], publishedAt: "2026-06-30", featured: false },
  { slug: "deepseek-dspark", raw: deepseekDsparkRaw, category: "LLM Research", tags: ["DeepSeek", "Inference", "DSpark"], publishedAt: "2026-06-28", featured: false },
  { slug: "agent-harness", raw: agentHarnessRaw, category: "Agent Engineering", tags: ["Harness", "Claude Code", "Developer Tools"], publishedAt: "2026-06-25", featured: true },
  { slug: "loop-engineering", raw: loopEngineeringRaw, category: "Agent Engineering", tags: ["Loop", "State", "Reliability"], publishedAt: "2026-06-24", featured: false },
];

const plainText = (value) => value
  .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
  .replace(/[`*_>#\[\]]/g, "")
  .replace(/\([^)]*\)/g, "")
  .replace(/\s+/g, " ")
  .trim();

function sentenceSummary(value, targetLength = 150) {
  const text = plainText(value);
  if (text.length <= targetLength && /[。！？!?]$/.test(text)) return text;

  const sentences = text.match(/[^。！？!?]+[。！？!?]+/g) || [];
  if (sentences.length) {
    let summary = "";
    for (const sentence of sentences) {
      if (summary && summary.length + sentence.length > targetLength) break;
      summary += sentence;
      if (summary.length >= 72) break;
    }
    if (summary) return summary.trim();
    return sentences[0].trim();
  }

  const fallback = text.slice(0, targetLength).replace(/[，、；：,;:\s]+$/u, "");
  return `${fallback}。`;
}

const headingId = (value) => plainText(value)
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, "-")
  .replace(/^-|-$/g, "");

function buildPost(definition) {
  const normalized = definition.raw.replace(/\r\n/g, "\n");
  const title = definition.title || normalized.match(/^#\s+(.+)$/m)?.[1]?.trim() || definition.slug;
  const body = normalized.replace(/^#\s+.+\n+/, "").trim();
  const summarySource = body.split(/\n\s*\n/).filter((block) => {
    const trimmed = block.trim();
    return trimmed
      && !trimmed.startsWith("!")
      && !trimmed.startsWith("#")
      && !trimmed.startsWith("---")
      && !trimmed.startsWith("```")
      && !trimmed.startsWith("-");
  }).slice(0, 4).join(" ");
  const firstImage = normalized.match(/!\[[^\]]*\]\(\.\.\/assets\/([^)]+)\)/)?.[1];
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => ({
    label: match[1].trim(),
    id: headingId(match[1]),
  }));
  const webImageName = (value) => value.replace(/\.png$/i, ".jpg");
  const markdown = body.replace(/\.\.\/assets\/([^)]+\.png)/gi, (_, name) => `/blog/${definition.slug}/${webImageName(name)}`);
  const characterCount = plainText(body).length;

  return {
    ...definition,
    title,
    summary: sentenceSummary(summarySource),
    cover: firstImage ? `/blog/${definition.slug}/${webImageName(firstImage)}` : "/assets/project-agent-cli.png",
    coverRatio: "portrait",
    readingTime: `${Math.max(4, Math.ceil(characterCount / 520))} 分钟`,
    headings,
    markdown,
  };
}

export const blogPosts = definitions.map(buildPost);
export { headingId };
