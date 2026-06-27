'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// ─── Types ────────────────────────────────────────────────────────────────────
export type OrbState = 'idle' | 'listening' | 'speaking';

interface ShaderSceneProps {
  state?: OrbState;
}

// ─── Speed map ────────────────────────────────────────────────────────────────
const SPEED: Record<OrbState, number> = {
  idle:      0.06,   // barely drifting
  listening: 0.14,   // gently alive
  speaking:  0.28,   // flowing water, not frantic
};

const WARP: Record<OrbState, number> = {
  idle:      0.28,
  listening: 0.38,
  speaking:  0.50,
};

// ─── Simplex Noise (Ashima Arts / Stefan Gustavson) ───────────────────────────
const simplexNoise = `
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x  = x_ * ns.x + ns.y;
  vec4 y  = y_ * ns.x + ns.y;
  vec4 h  = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// ─── FBM + Flow Field ─────────────────────────────────────────────────────────
const fbmGlsl = `
${simplexNoise}

mat2 rotate2D(float a){
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

float fbm(vec3 p){
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for(int i = 0; i < 5; i++){
    value += amplitude * snoise(p * frequency);
    p.xy *= rotate2D(0.5);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec2 flowField(vec2 uv, float time){
  float x = fbm(vec3(uv * 2.5,       time));
  float y = fbm(vec3(uv * 2.5 + 8.3, time));
  return vec2(x, y);
}
`;

// ─── Vertex Shader ────────────────────────────────────────────────────────────
const vertexShader = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// ─── Fragment Shader ──────────────────────────────────────────────────────────
const fragmentShader = `
uniform float uTime;
uniform float uWarp;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;

varying vec2 vUv;

${fbmGlsl}

vec3 gradientColor(float t){
  vec3 c = uColor1;
  c = mix(c, uColor2, smoothstep(0.00, 0.18, t));
  c = mix(c, uColor3, smoothstep(0.16, 0.34, t));
  c = mix(c, uColor4, smoothstep(0.32, 0.50, t));
  c = mix(c, uColor5, smoothstep(0.48, 0.66, t));
  c = mix(c, uColor6, smoothstep(0.64, 0.82, t));
  c = mix(c, uColor7, smoothstep(0.80, 1.00, t));
  return c;
}

void main(){
  vec2 uv = vUv;

  vec2 flow  = flowField(uv - 0.5, uTime);
  vec2 uv2   = uv + flow * uWarp * 1.4;
  vec2 flow2 = flowField(uv2 - 0.5, uTime + 3.7);
  vec2 warped = uv + flow * uWarp + flow2 * (uWarp * 0.6);

  float ty = clamp(warped.y, 0.0, 1.0);
  float t  = ty;

  vec3 color = gradientColor(t);
  color += 0.05 * length(flow);

  gl_FragColor = vec4(color, 1.0);
}
`;

// ─── Material ────────────────────────────────────────────────────────────────
interface GradientMaterialProps {
  orbState: OrbState;
}

function GradientMaterial({ orbState }: GradientMaterialProps) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime:   { value: 0 },
          uWarp:   { value: WARP.idle },
          // Screenshot-matched palette: lavender → purple → mauve → rose → peach → sand
          uColor1: { value: new THREE.Color('#7B78E5') }, // periwinkle
          uColor2: { value: new THREE.Color('#9D8FEF') }, // soft violet
          uColor3: { value: new THREE.Color('#B89BE8') }, // lavender
          uColor4: { value: new THREE.Color('#D4A0C8') }, // mauve
          uColor5: { value: new THREE.Color('#E8A898') }, // rose
          uColor6: { value: new THREE.Color('#F2BC88') }, // peach
          uColor7: { value: new THREE.Color('#F5D07A') }, // warm sand
        },
      }),
    []
  );

  // Accumulate time scaled by current speed — avoids the jump when speed changes
  const currentSpeed = useRef(SPEED.idle);
  const currentWarp  = useRef(WARP.idle);
  const scaledTime   = useRef(0);

  useFrame((_, delta) => {
    const targetSpeed = SPEED[orbState];
    const targetWarp  = WARP[orbState];
    const lerpFactor  = 1 - Math.exp(-delta * 2.5);

    currentSpeed.current += (targetSpeed - currentSpeed.current) * lerpFactor;
    currentWarp.current  += (targetWarp  - currentWarp.current)  * lerpFactor;

    // Time advances by delta * speed each frame — no sudden jumps on state change
    scaledTime.current += delta * currentSpeed.current;

    material.uniforms.uTime.value = scaledTime.current;
    material.uniforms.uWarp.value = currentWarp.current;
  });

  return <primitive object={material} attach="material" />;
}

// ─── Orb ─────────────────────────────────────────────────────────────────────
function ShaderOrb({ orbState }: { orbState: OrbState }) {
  return (
    <mesh>
      <sphereGeometry args={[1, 256, 256]} />
      <GradientMaterial orbState={orbState} />
    </mesh>
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────
export function ShaderScene({ state = 'idle' }: ShaderSceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
      <ambientLight intensity={1} />
      <ShaderOrb orbState={state} />
    </Canvas>
  );
}