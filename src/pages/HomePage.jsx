import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowSquareOut,
  GitFork,
  GithubLogo,
  Star,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { CircularBlogGallery } from "../components/CircularBlogGallery";
import { KnowledgeNetwork } from "../components/KnowledgeNetwork";
import { ProjectCardSwap } from "../components/ProjectCardSwap";
import { blogPosts } from "../data/blogPosts";
import {
  experiences,
  githubFallback,
  profile,
  projects,
} from "../data/portfolio";
import { OutputModal } from "../components/OutputModal";
import { useReveal } from "../hooks/useReveal";

const repoFilters = ["All", "AI Agent", "LLM", "Knowledge Graph", "Web", "Research"];
const HeroLanyard = lazy(() => import("../components/HeroLanyard").then((module) => ({ default: module.HeroLanyard })));

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="section-heading reveal-item">
      <p className="signal-label">{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

function useGithubRepos() {
  const [repos, setRepos] = useState(githubFallback);

  useEffect(() => {
    let alive = true;
    let refreshTimer;
    let requestTimer;
    let controller;
    const cacheKey = "github-repos-leomjl-v3";
    let cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    } catch {
      localStorage.removeItem(cacheKey);
    }
    const hasValidCache = cached
      && Array.isArray(cached.data)
      && cached.data.length > 0
      && Date.now() - cached.savedAt < 60 * 60 * 1000;
    if (hasValidCache) {
      setRepos(cached.data);
      return undefined;
    }

    const refreshRepos = () => {
      if (!alive) return;
      controller = new AbortController();
      requestTimer = window.setTimeout(() => controller.abort(), 5000);
      fetch("https://api.github.com/users/LeoMjl/repos?sort=updated&per_page=100", { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("GitHub request failed");
          return response.json();
        })
        .then((data) => {
          if (!alive || !Array.isArray(data) || !data.length) return;
          const normalized = data.map((repo, index) => {
            const signals = [repo.name, repo.description, ...(repo.topics || [])].join(" ").toLowerCase();
            const category = signals.includes("memory") || signals.includes("agent") || signals.includes("ai_")
              ? "AI Agent"
              : signals.includes("llm")
                ? "LLM"
                : repo.language === "TypeScript"
                  ? "Web"
                  : "Research";
            return { ...repo, category, featured: index < 3 };
          });
          setRepos(normalized);
          localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), data: normalized }));
        })
        .catch(() => undefined)
        .finally(() => clearTimeout(requestTimer));
    };

    refreshTimer = window.setTimeout(refreshRepos, 7000);
    return () => {
      alive = false;
      clearTimeout(refreshTimer);
      clearTimeout(requestTimer);
      controller?.abort();
    };
  }, []);
  return repos;
}

function GithubSection() {
  const repos = useGithubRepos();
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Featured");
  const visible = useMemo(() => {
    const sourceRepos = Array.isArray(repos) && repos.length ? repos : githubFallback;
    const filtered = filter === "All" ? sourceRepos : sourceRepos.filter((repo) => repo.category === filter || repo.topics?.includes(filter.toLowerCase().replaceAll(" ", "-")));
    return [...filtered]
      .sort((a, b) => {
        if (sort === "Most Stars") return b.stargazers_count - a.stargazers_count;
        if (sort === "Recently Updated") return new Date(b.updated_at) - new Date(a.updated_at);
        return Number(b.featured) - Number(a.featured);
      })
      .slice(0, 12);
  }, [filter, repos, sort]);

  return (
    <section className="content-section github-section" id="open-source">
      <SectionHeading eyebrow="OPEN SOURCE / 03" title="Open Source & Experiments" description="真实仓库数据与持续演进的工程实验。" />
      <div className="repo-toolbar reveal-item">
        <div className="segmented-control" aria-label="仓库分类">
          {repoFilters.map((item) => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)} type="button">{item}</button>)}
        </div>
        <label className="sort-control">
          <span>Sort</span>
          <select onChange={(event) => setSort(event.target.value)} value={sort}>
            <option>Featured</option><option>Recently Updated</option><option>Most Stars</option>
          </select>
        </label>
      </div>
      <div className="repo-grid">
        {visible.map((repo) => (
          <article className="repo-card" key={repo.id}>
            <div className="repo-topline"><GithubLogo size={22} weight="duotone" /><span>{repo.language || "Code"}</span></div>
            <h3>{repo.name}</h3>
            <p>{repo.description || "A practical experiment in agent systems and knowledge workflows."}</p>
            <div className="tag-list">{(repo.topics || []).slice(0, 3).map((topic) => <span key={topic}>{topic}</span>)}</div>
            <div className="repo-meta">
              <span><Star size={15} />{repo.stargazers_count}</span>
              <span><GitFork size={15} />{repo.forks_count}</span>
              <a href={repo.html_url} rel="noreferrer" target="_blank">GitHub <ArrowSquareOut size={15} /></a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  const [activeOutput, setActiveOutput] = useState(null);
  useReveal(activeOutput?.id || "home");
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-copy reveal-item is-visible">
          <p className="hero-role">{profile.role}<span>{profile.secondaryRole.split(" · ")[1]}</span></p>
          <div className="hero-rule" />
          <h1>From research signals<br />to <span>reliable</span> agent systems.</h1>
          <p className="hero-summary">{profile.statementZh}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#selected-projects">Explore Projects <ArrowRight size={18} /></a>
            <span className="availability"><i />{profile.availability}</span>
          </div>
        </div>
        <Suspense fallback={<div className="hero-lanyard"><div className="lanyard-loading">IDENTITY SIGNAL CONNECTING...</div></div>}>
          <HeroLanyard />
        </Suspense>
      </section>

      <section className="content-section focus-section" id="focus">
        <SectionHeading eyebrow="PROFESSIONAL FOCUS / 01" title="Turning research into reliable AI systems" description="选择一个能力方向，进入可拖拽、可缩放的知识图谱，探索方法、工具、项目与成果之间的关系。" />
        <KnowledgeNetwork />
      </section>

      <section className="content-section projects-section" id="selected-projects">
        <SectionHeading eyebrow="SELECTED PROJECTS / 02" title="Systems built around real constraints" description="精选项目强调我的角色、具体工作与可验证产出。" />
        <ProjectCardSwap onOutput={setActiveOutput} projects={featuredProjects} />
        <Link className="text-link reveal-item" to="/projects">View all projects <ArrowRight size={17} /></Link>
      </section>

      <GithubSection />

      <section className="content-section experience-section" id="project-experience">
        <SectionHeading eyebrow="EXPERIENCE / 04" title="Supercomputing Experience" description="聚焦我在国家超算济南中心承担的大模型应用与智能体研发工作。" />
        <div className="experience-timeline">
          {experiences.map((item, index) => (
            <article className="experience-row reveal-item" key={item.id}>
              <div className="timeline-marker"><span>0{index + 1}</span><i /></div>
              <div className="experience-period">{item.period}<small>{item.type}</small></div>
              <div className="experience-content"><h3>{item.organization}</h3><strong>{item.role}</strong><p>{item.summary}</p><div className="tag-list">{item.details.map((detail) => <span key={detail}>{detail}</span>)}</div></div>
            </article>
          ))}
        </div>
        <Link className="text-link reveal-item" to="/experience">Explore full experience <ArrowRight size={17} /></Link>
      </section>

      <section className="content-section blog-section" id="ideas">
        <SectionHeading eyebrow="IDEAS / 05" title="Ideas in Visual Form" description="关于智能体、大模型应用、知识系统与工程实践的记录。" />
        <CircularBlogGallery posts={blogPosts} />
        <Link className="text-link reveal-item" to="/blog">Open the gallery <ArrowRight size={17} /></Link>
      </section>

      <section className="resume-cta reveal-item">
        <div><p className="signal-label">READY TO COLLABORATE</p><h2>Let’s Build Something Meaningful</h2><p>关注 Agent 系统、大模型应用与知识工程研发岗位，也欢迎交流研究和合作机会。</p></div>
        <div className="resume-cta-actions"><Link className="button button-primary" to="/resume">Send Request & Get Resume <ArrowRight size={18} /></Link><a className="button button-secondary" href={profile.github} rel="noreferrer" target="_blank"><GithubLogo size={18} /> GitHub</a></div>
      </section>

      <OutputModal onClose={() => setActiveOutput(null)} output={activeOutput} />
    </>
  );
}
