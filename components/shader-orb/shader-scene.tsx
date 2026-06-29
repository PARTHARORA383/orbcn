'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

export const DEFAULT_COLORS: string[] = [
  '#7B78E5', '#9D8FEF', '#B89BE8', '#D4A0C8',
  '#E8A898', '#F2BC88', '#F5D07A',
];

const MAX_COLORS = 16;

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

const vertexShader = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
#define MAX_COLORS ${MAX_COLORS}

uniform float uTime;
uniform float uFlowX;
uniform float uFlowY;
uniform float uWarp;
uniform float uFlowDir;
uniform float uRibbonOpacityCap;
uniform float uRibbonBreatheAmp;
uniform float uRibbonBreatheSpeed;
uniform float uGrainAmount;
uniform vec3  uColors[MAX_COLORS];
uniform int   uColorCount;
uniform float uSpeaking;

varying vec2 vUv;

${fbmGlsl}

vec3 gradientColor(float t){
  vec3 color = uColors[0];
  for(int i = 1; i < MAX_COLORS; i++){
    if(i >= uColorCount) break;
    float stopT = float(i) / float(uColorCount - 1);
    float prevT = float(i - 1) / float(uColorCount - 1);
    color = mix(color, uColors[i], smoothstep(prevT, stopT, t));
  }
  return color;
}

float grain(vec2 uv, float time){
  return fract(sin(dot(uv * 200.0 + time * 0.3, vec2(127.1, 311.7))) * 43758.5453);
}

float ribbonLayer(vec2 centered, vec2 flowDisp, float t, float orbitSpeed, vec2 fbmOffset, float fbmScale, float timeScale){
  float angle = t * orbitSpeed;
  float ca = cos(angle), sa = sin(angle);
  vec2 orbited = vec2(centered.x*ca - centered.y*sa, centered.x*sa + centered.y*ca);
  vec2 distorted = orbited + flowDisp * 0.28;
  float n = fbm(vec3((distorted + fbmOffset) * fbmScale, t * timeScale));
  return smoothstep(0.30, 0.74, n * 0.5 + 0.5);
}

float sweepArc(vec2 c, float t, float speed, float phase, float width, float noiseAmt) {
  float angle = atan(c.y, c.x);
  float r = length(c);
  float edgeFade = smoothstep(0.08, 0.42, r) * smoothstep(0.52, 0.38, r);
  float arcCenter = mod(t * speed + phase, 6.28318);
  float diff = abs(mod(angle - arcCenter + 9.42478, 6.28318) - 3.14159);
  float n = fbm(vec3(c * 3.5, t * 0.8 + phase)) * noiseAmt;
  float arc = smoothstep(width + n, width * 0.1 + n, diff);
  return arc * edgeFade;
}

mat3 rotationY(float a){ float c = cos(a); float s = sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }
mat3 rotationX(float a){ float c = cos(a); float s = sin(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }

float shellBand(vec3 p, float t){
  p = rotationY(t*0.18) * rotationX(sin(t*0.3)*0.25) * p;
  vec3 q = p;
  q += vec3(fbm(vec3(p.xy*3.0,t*0.25)), fbm(vec3(p.yz*3.0,t*0.23)), fbm(vec3(p.zx*3.0,t*0.27)))*0.18;
  float d = abs(q.y + q.x*0.35);
  float outer = exp(-d*2.5);
  float middle = exp(-d*6.0);
  float core = exp(-d*18.0);
  float mask = outer*0.18 + middle*0.42 + core*0.75;
  mask *= smoothstep(-0.95,-0.2,q.z);
  mask *= 1.0-smoothstep(0.35,0.95,q.z);
  return clamp(mask,0.0,1.0);
}

void main(){
  // ── uFlowDir smoothly reverses the scroll direction: +1 normal, -1 reversed ──
  vec2 uv = vec2(vUv.x + uFlowX * uFlowDir, vUv.y + uFlowY * uFlowDir);
  vec2 centered = uv - 0.5;

  // ── Flow field evaluated in the (possibly reversed) direction ──
  vec2 flow = flowField(centered, uTime) * uFlowDir;
  vec2 uv2 = centered + flow * uWarp * 1.4;
  vec2 flow2 = flowField(uv2, uTime + 3.7) * uFlowDir;
  vec2 warped = centered + flow * uWarp + flow2 * (uWarp * 0.6);

  float diag = (centered.x * 0.7071 + centered.y * 0.7071) * 0.9 + 0.5;
  float warpedDiag = (warped.x * 0.7071 + warped.y * 0.7071) * 0.9 + 0.5;
  float perp = (-centered.x * 0.7071 + centered.y * 0.7071);
  float wave1 = sin(perp * 5.0 - uTime * 0.6 * uFlowDir) * 0.04;
  float wave2 = sin(perp * 3.2 - uTime * 0.42 * uFlowDir + 1.3) * 0.02;
  float noiseDisplace = fbm(vec3(uv * 2.2, uTime * 2.0)) * 0.10;
  float rawGt = mix(diag, warpedDiag, 0.6) + wave1 + wave2 + noiseDisplace;
  float gt = abs(fract(rawGt * 0.5) * 2.0 - 1.0);
  vec3 color = gradientColor(gt);

  vec2 ribbonFlow = flow * 0.25;
  float mA = ribbonLayer(centered, ribbonFlow, uTime, 0.09,  vec2(0.0, 0.0), 1.6, 0.12);
  float mB = ribbonLayer(centered, ribbonFlow, uTime, -0.13, vec2(3.7, 1.9), 1.4, 0.09);
  float mC = ribbonLayer(centered, ribbonFlow, uTime,  0.07, vec2(7.2,-2.4), 1.9, 0.16);
  float ribbonMask = clamp(mA * 0.65 + mB * 0.55 + mC * 0.35, 0.0, 1.0);
  float breathe = 0.50 + uRibbonBreatheAmp * sin(uTime * uRibbonBreatheSpeed) + 0.15 * sin(uTime * 0.57 + 1.4);
  color = mix(color, vec3(1.0), clamp(ribbonMask * breathe, 0.0, uRibbonOpacityCap));

  if(uSpeaking > 0.001){
    float s1 = sweepArc(centered, uTime, 2.8, 0.00, 0.55, 0.18);
    float s2 = sweepArc(centered, uTime, 1.9, 2.09, 0.38, 0.22);
    float s3 = sweepArc(centered, uTime, 3.5, 4.19, 0.28, 0.14);
    float s4 = sweepArc(centered, uTime, 1.1, 1.05, 0.90, 0.30) * 0.4;
    float sweep = clamp(s1 * 0.85 + s2 * 0.70 + s3 * 0.60 + s4, 0.0, 1.0);
    vec3 sweepColor = vec3(1.0, 0.98, 0.96);
    color = mix(color, sweepColor, sweep * uSpeaking * 0.82);
  }

  float g = grain(vUv, uTime) * uGrainAmount;
  color += g - uGrainAmount * 0.5;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);

  vec2 sphereUV = vUv * 2.0 - 1.0;
  float rr = dot(sphereUV, sphereUV);
  if(rr <= 1.0){
    float z = sqrt(1.0 - rr);
    vec3 normal = normalize(vec3(sphereUV, z));
    float shell = shellBand(normal, uTime);
    float shellBreathe = 0.75 + 0.25 * sin(uTime * 0.55);
    shell *= shellBreathe;
    float fresnel = pow(1.0 - normal.z, 3.0);
    shell += fresnel * 0.22;
    shell = clamp(shell, 0.0, 1.0);
    vec3 shellColor = vec3(1.0);
    color = mix(color, shellColor, shell * 0.28);
  }
}
`;

function colorsToFloat32(hexColors: string[]): Float32Array {
  const arr = new Float32Array(MAX_COLORS * 3);
  const tmp = new THREE.Color();
  hexColors.forEach((hex, i) => {
    if (i >= MAX_COLORS) return;
    tmp.set(hex);
    arr[i * 3 + 0] = tmp.r;
    arr[i * 3 + 1] = tmp.g;
    arr[i * 3 + 2] = tmp.b;
  });
  return arr;
}

interface MaterialProps {
  configRef: React.MutableRefObject<ResolvedConfig>;
}

function GradientMaterial({ configRef }: MaterialProps) {
  const speakingRef = useRef(0);
  // Smoothed flow direction: +1 idle/listening, -1 speaking
  const flowDirRef = useRef(1.0);

  const material = useMemo(() => {
    const cfg = configRef.current;
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uFlowX: { value: 0 },
        uFlowY: { value: 0 },
        uWarp: { value: cfg.warpStrength },
        uFlowDir: { value: 1.0 },
        uRibbonOpacityCap: { value: cfg.ribbonOpacityCap },
        uRibbonBreatheAmp: { value: cfg.ribbonBreatheAmp },
        uRibbonBreatheSpeed: { value: cfg.ribbonBreatheSpeed },
        uGrainAmount: { value: cfg.grainAmount },
        uColors: { value: colorsToFloat32(cfg.colors) },
        uColorCount: { value: Math.min(cfg.colors.length, MAX_COLORS) },
        uSpeaking: { value: 0 },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    const cfg = configRef.current;
    const dt = Math.min(delta, 0.1);
    const isSpeaking = cfg.state === 'speaking';

    // Smooth speaking blend 0→1
    const speakTarget = isSpeaking ? 1 : 0;
    speakingRef.current += (speakTarget - speakingRef.current) * dt * 3.0;
    const sp = speakingRef.current;

    // ── Smooth direction flip: target -1 when speaking, +1 otherwise ──
    const dirTarget = isSpeaking ? -1.0 : 1.0;
    flowDirRef.current += (dirTarget - flowDirRef.current) * dt * 1.5;

    // ── Speed: faster when speaking (2.8×), slightly quicker when listening ──
    const isListening = cfg.state === 'listening';
    const speedMult = isSpeaking ? 2.8 : isListening ? 1.3 : 1.0;
    material.uniforms.uTime.value += dt * cfg.speed * speedMult;

    const t = material.uniforms.uTime.value;
    material.uniforms.uFlowX.value =
      Math.sin(t * cfg.flowXSpeed) * cfg.flowX;
    material.uniforms.uFlowY.value =
      Math.sin(t * cfg.flowXSpeed * 0.7 + 1.2) * cfg.flowY;

    material.uniforms.uFlowDir.value = flowDirRef.current;
    material.uniforms.uWarp.value = cfg.warpStrength;
    material.uniforms.uRibbonOpacityCap.value = cfg.ribbonOpacityCap;
    material.uniforms.uRibbonBreatheAmp.value = cfg.ribbonBreatheAmp;
    material.uniforms.uRibbonBreatheSpeed.value = cfg.ribbonBreatheSpeed;
    material.uniforms.uGrainAmount.value = cfg.grainAmount;

    colorsToFloat32(cfg.colors).forEach((v, i) => {
      (material.uniforms.uColors.value as Float32Array)[i] = v;
    });
    material.uniforms.uColorCount.value = Math.min(cfg.colors.length, MAX_COLORS);
    material.uniforms.uSpeaking.value = sp;
  });

  return <primitive object={material} attach="material" />;
}

interface AnimatedOrbProps {
  configRef: React.MutableRefObject<ResolvedConfig>;
}

function AnimatedOrb({ configRef }: AnimatedOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(1.0);
  const timeRef = useRef(0);
  const listenBlendRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const { state, listeningBreathSpeed, listeningBreathAmp } = configRef.current;
    const dt = Math.min(delta, 0.1);

    timeRef.current += dt;
    const t = timeRef.current;

    const listenTarget = state === 'listening' ? 1 : 0;
    listenBlendRef.current += (listenTarget - listenBlendRef.current) * dt * 2.5;

    const listenBreathe =
      Math.sin(t * listeningBreathSpeed) * listeningBreathAmp * listenBlendRef.current;

    const snapTarget = state === 'listening' ? 0.85 : 1.0;
    scaleRef.current += (snapTarget - scaleRef.current) * dt * 8.0;

    const s = scaleRef.current + listenBreathe;
    meshRef.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 256, 256]} />
      <GradientMaterial configRef={configRef} />
    </mesh>
  );
}


export type OrbState = 'idle' | 'listening' | 'speaking';

export interface OrbConfig {
  flowX?: number;
  flowY?: number;
  flowXSpeed?: number;
  speed?: number;
  warpStrength?: number;
  colors?: string[];
  ribbonOpacityCap?: number;
  ribbonBreatheAmp?: number;
  ribbonBreatheSpeed?: number;
  grainAmount?: number;
  state?: OrbState;
  listeningBreathSpeed?: number; // cycles per second, default 1.4
  listeningBreathAmp?: number;   // scale swing ±, default 0.038
}

interface ResolvedConfig extends Required<Omit<OrbConfig, 'colors'>> {
  colors: string[];
}

export function ShaderScene({
  flowX = 0.15,
  flowY = 0,
  flowXSpeed = 0.8,
  speed = 0.06,
  warpStrength = 0.28,
  colors,
  ribbonOpacityCap = 0.52,
  ribbonBreatheAmp = 0.25,
  ribbonBreatheSpeed = 0.31,
  grainAmount = 0.04,
  state = 'idle',
  listeningBreathSpeed = 1.4,
  listeningBreathAmp = 0.038,
}: OrbConfig) {
  const resolvedColors = colors && colors.length > 0 ? colors : DEFAULT_COLORS;

  const configRef = useRef<ResolvedConfig>({
    flowX, flowY, flowXSpeed, speed, warpStrength,
    colors: resolvedColors,
    ribbonOpacityCap, ribbonBreatheAmp, ribbonBreatheSpeed,
    grainAmount, state,
    listeningBreathSpeed, listeningBreathAmp,
  });

  useEffect(() => {
    configRef.current = {
      flowX, flowY, flowXSpeed, speed, warpStrength,
      colors: resolvedColors,
      ribbonOpacityCap, ribbonBreatheAmp, ribbonBreatheSpeed,
      grainAmount, state,
      listeningBreathSpeed, listeningBreathAmp,
    };
  });

  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
      <ambientLight intensity={1} />
      <AnimatedOrb configRef={configRef} />
    </Canvas>
  );
}