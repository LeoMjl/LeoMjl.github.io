import { ArrowRight, GithubLogo } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export function ProjectCard({ project, onOutput }) {
  return (
    <article className="project-card reveal-item">
      <Link className="project-cover" to={`/projects/${project.slug}`}>
        <img alt={`${project.title} 项目封面`} decoding="async" loading="lazy" src={project.cover} />
        <span>{project.typeLabel}</span>
      </Link>
      <div className="project-card-body">
        <div className="project-card-heading">
          <div>
            <p className="signal-label">{project.period}</p>
            <h3><Link to={`/projects/${project.slug}`}>{project.title}</Link></h3>
          </div>
          <Link aria-label={`查看 ${project.title}`} className="icon-button" to={`/projects/${project.slug}`}>
            <ArrowRight size={19} />
          </Link>
        </div>
        <p>{project.description}</p>
        <dl className="project-essentials">
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Contribution</dt><dd>{project.contributions[0]}</dd></div>
        </dl>
        <div className="tag-list">{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
        <div className="project-links">
          {project.githubUrl ? <a href={project.githubUrl} rel="noreferrer" target="_blank"><GithubLogo size={17} /> GitHub</a> : null}
          <Link to={`/projects/${project.slug}`}>View Project <ArrowRight size={16} /></Link>
        </div>
      </div>
      <div className="output-strip">
        <span>Outputs</span>
        {project.outputs.slice(0, 2).map((output) => (
          <button key={output.id} onClick={() => onOutput(output)} type="button">
            <small>{output.type}</small>{output.title}<ArrowRight size={14} />
          </button>
        ))}
        {project.outputs.length > 2 ? <span className="more-output">+{project.outputs.length - 2}</span> : null}
      </div>
    </article>
  );
}
