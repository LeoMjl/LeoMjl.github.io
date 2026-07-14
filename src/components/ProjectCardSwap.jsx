import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, GithubLogo } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const wrap = (value, length) => ((value % length) + length) % length;

export function ProjectCardSwap({ projects, onOutput }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeProject = projects[activeIndex];

  useEffect(() => {
    if (paused || projects.length < 2) return undefined;
    const timer = window.setInterval(() => setActiveIndex((current) => wrap(current + 1, projects.length)), 4600);
    return () => window.clearInterval(timer);
  }, [paused, projects.length]);

  const move = (direction) => setActiveIndex((current) => wrap(current + direction, projects.length));

  return (
    <div
      className="project-swap reveal-item"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="project-swap-info">
        <div>
          <p className="signal-label">{activeProject.typeLabel} / {String(activeIndex + 1).padStart(2, "0")}</p>
          <h3>{activeProject.title}</h3>
          <strong>{activeProject.subtitle}</strong>
          <p>{activeProject.description}</p>
        </div>

        <dl className="project-swap-facts">
          <div><dt>Role</dt><dd>{activeProject.role}</dd></div>
          <div><dt>Period</dt><dd>{activeProject.period}</dd></div>
          <div><dt>Focus</dt><dd>{activeProject.contributions[0]}</dd></div>
        </dl>

        <div className="tag-list">{activeProject.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>

        <div className="project-swap-actions">
          <Link className="button button-primary" to={`/projects/${activeProject.slug}`}>View Project <ArrowRight size={17} /></Link>
          {activeProject.githubUrl ? <a className="button button-secondary" href={activeProject.githubUrl} rel="noreferrer" target="_blank"><GithubLogo size={17} /> GitHub</a> : null}
        </div>

        {activeProject.outputs.length ? (
          <div className="project-swap-outputs">
            <span>OUTPUTS</span>
            {activeProject.outputs.slice(0, 2).map((output) => <button key={output.id} onClick={() => onOutput(output)} type="button">{output.title}<ArrowRight size={14} /></button>)}
          </div>
        ) : null}
      </div>

      <div className="project-swap-stage" aria-label="精选项目卡片">
        {projects.map((project, index) => {
          const slot = wrap(index - activeIndex, projects.length);
          return (
            <button
              aria-label={`显示项目：${project.title}`}
              aria-pressed={slot === 0}
              className={`project-swap-card project-swap-card-${slot}`}
              key={project.id}
              onClick={() => setActiveIndex(index)}
              style={{ "--swap-slot": slot }}
              type="button"
            >
              <img alt="" decoding="async" draggable="false" loading="lazy" src={project.cover} />
              <span className="project-swap-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <small>{project.typeLabel}</small>
                <h4>{project.title}</h4>
                <p>{project.subtitle}</p>
              </div>
            </button>
          );
        })}
        <div className="project-swap-controls">
          <button aria-label="上一个项目" onClick={() => move(-1)} type="button"><ArrowLeft size={19} /></button>
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
          <button aria-label="下一个项目" onClick={() => move(1)} type="button"><ArrowRight size={19} /></button>
        </div>
      </div>
    </div>
  );
}
