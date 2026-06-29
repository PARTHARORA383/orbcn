'use client';

import { useState } from 'react';
import { ShaderScene, OrbConfig } from '@/components/shader-orb/shader-scene';
import { ElasticSlider } from '@/components/elastic-slider';
import { useToolbarContext } from '@/context/toolbar-context';
import { Label } from '@/components/ui/label';
import { Toolbar , ToolbarHeader , ToolbarBody , ToolbarFooter} from '@/components/ui/toolbar';
import { DEFAULT_COLORS } from '@/lib/constants';
import { ColorToolbar } from '@/components/color-toolbar';

export default function Orb() {
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'speaking'>('idle');

  const {
    flowX,
    setFlowX,
    flowY,
    setFlowY,
    flowXSpeed,
    setFlowXSpeed,
    speed,
    setSpeed,
    warpStrength,
    setWarpStrength,
    ribbonOpacityCap,
    setRibbonOpacityCap,
    ribbonBreatheAmp,
    setRibbonBreatheAmp,
    ribbonBreatheSpeed,
    setRibbonBreatheSpeed,
    grainAmount,
    setGrainAmount,
    colors,
    setColors,
  } = useToolbarContext();

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
  <div className="flex min-h-screen bg-zinc-950">
    {/* Orb */}
    <div className="flex flex-1 items-center justify-center">
      <div className="h-[300px] w-[300px]">
        <ShaderScene {...config} />
      </div>
    </div>

    <Toolbar>
      <ToolbarHeader>
        <span className="text-xs font-mono tracking-wider text-zinc-200">
          ORB CONTROLS
        </span>

        <button
          onClick={resetAll}
          className="rounded-md border border-zinc-700 px-2 py-1 text-[10px] font-mono text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-300"
        >
          RESET
        </button>
      </ToolbarHeader>

      <ToolbarBody>
        {/* Movement */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">
            Flow &amp; Movement
          </span>

          <ElasticSlider
            label="Flow X amplitude"
            value={flowX}
            min={0}
            max={0.5}
            step={0.01}
            onValueChange={setFlowX}
          />

          <ElasticSlider
            label="Flow Y amplitude"
            value={flowY}
            min={0}
            max={0.5}
            step={0.01}
            onValueChange={setFlowY}
          />

          <ElasticSlider
            label="Flow speed"
            value={flowXSpeed}
            min={0.1}
            max={3}
            step={0.05}
            onValueChange={setFlowXSpeed}
          />

          <ElasticSlider
            label="Global speed"
            value={speed}
            min={0.005}
            max={0.3}
            step={0.005}
            onValueChange={setSpeed}
          />

          <ElasticSlider
            label="Warp strength"
            value={warpStrength}
            min={0}
            max={0.8}
            step={0.01}
            onValueChange={setWarpStrength}
          />
        </div>

        {/* Ribbon */}
        <div className="space-y-3 ">
          <span className="text-xs font-medium text-zinc-400">
            White Ribbon
          </span>

          <ElasticSlider
            label="Opacity cap"
            value={ribbonOpacityCap}
            min={0}
            max={1}
            step={0.01}
            onValueChange={setRibbonOpacityCap}
          />

          <ElasticSlider
            label="Breathe amplitude"
            value={ribbonBreatheAmp}
            min={0}
            max={0.5}
            step={0.01}
            onValueChange={setRibbonBreatheAmp}
          />

          <ElasticSlider
            label="Breathe speed"
            value={ribbonBreatheSpeed}
            min={0.05}
            max={2}
            step={0.05}
            onValueChange={setRibbonBreatheSpeed}
          />
        </div>

        {/* Grain */}
        <div className="space-y-3 ">
          <span className="text-xs font-medium text-zinc-400">
            Grain
          </span>

          <ElasticSlider
            label="Grain amount"
            value={grainAmount}
            min={0}
            max={0.15}
            step={0.005}
            onValueChange={setGrainAmount}
          />
        </div>


      </ToolbarBody>

      {/* <ToolbarFooter>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              setColors([
                "#7B78E5",
                "#9D8FEF",
                "#B89BE8",
                "#D4A0C8",
                "#E8A898",
                "#F2BC88",
                "#F5D07A",
              ])
            }
            className="rounded border border-zinc-700 px-2 py-1 text-[10px] font-mono text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
          >
            Default
          </button>

          <button
            onClick={() =>
              setColors([
                "#00C6FF",
                "#0072FF",
                "#7B2FFF",
                "#C800FF",
                "#FF006E",
                "#FF4D00",
                "#FFB800",
              ])
            }
            className="rounded border border-zinc-700 px-2 py-1 text-[10px] font-mono text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
          >
            Neon
          </button>

          <button
            onClick={() =>
              setColors([
                "#1a1a2e",
                "#16213e",
                "#0f3460",
                "#533483",
                "#e94560",
                "#f5a623",
                "#f8e71c",
              ])
            }
            className="rounded border border-zinc-700 px-2 py-1 text-[10px] font-mono text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
          >
            Deep Space
          </button>

          <button
            onClick={() =>
              setColors([
                "#006d5b",
                "#00917c",
                "#4caf85",
                "#a8d8a8",
                "#ffd460",
                "#ff9a3c",
                "#ff6b6b",
              ])
            }
            className="rounded border border-zinc-700 px-2 py-1 text-[10px] font-mono text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
          >
            Aurora
          </button>

          <button
            onClick={() =>
              setColors([
                "#ff6ec7",
                "#ffb3ec",
                "#d4b8ff",
                "#b8d4ff",
                "#b8f4ff",
              ])
            }
            className="rounded border border-zinc-700 px-2 py-1 text-[10px] font-mono text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
          >
            Cotton Candy
          </button>

          <button
            onClick={() => setColors(["#ff0000", "#ff7700"])}
            className="rounded border border-zinc-700 px-2 py-1 text-[10px] font-mono text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
          >
            2-stop Fire
          </button>
        </div>
      </ToolbarFooter> */}
    </Toolbar>
      <div className="space-y-3 pt-4">
          <span className="text-xs font-medium text-zinc-400">
            Gradient Colors ({colors.length})
          </span>

          <div className="space-y-2">
            {colors.map((hex, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2"
              >
                <Label>Stop {i + 1}</Label>

                <div className="flex items-center gap-2">
                  <span className="w-16 text-right text-[10px] font-mono text-zinc-400">
                    {hex.toUpperCase()}
                  </span>

                  <label
                    className="h-7 w-7 cursor-pointer overflow-hidden rounded border border-zinc-700"
                    style={{ backgroundColor: hex }}
                  >
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => setColor(i, e.target.value)}
                      className="h-full w-full opacity-0"
                    />
                  </label>

                  <button
                    onClick={() => removeColor(i)}
                    disabled={colors.length <= 1}
                    className="text-zinc-500 transition hover:text-red-400 disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addColor}
              disabled={colors.length >= 16}
              className="mt-2 w-full rounded-md border border-dashed border-zinc-700 py-2 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40"
            >
              + Add Color Stop
            </button>
          </div>
        </div>

        {/* Orb State */}
        <div className="space-y-3 pt-4">
          <span className="text-xs font-medium text-zinc-400">
            Orb State
          </span>

          <div className="grid grid-cols-3 gap-2">
            {(["idle", "listening", "speaking"] as const).map((state) => (
              <button
                key={state}
                onClick={() => setOrbState(state)}
                className={`rounded-md border py-2 text-xs capitalize transition-colors ${
                  orbState === state
                    ? "border-violet-500 bg-violet-500/10 text-violet-300"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

       
<ColorToolbar
  colors={colors}
  orbState={orbState}
  setColor={setColor}
  addColor={addColor}
  removeColor={removeColor}
  setOrbState={setOrbState}
/>
  </div>
);
}


