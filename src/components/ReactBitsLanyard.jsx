/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";

import cardGLB from "../card.glb";
import lanyardTexture from "../lanyard.png";

extend({ MeshLineGeometry, MeshLineMaterial });

const BLANK_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };
const BASE_CARD_SCALE = 2.25;
const BASE_CARD_JOINT_Y = 1.45;
const CARD_GROUP_OFFSET_Y = -1.2;

function isFiniteVector(vector) {
  return Number.isFinite(vector?.x) && Number.isFinite(vector?.y) && Number.isFinite(vector?.z);
}

function getFrontHotspotFromUv(uv, hotspots) {
  if (!uv || !hotspots?.length) return null;

  const normalizedX = (uv.x - FRONT_UV_RECT.x) / FRONT_UV_RECT.w;
  const normalizedY = (uv.y - FRONT_UV_RECT.y) / FRONT_UV_RECT.h;
  if (normalizedX < 0 || normalizedX > 1 || normalizedY < 0 || normalizedY > 1) return null;

  const yCandidates = [normalizedY, 1 - normalizedY];
  return (
    hotspots.find((hotspot) =>
      yCandidates.some(
        (normalizedTopY) =>
          normalizedX >= hotspot.x &&
          normalizedX <= hotspot.x + hotspot.width &&
          normalizedTopY >= hotspot.y &&
          normalizedTopY <= hotspot.y + hotspot.height,
      ),
    ) ?? null
  );
}

function ReactBitsLanyard({
  anchorPosition = [0, 4, 0],
  cardScale = 2.25,
  contactHotspots = [],
  position = [0, 0, 24],
  gravity = [0, -40, 0],
  fov = 22,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = "cover",
  lanyardImage = null,
  lanyardWidth = 1,
  onContactHotspot = null,
  onReady = null,
  ropeSegmentLength = 1,
  staticMode = false,
}) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="react-bits-lanyard">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        frameloop="always"
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={staticMode ? [0, 0, 0] : gravity} paused={staticMode} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            anchorPosition={anchorPosition}
            backImage={backImage}
            cardScale={cardScale}
            contactHotspots={contactHotspots}
            frontImage={frontImage}
            imageFit={imageFit}
            isMobile={isMobile}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            onContactHotspot={onContactHotspot}
            onReady={onReady}
            ropeSegmentLength={ropeSegmentLength}
            staticMode={staticMode}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            color="white"
            intensity={2}
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color="white"
            intensity={3}
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color="white"
            intensity={3}
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color="white"
            intensity={10}
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({
  anchorPosition = [0, 4, 0],
  cardScale = 2.25,
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  contactHotspots = [],
  imageFit = "cover",
  lanyardImage = null,
  lanyardWidth = 1,
  onContactHotspot = null,
  onReady = null,
  ropeSegmentLength = 1,
  staticMode = false,
}) {
  const band = useRef(null);
  const fixed = useRef(null);
  const j1 = useRef(null);
  const j2 = useRef(null);
  const j3 = useRef(null);
  const card = useRef(null);
  const didSignalReady = useRef(false);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = {
    type: staticMode ? "fixed" : "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };
  const scaleRatio = cardScale / BASE_CARD_SCALE;
  const cardJointY = CARD_GROUP_OFFSET_Y + (BASE_CARD_JOINT_Y - CARD_GROUP_OFFSET_Y) * scaleRatio;

  useEffect(() => {
    if (didSignalReady.current) return;
    didSignalReady.current = true;
    onReady?.();
  }, [onReady]);

  const getLerped = (body) => {
    const translation = body.translation();
    if (!isFiniteVector(translation)) return body.lerped || new THREE.Vector3();
    if (!body.lerped || !isFiniteVector(body.lerped)) {
      body.lerped = new THREE.Vector3().copy(translation);
    }

    return body.lerped;
  };

  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyardImage || lanyardTexture);
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image;
    const width = baseImg.width;
    const height = baseImg.height;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return baseMap;

    context.drawImage(baseImg, 0, 0, width, height);

    const drawFitted = (img, rect) => {
      const rx = rect.x * width;
      const ry = rect.y * height;
      const rw = rect.w * width;
      const rh = rect.h * height;
      const fit = imageFit === "contain" ? Math.min : Math.max;
      const scale = fit(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      context.save();
      context.beginPath();
      context.rect(rx, ry, rw, rh);
      context.clip();
      context.drawImage(img, dx, dy, dw, dh);
      context.restore();
    };

    if (frontImage && frontTex.image) drawFitted(frontTex.image, FRONT_UV_RECT);
    if (backImage && backTex.image) drawFitted(backTex.image, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [backImage, backTex, frontImage, frontTex, imageFit, materials.base.map]);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );
  const initialBandPoints = useMemo(
    () => [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.01, 0),
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(0, 0.03, 0),
    ],
    [],
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState(false);

  useRopeJoint(fixed, j1, [
    [0, 0, 0],
    [0, 0, 0],
    ropeSegmentLength,
  ]);
  useRopeJoint(j1, j2, [
    [0, 0, 0],
    [0, 0, 0],
    ropeSegmentLength,
  ]);
  useRopeJoint(j2, j3, [
    [0, 0, 0],
    [0, 0, 0],
    ropeSegmentLength,
  ]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, cardJointY, 0],
  ]);

  useEffect(() => {
    if (!hovered) return undefined;

    document.body.style.cursor = dragged ? "grabbing" : hoveredHotspot ? "pointer" : "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [dragged, hovered, hoveredHotspot]);

  const handleContactClick = (event) => {
    const hotspot = getFrontHotspotFromUv(event.uv, contactHotspots);
    if (!hotspot || (typeof event.delta === "number" && event.delta > 8)) return;

    event.stopPropagation();
    onContactHotspot?.(hotspot);
  };

  const handleContactHover = (event) => {
    setHoveredHotspot(Boolean(getFrontHotspotFromUv(event.uv, contactHotspots)));
  };

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== "boolean") {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (![fixed, j1, j2, j3, card, band].every((ref) => ref.current)) return;

    [j1, j2].forEach((ref) => {
      const translation = ref.current.translation();
      if (!isFiniteVector(translation)) return;
      const lerped = getLerped(ref.current);
      const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(translation)));
      const alpha = Math.min(1, delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      lerped.lerp(translation, alpha);
    });
    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(getLerped(j2.current));
    curve.points[2].copy(getLerped(j1.current));
    curve.points[3].copy(fixed.current.translation());
    const bandPoints = curve.getPoints(isMobile ? 16 : 32);
    if (bandPoints.every(isFiniteVector)) band.current.geometry.setPoints(bandPoints);
    ang.copy(card.current.angvel());
    rot.copy(card.current.rotation());
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={anchorPosition}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody ref={j1} position={staticMode ? [0, -ropeSegmentLength * 1.5, 0] : [ropeSegmentLength * 0.5, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={j2} position={staticMode ? [0, -ropeSegmentLength * 3, 0] : [ropeSegmentLength, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={j3} position={staticMode ? [0, -ropeSegmentLength * 4.5, 0] : [ropeSegmentLength * 1.5, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          ref={card}
          position={staticMode ? [0, -ropeSegmentLength * 6, 0] : [ropeSegmentLength * 2, 0, 0]}
          {...segmentProps}
          type={staticMode ? "fixed" : dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8 * scaleRatio, 1.125 * scaleRatio, 0.01]} />
          <group
            onPointerDown={(event) => {
              event.target.setPointerCapture(event.pointerId);
              drag(new THREE.Vector3().copy(event.point).sub(vec.copy(card.current.translation())));
            }}
            onPointerOut={() => {
              hover(false);
              setHoveredHotspot(false);
            }}
            onPointerOver={() => hover(true)}
            onPointerUp={(event) => {
              event.target.releasePointerCapture(event.pointerId);
              drag(false);
            }}
            position={[0, CARD_GROUP_OFFSET_Y, -0.05]}
            scale={cardScale}
          >
            <mesh geometry={nodes.card.geometry} onClick={handleContactClick} onPointerMove={handleContactHover}>
              <meshPhysicalMaterial
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                map={cardMap}
                map-anisotropy={16}
                metalness={0.8}
                roughness={0.9}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry points={initialBandPoints} />
        <meshLineMaterial
          color="white"
          depthTest={false}
          lineWidth={lanyardWidth}
          map={texture}
          repeat={[-4, 1]}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
        />
      </mesh>
    </>
  );
}

useGLTF.preload(cardGLB);
useTexture.preload(lanyardTexture);

export default ReactBitsLanyard;
