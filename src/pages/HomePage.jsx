import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowSquareOut,
  GitFork,
  GithubLogo,
  Star,
} from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import { CircularBlogGallery } from "../components/CircularBlogGallery";
import { KnowledgeNetwork } from "../components/KnowledgeNetwork";
import { ProjectCardSwap } from "../components/ProjectCardSwap";
import { WelcomeEntry } from "../components/entry/WelcomeEntry";
import { blogPosts } from "../data/blogPosts";
import {
  experiences,
  githubFallback,
  profile,
  projects,
} from "../data/portfolio";
import { OutputModal } from "../components/OutputModal";
import { useEntryState } from "../hooks/useEntryState";
import { useReveal } from "../hooks/useReveal";

const repoFilters = [
  { value: "All", label: "全部" },
  { value: "AI Agent", label: "智能体" },
  { value: "LLM", label: "大模型" },
  { value: "Knowledge Graph", label: "知识图谱" },
  { value: "Web", label: "Web" },
  { value: "Research", label: "科研" },
];
const HeroLanyard = lazy(() => import("../components/HeroLanyard").then((module) => ({ default: module.HeroLanyard })));
const homeCriticalImages = ["/assets/hero-portrait-rain.png", "/assets/project-agent-cli.png"];

function HeroVisualPlaceholder() {
  return (
    <div aria-hidden="true" className="hero-lanyard hero-visual-placeholder">
      <img alt="" src="/assets/hero-portrait-rain.png" />
      <span />
    </div>
  );
}

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
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let alive = true;
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
      setStatus("loaded");
      return undefined;
    }
    fetch("https://api.github.com/users/LeoMjl/repos?sort=updated&per_page=100")
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
      .catch(() => setRepos(githubFallback))
      .finally(() => alive && setStatus("loaded"));
    return () => {
      alive = false;
    };
  }, []);
  return { repos, status };
}

function GithubSection() {
  const { repos, status } = useGithubRepos();
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
      <SectionHeading eyebrow="OPEN SOURCE / 03" title="开源项目与工程实验" description="真实仓库数据与持续演进的工程实验。" />
      <div className="repo-toolbar reveal-item">
        <div className="segmented-control" aria-label="仓库分类">
          {repoFilters.map((item) => <button className={filter === item.value ? "active" : ""} key={item.value} onClick={() => setFilter(item.value)} type="button">{item.label}</button>)}
        </div>
        <label className="sort-control">
          <span>排序</span>
          <select onChange={(event) => setSort(event.target.value)} value={sort}>
            <option value="Featured">精选优先</option><option value="Recently Updated">最近更新</option><option value="Most Stars">最多星标</option>
          </select>
        </label>
      </div>
      {status === "loading" ? (
        <div className="terminal-loader reveal-item"><span>正在获取仓库...</span><span>正在读取项目元数据...</span><span className="blink">仓库加载中。</span></div>
      ) : null}
      <div className="repo-grid">
        {visible.map((repo) => (
          <article className="repo-card" key={repo.id}>
            <div className="repo-topline"><GithubLogo size={22} weight="duotone" /><span>{repo.language || "代码"}</span></div>
            <h3>{repo.name}</h3>
            <p>{repo.description || "围绕智能体系统与知识工作流开展的工程实验。"}</p>
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
  const location = useLocation();
  const entry = useEntryState({ skip: Boolean(location.hash) });
  useReveal(activeOutput?.id || "home");
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  const shouldLoadHeroLanyard = entry.phase === "exiting" || entry.phase === "entered";

  useEffect(() => {
    if (!location.hash) return undefined;
    const sectionId = decodeURIComponent(location.hash.slice(1));
    const timerId = window.setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY - 96;
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, Math.max(0, top));
      root.style.scrollBehavior = previousScrollBehavior;
    }, 0);
    return () => clearTimeout(timerId);
  }, [location.hash]);

  return (
    <div className={`home-entry-shell is-entry-${entry.phase}`}>
      {entry.shouldRender ? <WelcomeEntry onEnter={entry.enter} phase={entry.phase} preloadImages={homeCriticalImages} /> : null}

      <div className="homepage-content">
      <section className="hero" id="home">
        <div className="hero-copy reveal-item is-visible">
          <p className="hero-role">{profile.role}<span>{profile.secondaryRole.split(" · ")[1]}</span></p>
          <div className="hero-rule" />
          <h1>从研究洞察出发<br />构建<span>可靠</span>的智能体系统。</h1>
          <p className="hero-summary">{profile.statementZh}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#selected-projects">浏览精选项目 <ArrowRight size={18} /></a>
            <span className="availability"><i />{profile.availability}</span>
          </div>
        </div>
        {shouldLoadHeroLanyard ? (
          <Suspense fallback={<HeroVisualPlaceholder />}>
            <HeroLanyard />
          </Suspense>
        ) : <HeroVisualPlaceholder />}
      </section>

      <section className="content-section focus-section" id="focus">
        <SectionHeading eyebrow="PROFESSIONAL FOCUS / 01" title="把研究转化为可靠的 AI 系统" description="选择一个能力方向，进入可旋转、可缩放的 3D 知识球，探索方法、工具、项目与成果之间的关系。" />
        <KnowledgeNetwork />
      </section>

      <section className="content-section projects-section" id="selected-projects">
        <SectionHeading eyebrow="SELECTED PROJECTS / 02" title="围绕真实约束构建系统" description="精选项目强调我的角色、具体工作与可验证产出。" />
        <ProjectCardSwap onOutput={setActiveOutput} projects={featuredProjects} />
        <Link className="text-link reveal-item" to="/projects">查看全部项目 <ArrowRight size={17} /></Link>
      </section>

      <GithubSection />

      <section className="content-section experience-section" id="project-experience">
        <SectionHeading eyebrow="EXPERIENCE / 04" title="国家超算中心研发经历" description="聚焦我在国家超算济南中心承担的大模型应用与智能体研发工作。" />
        <div className="experience-timeline">
          {experiences.map((item, index) => (
            <article className="experience-row reveal-item" key={item.id}>
              <div className="timeline-marker"><span>0{index + 1}</span><i /></div>
              <div className="experience-period">{item.period}<small>{item.type}</small></div>
              <div className="experience-content"><h3>{item.organization}</h3><strong>{item.role}</strong><p>{item.summary}</p><div className="tag-list">{item.details.map((detail) => <span key={detail}>{detail}</span>)}</div></div>
            </article>
          ))}
        </div>
        <Link className="text-link reveal-item" to="/experience">查看完整经历 <ArrowRight size={17} /></Link>
      </section>

      <section className="content-section blog-section" id="ideas">
        <SectionHeading eyebrow="IDEAS / 05" title="持续生长的技术思考" description="关于智能体、大模型应用、知识系统与工程实践的记录。" />
        <CircularBlogGallery posts={blogPosts} />
        <Link className="text-link reveal-item" to="/blog">浏览全部文章 <ArrowRight size={17} /></Link>
      </section>

      <section className="resume-cta reveal-item">
        <div><p className="signal-label">READY TO COLLABORATE</p><h2>一起构建真正有价值的系统</h2><p>关注 Agent 系统、大模型应用与知识工程研发岗位，也欢迎交流研究和合作机会。</p></div>
        <div className="resume-cta-actions"><Link className="button button-primary" to="/resume">联系并获取简历 <ArrowRight size={18} /></Link><a className="button button-secondary" href={profile.github} rel="noreferrer" target="_blank"><GithubLogo size={18} /> GitHub</a></div>
      </section>
      </div>

      <OutputModal onClose={() => setActiveOutput(null)} output={activeOutput} />
    </div>
  );
}
