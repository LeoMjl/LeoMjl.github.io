import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const wrap = (value, length) => ((value % length) + length) % length;
const DRAG_THRESHOLD = 7;

function circularDistance(index, position, length) {
  let distance = index - position;
  distance -= Math.round(distance / length) * length;
  return distance;
}

export function CircularBlogGallery({ posts }) {
  const [position, setPosition] = useState(0);
  const drag = useRef(null);
  const moved = useRef(false);
  const wheelLock = useRef(false);
  const length = posts.length;

  useEffect(() => setPosition(0), [posts]);

  if (!length) return null;

  const activeIndex = wrap(Math.round(position), length);
  const activePost = posts[activeIndex];
  const moveTo = (next) => setPosition((current) => current + circularDistance(wrap(next, length), current, length));

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    drag.current = {
      x: event.clientX,
      pointerId: event.pointerId,
      position,
      current: position,
      lastPosition: position,
      lastTime: event.timeStamp,
      velocity: 0,
      captured: false,
    };
    moved.current = false;
  };

  const onPointerMove = (event) => {
    if (!drag.current) return;
    const delta = event.clientX - drag.current.x;
    if (!moved.current && Math.abs(delta) <= DRAG_THRESHOLD) return;
    if (!moved.current) {
      moved.current = true;
      drag.current.captured = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    const nextPosition = drag.current.position - delta / 285;
    const elapsed = Math.max(1, event.timeStamp - drag.current.lastTime);
    drag.current.velocity = (nextPosition - drag.current.lastPosition) / elapsed;
    drag.current.current = nextPosition;
    drag.current.lastPosition = nextPosition;
    drag.current.lastTime = event.timeStamp;
    setPosition(nextPosition);
  };

  const onPointerUp = (event) => {
    if (!drag.current) return;
    const wasMoved = moved.current;
    const projected = drag.current.current + Math.max(-1.25, Math.min(1.25, drag.current.velocity * 180));
    const captured = drag.current.captured;
    drag.current = null;
    if (captured && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (wasMoved) setPosition(Math.round(projected));
  };

  const onWheel = (event) => {
    if (wheelLock.current) return;
    wheelLock.current = true;
    moveTo(activeIndex + (event.deltaY > 0 || event.deltaX > 0 ? 1 : -1));
    window.setTimeout(() => { wheelLock.current = false; }, 360);
  };

  return (
    <section className="circular-gallery-shell" aria-label="文章环形画廊">
      <div
        className="circular-gallery-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragStart={(event) => event.preventDefault()}
        onWheel={onWheel}
      >
        <div className="circular-gallery-orbit" aria-hidden="true" />
        {posts.map((post, index) => {
          const distance = circularDistance(index, position, length);
          const magnitude = Math.abs(distance);
          const x = distance * 310;
          const y = magnitude * magnitude * 23;
          const scale = Math.max(0.67, 1 - magnitude * 0.12);
          const opacity = Math.max(0, 1 - Math.max(0, magnitude - 2.25) * 0.7);
          const isActive = magnitude < 0.5;
          return (
            <Link
              aria-hidden={magnitude > 2.8}
              className={`circular-gallery-card${isActive ? " is-active" : ""}`}
              draggable={false}
              key={post.slug}
              onClick={(event) => {
                if (moved.current) {
                  event.preventDefault();
                }
              }}
              style={{
                "--card-x": `${x}px`,
                "--card-y": `${y}px`,
                "--card-scale": scale,
                "--card-opacity": opacity,
                "--card-rotate": `${distance * -7}deg`,
                zIndex: 100 - Math.round(magnitude * 10),
              }}
              tabIndex={isActive ? 0 : -1}
              to={`/blog/${post.slug}`}
            >
              <img alt="" decoding="async" draggable="false" loading="lazy" src={post.cover} />
              <span className="circular-card-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="circular-card-copy">
                <span>{post.category}</span>
                <h2>{post.title}</h2>
                <small>{post.publishedAt}</small>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="circular-gallery-caption" aria-live="polite">
        <div>
          <p className="signal-label">SELECTED NOTE / {String(activeIndex + 1).padStart(2, "0")}</p>
          <h3>{activePost.title}</h3>
          <p>{activePost.summary}</p>
        </div>
        <div className="circular-gallery-controls">
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(length).padStart(2, "0")}</span>
          <button aria-label="上一篇" onClick={() => moveTo(activeIndex - 1)} type="button"><ArrowLeft size={20} /></button>
          <button aria-label="下一篇" onClick={() => moveTo(activeIndex + 1)} type="button"><ArrowRight size={20} /></button>
        </div>
      </div>
    </section>
  );
}
