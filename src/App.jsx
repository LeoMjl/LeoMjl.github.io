import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { PortfolioLayout } from "./components/PortfolioLayout";
import { profile, projects } from "./data/portfolio";
import { BlogPage } from "./pages/BlogPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { ExperiencePage } from "./pages/ExperiencePage";
import { HomePage } from "./pages/HomePage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ResumePage } from "./pages/ResumePage";

const CapabilityPage = lazy(() => import("./pages/CapabilityPage").then((module) => ({ default: module.CapabilityPage })));

const titles = {
  "/": `${profile.name} | 大模型应用开发工程师`,
  "/projects": `Projects | ${profile.englishName}`,
  "/experience": `Experience | ${profile.englishName}`,
  "/blog": `Ideas | ${profile.englishName}`,
  "/resume": `Resume & Contact | ${profile.englishName}`,
};

function SeoSync() {
  const location = useLocation();
  useEffect(() => {
    const project = projects.find((item) => location.pathname === `/projects/${item.slug}`);
    document.title = project ? `${project.title} | ${profile.englishName}` : titles[location.pathname] || `${profile.englishName} Portfolio`;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", project?.description || "马江霖的 AI Agent、大模型应用、知识工程项目与研究作品集。" );
  }, [location.pathname]);
  return null;
}

export function App() {
  return (
    <>
      <SeoSync />
      <Routes>
        <Route element={<PortfolioLayout />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:slug" element={<ProjectDetailPage />} />
          <Route path="experience" element={<ExperiencePage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="capabilities/:slug" element={<Suspense fallback={<div className="route-loading">LOADING KNOWLEDGE MAP...</div>}><CapabilityPage /></Suspense>} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </>
  );
}
