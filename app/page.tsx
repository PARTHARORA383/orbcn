'use client';

import { useState } from 'react';
import { ShaderScene, OrbConfig } from '@/components/shader-orb/shader-scene';

// ─── Tiny reusable control primitives ────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
      {children}
    </span>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-mono text-zinc-300 tabular-nums w-10 text-right">
      {children}
    </span>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  displayValue?: string;
}

function Slider({ label, value, min, max, step, onChange, displayValue }: SliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <Value>{displayValue ?? value.toFixed(2)}</Value>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-violet-400 cursor-pointer"
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600 pt-1 border-t border-zinc-800">
      {children}
    </p>
  );
}

// ─── Default config ───────────────────────────────────────────────────────────

const DEFAULT_COLORS: string[] = [
  '#7B78E5',
  '#9D8FEF',
  '#B89BE8',
  '#D4A0C8',
  '#E8A898',
  '#F2BC88',
  '#F5D07A',
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'speaking'>('idle');

  // Movement
  const [flowX,      setFlowX]      = useState(0.15);
  const [flowY,      setFlowY]      = useState(0);
  const [flowXSpeed, setFlowXSpeed] = useState(0.8);
  const [speed,      setSpeed]      = useState(0.06);
  const [warpStrength, setWarpStrength] = useState(0.28);

  // Ribbon
  const [ribbonOpacityCap,   setRibbonOpacityCap]   = useState(0.52);
  const [ribbonBreatheAmp,   setRibbonBreatheAmp]   = useState(0.25);
  const [ribbonBreatheSpeed, setRibbonBreatheSpeed] = useState(0.31);

  // Grain
  const [grainAmount, setGrainAmount] = useState(0.04);

  // Colors
  const [colors, setColors] = useState<string[]>([...DEFAULT_COLORS]);

  const setColor = (index: number, hex: string) => {
    setColors(prev => {
      const next = [...prev];
      next[index] = hex;
      return next;
    });
  };

  const addColor = () => {
    setColors(prev => prev.length < 16 ? [...prev, '#ffffff'] : prev);
  };

  const removeColor = (index: number) => {
    setColors(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  };

  const config: OrbConfig = {
    flowX, flowY, flowXSpeed, speed, warpStrength,
    colors,
    ribbonOpacityCap, ribbonBreatheAmp, ribbonBreatheSpeed,
    grainAmount,
    state: orbState,
  };

  const resetAll = () => {
    setFlowX(0.15); setFlowY(0); setFlowXSpeed(0.8); setSpeed(0.06);
    setWarpStrength(0.28); setRibbonOpacityCap(0.52); setRibbonBreatheAmp(0.25);
    setRibbonBreatheSpeed(0.31); setGrainAmount(0.04);
    setColors([...DEFAULT_COLORS]);
  };

  return (
    <div className="flex flex-1 min-h-screen bg-zinc-950 font-sans">

      {/* ── Orb canvas ── */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-[340px] h-[340px]">
          <ShaderScene {...config} />
        </div>
      </div>

      {/* ── Control panel ── */}
      <aside className="w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <span className="text-xs font-mono text-zinc-200 tracking-wider">ORB CONTROLS</span>
          <button
            onClick={resetAll}
            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 border border-zinc-700 hover:border-zinc-500 rounded"
          >
            RESET
          </button>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4">

          {/* Movement */}
          <SectionTitle>Flow &amp; Movement</SectionTitle>

          <Slider
            label="Flow X amplitude"
            value={flowX} min={0} max={0.5} step={0.01}
            onChange={setFlowX}
          />
          <Slider
            label="Flow Y amplitude"
            value={flowY} min={0} max={0.5} step={0.01}
            onChange={setFlowY}
          />
          <Slider
            label="Flow speed"
            value={flowXSpeed} min={0.1} max={3} step={0.05}
            onChange={setFlowXSpeed}
          />
          <Slider
            label="Global speed"
            value={speed} min={0.005} max={0.3} step={0.005}
            onChange={setSpeed}
          />
          <Slider
            label="Warp strength"
            value={warpStrength} min={0} max={0.8} step={0.01}
            onChange={setWarpStrength}
          />

          {/* Ribbon */}
          <SectionTitle>White Ribbon</SectionTitle>

          <Slider
            label="Opacity cap"
            value={ribbonOpacityCap} min={0} max={1} step={0.01}
            onChange={setRibbonOpacityCap}
          />
          <Slider
            label="Breathe amplitude"
            value={ribbonBreatheAmp} min={0} max={0.5} step={0.01}
            onChange={setRibbonBreatheAmp}
          />
          <Slider
            label="Breathe speed"
            value={ribbonBreatheSpeed} min={0.05} max={2} step={0.05}
            onChange={setRibbonBreatheSpeed}
          />

          {/* Grain */}
          <SectionTitle>Grain</SectionTitle>

          <Slider
            label="Grain amount"
            value={grainAmount} min={0} max={0.15} step={0.005}
            onChange={setGrainAmount}
          />

          {/* Colors */}
          <SectionTitle>Gradient Colors ({colors.length})</SectionTitle>

          <div className="flex flex-col gap-2">
            {colors.map((hex, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <Label>Stop {i + 1}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-400">{hex.toUpperCase()}</span>
                  <label
                    className="w-7 h-7 rounded cursor-pointer border-2 border-zinc-700 hover:border-zinc-400 transition-colors overflow-hidden"
                    style={{ backgroundColor: hex }}
                  >
                    <input
                      type="color"
                      value={hex}
                      onChange={e => setColor(i, e.target.value)}
                      className="opacity-0 w-full h-full cursor-pointer"
                    />
                  </label>
                  <button
                    onClick={() => removeColor(i)}
                    disabled={colors.length <= 1}
                    className="text-zinc-600 hover:text-red-400 disabled:opacity-20 transition-colors text-sm leading-none"
                    title="Remove stop"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addColor}
              disabled={colors.length >= 16}
              className="mt-1 text-[10px] font-mono px-2.5 py-1.5 rounded border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 disabled:opacity-30 transition-colors"
            >
              + Add color stop
            </button>
          </div>

      {/* State buttons */}
          <SectionTitle>Orb State</SectionTitle>
          <div className="flex gap-2">
            {(['idle', 'listening', 'speaking'] as const).map(s => (
              <button
                key={s}
                onClick={() => setOrbState(s)}
                className={`flex-1 text-[10px] font-mono py-1.5 rounded border transition-colors capitalize
                  ${orbState === s
                    ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                    : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Presets */}
          <SectionTitle>Presets</SectionTitle>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setColors(['#7B78E5','#9D8FEF','#B89BE8','#D4A0C8','#E8A898','#F2BC88','#F5D07A'])}
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
            >
              Default
            </button>
            <button
              onClick={() => setColors(['#00C6FF','#0072FF','#7B2FFF','#C800FF','#FF006E','#FF4D00','#FFB800'])}
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
            >
              Neon
            </button>
            <button
              onClick={() => setColors(['#1a1a2e','#16213e','#0f3460','#533483','#e94560','#f5a623','#f8e71c'])}
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
            >
              Deep Space
            </button>
            <button
              onClick={() => setColors(['#006d5b','#00917c','#4caf85','#a8d8a8','#ffd460','#ff9a3c','#ff6b6b'])}
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
            >
              Aurora
            </button>
            <button
              onClick={() => setColors(['#ff6ec7','#ffb3ec','#d4b8ff','#b8d4ff','#b8f4ff'])}
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
            >
              Cotton Candy
            </button>
            <button
              onClick={() => setColors(['#ff0000','#ff7700'])}
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
            >
              2-stop fire
            </button>
          </div>

        </div>
      </aside>
    </div>
  );
}