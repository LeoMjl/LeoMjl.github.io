import { useEffect, useRef, useState } from "react";
import { EntryScrollHint } from "./EntryScrollHint";

const WHEEL_THRESHOLD = 80;
const DRAG_THRESHOLD = 60;
const backgroundNodes = Array.from({ length: 10 }, (_, index) => index);

export function WelcomeEntry({ onEnter, phase, preloadImages = [] }) {
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const entryRef = useRef(null);
  const avatarRef = useRef(null);
  const pointerStartRef = useRef(null);
  const wheelDistanceRef = useRef(0);
  const wheelResetRef = useRef(0);

  useEffect(() => {
    const images = ["/assets/contact-id-photo.jpg", ...preloadImages];
    images.forEach((src) => {
      if (!src) return;
      const image = new Image();
      image.decoding = "async";
      image.src = src;
    });
  }, [preloadImages]);

  useEffect(() => {
    if (phase !== "ready") return undefined;
    entryRef.current?.focus({ preventScroll: true });

    const onWheel = (event) => {
      event.preventDefault();
      if (event.deltaY <= 0) {
        wheelDistanceRef.current = Math.max(0, wheelDistanceRef.current + event.deltaY);
        return;
      }

      wheelDistanceRef.current += event.deltaY;
      window.clearTimeout(wheelResetRef.current);
      wheelResetRef.current = window.setTimeout(() => {
        wheelDistanceRef.current = 0;
      }, 420);

      if (wheelDistanceRef.current >= WHEEL_THRESHOLD) onEnter();
    };

    const onKeyDown = (event) => {
      if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
      event.preventDefault();
      onEnter();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(wheelResetRef.current);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onEnter, phase]);

  useEffect(() => {
    const active = phase === "checking" || phase === "ready" || phase === "exiting";
    document.body.classList.toggle("entry-open", active);
    return () => document.body.classList.remove("entry-open");
  }, [phase]);

  const resetPointer = () => {
    pointerStartRef.current = null;
    entryRef.current?.style.setProperty("--entry-drag-shift", "0px");
  };

  const handlePointerDown = (event) => {
    if (phase !== "ready") return;
    pointerStartRef.current = event.clientY;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (event.pointerType === "mouse" && !reducedMotion && window.innerWidth >= 760 && avatarRef.current) {
      const x = (event.clientX / window.innerWidth - 0.5) * 12;
      const y = (event.clientY / window.innerHeight - 0.5) * 9;
      avatarRef.current.style.setProperty("--avatar-x", `${x.toFixed(2)}px`);
      avatarRef.current.style.setProperty("--avatar-y", `${y.toFixed(2)}px`);
    }

    if (phase !== "ready" || pointerStartRef.current === null) return;
    const distance = event.clientY - pointerStartRef.current;
    const shift = Math.max(-46, Math.min(0, distance * 0.22));
    entryRef.current?.style.setProperty("--entry-drag-shift", `${shift}px`);
    if (distance <= -DRAG_THRESHOLD) {
      resetPointer();
      onEnter();
    }
  };

  const handlePointerLeave = () => {
    if (avatarRef.current) {
      avatarRef.current.style.setProperty("--avatar-x", "0px");
      avatarRef.current.style.setProperty("--avatar-y", "0px");
    }
    resetPointer();
  };

  return (
    <section
      aria-label="欢迎进入马江霖的个人数字研究空间"
      className={`welcome-entry is-${phase}`}
      onPointerCancel={resetPointer}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerUp={resetPointer}
      ref={entryRef}
      tabIndex="-1"
    >
      <div aria-hidden="true" className="entry-background-nodes">
        {backgroundNodes.map((node) => <i key={node} />)}
      </div>

      <div className="entry-content">
        <div className={`entry-avatar${avatarLoaded ? " is-loaded" : ""}`} ref={avatarRef}>
          <div aria-hidden="true" className="entry-avatar-placeholder" />
          <img
            alt="马江霖头像"
            decoding="async"
            fetchPriority="high"
            onLoad={() => setAvatarLoaded(true)}
            src="/assets/contact-id-photo.jpg"
          />
        </div>

        <p className="entry-name">JIANGLIN MA</p>
        <h1 id="welcome-title">Welcome to my digital research space.</h1>
        <p className="entry-description">Connecting knowledge,<br />projects and research.</p>
      </div>

      <EntryScrollHint onEnter={onEnter} />
    </section>
  );
}
