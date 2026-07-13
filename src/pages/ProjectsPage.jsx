import { useMemo, useState } from "react";
import { FadersHorizontal } from "@phosphor-icons/react";
import { OutputModal } from "../components/OutputModal";
import { ProjectCard } from "../components/ProjectCard";
import { projects } from "../data/portfolio";
import { useReveal } from "../hooks/useReveal";

const filters = ["all", "personal", "research", "internship", "patent", "academic"];

export function ProjectsPage() {
  const [filter, setFilter] = useState("all");
  const [output, setOutput] = useState(null);
  const visible = useMemo(() => filter === "all" ? projects : projects.filter((project) => project.type === filter), [filter]);
  useReveal(`${filter}-${output?.id || ""}`);

  return (
    <div className="route-page">
      <header className="route-hero reveal-item is-visible">
        <p className="signal-label">PROJECT INDEX / 01</p>
        <h1>Projects built from research, constraints and code.</h1>
        <p>从个人构建、科研课题到企业协作，每个项目都明确展示我的角色、工作和产出。</p>
      </header>
      <div className="filter-bar reveal-item">
        <FadersHorizontal size={20} />
        <div className="segmented-control">
          {filters.map((item) => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)} type="button">{item === "all" ? "All" : item}</button>)}
        </div>
      </div>
      <div className="all-project-grid">
        {visible.map((project) => <ProjectCard key={project.id} onOutput={setOutput} project={project} />)}
      </div>
      <OutputModal onClose={() => setOutput(null)} output={output} />
    </div>
  );
}

