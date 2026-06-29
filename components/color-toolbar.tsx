'use client';

import {
  Toolbar,
  ToolbarHeader,
  ToolbarBody,
} from '@/components/ui/toolbar';
import { Label } from '@/components/ui/label';

interface ColorToolbarProps {
  colors: string[];
  orbState: 'idle' | 'listening' | 'speaking';

  setColor: (index: number, color: string) => void;
  addColor: () => void;
  removeColor: (index: number) => void;
  setOrbState: (state: 'idle' | 'listening' | 'speaking') => void;
}

export function ColorToolbar({
  colors,
  orbState,
  setColor,
  addColor,
  removeColor,
  setOrbState,
}: ColorToolbarProps) {
  return (
    <Toolbar className="right-[420px] w-[320px]">
      <ToolbarHeader>
        <span className="text-xs font-mono tracking-wider">
          COLORS
        </span>
      </ToolbarHeader>

      <ToolbarBody>
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">
            Gradient Colors ({colors.length})
          </span>

          <div className="space-y-2">
            {colors.map((hex, i) => (
              <div
                key={i}
                className="flex items-center justify-between"
              >
                <Label>Stop {i + 1}</Label>

                <div className="flex items-center gap-2">
                  <span className="w-16 text-right text-[10px] font-mono text-muted-foreground">
                    {hex.toUpperCase()}
                  </span>

                  <label
                    className="h-7 w-7 overflow-hidden rounded border border-border"
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
                    className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addColor}
              disabled={colors.length >= 16}
              className="mt-2 w-full rounded-md border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              + Add Color Stop
            </button>
          </div>

          <div className="pt-4">
            <span className="text-xs font-medium text-muted-foreground">
              Orb State
            </span>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {(['idle', 'listening', 'speaking'] as const).map((state) => (
                <button
                  key={state}
                  onClick={() => setOrbState(state)}
                  className={`rounded-md border py-2 text-xs capitalize transition ${
                    orbState === state
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ToolbarBody>
    </Toolbar>
  );
}