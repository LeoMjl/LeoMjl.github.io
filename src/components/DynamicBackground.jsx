import { useEffect, useRef } from "react";
import { useTheme } from "../hooks/useTheme.jsx";

export function DynamicBackground() {
  const canvasRef = useRef(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { alpha: true });
    const staticMode = new URLSearchParams(window.location.search).has("qa");
    const reduceMotion = staticMode || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.innerWidth < 760;
    const count = reduceMotion ? 18 : compact ? 24 : 46;
    let width = 0;
    let height = 0;
    let frame = 0;
    let active = true;
    const pointer = { x: -1000, y: -1000 };
    const nodes = Array.from({ length: count }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * (0.00008 + (index % 4) * 0.00001),
      vy: (Math.random() - 0.5) * (0.00006 + (index % 3) * 0.00001),
      size: index % 7 === 0 ? 2.2 : 1.25,
    }));

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      if (!active) return;
      context.clearRect(0, 0, width, height);
      const line = resolvedTheme === "dark" ? "110,140,255" : "49,92,235";
      const point = resolvedTheme === "dark" ? "171,186,255" : "49,92,235";

      nodes.forEach((node) => {
        if (!reduceMotion) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < -0.05 || node.x > 1.05) node.vx *= -1;
          if (node.y < -0.05 || node.y > 1.05) node.vy *= -1;
        }
        const x = node.x * width;
        const y = node.y * height;
        const distance = Math.hypot(pointer.x - x, pointer.y - y);
        const lift = distance < 180 ? 0.7 : 0.35;
        context.beginPath();
        context.arc(x, y, node.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(${point},${lift})`;
        context.fill();
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const ax = nodes[i].x * width;
          const ay = nodes[i].y * height;
          const bx = nodes[j].x * width;
          const by = nodes[j].y * height;
          const distance = Math.hypot(ax - bx, ay - by);
          if (distance > 155) continue;
          context.beginPath();
          context.moveTo(ax, ay);
          context.lineTo(bx, by);
          context.strokeStyle = `rgba(${line},${(1 - distance / 155) * 0.16})`;
          context.lineWidth = 0.7;
          context.stroke();
        }
      }

      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };

    const onPointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const onVisibility = () => {
      active = document.visibilityState === "visible";
      if (active && !reduceMotion) frame = requestAnimationFrame(draw);
      else cancelAnimationFrame(frame);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [resolvedTheme]);

  return <canvas aria-hidden="true" className="dynamic-background" ref={canvasRef} />;
}
