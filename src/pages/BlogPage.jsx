import { useMemo } from "react";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import { Link, useSearchParams } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";
import { useReveal } from "../hooks/useReveal";

const categories = ["All", ...new Set(blogPosts.map((post) => post.category))];

export function BlogPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "All";
  const query = params.get("q") || "";
  const visible = useMemo(() => blogPosts
    .filter((post) => category === "All" || post.category === category)
    .filter((post) => `${post.title} ${post.summary} ${post.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  useReveal(`${category}-${query}`);

  const patchParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "All") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  return (
    <div className="route-page blog-route">
      <header className="route-hero blog-route-hero reveal-item is-visible">
        <p className="signal-label">FIELD NOTES / 03</p>
        <h1>Ideas in motion.</h1>
        <p>记录 Agent 架构、大模型应用与工程实践。以不同尺度浏览研究、产品观察与工程笔记。</p>
      </header>
      <div className="blog-tools reveal-item">
        <label className="search-field"><MagnifyingGlass size={19} /><input aria-label="搜索文章" onChange={(event) => patchParam("q", event.target.value)} placeholder="搜索标题、主题或关键词" value={query} /></label>
        <span className="blog-result-count">{String(visible.length).padStart(2, "0")} ARTICLES</span>
      </div>
      <div className="segmented-control blog-categories reveal-item">{categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => patchParam("category", item)} type="button">{item}</button>)}</div>
      {visible.length ? (
        <div className="blog-masonry">
          {visible.map((post, index) => (
            <Link className={`gallery-post gallery-post-${index + 1} reveal-item`} key={post.slug} to={`/blog/${post.slug}`}>
              <img alt={`${post.title} 封面`} decoding="async" loading="lazy" src={post.cover} />
              <div className="gallery-overlay">
                <div><span>{post.category}</span><ArrowRight size={19} /></div>
                <h2>{post.title}</h2>
                <p>{post.summary}</p>
                <small>{post.publishedAt} · {post.readingTime}</small>
                <div className="tag-list">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : <div className="empty-state"><h2>没有匹配的文章</h2><button className="button button-secondary" onClick={() => setParams({})} type="button">清除筛选</button></div>}
    </div>
  );
}
