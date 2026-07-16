import { ArrowLeft, ArrowsClockwise, MagnifyingGlass, Pause, Play, X } from "@phosphor-icons/react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";
import { capabilityBySlug } from "../data/capabilities";
import { projects } from "../data/portfolio";

const KnowledgeSphere = lazy(() => import("../components/KnowledgeSphere").then((module) => ({ default: module.KnowledgeSphere })));

const relationLabels = {
  contains: "包含", depends_on: "依赖", works_with: "协同", supports: "支撑", validates: "验证",
};
const outputTypeLabels = { paper: "论文", patent: "专利", report: "报告", software: "软件", demo: "演示", dataset: "数据集" };

function resolveOutput(outputId) {
  for (const project of projects) {
    const output = project.outputs?.find((item) => item.id === outputId);
    if (output) return { ...output, projectSlug: project.slug };
  }
  return null;
}

function DetailPanel({ capability, node, onClose }) {
  const relatedProjects = (node?.projectIds || capability.projectIds).map((id) => projects.find((project) => project.id === id)).filter(Boolean);
  const relatedNodes = (node?.relatedNodeIds || []).map((id) => capability.nodes.find((item) => item.id === id)).filter(Boolean);
  const outputs = (node?.outputIds || capability.outputIds).map(resolveOutput).filter(Boolean);
  const blogs = (node?.blogSlugs || capability.blogSlugs).map((slug) => blogPosts.find((post) => post.slug === slug)).filter(Boolean);
  return (
    <aside className={`capability-detail${node ? " has-selection" : ""}`} aria-live="polite">
      <button aria-label="关闭详情" className="capability-detail-close" onClick={onClose} type="button"><X size={19} /></button>
      <div className="capability-detail-scroll" key={node?.id || capability.slug}>
        <p className="signal-label">{node ? `${node.categoryLabel} / SELECTED NODE` : "DOMAIN OVERVIEW"}</p>
        <h2>{node?.nameZh || capability.titleZh}</h2>
        <h3>{node?.name || capability.title}</h3>
        <p className="capability-definition">{node?.definition || capability.overview}</p>
        {node ? <p>{node.explanation}</p> : null}

        {node ? <section><h4>核心能力</h4><ul>{node.abilities.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
        {node ? <section><h4>关键概念</h4><div className="capability-chip-list">{node.concepts.map((item) => <span key={item}>{item}</span>)}</div></section> : null}
        {relatedNodes.length ? <section><h4>关联知识</h4><div className="capability-chip-list">{relatedNodes.map((item) => <span key={item.id}>{item.nameZh} · {item.name}</span>)}</div></section> : null}
        <section><h4>实践证据</h4><p>{node?.evidence || `能力网络来自${capability.evidenceContext}中的真实问题、技术方案和验证结果。`}</p></section>
        {relatedProjects.length ? <section><h4>相关项目</h4>{relatedProjects.map((project) => <Link className="capability-related-link" key={project.id} to={`/projects/${project.slug}`}><span>{project.typeLabel}</span><strong>{project.title}</strong></Link>)}</section> : null}
        {outputs.length ? <section><h4>成果输出</h4>{outputs.map((output) => <Link className="capability-related-link" key={output.id} to={`/projects/${output.projectSlug}`}><span>{outputTypeLabels[output.type] || output.type}</span><strong>{output.title}</strong></Link>)}</section> : null}
        {blogs.length ? <section><h4>相关博客</h4>{blogs.map((post) => <Link className="capability-related-link" key={post.slug} to={`/blog/${post.slug}`}><span>{post.category}</span><strong>{post.title}</strong></Link>)}</section> : null}
      </div>
    </aside>
  );
}

export function CapabilityPage() {
  const { slug } = useParams();
  const capability = capabilityBySlug[slug];
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [manualPaused, setManualPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const resumeTimer = useRef(null);

  const selectedNode = capability?.nodes.find((node) => node.id === selectedId) || null;
  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized || !capability) return [];
    return capability.nodes.filter((node) => `${node.name} ${node.nameZh} ${node.categoryLabelZh}`.toLowerCase().includes(normalized)).slice(0, 7);
  }, [capability, query]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  useEffect(() => {
    if (!capability) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setQuery("");
        setMobileDetailOpen(false);
        return;
      }
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"].includes(event.key) || event.target.matches("input, textarea")) return;
      event.preventDefault();
      if (event.key === "Enter" && searchResults[0]) {
        setSelectedId(searchResults[0].id); setMobileDetailOpen(true); setQuery(""); return;
      }
      const currentId = selectedId || capability.nodes[0].id;
      const neighborIds = capability.links.flatMap((link) => link.source === currentId ? [link.target] : link.target === currentId ? [link.source] : []);
      const orderedNodes = neighborIds.length ? neighborIds.map((id) => capability.nodes.find((node) => node.id === id)).filter(Boolean) : capability.nodes;
      const index = Math.max(0, orderedNodes.findIndex((node) => node.id === selectedId));
      const delta = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      const next = orderedNodes[(index + delta + orderedNodes.length) % orderedNodes.length];
      setSelectedId(next.id); setMobileDetailOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [capability, searchResults, selectedId]);

  if (!capability) return <Navigate replace to="/" />;

  const selectNode = (id) => {
    setSelectedId(id);
    setMobileDetailOpen(true);
  };
  const handleInteraction = (type) => {
    if (type === "reset") {
      setResetSignal((value) => value + 1);
      return;
    }
    if (type === "blank") {
      clearTimeout(resumeTimer.current);
      setInteractionPaused(false);
      return;
    }
    clearTimeout(resumeTimer.current);
    if (type === "start") setInteractionPaused(true);
    if (type === "end") resumeTimer.current = setTimeout(() => setInteractionPaused(false), 2800);
  };

  return (
    <article className="capability-page">
      <header className="capability-page-header">
        <Link className="capability-back" to="/#focus"><ArrowLeft size={18} /> 能力领域</Link>
        <div><p className="signal-label">CAPABILITY KNOWLEDGE MAP / {capability.number}</p><h1>{capability.titleZh}</h1><span>{capability.title} · {capability.description}</span></div>
        <div className="capability-controls">
          <div className="capability-search">
            <MagnifyingGlass size={17} />
            <input aria-label="搜索知识节点" onChange={(event) => setQuery(event.target.value)} placeholder="搜索节点" value={query} />
            {searchResults.length ? <div className="capability-search-results">{searchResults.map((node) => <button key={node.id} onClick={() => { selectNode(node.id); setQuery(""); }} type="button"><strong>{node.name}</strong><span>{node.nameZh}</span></button>)}</div> : null}
          </div>
          <button className="capability-control-button" onClick={() => setResetSignal((value) => value + 1)} title="重置视角" type="button"><ArrowsClockwise size={18} /><span>重置视角</span></button>
          <button className="capability-control-button" onClick={() => setManualPaused((value) => !value)} title={manualPaused ? "开始旋转" : "暂停旋转"} type="button">{manualPaused ? <Play size={18} /> : <Pause size={18} />}<span>{manualPaused ? "开始旋转" : "暂停旋转"}</span></button>
        </div>
        <div className="capability-stats"><span><strong>{capability.nodes.length}</strong> 个节点</span><span><strong>{capability.links.length}</strong> 条关系</span></div>
      </header>

      <div className={`capability-workspace${mobileDetailOpen ? " is-detail-open" : ""}`}>
        <section className="capability-scene" tabIndex="0" aria-label={`${capability.title} 三维知识图谱，拖动旋转，滚轮缩放`}>
          <Suspense fallback={<div className="sphere-loading"><i />正在构建知识图谱...</div>}>
            <KnowledgeSphere capability={capability} manualPaused={manualPaused || interactionPaused} onHover={() => undefined} onInteraction={handleInteraction} onSelect={selectNode} resetSignal={resetSignal} selectedId={selectedId} />
          </Suspense>
          <div className="capability-scene-hint">拖动旋转 · 滚轮缩放 · 双击重置</div>
        </section>
        <DetailPanel capability={capability} node={selectedNode} onClose={() => setMobileDetailOpen(false)} />
      </div>

      <footer className="capability-page-footer">
        <div><p className="signal-label">NODE CATEGORIES</p><div className="capability-legend">{capability.categories.map((category) => <span key={category.id}><i style={{ background: category.color }} />{category.labelZh}</span>)}</div></div>
        <div><p className="signal-label">RELATION TYPES</p><div className="capability-legend relation-legend">{capability.relationTypes.map((type) => <span key={type}><i />{relationLabels[type]}</span>)}</div></div>
        <div><p className="signal-label">KEYBOARD</p><span className="capability-keyboard">方向键切换节点 · Enter 选择 · Esc 关闭</span></div>
        <div><p className="signal-label">DOMAIN PROJECTS</p><div className="capability-footer-projects">{capability.projectIds.map((id) => projects.find((project) => project.id === id)).filter(Boolean).map((project) => <Link key={project.id} to={`/projects/${project.slug}`}>{project.title}</Link>)}</div></div>
      </footer>
    </article>
  );
}
