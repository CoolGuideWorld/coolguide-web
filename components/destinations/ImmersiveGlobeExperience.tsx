"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  Suspense,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  AVAILABLE_DESTINATION_COUNTRIES,
  type AvailableCountry,
} from "./availableCountries";
import styles from "./ImmersiveGlobeExperience.module.css";

const GLOBE_RADIUS = 1.55;
const ROTATION_SPEED = (Math.PI * 2) / 240;
const PULSE_SECONDS = 8;
const ROTATION_RAMP_SECONDS = 18;
const AUTO_ROTATION_RESUME_DELAY_MS = 5000;
const AUTO_ROTATION_RESUME_BLEND_MS = 1400;
const COUNTRY_CLICK_MAX_DELTA_PX = 6;
const CAMERA_MOVE_THRESHOLD_SQ = 0.00001;
const ORBIT_MIN_DISTANCE = 3.95;
const ORBIT_MAX_DISTANCE = 4.95;
const ORBIT_MIN_POLAR_ANGLE = 0.02;
const ORBIT_MAX_POLAR_ANGLE = Math.PI - 0.02;
const EARTH_TEXTURE_DESKTOP = "/world/earth-land-ocean-ice-2048.png";
const EARTH_TEXTURE_MOBILE = "/world/earth-land-ocean-ice-1024.png";
const NASA_TEXTURE_LONGITUDE_OFFSET_DEG = 0;
const FOCUS_DURATION_MS = 1150;
const FOCUS_PULSE_DURATION_MS = 1200;
const FOCUS_CENTER_TOLERANCE_RAD = THREE.MathUtils.degToRad(10);
const FOCUS_CAMERA_POSITION = new THREE.Vector3(0.18, -0.1, 3.92);
const FOCUS_DIRECTION = new THREE.Vector3(0.03, 0.06, 0.9975).normalize();
const EUROPE_INITIAL_VIEW = {
  latitude: 48,
  longitude: 8,
};

const EARTH_ATMOSPHERE_VERTEX_SHADER = `
varying vec3 vViewNormal;
varying vec3 vViewDirection;
varying vec3 vWorldNormal;

void main() {
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  vViewNormal = normalize(normalMatrix * normal);
  vViewDirection = normalize(-modelViewPosition.xyz);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);

  gl_Position = projectionMatrix * modelViewPosition;
}
`;

const EARTH_ATMOSPHERE_FRAGMENT_SHADER = `
uniform vec3 uColor;
uniform vec3 uDeepColor;
uniform vec3 uLightDirection;
uniform float uOpacity;
uniform float uPower;
uniform float uIntro;

varying vec3 vViewNormal;
varying vec3 vViewDirection;
varying vec3 vWorldNormal;

void main() {
  float ndv = max(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0);
  float rimCore = pow(1.0 - ndv, uPower + 0.45);
  float rimSoft = pow(1.0 - ndv, max(1.18, uPower * 0.38));
  float fresnel = mix(rimSoft * 0.72, rimCore, 0.58);

  float directional = clamp(dot(normalize(vWorldNormal), normalize(uLightDirection)) * 0.5 + 0.5, 0.0, 1.0);
  float atmosphericIntensity = fresnel * (0.6 + 0.4 * directional) * uOpacity * uIntro;
  float edgeFade = smoothstep(0.04, 0.98, 1.0 - ndv);
  atmosphericIntensity *= edgeFade;

  vec3 atmosphericColor = mix(uDeepColor, uColor, 0.58 + 0.42 * directional);
  float alpha = atmosphericIntensity * (0.86 + 0.14 * rimSoft);

  gl_FragColor = vec4(atmosphericColor, alpha);
}
`;

type TextureState = "loading" | "ready" | "error";

type FocusAnimation = {
  country: AvailableCountry;
  startAtMs: number;
  durationMs: number;
  fromQuaternion: THREE.Quaternion;
  toQuaternion: THREE.Quaternion;
  fromCameraPosition: THREE.Vector3;
  toCameraPosition: THREE.Vector3;
};

type GlobeSceneHandle = {
  focusCountry: (country: AvailableCountry) => void;
  isCountryCentered: (country: AvailableCountry) => boolean;
};

export type ImmersiveGlobeExperienceHandle = {
  focusCountry: (country: AvailableCountry) => void;
  isCountryCentered: (country: AvailableCountry) => boolean;
};

type ImmersiveGlobeExperienceProps = {
  activeCountry?: AvailableCountry | null;
  onFocusStateChange?: (isFocusingCountry: boolean) => void;
};

const COUNTRY_LABEL_OFFSET_BY_SLUG: Record<string, [number, number, number]> = {
  france: [0, 0, 0],
};

function CountryLabel({
  country,
  position,
  isFocused,
}: {
  country: AvailableCountry;
  position: THREE.Vector3;
  isFocused: boolean;
}) {
  return (
    <Html
      position={position}
      center
      transform={false}
      style={{ pointerEvents: "none" }}
    >
      <span
        className={`${styles.countryLabel} ${isFocused ? styles.countryLabelFocused : ""}`.trim()}
      >
        {country.name}
      </span>
    </Html>
  );
}

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

function getInitialGlobeQuaternion(latitudeDeg: number, longitudeDeg: number) {
  const direction = latLonToVector3(latitudeDeg, longitudeDeg, 1).normalize();
  return new THREE.Quaternion().setFromUnitVectors(direction, FOCUS_DIRECTION);
}

function StarField({ isMobile }: { isMobile: boolean }) {
  const farPositions = useMemo(() => {
    const count = isMobile ? 128 : 240;
    const values = new Float32Array(count * 3);
    let index = 0;
    let attempts = 0;

    while (index < count && attempts < count * 10) {
      attempts += 1;

      const radius = THREE.MathUtils.randFloat(9.8, 14.8);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      if (Math.abs(x) < 2.0 && Math.abs(y + 0.14) < 1.55 && z > 0) {
        continue;
      }

      const base = index * 3;
      values[base] = x;
      values[base + 1] = y;
      values[base + 2] = z;
      index += 1;
    }

    return values;
  }, [isMobile]);

  const midPositions = useMemo(() => {
    const count = isMobile ? 54 : 96;
    const values = new Float32Array(count * 3);
    let index = 0;
    let attempts = 0;

    while (index < count && attempts < count * 10) {
      attempts += 1;

      const radius = THREE.MathUtils.randFloat(8.8, 12.6);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      if (Math.abs(x) < 1.78 && Math.abs(y + 0.11) < 1.34 && z > 0) {
        continue;
      }

      const base = index * 3;
      values[base] = x;
      values[base + 1] = y;
      values[base + 2] = z;
      index += 1;
    }

    return values;
  }, [isMobile]);

  const nearPositions = useMemo(() => {
    const count = isMobile ? 12 : 20;
    const values = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const radius = THREE.MathUtils.randFloat(8.2, 10.2);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

      const base = i * 3;
      values[base] = radius * Math.sin(phi) * Math.cos(theta);
      values[base + 1] = radius * Math.cos(phi);
      values[base + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    return values;
  }, [isMobile]);

  const milkyWayDustPositions = useMemo(() => {
    const count = isMobile ? 210 : 440;
    const values = new Float32Array(count * 3);
    const tangent = new THREE.Vector3(0.86, -0.47, -0.18).normalize();
    const normal = new THREE.Vector3(0.12, 0.32, -0.94).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
    const center = new THREE.Vector3(0.15, 0.18, -8.4);

    for (let i = 0; i < count; i += 1) {
      const along = THREE.MathUtils.randFloatSpread(17.5);
      const band = THREE.MathUtils.randFloatSpread(isMobile ? 1.4 : 1.85);
      const depth = THREE.MathUtils.randFloatSpread(isMobile ? 1.05 : 1.25);

      const point = center
        .clone()
        .addScaledVector(tangent, along)
        .addScaledVector(normal, band)
        .addScaledVector(binormal, depth);

      const base = i * 3;
      values[base] = point.x;
      values[base + 1] = point.y;
      values[base + 2] = point.z;
    }

    return values;
  }, [isMobile]);

  const nearMaterialRef = useRef<THREE.PointsMaterial>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  useFrame((state) => {
    if (!nearMaterialRef.current || reducedMotion) {
      return;
    }

    const subtlePulse = 0.16 + 0.028 * Math.sin(state.clock.getElapsedTime() * 0.72);
    nearMaterialRef.current.opacity = subtlePulse;
  });

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[milkyWayDustPositions, 3]}
            count={milkyWayDustPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#d5deea"
          size={isMobile ? 0.0095 : 0.0115}
          sizeAttenuation
          transparent
          opacity={isMobile ? 0.072 : 0.102}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[farPositions, 3]}
            count={farPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#dde5f2"
          size={0.0095}
          sizeAttenuation
          transparent
          opacity={isMobile ? 0.115 : 0.145}
          depthWrite={false}
        />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[midPositions, 3]}
            count={midPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#e8eff8"
          size={isMobile ? 0.0115 : 0.0145}
          sizeAttenuation
          transparent
          opacity={isMobile ? 0.15 : 0.195}
          depthWrite={false}
        />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[nearPositions, 3]}
            count={nearPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={nearMaterialRef}
          color="#f3f6ff"
          size={isMobile ? 0.015 : 0.019}
          sizeAttenuation
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </points>
    </>
  );
}

function CountryDiscoverySignal({
  country,
  countryVector,
  isHovered,
  isFocused,
  isNavigating,
  isMobile,
  focusPulseVersion,
}: {
  country: AvailableCountry;
  countryVector: THREE.Vector3;
  isHovered: boolean;
  isFocused: boolean;
  isNavigating: boolean;
  isMobile: boolean;
  focusPulseVersion: number;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const haloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const haloSoftMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const pointCoreRef = useRef<THREE.MeshBasicMaterial>(null);
  const pointShellRef = useRef<THREE.MeshBasicMaterial>(null);
  const dustMaterialRef = useRef<THREE.PointsMaterial>(null);
  const dustGeometryRef = useRef<THREE.BufferGeometry>(null);
  const focusPulseStartedAtRef = useRef(0);

  const orientation = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        countryVector.clone().normalize()
      ),
    [countryVector]
  );

  const origin = useMemo(
    () => countryVector.clone().multiplyScalar(GLOBE_RADIUS * 1.008),
    [countryVector]
  );

  const particleCount = isMobile ? 30 : 56;
  const dustHeight = isMobile ? 0.34 : 0.5;
  const dustBaseWidth = isMobile ? 0.04 : 0.052;

  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const progress = new Float32Array(particleCount);
    const angle = new Float32Array(particleCount);
    const speed = new Float32Array(particleCount);
    const driftAmp = new Float32Array(particleCount);
    const driftFreq = new Float32Array(particleCount);
    const phase = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i += 1) {
      const p = Math.pow(Math.random(), 1.6);
      const a = Math.random() * Math.PI * 2;
      const palette = Math.random();
      const tone = 1 - p * 0.62;

      progress[i] = p;
      angle[i] = a;
      speed[i] = THREE.MathUtils.randFloat(0.02, 0.05) * (isMobile ? 0.78 : 1);
      driftAmp[i] = THREE.MathUtils.randFloat(0.0018, 0.0086) * (isMobile ? 0.82 : 1);
      driftFreq[i] = THREE.MathUtils.randFloat(0.55, 1.2);
      phase[i] = Math.random() * Math.PI * 2;

      const spread = (0.009 + dustBaseWidth * Math.pow(p, 1.32)) * THREE.MathUtils.randFloat(0.75, 1.15);
      const base = i * 3;

      positions[base] = Math.cos(a) * spread;
      positions[base + 1] = p * dustHeight;
      positions[base + 2] = Math.sin(a) * spread;

      if (palette < 0.34) {
        colors[base] = 1 * tone;
        colors[base + 1] = 0.945 * tone;
        colors[base + 2] = 0.75 * tone;
      } else if (palette < 0.68) {
        colors[base] = 0.91 * tone;
        colors[base + 1] = 0.77 * tone;
        colors[base + 2] = 0.42 * tone;
      } else {
        colors[base] = 0.73 * tone;
        colors[base + 1] = 0.54 * tone;
        colors[base + 2] = 0.21 * tone;
      }
    }

    return { positions, progress, angle, speed, driftAmp, driftFreq, phase, colors };
  }, [dustBaseWidth, dustHeight, isMobile, particleCount]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    focusPulseStartedAtRef.current = performance.now();
  }, [focusPulseVersion]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const motionScale = reducedMotion ? 0 : 1;
    const hoverBoost = isHovered ? 0.08 : 0;
    const focusBoost = isFocused ? 0.12 : 0;

    let oneShotPulse = 0;
    if (focusPulseStartedAtRef.current > 0) {
      const progress = Math.max(
        0,
        Math.min(
          1,
          (performance.now() - focusPulseStartedAtRef.current) / FOCUS_PULSE_DURATION_MS
        )
      );
      oneShotPulse = Math.sin(progress * Math.PI) * 0.2;
      if (progress >= 1) {
        focusPulseStartedAtRef.current = 0;
      }
    }

    const emphasis = isNavigating ? 1 : 1 + hoverBoost + focusBoost + oneShotPulse;
    const haloPulse = reducedMotion
      ? 1
      : 1 + (0.06 + oneShotPulse * 0.3) * (0.5 + 0.5 * Math.sin(elapsed * 1.9));

    if (haloRef.current) {
      haloRef.current.scale.setScalar(haloPulse);
    }

    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = (0.2 + oneShotPulse * 0.12) * emphasis;
    }

    if (haloSoftMaterialRef.current) {
      haloSoftMaterialRef.current.opacity = (0.075 + oneShotPulse * 0.06) * emphasis;
    }

    if (pointCoreRef.current) {
      pointCoreRef.current.opacity = 0.92 * emphasis;
    }

    if (pointShellRef.current) {
      pointShellRef.current.opacity = 0.46 * emphasis;
    }

    if (dustMaterialRef.current) {
      dustMaterialRef.current.opacity = (0.32 + oneShotPulse * 0.07) * emphasis;
    }

    if (!motionScale || !dustGeometryRef.current) {
      return;
    }

    const positions = particleData.positions;
    const { progress, angle, speed, driftAmp, driftFreq, phase } = particleData;
    const len = progress.length;

    for (let i = 0; i < len; i += 1) {
      const p = (progress[i] + elapsed * speed[i]) % 1;
      const spread =
        (0.009 + dustBaseWidth * Math.pow(p, 1.36)) *
        (1 + Math.sin(elapsed * driftFreq[i] + phase[i]) * 0.06);
      const drift = driftAmp[i] * Math.sin(elapsed * (0.5 + driftFreq[i]) + phase[i]);
      const base = i * 3;

      positions[base] = Math.cos(angle[i]) * spread + drift;
      positions[base + 1] = p * dustHeight;
      positions[base + 2] = Math.sin(angle[i]) * spread + drift * 0.65;
    }

    const positionAttribute = dustGeometryRef.current.getAttribute(
      "position"
    ) as THREE.BufferAttribute | undefined;

    if (positionAttribute) {
      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <group name={`country-discovery-signal-${country.slug}`} position={origin} quaternion={orientation}>
      <mesh ref={haloRef} position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[isMobile ? 0.03 : 0.034, isMobile ? 0.08 : 0.09, 64]} />
        <meshBasicMaterial
          ref={haloMaterialRef}
          color="#e7c46a"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[isMobile ? 0.062 : 0.07, 44]} />
        <meshBasicMaterial
          ref={haloSoftMaterialRef}
          color="#b98a35"
          transparent
          opacity={0.075}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.012, 0]}>
        <sphereGeometry args={[isMobile ? 0.017 : 0.019, 20, 20]} />
        <meshBasicMaterial
          ref={pointShellRef}
          color="#e7c46a"
          transparent
          opacity={0.46}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.012, 0]}>
        <sphereGeometry args={[isMobile ? 0.009 : 0.01, 18, 18]} />
        <meshBasicMaterial
          ref={pointCoreRef}
          color="#fff1bf"
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <points position={[0, 0.015, 0]}>
        <bufferGeometry ref={dustGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
            count={particleData.positions.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleData.colors, 3]}
            count={particleData.colors.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={dustMaterialRef}
          size={isMobile ? 0.013 : 0.0115}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

const GlobeScene = forwardRef<
  GlobeSceneHandle,
  {
    texturePath: string;
    isMobile: boolean;
    activeCountry: AvailableCountry;
    onFocusStateChange?: (isFocusingCountry: boolean) => void;
  }
>(function GlobeScene(
  { texturePath, isMobile, activeCountry, onFocusStateChange },
  ref
) {
  const router = useRouter();
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera as THREE.PerspectiveCamera);
  const earthMap = useLoader(THREE.TextureLoader, texturePath);

  const [hovered, setHovered] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [focusLabelCountry, setFocusLabelCountry] = useState<AvailableCountry | null>(null);
  const [isFocusAnimating, setIsFocusAnimating] = useState(false);

  const globeGroupRef = useRef<THREE.Group>(null);
  const earthMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const atmosphereRef = useRef<THREE.ShaderMaterial>(null);
  const atmosphereOuterRef = useRef<THREE.ShaderMaterial>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const focusAnimationRef = useRef<FocusAnimation | null>(null);
  const focusPulseRef = useRef<{ startAtMs: number; durationMs: number } | null>(null);
  const [focusPulseVersion, setFocusPulseVersion] = useState(0);

  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#7fcfff") },
      uDeepColor: { value: new THREE.Color("#1f5f9e") },
      uLightDirection: { value: new THREE.Vector3(3.4, 1.5, 3.6).normalize() },
      uOpacity: { value: isMobile ? 0.155 : 0.19 },
      uPower: { value: isMobile ? 4.2 : 3.9 },
      uIntro: { value: 0 },
    }),
    [isMobile]
  );

  const atmosphereOuterUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#7fcfff") },
      uDeepColor: { value: new THREE.Color("#1f5f9e") },
      uLightDirection: { value: new THREE.Vector3(3.4, 1.5, 3.6).normalize() },
      uOpacity: { value: isMobile ? 0.078 : 0.094 },
      uPower: { value: isMobile ? 2.75 : 2.55 },
      uIntro: { value: 0 },
    }),
    [isMobile]
  );

  const introProgressRef = useRef(0);
  const navigatingRef = useRef(false);
  const navigationTimerRef = useRef<number | null>(null);
  const autoRotationFactorRef = useRef(1);
  const isOrbitInteractingRef = useRef(false);
  const lastInteractionAtRef = useRef(0);
  const lastCameraPositionRef = useRef(new THREE.Vector3());
  const countryPointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const countryPointerMovedRef = useRef(false);
  const controlsMovedSinceCountryDownRef = useRef(false);

  const activeCountryDirection = useMemo(
    () => latLonToVector3(activeCountry.latitude, activeCountry.longitude, 1).normalize(),
    [activeCountry.latitude, activeCountry.longitude]
  );
  const activeCountryPoint = useMemo(
    () => activeCountryDirection.clone().multiplyScalar(GLOBE_RADIUS * 1.008),
    [activeCountryDirection]
  );
  const labelPoint = useMemo(
    () => activeCountryDirection.clone().multiplyScalar(GLOBE_RADIUS * 1.21),
    [activeCountryDirection]
  );
  const labelPointOffset = useMemo(() => {
    const offset = COUNTRY_LABEL_OFFSET_BY_SLUG[activeCountry.slug];
    if (offset) {
      return new THREE.Vector3(offset[0], offset[1], offset[2]);
    }

    const latitudeBias = THREE.MathUtils.clamp(activeCountry.latitude / 90, -1, 1) * 0.014;
    return new THREE.Vector3(0, latitudeBias, 0);
  }, [activeCountry.latitude, activeCountry.slug]);
  const labelAnchorPoint = useMemo(
    () => labelPoint.clone().add(labelPointOffset),
    [labelPoint, labelPointOffset]
  );

  const markInteraction = () => {
    lastInteractionAtRef.current = performance.now();
  };

  const initialGlobeQuaternion = useMemo(
    () =>
      getInitialGlobeQuaternion(
        EUROPE_INITIAL_VIEW.latitude,
        EUROPE_INITIAL_VIEW.longitude
      ),
    []
  );

  const beginFocusAnimation = (country: AvailableCountry) => {
    const globeGroup = globeGroupRef.current;

    if (!globeGroup) {
      return;
    }

    const countryDirection = latLonToVector3(country.latitude, country.longitude, 1).normalize();

    focusAnimationRef.current = {
      country,
      startAtMs: performance.now(),
      durationMs: FOCUS_DURATION_MS,
      fromQuaternion: globeGroup.quaternion.clone(),
      toQuaternion: getInitialGlobeQuaternion(country.latitude, country.longitude),
      fromCameraPosition: camera.position.clone(),
      toCameraPosition: FOCUS_CAMERA_POSITION.clone(),
    };

    focusPulseRef.current = {
      startAtMs: performance.now(),
      durationMs: FOCUS_PULSE_DURATION_MS,
    };
    setFocusPulseVersion((version) => version + 1);

    setHovered(false);
    setFocusLabelCountry(country);
    setIsFocusAnimating(true);
    markInteraction();
    onFocusStateChange?.(true);
  };

  const isCountryCentered = (country: AvailableCountry) => {
    const globeGroup = globeGroupRef.current;

    if (!globeGroup) {
      return false;
    }

    const countryDirection = latLonToVector3(country.latitude, country.longitude, 1).normalize();
    const worldDirection = countryDirection.applyQuaternion(globeGroup.quaternion).normalize();

    return worldDirection.angleTo(FOCUS_DIRECTION) <= FOCUS_CENTER_TOLERANCE_RAD;
  };

  useImperativeHandle(
    ref,
    () => ({
      focusCountry: beginFocusAnimation,
      isCountryCentered,
    }),
    [camera, onFocusStateChange]
  );

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

    if (isOrbitInteractingRef.current || isFocusAnimating) {
      return;
    }

    setHovered(isHovering);
  };

  const triggerCountryNavigation = () => {
    if (navigatingRef.current) {
      return;
    }

    navigatingRef.current = true;
    autoRotationFactorRef.current = 0;
    focusAnimationRef.current = null;
    focusPulseRef.current = null;
    setIsFocusAnimating(false);
    setZooming(false);
    onFocusStateChange?.(false);
    router.push(`/destinations/${activeCountry.slug}`);
  };

  const handleOrbitStart = () => {
    if (isFocusAnimating) {
      return;
    }

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
    if (movedDistance > CAMERA_MOVE_THRESHOLD_SQ && countryPointerDownRef.current) {
      controlsMovedSinceCountryDownRef.current = true;
    }

    lastCameraPositionRef.current.copy(camera.position);
    markInteraction();
  };

  const handleOrbitEnd = () => {
    isOrbitInteractingRef.current = false;
    markInteraction();
    document.body.style.cursor = "";
  };

  const handleCountryPointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (isFocusAnimating) {
      return;
    }

    countryPointerDownRef.current = {
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    };
    countryPointerMovedRef.current = false;
    controlsMovedSinceCountryDownRef.current = false;
  };

  const handleCountryPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!countryPointerDownRef.current) {
      return;
    }

    const dx = event.nativeEvent.clientX - countryPointerDownRef.current.x;
    const dy = event.nativeEvent.clientY - countryPointerDownRef.current.y;
    if (Math.hypot(dx, dy) > COUNTRY_CLICK_MAX_DELTA_PX) {
      countryPointerMovedRef.current = true;
    }
  };

  const resetCountryPointer = () => {
    countryPointerDownRef.current = null;
    countryPointerMovedRef.current = false;
    controlsMovedSinceCountryDownRef.current = false;
  };

  const handleCountryPointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!countryPointerDownRef.current || isFocusAnimating) {
      return;
    }

    const dx = event.nativeEvent.clientX - countryPointerDownRef.current.x;
    const dy = event.nativeEvent.clientY - countryPointerDownRef.current.y;
    const pointerDelta = Math.hypot(dx, dy);

    const shouldNavigate =
      pointerDelta <= COUNTRY_CLICK_MAX_DELTA_PX &&
      !countryPointerMovedRef.current &&
      !controlsMovedSinceCountryDownRef.current;

    resetCountryPointer();

    if (!shouldNavigate) {
      return;
    }

    event.stopPropagation();
    triggerCountryNavigation();
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
      const targetAutoRotation =
        isOrbitInteractingRef.current ||
        zooming ||
        isFocusAnimating ||
        navigatingRef.current
          ? 0
          : resumeProgress;
      const blendAlpha = 1 - Math.exp(-4 * delta);
      autoRotationFactorRef.current = THREE.MathUtils.lerp(
        autoRotationFactorRef.current,
        targetAutoRotation,
        blendAlpha
      );

      globeGroup.rotation.y +=
        delta * ROTATION_SPEED * ramp * autoRotationFactorRef.current;
      globeGroup.position.set(0, -0.24, 0);

      const scale = 1 + 0.11 * introProgressRef.current;
      globeGroup.scale.setScalar(scale);

      const focusAnimation = focusAnimationRef.current;
      if (focusAnimation && !navigatingRef.current) {
        const elapsedMs = now - focusAnimation.startAtMs;
        const progress = Math.max(0, Math.min(1, elapsedMs / focusAnimation.durationMs));
        const easedProgress = smoothstep(0, 1, progress);

        globeGroup.quaternion.slerpQuaternions(
          focusAnimation.fromQuaternion,
          focusAnimation.toQuaternion,
          easedProgress
        );
        camera.position.lerpVectors(
          focusAnimation.fromCameraPosition,
          focusAnimation.toCameraPosition,
          easedProgress
        );
        camera.lookAt(0, 0, 0);
        controlsRef.current?.update();

        if (progress >= 1) {
          focusAnimationRef.current = null;
          setIsFocusAnimating(false);
          onFocusStateChange?.(false);
          markInteraction();
        }
      }
    }

    const focusPulse = focusPulseRef.current;
    if (focusPulse) {
      const now = performance.now();
      const pulseProgress = Math.max(0, Math.min(1, (now - focusPulse.startAtMs) / focusPulse.durationMs));

      if (pulseProgress >= 1) {
        focusPulseRef.current = null;

        if (!hovered && !isFocusAnimating) {
          setFocusLabelCountry(null);
        }
      }
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.uniforms.uIntro.value = introProgressRef.current;
    }

    if (atmosphereOuterRef.current) {
      atmosphereOuterRef.current.uniforms.uIntro.value = introProgressRef.current;
    }

    if (zooming && !navigatingRef.current) {
      const alpha = 1 - Math.exp(-3.5 * delta);
      camera.position.lerp(FOCUS_CAMERA_POSITION, alpha);
      camera.lookAt(0, 0, 0);
    }
  });

  const showLabel = hovered || isFocusAnimating || Boolean(focusLabelCountry);
  const labelCountry = focusLabelCountry ?? activeCountry;
  const isLabelFocused = isFocusAnimating || Boolean(focusLabelCountry);

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
        enabled={!zooming && !isFocusAnimating}
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

      <group ref={globeGroupRef} quaternion={initialGlobeQuaternion}>
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
          <sphereGeometry args={[GLOBE_RADIUS * (isMobile ? 1.025 : 1.032), 72, 72]} />
          <shaderMaterial
            ref={atmosphereRef}
            vertexShader={EARTH_ATMOSPHERE_VERTEX_SHADER}
            fragmentShader={EARTH_ATMOSPHERE_FRAGMENT_SHADER}
            uniforms={atmosphereUniforms}
            transparent
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS * (isMobile ? 1.04 : 1.046), 72, 72]} />
          <shaderMaterial
            ref={atmosphereOuterRef}
            vertexShader={EARTH_ATMOSPHERE_VERTEX_SHADER}
            fragmentShader={EARTH_ATMOSPHERE_FRAGMENT_SHADER}
            uniforms={atmosphereOuterUniforms}
            transparent
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

        <CountryDiscoverySignal
          country={activeCountry}
          countryVector={activeCountryDirection}
          isHovered={hovered}
          isFocused={isFocusAnimating || Boolean(focusLabelCountry)}
          isNavigating={navigatingRef.current}
          isMobile={isMobile}
          focusPulseVersion={focusPulseVersion}
        />

        <mesh
          position={activeCountryPoint.clone().multiplyScalar(1.02)}
          onPointerOver={(event) => handleHover(event, true)}
          onPointerOut={(event) => {
            handleHover(event, false);
            resetCountryPointer();
          }}
          onPointerDown={handleCountryPointerDown}
          onPointerMove={handleCountryPointerMove}
          onPointerUp={handleCountryPointerUp}
          onPointerCancel={resetCountryPointer}
        >
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {showLabel ? (
          <CountryLabel
            country={labelCountry}
            position={labelAnchorPoint}
            isFocused={isLabelFocused}
          />
        ) : null}
      </group>
    </>
  );
});

function GlobeFallback({ message, countrySlug }: { message: string; countrySlug: string }) {
  return (
    <div className={styles.fallbackPanel} role="status" aria-live="polite">
      <img
        src={EARTH_TEXTURE_MOBILE}
        alt="Globe terrestre"
        className={styles.fallbackImage}
        loading="lazy"
      />
      <p className={styles.fallbackText}>{message}</p>
      <a href={`/destinations/${countrySlug}`} className={styles.fallbackLink}>
        Voir les pays disponibles
      </a>
    </div>
  );
}

const ImmersiveGlobeExperience = forwardRef<
  ImmersiveGlobeExperienceHandle,
  ImmersiveGlobeExperienceProps
>(function ImmersiveGlobeExperience(
  { activeCountry, onFocusStateChange },
  ref
) {
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [textureState, setTextureState] = useState<TextureState>("loading");
  const sceneRef = useRef<GlobeSceneHandle | null>(null);
  const pendingFocusRef = useRef<AvailableCountry | null>(null);

  const isMobile = viewportWidth <= 640;
  const texturePath = isMobile ? EARTH_TEXTURE_MOBILE : EARTH_TEXTURE_DESKTOP;
  const defaultCountry = AVAILABLE_DESTINATION_COUNTRIES[0];
  const resolvedActiveCountry = activeCountry ?? defaultCountry;

  useImperativeHandle(ref, () => ({
    focusCountry: (country) => {
      if (sceneRef.current) {
        sceneRef.current.focusCountry(country);
        return;
      }

      pendingFocusRef.current = country;
    },
    isCountryCentered: (country) => sceneRef.current?.isCountryCentered(country) ?? false,
  }));

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

  useEffect(() => {
    if (textureState !== "ready") {
      return;
    }

    if (!sceneRef.current || !pendingFocusRef.current) {
      return;
    }

    sceneRef.current.focusCountry(pendingFocusRef.current);
    pendingFocusRef.current = null;
  }, [textureState]);

  return (
    <>
      <div className={styles.globeShell} aria-label="Globe interactif des destinations">
        {textureState === "error" ? (
          <div className={styles.textureFallbackOverlay}>
            <GlobeFallback
              message="Texture terrestre indisponible. Utilisez la liste des pays."
              countrySlug={defaultCountry.slug}
            />
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
            fallback={
              <GlobeFallback
                message="Affichage 3D indisponible sur cet appareil."
                countrySlug={defaultCountry.slug}
              />
            }
          >
            <Suspense fallback={null}>
              <GlobeScene
                ref={sceneRef}
                texturePath={texturePath}
                isMobile={isMobile}
                activeCountry={resolvedActiveCountry}
                onFocusStateChange={onFocusStateChange}
              />
            </Suspense>
          </Canvas>
        ) : (
          <div className={styles.textureFallbackOverlay}>
            <GlobeFallback
              message="Chargement de la texture terrestre..."
              countrySlug={defaultCountry.slug}
            />
          </div>
        )}
      </div>

      <p className={styles.helperText}>Faites glisser le globe ou recherchez un pays.</p>
    </>
  );
});

export default ImmersiveGlobeExperience;
