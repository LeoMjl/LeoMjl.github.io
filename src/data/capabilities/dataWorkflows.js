import { createCapability } from "./createCapability";

const domain = {
  slug: "data-workflows",
  number: "03",
  icon: "Graph",
  title: "Data Workflows",
  titleZh: "数据工作流",
  shortTitle: "Data Systems",
  description: "把采集、清洗、对齐、融合、调度与追踪组织成可复现的数据生产链。",
  overview: "该知识球覆盖多源数据从进入系统到成为模型、知识图谱和科研实验输入的全流程。",
  projectIds: ["marine-agent", "openehr", "xgboost-hiv"],
  outputIds: ["marine-workflow", "openehr-copyright"],
  blogSlugs: ["ai-meeting-minutes", "loop-engineering", "agent-harness"],
  evidenceContext: "海洋遥感科研数据流程、openEHR 图映射与机器学习数据建模",
};

const nodes = [
  ["API Data Collection", "API 数据采集", "foundation"], ["Batch Download", "批量下载", "foundation"],
  ["File Parsing", "文件解析", "foundation"], ["Web Data Extraction", "网页数据提取", "foundation"],
  ["Data Cleaning", "数据清洗", "execution"], ["Missing Value Handling", "缺失值处理", "execution"],
  ["Outlier Detection", "异常值检测", "evaluation"], ["Schema Normalization", "模式标准化", "execution"],
  ["Data Transformation", "数据转换", "execution"], ["Temporal Alignment", "时间对齐", "knowledge"],
  ["Spatial Alignment", "空间对齐", "knowledge"], ["Entity Mapping", "实体映射", "knowledge"],
  ["Multi-Source Fusion", "多源融合", "knowledge"], ["ETL Pipeline", "ETL 管道", "planning"],
  ["Workflow Scheduling", "工作流调度", "planning"], ["Batch Processing", "批处理", "execution"],
  ["Task Monitoring", "任务监控", "reliability"], ["Failure Recovery", "失败恢复", "reliability"],
  ["Data Validation", "数据验证", "evaluation"], ["Metadata Management", "元数据管理", "knowledge"],
  ["Data Versioning", "数据版本管理", "reliability"], ["Processing Logs", "处理日志", "reliability"],
  ["Graph Database Mapping", "图数据库映射", "knowledge"], ["Vector Data Preparation", "向量数据准备", "knowledge"],
].map(([name, nameZh, category], index) => ({ name, nameZh, category, importance: [0, 4, 9, 13, 14, 18, 22].includes(index) ? 3 : 1 }));

export const dataWorkflows = createCapability(domain, nodes, [
  ["data-cleaning", "missing-value-handling", "contains"], ["data-cleaning", "outlier-detection", "contains"],
  ["temporal-alignment", "spatial-alignment", "works_with"], ["entity-mapping", "multi-source-fusion", "supports"],
  ["etl-pipeline", "workflow-scheduling", "depends_on"], ["task-monitoring", "failure-recovery", "supports"],
  ["data-validation", "data-versioning", "validates"], ["graph-database-mapping", "vector-data-preparation", "works_with"],
]);
