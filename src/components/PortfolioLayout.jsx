import { useEffect, useState } from "react";
import { ArrowRight, List, Moon, Sun, X } from "@phosphor-icons/react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { navigation, profile } from "../data/portfolio";
import { useTheme } from "../hooks/useTheme.jsx";
import { DynamicBackground } from "./DynamicBackground";

export function PortfolioLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

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
            <NavLink end={item.href === "/"} key={item.href} to={item.href}>
              {item.label}
            </NavLink>
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
