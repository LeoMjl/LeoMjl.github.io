import { createCapability } from "./createCapability";

const domain = {
  slug: "llm-applications",
  number: "02",
  icon: "BracketsCurly",
  title: "LLM Applications",
  titleZh: "大模型应用",
  shortTitle: "LLM Stack",
  description: "连接提示、检索、工具调用、结构化输出与评估，构建可靠的大模型应用链路。",
  overview: "该知识球围绕 Prompt、RAG、工具调用、评估与推理优化，呈现从模型能力到真实产品的完整工程关系。",
  projectIds: ["gov-agent", "cli-assistant", "graph-memory"],
  outputIds: ["academic-papers", "invention-patents", "cli-prototype"],
  blogSlugs: ["agent-tool-discovery", "dynamic-agent-tools", "deepseek-dspark", "agent-harness"],
  evidenceContext: "政务大模型应用、命令行智能助手与 Agent 工具系统",
};

const nodes = [
  ["System Prompt Design", "系统提示词设计", "foundation"], ["Task Prompt Design", "任务提示词设计", "foundation"],
  ["Few-Shot Examples", "少样本示例", "foundation"], ["Prompt Templates", "提示词模板", "foundation"],
  ["Output Constraints", "输出约束", "reliability"], ["Query Understanding", "查询理解", "knowledge"],
  ["Query Rewriting", "查询改写", "knowledge"], ["Embedding Retrieval", "向量检索", "knowledge"],
  ["Hybrid Search", "混合检索", "knowledge"], ["Reranking", "重排序", "knowledge"],
  ["RAG Pipeline", "RAG 链路", "execution"], ["Context Selection", "上下文选择", "knowledge"],
  ["Context Compression", "上下文压缩", "knowledge"], ["Session Memory", "会话记忆", "knowledge"],
  ["Function Calling", "函数调用", "execution"], ["Tool Schema Design", "工具模式设计", "execution"],
  ["Structured Output", "结构化输出", "execution"], ["Output Parsing", "输出解析", "execution"],
  ["Hallucination Detection", "幻觉检测", "evaluation"], ["LLM Evaluation", "大模型评估", "evaluation"],
  ["Tool Selection Evaluation", "工具选择评估", "evaluation"], ["Latency Optimization", "时延优化", "reliability"],
  ["Model Routing", "模型路由", "planning"], ["Guardrails", "安全护栏", "reliability"],
].map(([name, nameZh, category], index) => ({ name, nameZh, category, importance: [0, 7, 10, 14, 19, 22].includes(index) ? 3 : 1 }));

export const llmApplications = createCapability(domain, nodes, [
  ["query-understanding", "query-rewriting", "depends_on"], ["embedding-retrieval", "hybrid-search", "works_with"],
  ["hybrid-search", "reranking", "supports"], ["rag-pipeline", "context-selection", "contains"],
  ["function-calling", "tool-schema-design", "depends_on"], ["structured-output", "output-parsing", "depends_on"],
  ["hallucination-detection", "llm-evaluation", "validates"], ["model-routing", "latency-optimization", "supports"],
]);
