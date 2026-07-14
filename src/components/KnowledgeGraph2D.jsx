import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import { useEffect, useMemo, useRef, useState } from "react";

const WIDTH = 900;
const HEIGHT = 620;
const DEFAULT_VIEW = { x: 0, y: 0, width: WIDTH, height: HEIGHT };

function initialPosition(node, index, total) {
  const angle = (index / Math.max(1, total)) * Math.PI * 2 - Math.PI / 2;
  const source = node.position || [0, 0, 0];
  const radius = 145 + (index % 3) * 42;
  return {
    x: WIDTH / 2 + Math.cos(angle) * radius + source[0] * 11 + source[2] * 5,
    y: HEIGHT / 2 + Math.sin(angle) * radius - source[1] * 10,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function KnowledgeGraph2D({ capability, manualPaused, onInteraction, onSelect, resetSignal, selectedId }) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const dragRef = useRef(null);
  const [frame, setFrame] = useState(0);
  const [view, setView] = useState(DEFAULT_VIEW);
  const [hoveredId, setHoveredId] = useState(null);
  const activeId = hoveredId || selectedId;

  const connectedIds = useMemo(() => {
    const ids = new Set(activeId ? [activeId] : []);
    if (!activeId) return ids;
    capability.links.forEach((link) => {
      if (link.source === activeId) ids.add(link.target);
      if (link.target === activeId) ids.add(link.source);
    });
    return ids;
  }, [activeId, capability.links]);

  useEffect(() => {
    const nodes = capability.nodes.map((node, index) => ({
      ...node,
      ...initialPosition(node, index, capability.nodes.length),
    }));
    const links = capability.links.map((link) => ({ ...link }));
    nodesRef.current = nodes;
    linksRef.current = links;
    setView(DEFAULT_VIEW);

    const simulation = forceSimulation(nodes)
      .force("link", forceLink(links).id((node) => node.id).distance((link) => link.type === "depends_on" ? 112 : 132).strength(0.42))
      .force("charge", forceManyBody().strength((node) => -220 - node.importance * 42))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2).strength(0.08))
      .force("collide", forceCollide().radius((node) => 28 + node.importance * 5).strength(0.92))
      .alphaDecay(0.035)
      .velocityDecay(0.34)
      .on("tick", () => setFrame((value) => value + 1));
    simulationRef.current = simulation;
    return () => simulation.stop();
  }, [capability]);

  useEffect(() => {
    const simulation = simulationRef.current;
    if (!simulation) return;
    if (manualPaused) simulation.stop();
    else simulation.alpha(Math.max(0.22, simulation.alpha())).restart();
  }, [manualPaused]);

  useEffect(() => {
    setView(DEFAULT_VIEW);
    const simulation = simulationRef.current;
    if (!simulation) return;
    nodesRef.current.forEach((node, index) => {
      const position = initialPosition(node, index, nodesRef.current.length);
      node.x = position.x;
      node.y = position.y;
      node.fx = null;
      node.fy = null;
    });
    simulation.alpha(0.9).restart();
  }, [resetSignal]);

  const pointFromEvent = (event) => {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: view.x + ((event.clientX - rect.left) / rect.width) * view.width,
      y: view.y + ((event.clientY - rect.top) / rect.height) * view.height,
    };
  };

  const beginNodeDrag = (event, node) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    dragRef.current = { kind: "node", node, pointerId: event.pointerId, moved: false, startX: point.x, startY: point.y };
    node.fx = node.x;
    node.fy = node.y;
    simulationRef.current?.alphaTarget(0.24).restart();
    onInteraction("start");
  };

  const moveNode = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.kind !== "node") return;
    const point = pointFromEvent(event);
    drag.moved = drag.moved || Math.hypot(point.x - drag.startX, point.y - drag.startY) > 5;
    drag.node.fx = point.x;
    drag.node.fy = point.y;
    setFrame((value) => value + 1);
  };

  const endNodeDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.kind !== "node") return;
    event.currentTarget.releasePointerCapture?.(drag.pointerId);
    drag.node.fx = null;
    drag.node.fy = null;
    simulationRef.current?.alphaTarget(0);
    dragRef.current = null;
    if (!drag.moved) onSelect(drag.node.id);
    onInteraction("end");
  };

  const beginPan = (event) => {
    if (event.target !== event.currentTarget) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { kind: "pan", pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, view };
    onInteraction("start");
  };

  const movePan = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.kind !== "pan") return;
    const rect = svgRef.current.getBoundingClientRect();
    setView({
      ...drag.view,
      x: drag.view.x - ((event.clientX - drag.clientX) / rect.width) * drag.view.width,
      y: drag.view.y - ((event.clientY - drag.clientY) / rect.height) * drag.view.height,
    });
  };

  const endPan = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.kind !== "pan") return;
    event.currentTarget.releasePointerCapture?.(drag.pointerId);
    dragRef.current = null;
    onInteraction("end");
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const ratioX = (event.clientX - rect.left) / rect.width;
    const ratioY = (event.clientY - rect.top) / rect.height;
    const factor = event.deltaY > 0 ? 1.12 : 0.88;
    const width = clamp(view.width * factor, 410, 1350);
    const height = width * (HEIGHT / WIDTH);
    const focusX = view.x + ratioX * view.width;
    const focusY = view.y + ratioY * view.height;
    setView({ x: focusX - ratioX * width, y: focusY - ratioY * height, width, height });
    onInteraction("end");
  };

  const nodeMap = new Map(nodesRef.current.map((node) => [node.id, node]));
  void frame;

  return (
    <div className="knowledge-graph-2d">
      <p className="sr-only">知识图谱包含：{capability.nodes.map((node) => `${node.name}，${node.nameZh}`).join("；")}</p>
      <svg
        aria-label={`${capability.title} 可拖拽力导向知识图谱`}
        onPointerCancel={endPan}
        onPointerDown={beginPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onWheel={handleWheel}
        ref={svgRef}
        role="img"
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
      >
        <defs>
          <filter id="node-glow" height="260%" width="260%" x="-80%" y="-80%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <g className="graph-2d-links">
          {linksRef.current.map((link) => {
            const source = typeof link.source === "object" ? link.source : nodeMap.get(link.source);
            const target = typeof link.target === "object" ? link.target : nodeMap.get(link.target);
            if (!source || !target) return null;
            const highlighted = activeId && (source.id === activeId || target.id === activeId);
            return <line className={highlighted ? "is-highlighted" : activeId ? "is-dimmed" : ""} key={link.id} x1={source.x} x2={target.x} y1={source.y} y2={target.y} />;
          })}
        </g>
        <g className="graph-2d-nodes">
          {nodesRef.current.map((node) => {
            const selected = selectedId === node.id;
            const connected = connectedIds.has(node.id);
            const dimmed = Boolean(activeId) && !connected;
            return (
              <g
                className={`${selected ? "is-selected " : ""}${connected ? "is-connected " : ""}${dimmed ? "is-dimmed" : ""}`}
                key={node.id}
                onFocus={() => setHoveredId(node.id)}
                onKeyDown={(event) => { if (event.key === "Enter") onSelect(node.id); }}
                onPointerCancel={endNodeDrag}
                onPointerDown={(event) => beginNodeDrag(event, node)}
                onPointerEnter={() => setHoveredId(node.id)}
                onPointerLeave={() => setHoveredId(null)}
                onPointerMove={moveNode}
                onPointerUp={endNodeDrag}
                role="button"
                tabIndex="0"
                transform={`translate(${node.x || 0} ${node.y || 0})`}
              >
                <circle className="graph-node-glow" fill={node.color} r={24 + node.importance * 3} />
                <circle className="graph-node-dot" fill={node.color} r={6 + node.importance * 1.6} />
                <g className="graph-node-label" transform={`translate(0 ${-20 - node.importance * 2})`}>
                  <rect height="28" rx="4" width={Math.max(82, node.name.length * 6.4 + 20)} x={-Math.max(82, node.name.length * 6.4 + 20) / 2} y="-20" />
                  <text>{node.name}</text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
