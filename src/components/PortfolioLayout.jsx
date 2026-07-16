import { useEffect, useState } from "react";
import { ArrowRight, List, Moon, Sun, X } from "@phosphor-icons/react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { navigation, profile } from "../data/portfolio";
import { useTheme } from "../hooks/useTheme.jsx";
import { DynamicBackground } from "./DynamicBackground";

export function PortfolioLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHomeHref, setActiveHomeHref] = useState("/");
  const location = useLocation();
  const { cycleTheme, mode, resolvedTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    if (!location.hash) window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") return undefined;

    const sectionMap = [
      { id: "home", href: "/" },
      { id: "focus", href: "/#focus" },
      { id: "selected-projects", href: "/#selected-projects" },
      { id: "project-experience", href: "/#project-experience" },
      { id: "ideas", href: "/#ideas" },
    ];
    let frameId = 0;

    const updateActiveSection = () => {
      frameId = 0;
      const readingLine = window.scrollY + Math.min(window.innerHeight * 0.34, 280);
      let nextHref = "/";
      sectionMap.forEach(({ id, href }) => {
        const section = document.getElementById(id);
        if (section && section.offsetTop <= readingLine) nextHref = href;
      });
      setActiveHomeHref((current) => current === nextHref ? current : nextHref);
    };

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [location.pathname]);

  const routeSection = location.pathname.split("/")[1];
  const routeHref = navigation.find((item) => item.section === routeSection)?.href;
  const activeHref = location.pathname === "/" ? activeHomeHref : routeHref;

  const themeLabel = mode === "system" ? `跟随系统，当前${resolvedTheme === "dark" ? "深色" : "浅色"}` : `${mode === "dark" ? "深色" : "浅色"}主题`;

  return (
    <div className="site-app">
      <DynamicBackground />
      <header className={scrolled ? "site-header is-scrolled" : "site-header"}>
        <Link className="wordmark" to="/" aria-label="返回首页">
          <strong>{profile.englishName}</strong>
          <span>AI SYSTEMS / RESEARCH</span>
        </Link>

        <nav aria-label="主要导航" className={menuOpen ? "primary-nav is-open" : "primary-nav"}>
          {navigation.map((item) => (
            <Link aria-current={activeHref === item.href ? "page" : undefined} className={activeHref === item.href ? "active" : undefined} key={item.href} to={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button className="icon-button theme-button" onClick={cycleTheme} type="button" aria-label={`切换主题：${themeLabel}`} title={themeLabel}>
            {resolvedTheme === "dark" ? <Moon size={19} weight="duotone" /> : <Sun size={19} weight="duotone" />}
          </button>
          <Link className="button button-secondary resume-button" to="/resume">
            Get Resume <ArrowRight size={17} weight="bold" />
          </Link>
          <button className="icon-button menu-toggle" onClick={() => setMenuOpen((value) => !value)} type="button" aria-label={menuOpen ? "关闭菜单" : "打开菜单"}>
            {menuOpen ? <X size={21} /> : <List size={21} />}
          </button>
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>
          <strong>{profile.englishName}</strong>
          <span>Agent systems · LLM applications · Knowledge engineering</span>
        </div>
        <div className="footer-links">
          <a href={profile.github} rel="noreferrer" target="_blank">GitHub</a>
          <Link to="/resume">Contact</Link>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
