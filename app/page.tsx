'use client';

import { useState } from 'react';
import { ShaderScene, OrbState } from '@/components/shader-orb/shader-scene';

const STATES: { state: OrbState; label: string; description: string }[] = [
  {
    state: 'idle',
    label: 'Idle',
    description: 'Slowly drifting',
  },
  {
    state: 'listening',
    label: 'Listening',
    description: 'Attentive & alive',
  },
  {
    state: 'speaking',
    label: 'Speaking',
    description: 'Energetic & fast',
  },
];

export default function Home() {
  const [orbState, setOrbState] = useState<OrbState>('idle');

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black font-sans gap-10">
      {/* Orb */}
      <div className="w-[300px] h-[300px]">
        <ShaderScene state={orbState} />
      </div>

      {/* State label */}
      <p className="text-sm text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
        {STATES.find(s => s.state === orbState)?.description}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {STATES.map(({ state, label }) => (
          <button
            key={state}
            onClick={() => setOrbState(state)}
            className={`
              px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200
              ${orbState === state
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md scale-105'
                : 'bg-white text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}