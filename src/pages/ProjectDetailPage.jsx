import { useState } from "react";
import { ArrowLeft, ArrowSquareOut, CheckCircle, GithubLogo } from "@phosphor-icons/react";
import { Link, useParams } from "react-router-dom";
import { OutputModal } from "../components/OutputModal";
import { projects } from "../data/portfolio";
import { useReveal } from "../hooks/useReveal";

const outputTypeLabels = {
  paper: "论文",
  patent: "专利",
  report: "报告",
  software: "软件",
  demo: "演示",
  dataset: "数据集",
};

export function ProjectDetailPage() {
  const { slug } = useParams();
  const [output, setOutput] = useState(null);
  const project = projects.find((item) => item.slug === slug);
  useReveal(output?.id || slug);

  if (!project) return <div className="route-page empty-state"><h1>未找到该项目</h1><Link to="/projects">返回项目列表</Link></div>;

  return (
    <article className="project-detail route-page">
      <Link className="back-link" to="/projects"><ArrowLeft size={17} /> 全部项目</Link>
      <header className="project-detail-hero reveal-item is-visible">
        <div>
          <p className="signal-label">{project.typeLabel} · {project.period}</p>
          <h1>{project.title}</h1>
          <p>{project.subtitle}</p>
          <div className="tag-list">{project.technologies.map((item) => <span key={item}>{item}</span>)}</div>
          <div className="detail-actions">
            {project.githubUrl ? <a className="button button-primary" href={project.githubUrl} rel="noreferrer" target="_blank"><GithubLogo size={18} /> GitHub</a> : null}
            {project.demoUrl ? <a className="button button-secondary" href={project.demoUrl}>在线演示 <ArrowSquareOut size={17} /></a> : null}
          </div>
        </div>
        <img alt={`${project.title} 视觉预览`} src={project.cover} />
      </header>

      <div className="project-facts reveal-item">
        <div><span>我的角色</span><strong>{project.role}</strong></div>
        <div><span>项目状态</span><strong>{project.status}</strong></div>
        <div><span>项目周期</span><strong>{project.period}</strong></div>
      </div>

      <section className="detail-section reveal-item"><p className="signal-label">BACKGROUND</p><h2>项目背景与问题来源</h2><p>{project.background}</p></section>
      <section className="detail-section split reveal-item">
        <div><p className="signal-label">KEY CHALLENGE</p><h2>{project.challenge}</h2></div>
        <div><p className="signal-label">SOLUTION</p><p>{project.solution}</p></div>
      </section>
      <section className="detail-section reveal-item">
        <p className="signal-label">MY RESPONSIBILITY</p><h2>我的职责与具体工作</h2>
        <div className="responsibility-list">{project.contributions.map((item) => <div key={item}><CheckCircle size={22} weight="duotone" /><span>{item}</span></div>)}</div>
      </section>
      <section className="architecture-section reveal-item" id="architecture">
        <img alt={`${project.title} 系统与数据流示意`} src={project.cover} />
        <div><p className="signal-label">SYSTEM ARCHITECTURE</p><h2>从状态建模到决策，再到可验证执行</h2><p>{project.solution}</p><div className="tag-list">{project.technologies.map((item) => <span key={item}>{item}</span>)}</div></div>
      </section>
      <section className="detail-section reveal-item">
        <p className="signal-label">PROJECT OUTPUTS</p><h2>科研与工程成果</h2>
        <div className="detail-output-grid">{project.outputs.map((item) => <button key={item.id} onClick={() => setOutput(item)} type="button"><span>{outputTypeLabels[item.type] ?? item.type}</span><strong>{item.title}</strong><small>{item.year} · {item.status}</small></button>)}</div>
      </section>
      <OutputModal onClose={() => setOutput(null)} output={output} />
    </article>
  );
}

