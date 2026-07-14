import { useState } from "react";
import { ArrowLeft, ArrowSquareOut, CheckCircle, GithubLogo } from "@phosphor-icons/react";
import { Link, useParams } from "react-router-dom";
import { OutputModal } from "../components/OutputModal";
import { projects } from "../data/portfolio";
import { useReveal } from "../hooks/useReveal";

export function ProjectDetailPage() {
  const { slug } = useParams();
  const [output, setOutput] = useState(null);
  const project = projects.find((item) => item.slug === slug);
  useReveal(output?.id || slug);

  if (!project) return <div className="route-page empty-state"><h1>Project not found.</h1><Link to="/projects">Return to projects</Link></div>;

  return (
    <article className="project-detail route-page">
      <Link className="back-link" to="/projects"><ArrowLeft size={17} /> All Projects</Link>
      <header className="project-detail-hero reveal-item is-visible">
        <div>
          <p className="signal-label">{project.typeLabel} · {project.period}</p>
          <h1>{project.title}</h1>
          <p>{project.subtitle}</p>
          <div className="tag-list">{project.technologies.map((item) => <span key={item}>{item}</span>)}</div>
          <div className="detail-actions">
            {project.githubUrl ? <a className="button button-primary" href={project.githubUrl} rel="noreferrer" target="_blank"><GithubLogo size={18} /> GitHub</a> : null}
            {project.demoUrl ? <a className="button button-secondary" href={project.demoUrl}>Demo <ArrowSquareOut size={17} /></a> : null}
          </div>
        </div>
        <img alt={`${project.title} 视觉预览`} src={project.cover} />
      </header>

      <div className="project-facts reveal-item">
        <div><span>Role</span><strong>{project.role}</strong></div>
        <div><span>Status</span><strong>{project.status}</strong></div>
        <div><span>Period</span><strong>{project.period}</strong></div>
      </div>

      <section className="detail-section reveal-item"><p className="signal-label">BACKGROUND</p><h2>Why this project exists</h2><p>{project.background}</p></section>
      <section className="detail-section split reveal-item">
        <div><p className="signal-label">KEY CHALLENGE</p><h2>{project.challenge}</h2></div>
        <div><p className="signal-label">SOLUTION</p><p>{project.solution}</p></div>
      </section>
      <section className="detail-section reveal-item">
        <p className="signal-label">MY RESPONSIBILITY</p><h2>What I owned</h2>
        <div className="responsibility-list">{project.contributions.map((item) => <div key={item}><CheckCircle size={22} weight="duotone" /><span>{item}</span></div>)}</div>
      </section>
      <section className="architecture-section reveal-item" id="architecture">
        <img alt={`${project.title} 系统与数据流示意`} decoding="async" loading="lazy" src={project.cover} />
        <div><p className="signal-label">SYSTEM ARCHITECTURE</p><h2>From state to decision to verified action.</h2><p>{project.solution}</p><div className="tag-list">{project.technologies.map((item) => <span key={item}>{item}</span>)}</div></div>
      </section>
      <section className="detail-section reveal-item">
        <p className="signal-label">PROJECT OUTPUTS</p><h2>Research and engineering outputs</h2>
        <div className="detail-output-grid">{project.outputs.map((item) => <button key={item.id} onClick={() => setOutput(item)} type="button"><span>{item.type}</span><strong>{item.title}</strong><small>{item.year} · {item.status}</small></button>)}</div>
      </section>
      <OutputModal onClose={() => setOutput(null)} output={output} />
    </article>
  );
}
