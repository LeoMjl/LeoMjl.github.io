import { useState } from "react";
import { ArrowRight, GithubLogo } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
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

function getProjectStart(period) {
  const match = period.match(/(\d{4})\.(\d{1,2})/);
  return match ? Number(match[1]) * 100 + Number(match[2]) : 0;
}

const projectsByTime = [...projects].sort((a, b) => getProjectStart(b.period) - getProjectStart(a.period));

export function ProjectsPage() {
  const [output, setOutput] = useState(null);
  useReveal(output?.id || "project-timeline");

  return (
    <div className="route-page projects-route">
      <header className="route-hero reveal-item is-visible">
        <p className="signal-label">PROJECT TIMELINE / 01</p>
        <h1>从研究问题到可运行的工程系统</h1>
        <p>按时间回看我从个人构建、科研课题到企业协作的项目实践，最新项目优先展示。</p>
      </header>

      <div aria-label="项目时间线" className="project-timeline">
        {projectsByTime.map((project, index) => (
          <article className="project-timeline-item reveal-item" key={project.id}>
            <div className="project-timeline-date">
              <span>{project.period}</span>
              <small>{project.status}</small>
            </div>

            <div aria-hidden="true" className="project-timeline-track">
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>

            <div className="project-timeline-card">
              <Link className="project-timeline-cover" to={`/projects/${project.slug}`}>
                <img alt={`${project.title} 项目封面`} src={project.cover} />
              </Link>

              <div className="project-timeline-content">
                <p className="signal-label">PROJECT / {String(index + 1).padStart(2, "0")}</p>
                <div className="project-timeline-heading">
                  <div>
                    <h2><Link to={`/projects/${project.slug}`}>{project.title}</Link></h2>
                    <strong>{project.subtitle}</strong>
                  </div>
                  <Link aria-label={`查看 ${project.title}`} className="icon-button" to={`/projects/${project.slug}`}>
                    <ArrowRight size={19} />
                  </Link>
                </div>

                <p className="project-timeline-description">{project.description}</p>

                <dl className="project-timeline-facts">
                  <div><dt>我的角色</dt><dd>{project.role}</dd></div>
                  <div><dt>核心贡献</dt><dd>{project.contributions[0]}</dd></div>
                </dl>

                <div className="tag-list">{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>

                {project.outputs.length ? (
                  <div className="project-timeline-outputs">
                    <span>成果</span>
                    {project.outputs.slice(0, 2).map((item) => (
                      <button key={item.id} onClick={() => setOutput(item)} type="button">
                        <small>{outputTypeLabels[item.type] ?? item.type}</small>
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="project-links">
                  {project.githubUrl ? <a href={project.githubUrl} rel="noreferrer" target="_blank"><GithubLogo size={17} /> GitHub</a> : <span />}
                  <Link to={`/projects/${project.slug}`}>查看项目 <ArrowRight size={16} /></Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <OutputModal onClose={() => setOutput(null)} output={output} />
    </div>
  );
}
