import { createCapability } from "./createCapability";

const domain = {
  slug: "research-prototyping",
  number: "04",
  icon: "Flask",
  title: "Research & Prototyping",
  titleZh: "研究与原型",
  shortTitle: "Research Loop",
  description: "把问题定义、机制设计、实验验证、原型开发与论文专利连接成研究闭环。",
  overview: "该知识球展示从研究问题到可复现实验、工程原型与成果输出的完整路径，并强调设计与证据之间的反馈。",
  projectIds: ["graph-memory", "openehr", "gov-agent", "xgboost-hiv"],
  outputIds: ["academic-papers", "invention-patents", "openehr-copyright"],
  blogSlugs: ["google-multi-agent-safety", "deepseek-dspark", "multi-agent-orchestration"],
  evidenceContext: "智能体记忆研究、省级重大项目、医疗图模型与科研原型开发",
};

const nodes = [
  ["Problem Framing", "问题定义", "foundation"], ["Literature Review", "文献综述", "knowledge"],
  ["Gap Identification", "研究空白识别", "knowledge"], ["Requirement Analysis", "需求分析", "foundation"],
  ["Research Hypothesis", "研究假设", "planning"], ["Conceptual Modeling", "概念建模", "planning"],
  ["System Architecture", "系统架构", "planning"], ["Mechanism Design", "机制设计", "planning"],
  ["Data Structure Design", "数据结构设计", "planning"], ["Algorithm Design", "算法设计", "planning"],
  ["Evaluation Metric Design", "评估指标设计", "evaluation"], ["Experimental Design", "实验设计", "evaluation"],
  ["Baseline Selection", "基线选择", "evaluation"], ["Dataset Construction", "数据集构建", "execution"],
  ["Ablation Study", "消融实验", "evaluation"], ["Sensitivity Analysis", "敏感性分析", "evaluation"],
  ["Error Analysis", "误差分析", "evaluation"], ["Result Visualization", "结果可视化", "execution"],
  ["Prototype Development", "原型开发", "execution"], ["Interaction Prototyping", "交互原型", "execution"],
  ["Architecture Diagram", "架构图", "execution"], ["Technical Validation", "技术验证", "evaluation"],
  ["Paper Writing", "论文写作", "knowledge"], ["Reviewer Rebuttal", "审稿回复", "knowledge"],
  ["Patent Drafting", "专利撰写", "knowledge"], ["Research Report", "研究报告", "knowledge"],
  ["Technical Presentation", "技术汇报", "knowledge"], ["Reproducibility", "可复现性", "reliability"],
].map(([name, nameZh, category], index) => ({ name, nameZh, category, importance: [0, 4, 6, 11, 18, 21, 27].includes(index) ? 3 : 1 }));

export const researchPrototyping = createCapability(domain, nodes, [
  ["literature-review", "gap-identification", "supports"], ["gap-identification", "research-hypothesis", "supports"],
  ["system-architecture", "mechanism-design", "contains"], ["experimental-design", "baseline-selection", "depends_on"],
  ["ablation-study", "technical-validation", "validates"], ["error-analysis", "result-visualization", "supports"],
  ["prototype-development", "interaction-prototyping", "contains"], ["paper-writing", "reviewer-rebuttal", "depends_on"],
  ["reproducibility", "technical-validation", "validates"],
]);
