import { Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const CAMERA_DISTANCE = 11.5;

function SupportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function SphereNode({ connected, dimmed, node, onHover, onSelect, selected }) {
  const meshRef = useRef(null);
  const pointerStart = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const pulse = selected ? 1 + Math.sin(state.clock.elapsedTime * 3.1) * 0.09 : 1;
    const base = 0.105 + node.importance * 0.026;
    meshRef.current.scale.setScalar(base * pulse);
  });

  const visibleLabel = selected || connected || node.importance >= 3;
  return (
    <group position={node.position}>
      <mesh
        onPointerDown={(event) => {
          pointerStart.current = [event.clientX, event.clientY];
        }}
        onPointerEnter={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
          onHover(node.id);
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "";
          onHover(null);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          const start = pointerStart.current;
          pointerStart.current = null;
          if (!start || Math.hypot(event.clientX - start[0], event.clientY - start[1]) <= 6) onSelect(node.id);
        }}
        ref={meshRef}
      >
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial color={node.color} opacity={dimmed ? 0.28 : 0.96} transparent />
      </mesh>
      <mesh scale={0.18 + node.importance * 0.03}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial blending={THREE.AdditiveBlending} color={node.color} depthWrite={false} opacity={selected ? 0.24 : connected ? 0.11 : 0.045} transparent />
      </mesh>
      {visibleLabel ? (
        <Html center className={`sphere-label${selected ? " is-selected" : ""}`} distanceFactor={9.5} style={{ pointerEvents: "none" }}>
          <span>{node.name}</span>
          {selected ? <small>{node.nameZh}</small> : null}
        </Html>
      ) : null}
    </group>
  );
}

function Scene({ capability, manualPaused, onHover, onInteraction, onSelect, resetSignal, selectedId }) {
  const controlsRef = useRef(null);
  const targetCamera = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const { camera } = useThree();
  const nodeMap = useMemo(() => new Map(capability.nodes.map((node) => [node.id, node])), [capability.nodes]);
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
    if (!selectedId) return;
    const node = nodeMap.get(selectedId);
    if (!node) return;
    const direction = new THREE.Vector3(...node.position).normalize();
    targetCamera.current = direction.multiplyScalar(CAMERA_DISTANCE);
  }, [nodeMap, selectedId]);

  useEffect(() => {
    camera.position.set(0, 0.4, CAMERA_DISTANCE);
    controlsRef.current?.reset();
    targetCamera.current = null;
  }, [camera, resetSignal]);

  useFrame(() => {
    if (targetCamera.current) {
      camera.position.lerp(targetCamera.current, 0.075);
      camera.lookAt(0, 0, 0);
      if (camera.position.distanceTo(targetCamera.current) < 0.04) targetCamera.current = null;
    }
  });

  const handleHover = (id) => {
    setHoveredId(id);
    onHover(id);
  };

  return (
    <>
      <ambientLight intensity={1.2} />
      <mesh raycast={() => null}>
        <sphereGeometry args={[4.35, 36, 36]} />
        <meshBasicMaterial color="#6e8cff" opacity={0.07} transparent wireframe />
      </mesh>
      <mesh raycast={() => null} scale={1.015}>
        <sphereGeometry args={[4.35, 20, 20]} />
        <meshBasicMaterial color="#6e8cff" opacity={0.025} side={THREE.BackSide} transparent />
      </mesh>

      {capability.links.map((link) => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (!source || !target) return null;
        const highlighted = activeId && (link.source === activeId || link.target === activeId);
        return (
          <Line
            color={highlighted ? source.color : "#7790c2"}
            depthWrite={false}
            key={link.id}
            lineWidth={highlighted ? 1.55 : 0.45}
            opacity={highlighted ? 0.88 : activeId ? 0.07 : 0.16}
            points={[source.position, target.position]}
            raycast={() => null}
            transparent
          />
        );
      })}

      {capability.nodes.map((node) => (
        <SphereNode
          connected={connectedIds.has(node.id)}
          dimmed={Boolean(activeId) && !connectedIds.has(node.id)}
          key={node.id}
          node={node}
          onHover={handleHover}
          onSelect={onSelect}
          selected={selectedId === node.id}
        />
      ))}

      <OrbitControls
        autoRotate={!manualPaused}
        autoRotateSpeed={0.42}
        enableDamping
        enablePan={false}
        maxDistance={15}
        minDistance={8.2}
        onEnd={() => onInteraction("end")}
        onStart={() => {
          targetCamera.current = null;
          onInteraction("start");
        }}
        ref={controlsRef}
        rotateSpeed={0.48}
        zoomSpeed={0.55}
      />
    </>
  );
}

function FallbackGraph({ capability, onSelect, selectedId }) {
  const size = 540;
  const center = size / 2;
  const radius = 205;
  const points = capability.nodes.map((node, index) => {
    const angle = (index / capability.nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { ...node, x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
  });
  const map = new Map(points.map((node) => [node.id, node]));
  return (
    <svg aria-label={`${capability.title} 2D knowledge map`} className="sphere-fallback" viewBox={`0 0 ${size} ${size}`}>
      <circle className="sphere-fallback-shell" cx={center} cy={center} r={radius + 24} />
      {capability.links.map((link) => {
        const source = map.get(link.source); const target = map.get(link.target);
        return <line key={link.id} x1={source.x} x2={target.x} y1={source.y} y2={target.y} />;
      })}
      {points.map((node) => (
        <g className={selectedId === node.id ? "is-selected" : ""} key={node.id} onClick={() => onSelect(node.id)} role="button" tabIndex="0" transform={`translate(${node.x} ${node.y})`}>
          <circle fill={node.color} r={selectedId === node.id ? 9 : 6} />
          {node.importance >= 3 || selectedId === node.id ? <text y="-13">{node.name}</text> : null}
        </g>
      ))}
    </svg>
  );
}

export const KnowledgeSphere = forwardRef(function KnowledgeSphere(
  { capability, manualPaused, onHover, onInteraction, onSelect, resetSignal, selectedId }, ref,
) {
  const [available] = useState(SupportsWebGL);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const hiddenNodes = capability.nodes.map((node) => `${node.name}，${node.nameZh}`).join("；");
  useImperativeHandle(ref, () => ({ focus: () => undefined }), []);

  useEffect(() => {
    const onVisibilityChange = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return (
    <div className="knowledge-sphere" onDoubleClick={(event) => {
      if (event.target.tagName === "CANVAS") onInteraction("reset");
    }}>
      <p className="sr-only">知识图谱包含：{hiddenNodes}</p>
      {available ? (
        <Canvas
          camera={{ fov: 43, near: 0.1, far: 100, position: [0, 0.4, CAMERA_DISTANCE] }}
          dpr={[1, 1.55]}
          frameloop={pageVisible ? "always" : "demand"}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          onPointerMissed={() => onInteraction("blank")}
        >
          <Scene capability={capability} manualPaused={manualPaused} onHover={onHover} onInteraction={onInteraction} onSelect={onSelect} resetSignal={resetSignal} selectedId={selectedId} />
        </Canvas>
      ) : <FallbackGraph capability={capability} onSelect={onSelect} selectedId={selectedId} />}
    </div>
  );
});
