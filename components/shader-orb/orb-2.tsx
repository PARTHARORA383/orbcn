'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// ─── Types ────────────────────────────────────────────────────────────────────
export type OrbState = 'idle' | 'listening' | 'speaking';

interface ShaderSceneProps {
  state?: OrbState;
}

// ─── Simplex Noise ────────────────────────────────────────────────────────────
const simplexNoise = `
vec3 mod289v3(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 mod289v4(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 permute(vec4 x){ return mod289v4(((x*34.0)+1.0)*x); }
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
  i = mod289v3(i);
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

vec2 flowField(vec2 uv, float t){
  float x = fbm(vec3(uv * 2.5,       t));
  float y = fbm(vec3(uv * 2.5 + 8.3, t));
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
uniform float uFlowX;
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

float grain(vec2 uv, float time){
  return fract(sin(dot(uv * 200.0 + time * 0.3, vec2(127.1, 311.7))) * 43758.5453);
}

float ribbonLayer(
  vec2  centered,
  vec2  flowDisp,
  float t,
  float orbitSpeed,
  vec2  fbmOffset,
  float fbmScale,
  float timeScale
){
  float angle = t * orbitSpeed;
  float ca = cos(angle), sa = sin(angle);
  vec2 orbited = vec2(
    centered.x * ca - centered.y * sa,
    centered.x * sa + centered.y * ca
  );
  vec2 distorted = orbited + flowDisp * 0.28;
  float n = fbm(vec3((distorted + fbmOffset) * fbmScale, t * timeScale));
  return smoothstep(0.52 - 0.22, 0.52 + 0.22, n * 0.5 + 0.5);
}

void main(){
  vec2 uv       = vec2(vUv.x + uFlowX, vUv.y);
  vec2 centered = uv - 0.5;

  const float warp = 0.28;

  vec2 flow   = flowField(centered, uTime);
  vec2 uv2    = centered + flow * warp * 1.4;
  vec2 flow2  = flowField(uv2, uTime + 3.7);
  vec2 warped = centered + flow * warp + flow2 * (warp * 0.6);

  float diag       = (centered.x * 0.7071 + centered.y * 0.7071) * 0.9 + 0.5;
  float warpedDiag = (warped.x   * 0.7071 + warped.y   * 0.7071) * 0.9 + 0.5;

  float perp  = (-centered.x * 0.7071 + centered.y * 0.7071);
  float wave1 = sin(perp * 5.0 - uTime * 0.6) * 0.04;
  float wave2 = sin(perp * 3.2 - uTime * 0.42 + 1.3) * 0.02;

  float noiseDisplace = fbm(vec3(uv * 2.2, uTime * 2.0)) * 0.10;

  float gt = clamp(mix(diag, warpedDiag, 0.6) + wave1 + wave2 + noiseDisplace, 0.0, 1.0);
  vec3 color = gradientColor(gt);

  // White ribbon
  vec2 ribbonFlow = flow * 0.25;
  float mA = ribbonLayer(centered, ribbonFlow, uTime,  0.09, vec2(0.0,  0.0), 1.6, 0.12);
  float mB = ribbonLayer(centered, ribbonFlow, uTime, -0.13, vec2(3.7,  1.9), 1.4, 0.09);
  float mC = ribbonLayer(centered, ribbonFlow, uTime,  0.07, vec2(7.2, -2.4), 1.9, 0.16);

  float ribbonMask = clamp(mA * 0.65 + mB * 0.55 + mC * 0.35, 0.0, 1.0);

  float breathe = 0.50 + 0.25 * sin(uTime * 0.31) + 0.15 * sin(uTime * 0.57 + 1.4);
  float ribbonOpacity = ribbonMask * breathe;

  color = mix(color, vec3(1.0), clamp(ribbonOpacity, 0.0, 0.52));

  float g = grain(vUv, uTime) * 0.04;
  color += g - 0.02;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

// ─── Material — always idle, state-blind ──────────────────────────────────────
function GradientMaterial() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime:   { value: 0 },
          uFlowX:  { value: 0 },
          uColor1: { value: new THREE.Color('#7B78E5') },
          uColor2: { value: new THREE.Color('#9D8FEF') },
          uColor3: { value: new THREE.Color('#B89BE8') },
          uColor4: { value: new THREE.Color('#D4A0C8') },
          uColor5: { value: new THREE.Color('#E8A898') },
          uColor6: { value: new THREE.Color('#F2BC88') },
          uColor7: { value: new THREE.Color('#F5D07A') },
        },
      }),
    []
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    material.uniforms.uTime.value  += dt * 0.06;
    material.uniforms.uFlowX.value -= dt * 0.04;
  });

  return <primitive object={material} attach="material" />;
}

// ─── Orb — no scale pulse, just the shader ────────────────────────────────────
function ShaderOrb() {
  return (
    <mesh>
      <sphereGeometry args={[1, 256, 256]} />
      <GradientMaterial />
    </mesh>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
export function ShaderScene({ state = 'idle' }: ShaderSceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
      <ambientLight intensity={1} />
      <ShaderOrb />
    </Canvas>
  );
}

export { ShaderScene as Orb2 };