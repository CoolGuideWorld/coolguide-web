"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import styles from "./ImmersiveGlobeExperience.module.css";

const GLOBE_RADIUS = 1.55;
const ROTATION_SPEED = (Math.PI * 2) / 240;
const PULSE_SECONDS = 8;
const ROTATION_RAMP_SECONDS = 18;
const AUTO_ROTATION_RESUME_DELAY_MS = 5000;
const AUTO_ROTATION_RESUME_BLEND_MS = 1400;
const FRANCE_CLICK_MAX_DELTA_PX = 6;
const CAMERA_MOVE_THRESHOLD_SQ = 0.00001;
const ORBIT_MIN_DISTANCE = 3.95;
const ORBIT_MAX_DISTANCE = 4.95;
const ORBIT_MIN_POLAR_ANGLE = 0.02;
const ORBIT_MAX_POLAR_ANGLE = Math.PI - 0.02;
const EARTH_TEXTURE_DESKTOP = "/world/earth-land-ocean-ice-2048.png";
const EARTH_TEXTURE_MOBILE = "/world/earth-land-ocean-ice-1024.png";
const NASA_TEXTURE_LONGITUDE_OFFSET_DEG = 0;
const FRANCE_COORDINATES = {
  latitude: 46.603354,
  longitude: 1.888334,
};

type TextureState = "loading" | "ready" | "error";

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function latLonToVector3(
  latitudeDeg: number,
  longitudeDeg: number,
  radius: number,
  longitudeOffsetDeg = NASA_TEXTURE_LONGITUDE_OFFSET_DEG
) {
  const latitude = THREE.MathUtils.degToRad(latitudeDeg);
  const longitude = THREE.MathUtils.degToRad(longitudeDeg + longitudeOffsetDeg);
  const cosLatitude = Math.cos(latitude);

  const x = radius * cosLatitude * Math.cos(longitude);
  const y = radius * Math.sin(latitude);
  const z = -radius * cosLatitude * Math.sin(longitude);

  return new THREE.Vector3(x, y, z);
}
function StarField({ isMobile }: { isMobile: boolean }) {
  const dimPositions = useMemo(() => {
    const count = isMobile ? 24 : 34;
    const values = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const radius = THREE.MathUtils.randFloat(8.6, 13.2);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

      const base = i * 3;
      values[base] = radius * Math.sin(phi) * Math.cos(theta);
      values[base + 1] = radius * Math.cos(phi);
      values[base + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    return values;
  }, [isMobile]);

  const tinyPositions = useMemo(() => {
    const count = isMobile ? 8 : 12;
    const values = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const radius = THREE.MathUtils.randFloat(9.4, 14.2);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

      const base = i * 3;
      values[base] = radius * Math.sin(phi) * Math.cos(theta);
      values[base + 1] = radius * Math.cos(phi);
      values[base + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    return values;
  }, [isMobile]);

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dimPositions, 3]}
            count={dimPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#e2ecfb"
          size={0.013}
          sizeAttenuation
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[tinyPositions, 3]}
            count={tinyPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#f0f5ff"
          size={0.019}
          sizeAttenuation
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </points>
    </>
  );
}

function GlobeScene({
  texturePath,
  isMobile,
}: {
  texturePath: string;
  isMobile: boolean;
}) {
  const router = useRouter();
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera as THREE.PerspectiveCamera);
  const earthMap = useLoader(THREE.TextureLoader, texturePath);

  const [hovered, setHovered] = useState(false);
  const [zooming, setZooming] = useState(false);

  const globeGroupRef = useRef<THREE.Group>(null);
  const earthMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const atmosphereRef = useRef<THREE.MeshBasicMaterial>(null);
  const beamMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const introProgressRef = useRef(0);
  const navigatingRef = useRef(false);
  const navigationTimerRef = useRef<number | null>(null);
  const autoRotationFactorRef = useRef(1);
  const isOrbitInteractingRef = useRef(false);
  const lastInteractionAtRef = useRef(0);
  const lastCameraPositionRef = useRef(new THREE.Vector3());
  const francePointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const francePointerMovedRef = useRef(false);
  const controlsMovedSinceFranceDownRef = useRef(false);

  const zoomCameraPosition = useMemo(() => new THREE.Vector3(0.28, -0.03, 3.62), []);

  const franceDirection = useMemo(
    () => latLonToVector3(FRANCE_COORDINATES.latitude, FRANCE_COORDINATES.longitude, 1).normalize(),
    []
  );
  const francePoint = useMemo(
    () => franceDirection.clone().multiplyScalar(GLOBE_RADIUS * 1.008),
    [franceDirection]
  );
  const labelPoint = useMemo(
    () => franceDirection.clone().multiplyScalar(GLOBE_RADIUS * 1.21),
    [franceDirection]
  );

  const beamData = useMemo(() => {
    const direction = franceDirection.clone();
    const length = GLOBE_RADIUS * 1.01;
    const midpoint = direction.clone().multiplyScalar(length * 0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction
    );

    return { direction, length, midpoint, quaternion };
  }, [franceDirection]);

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    earthMap.anisotropy = Math.min(6, maxAnisotropy);
    earthMap.wrapS = THREE.RepeatWrapping;
    earthMap.wrapT = THREE.ClampToEdgeWrapping;
    earthMap.colorSpace = THREE.SRGBColorSpace;
    earthMap.needsUpdate = true;
  }, [earthMap, gl]);

  useEffect(() => {
    lastInteractionAtRef.current = performance.now();
    lastCameraPositionRef.current.copy(camera.position);

    return () => {
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current);
      }
      document.body.style.cursor = "";
    };
  }, [camera]);

  useEffect(() => {
    if (isOrbitInteractingRef.current) {
      document.body.style.cursor = "grabbing";
      return;
    }

    document.body.style.cursor = hovered ? "pointer" : "";
  }, [hovered]);

  const handleHover = (event: ThreeEvent<PointerEvent>, isHovering: boolean) => {
    event.stopPropagation();

    if (isOrbitInteractingRef.current) {
      return;
    }

    setHovered(isHovering);
  };

  const triggerFranceNavigation = () => {
    if (navigatingRef.current) {
      return;
    }

    navigatingRef.current = true;
    setZooming(true);

    navigationTimerRef.current = window.setTimeout(() => {
      router.push("/destinations/france");
    }, 780);
  };

  const markInteraction = () => {
    lastInteractionAtRef.current = performance.now();
  };

  const handleOrbitStart = () => {
    isOrbitInteractingRef.current = true;
    autoRotationFactorRef.current = Math.max(0, autoRotationFactorRef.current - 0.22);
    lastCameraPositionRef.current.copy(camera.position);
    markInteraction();
    if (hovered) {
      setHovered(false);
    }
    document.body.style.cursor = "grabbing";
  };

  const handleOrbitChange = () => {
    if (!isOrbitInteractingRef.current) {
      return;
    }

    const movedDistance = lastCameraPositionRef.current.distanceToSquared(camera.position);
    if (movedDistance > CAMERA_MOVE_THRESHOLD_SQ && francePointerDownRef.current) {
      controlsMovedSinceFranceDownRef.current = true;
    }

    lastCameraPositionRef.current.copy(camera.position);
    markInteraction();
  };

  const handleOrbitEnd = () => {
    isOrbitInteractingRef.current = false;
    markInteraction();
    document.body.style.cursor = "";
  };

  const handleFrancePointerDown = (event: ThreeEvent<PointerEvent>) => {
    francePointerDownRef.current = {
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    };
    francePointerMovedRef.current = false;
    controlsMovedSinceFranceDownRef.current = false;
  };

  const handleFrancePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!francePointerDownRef.current) {
      return;
    }

    const dx = event.nativeEvent.clientX - francePointerDownRef.current.x;
    const dy = event.nativeEvent.clientY - francePointerDownRef.current.y;
    if (Math.hypot(dx, dy) > FRANCE_CLICK_MAX_DELTA_PX) {
      francePointerMovedRef.current = true;
    }
  };

  const resetFrancePointer = () => {
    francePointerDownRef.current = null;
    francePointerMovedRef.current = false;
    controlsMovedSinceFranceDownRef.current = false;
  };

  const handleFrancePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!francePointerDownRef.current) {
      return;
    }

    const dx = event.nativeEvent.clientX - francePointerDownRef.current.x;
    const dy = event.nativeEvent.clientY - francePointerDownRef.current.y;
    const pointerDelta = Math.hypot(dx, dy);

    const shouldNavigate =
      pointerDelta <= FRANCE_CLICK_MAX_DELTA_PX &&
      !francePointerMovedRef.current &&
      !controlsMovedSinceFranceDownRef.current;

    resetFrancePointer();

    if (!shouldNavigate) {
      return;
    }

    event.stopPropagation();
    triggerFranceNavigation();
  };

  useFrame((state, delta) => {
    const globeGroup = globeGroupRef.current;

    if (globeGroup) {
      introProgressRef.current = Math.min(1, introProgressRef.current + delta / 2.7);
      const ramp = smoothstep(0, ROTATION_RAMP_SECONDS, state.clock.getElapsedTime());

      const now = performance.now();
      const inactiveForMs = now - lastInteractionAtRef.current;
      const resumeProgress = smoothstep(
        0,
        AUTO_ROTATION_RESUME_BLEND_MS,
        inactiveForMs - AUTO_ROTATION_RESUME_DELAY_MS
      );
      const targetAutoRotation = isOrbitInteractingRef.current || zooming ? 0 : resumeProgress;
      const blendAlpha = 1 - Math.exp(-4 * delta);
      autoRotationFactorRef.current = THREE.MathUtils.lerp(
        autoRotationFactorRef.current,
        targetAutoRotation,
        blendAlpha
      );

      globeGroup.rotation.y += delta * ROTATION_SPEED * ramp * autoRotationFactorRef.current;
      globeGroup.position.set(0, -0.24, 0);

      const scale = 1 + 0.11 * introProgressRef.current;
      globeGroup.scale.setScalar(scale);
    }

    const elapsed = state.clock.getElapsedTime();
    const pulse = 0.9 + 0.1 * Math.sin((elapsed * Math.PI * 2) / PULSE_SECONDS);
    const hoverBoost = hovered ? 1.2 : 1;

    if (atmosphereRef.current) {
      atmosphereRef.current.opacity = (0.125 + 0.012 * pulse) * introProgressRef.current;
    }

    if (beamMaterialRef.current) {
      beamMaterialRef.current.opacity = (0.09 + 0.022 * pulse) * hoverBoost * introProgressRef.current;
    }

    if (glowMaterialRef.current) {
      glowMaterialRef.current.opacity = (0.16 + 0.04 * pulse) * hoverBoost * introProgressRef.current;
    }

    if (pointLightRef.current) {
      pointLightRef.current.intensity = 0.92 * pulse * hoverBoost * introProgressRef.current;
    }

    if (zooming) {
      const alpha = 1 - Math.exp(-3.5 * delta);
      camera.position.lerp(zoomCameraPosition, alpha);
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <color attach="background" args={["#030a14"]} />

      <ambientLight intensity={0.84} color="#edf5ff" />
      <hemisphereLight intensity={0.78} color="#d7ebff" groundColor="#4d6f8f" />
      <directionalLight position={[3.4, 1.5, 3.6]} intensity={1.14} color="#ffffff" />
      <directionalLight position={[-4.4, -2.1, -3.4]} intensity={0.92} color="#b6d3ef" />

      <StarField isMobile={isMobile} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={!zooming}
        enableRotate
        enableZoom
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.52}
        zoomSpeed={0.36}
        minDistance={ORBIT_MIN_DISTANCE}
        maxDistance={ORBIT_MAX_DISTANCE}
        minPolarAngle={ORBIT_MIN_POLAR_ANGLE}
        maxPolarAngle={ORBIT_MAX_POLAR_ANGLE}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_ROTATE,
        }}
        target={[0, -0.08, 0]}
        onStart={handleOrbitStart}
        onChange={handleOrbitChange}
        onEnd={handleOrbitEnd}
      />

      <group ref={globeGroupRef}>
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
          <meshStandardMaterial
            ref={earthMaterialRef}
            map={earthMap}
            roughness={0.62}
            metalness={0}
            emissive="#22384d"
            emissiveIntensity={0.12}
            color="#ffffff"
            transparent={false}
            opacity={1}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS * 1.034, 72, 72]} />
          <meshBasicMaterial
            ref={atmosphereRef}
            color="#8fc0ea"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS * 1.01, 64, 64]} />
          <meshBasicMaterial
            color="#9f7b42"
            transparent
            opacity={0.026}
            blending={THREE.AdditiveBlending}
            side={THREE.FrontSide}
            depthWrite={false}
          />
        </mesh>

        <mesh position={beamData.midpoint} quaternion={beamData.quaternion}>
          <cylinderGeometry args={[0.045, 0.1, beamData.length, 20, 1, true]} />
          <meshBasicMaterial
            ref={beamMaterialRef}
            color="#f6c772"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh position={francePoint.clone().multiplyScalar(0.6)}>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshBasicMaterial
            color="#f4bf68"
            transparent
            opacity={0.072}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh position={franceDirection.clone().multiplyScalar(GLOBE_RADIUS * 0.9)}>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshBasicMaterial
            ref={glowMaterialRef}
            color="#ffd487"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh position={franceDirection.clone().multiplyScalar(GLOBE_RADIUS * 1.01)}>
          <sphereGeometry args={[0.065, 24, 24]} />
          <meshBasicMaterial
            color="#fff4dd"
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh
          position={francePoint.clone().multiplyScalar(1.16)}
          quaternion={beamData.quaternion}
        >
          <cylinderGeometry args={[0.015, 0.052, 0.48, 18, 1, true]} />
          <meshBasicMaterial
            color="#f8cf86"
            transparent
            opacity={0.078}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <pointLight
          ref={pointLightRef}
          position={franceDirection.clone().multiplyScalar(GLOBE_RADIUS * 0.9)}
          color="#ffd28a"
          intensity={0}
          distance={1.9}
          decay={2}
        />

        <pointLight
          position={franceDirection.clone().multiplyScalar(GLOBE_RADIUS * 0.52)}
          color="#ffdba3"
          intensity={0.34}
          distance={1.45}
          decay={2}
        />

        <mesh
          position={francePoint.clone().multiplyScalar(1.02)}
          onPointerOver={(event) => handleHover(event, true)}
          onPointerOut={(event) => {
            handleHover(event, false);
            resetFrancePointer();
          }}
          onPointerDown={handleFrancePointerDown}
          onPointerMove={handleFrancePointerMove}
          onPointerUp={handleFrancePointerUp}
          onPointerCancel={resetFrancePointer}
        >
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {hovered ? (
          <Html position={labelPoint} center distanceFactor={8}>
            <span className={styles.countryLabel}>France</span>
          </Html>
        ) : null}
      </group>
    </>
  );
}

function GlobeFallback({ message }: { message: string }) {
  return (
    <div className={styles.fallbackPanel} role="status" aria-live="polite">
      <img
        src={EARTH_TEXTURE_MOBILE}
        alt="Globe terrestre"
        className={styles.fallbackImage}
        loading="lazy"
      />
      <p className={styles.fallbackText}>{message}</p>
      <a href="/destinations/france" className={styles.fallbackLink}>
        Voir les pays disponibles
      </a>
    </div>
  );
}

export default function ImmersiveGlobeExperience() {
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [textureState, setTextureState] = useState<TextureState>("loading");

  const isMobile = viewportWidth <= 640;
  const texturePath = isMobile ? EARTH_TEXTURE_MOBILE : EARTH_TEXTURE_DESKTOP;

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);

    return () => {
      window.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setTextureState("loading");

    const image = new window.Image();
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setTextureState("error");
      }
    }, 4500);

    image.onload = () => {
      if (cancelled) {
        return;
      }
      window.clearTimeout(timeout);
      setTextureState("ready");
    };

    image.onerror = () => {
      if (cancelled) {
        return;
      }
      window.clearTimeout(timeout);
      setTextureState("error");
    };

    image.src = texturePath;

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [texturePath]);

  return (
    <>
      <div className={styles.globeShell} aria-label="Globe interactif des destinations">
        {textureState === "error" ? (
          <div className={styles.textureFallbackOverlay}>
            <GlobeFallback message="Texture terrestre indisponible. Utilisez la liste des pays." />
          </div>
        ) : textureState === "ready" ? (
          <Canvas
            className={styles.canvas}
            dpr={[1, 1.7]}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.24,
            }}
            camera={{ fov: 31.5, position: [0.18, -0.1, 4.2], near: 0.1, far: 60 }}
            fallback={<GlobeFallback message="Affichage 3D indisponible sur cet appareil." />}
          >
            <Suspense fallback={null}>
              <GlobeScene texturePath={texturePath} isMobile={isMobile} />
            </Suspense>
          </Canvas>
        ) : (
          <div className={styles.textureFallbackOverlay}>
            <GlobeFallback message="Chargement de la texture terrestre..." />
          </div>
        )}
      </div>

      <p className={styles.helperText}>Faites glisser le globe ou recherchez un pays.</p>
    </>
  );
}
