import { createCapability } from "./createCapability";

const domain = {
  slug: "agent-orchestration",
  number: "01",
  icon: "CirclesThreePlus",
  title: "Agent Orchestration",
  titleZh: "智能体编排",
  shortTitle: "Agent Systems",
  description: "组织状态、任务、工具、记忆与恢复机制，让复杂 Agent 工作流可持续运行。",
  overview: "该知识球展示可靠智能体从理解任务到执行、验证、恢复与进化的完整能力网络。所有节点处于同一层级，通过关系说明能力如何共同支撑长期任务。",
  projectIds: ["gov-agent", "marine-agent", "graph-memory"],
  outputIds: ["academic-papers", "invention-patents", "marine-workflow"],
  blogSlugs: ["multi-agent-orchestration", "agent-loop-patterns", "agent-tool-discovery", "loop-engineering"],
  evidenceContext: "政务大模型智能体、海洋科研智能体与图记忆研究",
};

const nodes = [
  ["State Modeling", "状态建模", "foundation"], ["Stage Tracking", "阶段跟踪", "foundation"],
  ["Context Construction", "上下文构建", "knowledge"], ["Context Compression", "上下文压缩", "knowledge"],
  ["Task Decomposition", "任务拆解", "planning"], ["Dependency Planning", "依赖规划", "planning"],
  ["Tool Routing", "工具路由", "execution"], ["Parameter Planning", "参数规划", "planning"],
  ["Execution Control", "执行控制", "execution"], ["Retry Policy", "重试策略", "reliability"],
  ["Failure Recovery", "失败恢复", "reliability"], ["Result Verification", "结果验证", "evaluation"],
  ["Process Cache", "过程缓存", "knowledge"], ["Reflection", "反思", "evaluation"],
  ["Self-Evolution", "自进化", "reliability"], ["Short-Term Memory", "短期记忆", "knowledge"],
  ["Long-Term Memory", "长期记忆", "knowledge"], ["Memory Retrieval", "记忆检索", "knowledge"],
  ["Memory Consolidation", "记忆巩固", "knowledge"], ["Multi-Agent Coordination", "多智能体协作", "execution"],
].map(([name, nameZh, category], index) => ({ name, nameZh, category, importance: index % 5 === 0 ? 3 : 1 }));

export const agentOrchestration = createCapability(domain, nodes, [
  ["task-decomposition", "dependency-planning", "depends_on"],
  ["tool-routing", "parameter-planning", "depends_on"],
  ["execution-control", "result-verification", "validates"],
  ["failure-recovery", "process-cache", "supports"],
  ["reflection", "self-evolution", "supports"],
  ["memory-retrieval", "context-construction", "supports"],
  ["multi-agent-coordination", "state-modeling", "depends_on"],
]);
