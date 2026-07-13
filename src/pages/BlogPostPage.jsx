import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Clock } from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { blogPosts, headingId } from "../data/blogPosts";
import { profile } from "../data/portfolio";

export function BlogPostPage() {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.slug === slug);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!post) return <div className="route-page empty-state"><h1>Article not found.</h1><Link to="/blog">返回 Blog</Link></div>;
  const index = blogPosts.findIndex((item) => item.slug === slug);
  const previous = blogPosts[index - 1];
  const next = blogPosts[index + 1];

  return (
    <article className="article-page">
      <div className="reading-progress" style={{ "--progress": `${progress}%` }} />
      <Link className="back-link" to="/blog"><ArrowLeft size={17} /> Blog</Link>
      <header className="article-header"><p className="signal-label">{post.category}</p><h1>{post.title}</h1><p>{post.summary}</p><div><span>{post.publishedAt}</span><span><Clock size={15} />{post.readingTime}</span><span>{profile.englishName}</span></div></header>
      <img className="article-cover" alt={`${post.title} 封面`} src={post.cover} />
      <div className="article-layout">
        <aside className="article-toc"><span>CONTENTS</span>{post.headings.map((heading) => <a href={`#${heading.id}`} key={heading.id}>{heading.label}</a>)}</aside>
        <div className="article-body">
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 id={headingId(String(children))}>{children}</h2>,
              img: ({ alt, ...props }) => <span className="article-figure"><img alt={alt || "文章配图"} loading="lazy" {...props} /><small>{alt}</small></span>,
              a: (props) => <a {...props} rel="noreferrer" target="_blank" />,
            }}
            remarkPlugins={[remarkGfm]}
          >{post.markdown}</ReactMarkdown>
        </div>
        <aside className="article-info"><span>TOPICS</span><div className="tag-list">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><p>本文来自我的 Obsidian Blog 知识库，记录当前阶段的研究、产品观察与工程实践。</p></aside>
      </div>
      <nav className="article-pagination">{previous ? <Link to={`/blog/${previous.slug}`}><ArrowLeft size={17} /><span>Previous<strong>{previous.title}</strong></span></Link> : <span />}{next ? <Link to={`/blog/${next.slug}`}><span>Next<strong>{next.title}</strong></span><ArrowRight size={17} /></Link> : null}</nav>
    </article>
  );
}
