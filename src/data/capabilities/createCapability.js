const relationTypes = ["contains", "depends_on", "works_with", "supports", "validates"];

const categoryMeta = {
  foundation: { label: "Foundation", labelZh: "基础认知", color: "#6e8cff" },
  planning: { label: "Planning", labelZh: "规划编排", color: "#8d72ef" },
  execution: { label: "Execution", labelZh: "执行控制", color: "#39bfc5" },
  reliability: { label: "Reliability", labelZh: "可靠性", color: "#69d09a" },
  knowledge: { label: "Knowledge", labelZh: "知识记忆", color: "#5e9cf5" },
  evaluation: { label: "Evaluation", labelZh: "评估验证", color: "#b477e8" },
};

function slugify(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fibonacciPosition(index, total, radius = 4.35) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / Math.max(1, total - 1)) * 2;
  const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = goldenAngle * index;
  return [Math.cos(theta) * ringRadius * radius, y * radius, Math.sin(theta) * ringRadius * radius];
}

function enrichNode(node, index, allNodes, domain) {
  const id = node.id || slugify(node.name);
  const meta = categoryMeta[node.category] || categoryMeta.foundation;
  const related = allNodes
    .filter((candidate) => candidate.category === node.category && candidate.name !== node.name)
    .slice(0, 3)
    .map((candidate) => candidate.id || slugify(candidate.name));

  return {
    id,
    name: node.name,
    nameZh: node.nameZh,
    category: node.category,
    categoryLabel: meta.label,
    categoryLabelZh: meta.labelZh,
    color: meta.color,
    importance: node.importance || (index % 7 === 0 ? 3 : index % 3 === 0 ? 2 : 1),
    definition: node.definition || `${node.nameZh}是${domain.titleZh}中的关键能力，用于把研究方法转化为可执行、可验证的工程步骤。`,
    explanation: node.explanation || `围绕 ${node.name} 建立清晰的输入、状态、约束与输出，使其能够在真实任务中被编排、观测和持续改进。`,
    abilities: node.abilities || [`设计 ${node.nameZh} 的数据与控制边界`, "建立可观测的执行反馈", "在项目中验证质量与稳定性"],
    concepts: node.concepts || [node.name, meta.label, domain.shortTitle],
    relatedNodeIds: node.relatedNodeIds || related,
    projectIds: node.projectIds || domain.projectIds.slice(0, index % 4 === 0 ? 2 : 1),
    outputIds: node.outputIds || domain.outputIds.slice(0, index % 5 === 0 ? 2 : 1),
    evidence: node.evidence || `已在${domain.evidenceContext}中用于方案设计、原型验证或工程实现。`,
    blogSlugs: node.blogSlugs || domain.blogSlugs.slice(index % 3, index % 3 + 2),
    links: node.links || [],
    position: fibonacciPosition(index, allNodes.length),
  };
}

function makeLinks(nodes, extraLinks = []) {
  const links = [];
  const seen = new Set();
  const add = (source, target, type, note) => {
    if (!source || !target || source === target) return;
    const key = [source, target].sort().join("::");
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ id: `${source}-${target}`, source, target, type, note });
  };

  nodes.forEach((node, index) => {
    const next = nodes[(index + 1) % nodes.length];
    add(node.id, next.id, relationTypes[index % relationTypes.length], `${node.name} 与 ${next.name} 形成直接能力链路。`);
    const sameCategory = nodes.find((candidate, candidateIndex) => candidateIndex > index + 1 && candidate.category === node.category);
    if (sameCategory) add(node.id, sameCategory.id, "works_with", "同一能力簇中的协同关系。 ");
  });
  extraLinks.forEach((link, index) => add(link[0], link[1], link[2] || relationTypes[index % relationTypes.length], link[3]));
  return links;
}

export function createCapability(domain, nodeDefinitions, extraLinks = []) {
  const normalized = nodeDefinitions.map((node) => ({ ...node, id: node.id || slugify(node.name) }));
  const nodes = normalized.map((node, index) => enrichNode(node, index, normalized, domain));
  const links = makeLinks(nodes, extraLinks);
  const categories = [...new Set(nodes.map((node) => node.category))].map((id) => ({ id, ...categoryMeta[id] }));
  return { ...domain, nodes, links, categories, relationTypes };
}

export { categoryMeta, relationTypes };
