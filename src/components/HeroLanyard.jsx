import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { profile } from "../data/portfolio";
import { useTheme } from "../hooks/useTheme.jsx";

const ReactBitsLanyard = lazy(() => import("./ReactBitsLanyard.jsx"));
const CARD = { width: 720, height: 1080 };

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.width - sourceWidth) / 2;
  context.drawImage(image, sourceX, 0, sourceWidth, sourceHeight, x, y, width, height);
}

function drawPulse(context, color) {
  context.save();
  context.strokeStyle = color;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(58, 866);
  context.lineTo(68, 866);
  context.lineTo(76, 848);
  context.lineTo(87, 882);
  context.lineTo(97, 858);
  context.lineTo(108, 866);
  context.lineTo(122, 866);
  context.stroke();
  context.restore();
}

async function makeCardTexture(theme) {
  const isLight = theme === "light";
  const palette = isLight
    ? { bg: "#f7f9ff", ink: "#10182b", muted: "#536078", line: "#cbd4e7", accent: "#315ceb", purple: "#7655d8" }
    : { bg: "#080d1e", ink: "#f5f7ff", muted: "#aab4cc", line: "#283450", accent: "#6e8cff", purple: "#9b7bff" };
  const photo = await loadImage("/assets/contact-id-photo.jpg");
  const canvas = document.createElement("canvas");
  canvas.width = CARD.width;
  canvas.height = CARD.height;
  const context = canvas.getContext("2d");

  context.fillStyle = palette.bg;
  context.fillRect(0, 0, CARD.width, CARD.height);
  const sheen = context.createLinearGradient(0, 0, CARD.width, CARD.height);
  sheen.addColorStop(0, isLight ? "rgba(49,92,235,.12)" : "rgba(110,140,255,.17)");
  sheen.addColorStop(0.42, "rgba(0,0,0,0)");
  sheen.addColorStop(1, isLight ? "rgba(118,85,216,.08)" : "rgba(155,123,255,.15)");
  context.fillStyle = sheen;
  context.fillRect(0, 0, CARD.width, CARD.height);

  context.strokeStyle = palette.line;
  context.lineWidth = 3;
  roundedRect(context, 34, 34, 652, 1012, 26);
  context.stroke();
  context.fillStyle = palette.accent;
  context.fillRect(34, 34, 420, 10);
  context.fillStyle = palette.purple;
  context.fillRect(454, 34, 232, 10);

  context.fillStyle = palette.muted;
  context.font = "600 22px IBM Plex Mono, monospace";
  context.fillText("IDENTITY / AGENT SYSTEMS", 58, 100);
  context.textAlign = "right";
  context.fillText("04 / 05", 662, 100);
  context.textAlign = "left";

  context.save();
  roundedRect(context, 58, 142, 604, 448, 20);
  context.clip();
  drawCover(context, photo, 58, 142, 604, 448);
  context.restore();

  const photoShade = context.createLinearGradient(0, 420, 0, 590);
  photoShade.addColorStop(0, "rgba(5,8,22,0)");
  photoShade.addColorStop(1, "rgba(5,8,22,.74)");
  context.fillStyle = photoShade;
  context.fillRect(58, 400, 604, 190);

  context.fillStyle = palette.ink;
  context.font = "700 48px Space Grotesk, Inter, sans-serif";
  context.fillText(profile.englishName, 58, 654);
  context.fillStyle = palette.accent;
  context.font = "700 40px Inter, sans-serif";
  context.fillText(profile.name, 58, 706);
  context.fillStyle = palette.ink;
  context.font = "600 30px Space Grotesk, Inter, sans-serif";
  context.fillText(profile.role, 58, 762);
  context.fillStyle = palette.muted;
  context.font = "500 21px Inter, sans-serif";
  context.fillText(profile.secondaryRole, 58, 798);

  context.strokeStyle = palette.line;
  context.beginPath();
  context.moveTo(58, 830);
  context.lineTo(662, 830);
  context.stroke();
  drawPulse(context, palette.accent);
  context.fillStyle = palette.ink;
  context.font = "600 22px IBM Plex Mono, monospace";
  context.fillText(profile.availability, 136, 876);
  context.fillStyle = palette.muted;
  context.font = "600 18px IBM Plex Mono, monospace";
  context.fillText("RESEARCH FOCUS", 58, 934);
  context.fillStyle = palette.ink;
  context.font = "500 22px Inter, sans-serif";
  context.fillText("Agent / LLM / Graph / Memory", 58, 974);

  return canvas.toDataURL("image/png");
}

function FastIdentityCard() {
  return (
    <div className="fast-id-card">
      <div className="fast-id-card-accent"><i /><i /></div>
      <div className="fast-id-card-top"><span>IDENTITY / AGENT SYSTEMS</span><span>04 / 05</span></div>
      <img alt="马江霖个人照片" decoding="async" fetchPriority="high" src="/assets/contact-id-photo.jpg" />
      <div className="fast-id-card-copy">
        <strong>{profile.englishName}</strong>
        <b>{profile.name}</b>
        <h3>{profile.role}</h3>
        <p>{profile.secondaryRole}</p>
        <div className="fast-id-availability"><i /><span>{profile.availability}</span></div>
        <small>RESEARCH FOCUS</small>
        <p>Agent / LLM / Graph / Memory</p>
      </div>
    </div>
  );
}

function FastLanyard() {
  const drag = useRef(null);
  const frame = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const anchorX = 170;
  const anchorY = 278;

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const settle = (start) => {
    cancelAnimationFrame(frame.current);
    let current = start;
    const tick = () => {
      current = { x: current.x * 0.82, y: current.y * 0.82 };
      if (Math.abs(current.x) < 0.35 && Math.abs(current.y) < 0.35) {
        setOffset({ x: 0, y: 0 });
        return;
      }
      setOffset(current);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  const handlePointerDown = (event) => {
    cancelAnimationFrame(frame.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerX: event.clientX, pointerY: event.clientY, ...offset };
    setDragging(true);
  };
  const handlePointerMove = (event) => {
    if (!drag.current) return;
    const x = Math.max(-150, Math.min(150, drag.current.x + event.clientX - drag.current.pointerX));
    const y = Math.max(-70, Math.min(110, drag.current.y + event.clientY - drag.current.pointerY));
    setOffset({ x, y });
  };
  const handlePointerUp = (event) => {
    if (!drag.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
    setDragging(false);
    settle(offset);
  };

  return (
    <div className={`lanyard-dom-pendulum fast-lanyard${dragging ? " is-dragging" : ""}`}>
      <svg aria-hidden="true" className="lanyard-dom-rope" viewBox="0 0 340 760">
        <path className="lanyard-rope-shadow" d={`M${anchorX} 0 C${anchorX} 105 ${anchorX + offset.x * 0.34} 178 ${anchorX + offset.x} ${anchorY + offset.y}`} />
        <path className="lanyard-rope-main" d={`M${anchorX} 0 C${anchorX} 105 ${anchorX + offset.x * 0.34} 178 ${anchorX + offset.x} ${anchorY + offset.y}`} />
        <path className="lanyard-rope-accent" d={`M${anchorX} 0 C${anchorX} 105 ${anchorX + offset.x * 0.34} 178 ${anchorX + offset.x} ${anchorY + offset.y}`} />
      </svg>
      <div className="lanyard-dom-ring" style={{ transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)` }}><span /></div>
      <button
        aria-label="拖动个人身份牌"
        className="lanyard-dom-card"
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px) rotate(${offset.x * 0.035}deg)` }}
        type="button"
      >
        <FastIdentityCard />
      </button>
    </div>
  );
}

function physicsDelay() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "")) return null;
  if (window.matchMedia("(max-width: 860px)").matches) return null;
  return connection?.effectiveType === "3g" ? 12000 : 6000;
}

export function HeroLanyard() {
  const { resolvedTheme } = useTheme();
  const [texture, setTexture] = useState(null);
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [physicsReady, setPhysicsReady] = useState(false);

  useEffect(() => {
    if (physicsEnabled) return undefined;
    const delay = physicsDelay();
    if (delay === null) return undefined;
    let idleId;
    const timer = window.setTimeout(() => {
      const start = () => setPhysicsEnabled(true);
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(start, { timeout: 6000 });
      else start();
    }, delay);
    return () => {
      clearTimeout(timer);
      if (idleId) window.cancelIdleCallback?.(idleId);
    };
  }, [physicsEnabled]);

  useEffect(() => {
    if (!physicsEnabled) return undefined;
    let alive = true;
    makeCardTexture(resolvedTheme).then((value) => alive && setTexture(value)).catch(() => undefined);
    return () => { alive = false; };
  }, [physicsEnabled, resolvedTheme]);

  return (
    <div className={`hero-lanyard${physicsReady ? " is-physics-ready" : ""}`} aria-label="可拖拽的个人身份卡">
      <FastLanyard />
      {physicsEnabled && texture ? (
        <Suspense fallback={null}>
          <ReactBitsLanyard
            anchorPosition={[0, 5.15, 0]}
            cardScale={5}
            fov={22}
            frontImage={texture}
            gravity={[0, -40, 0]}
            imageFit="cover"
            lanyardWidth={1.1}
            onReady={() => setPhysicsReady(true)}
            position={[0, 0, 24]}
            ropeSegmentLength={1.05}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
