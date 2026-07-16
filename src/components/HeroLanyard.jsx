import { createElement, useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Pulse } from "@phosphor-icons/react";
import { profile } from "../data/portfolio";
import { useTheme } from "../hooks/useTheme.jsx";
import ReactBitsLanyard from "./ReactBitsLanyard.jsx";

const CARD = { width: 720, height: 1080 };

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function iconDataUrl(Icon, color) {
  const svg = renderToStaticMarkup(createElement(Icon, { color, size: 96, weight: "duotone" }));
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
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
  const sourceY = 0;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

async function makeCardTexture(theme) {
  const isLight = theme === "light";
  const palette = isLight
    ? { bg: "#f7f9ff", panel: "#ffffff", ink: "#10182b", muted: "#536078", line: "#cbd4e7", accent: "#315ceb", purple: "#7655d8" }
    : { bg: "#080d1e", panel: "#0d152b", ink: "#f5f7ff", muted: "#aab4cc", line: "#283450", accent: "#6e8cff", purple: "#9b7bff" };
  const [photo, pulseIcon] = await Promise.all([
    loadImage("/assets/contact-id-photo.jpg"),
    loadImage(iconDataUrl(Pulse, palette.accent)),
  ]);
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
  context.drawImage(pulseIcon, 58, 846, 38, 38);
  context.fillStyle = palette.ink;
  context.font = "600 22px IBM Plex Mono, monospace";
  context.fillText(profile.availability, 108, 876);
  context.fillStyle = palette.muted;
  context.font = "600 18px IBM Plex Mono, monospace";
  context.fillText("RESEARCH FOCUS", 58, 934);
  context.fillStyle = palette.ink;
  context.font = "500 22px Inter, sans-serif";
  context.fillText("Agent / LLM / Graph / Memory", 58, 974);

  return canvas.toDataURL("image/png");
}

export function HeroLanyard() {
  const { resolvedTheme } = useTheme();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    let alive = true;
    setTexture(null);
    makeCardTexture(resolvedTheme).then((value) => alive && setTexture(value));
    return () => {
      alive = false;
    };
  }, [resolvedTheme]);

  return (
    <div className="hero-lanyard" aria-label="可拖拽的个人身份卡">
      {texture ? (
        <ReactBitsLanyard
          anchorPosition={[0, 5.15, 0]}
          cardScale={5}
          fov={22}
          frontImage={texture}
          gravity={[0, -40, 0]}
          imageFit="cover"
          lanyardWidth={1.1}
          position={[0, 0, 24]}
          ropeSegmentLength={1.05}
        />
      ) : (
        <div className="lanyard-loading">身份卡加载中...</div>
      )}
    </div>
  );
}
