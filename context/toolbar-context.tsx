'use client'

import { createContext, Dispatch, SetStateAction, ReactNode, useContext , useState } from "react";

export interface ShaderContextType {
  flowX: number;
  setFlowX: Dispatch<SetStateAction<number>>;

  flowY: number;
  setFlowY: Dispatch<SetStateAction<number>>;

  flowXSpeed: number;
  setFlowXSpeed: Dispatch<SetStateAction<number>>;

  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;

  warpStrength: number;
  setWarpStrength: Dispatch<SetStateAction<number>>;

  ribbonOpacityCap: number;
  setRibbonOpacityCap: Dispatch<SetStateAction<number>>;

  ribbonBreatheAmp: number;
  setRibbonBreatheAmp: Dispatch<SetStateAction<number>>;

  ribbonBreatheSpeed: number;
  setRibbonBreatheSpeed: Dispatch<SetStateAction<number>>;

  grainAmount: number;
  setGrainAmount: Dispatch<SetStateAction<number>>;

  colors: string[];
  setColors: Dispatch<SetStateAction<string[]>>;
}

export const ToolbarContext = createContext<ShaderContextType | undefined>(undefined);

type ToolbarContextProviderProps = ShaderContextType & {
  children: ReactNode;
};

const DEFAULT_COLORS = [
  '#7B78E5',
  '#9D8FEF',
  '#B89BE8',
  '#D4A0C8',
  '#E8A898',
  '#F2BC88',
  '#F5D07A',
];

export function ToolbarContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [flowX, setFlowX] = useState(0.15);
  const [flowY, setFlowY] = useState(0);
  const [flowXSpeed, setFlowXSpeed] = useState(0.8);
  const [speed, setSpeed] = useState(0.06);
  const [warpStrength, setWarpStrength] = useState(0.28);
  const [ribbonOpacityCap, setRibbonOpacityCap] = useState(0.52);
  const [ribbonBreatheAmp, setRibbonBreatheAmp] = useState(0.25);
  const [ribbonBreatheSpeed, setRibbonBreatheSpeed] = useState(0.31);
  const [grainAmount, setGrainAmount] = useState(0.04);
  const [colors, setColors] = useState(DEFAULT_COLORS);

  return (
    <ToolbarContext.Provider
      value={{
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
      }}
    >
      {children}
    </ToolbarContext.Provider>
  );
}



export function useToolbarContext(){

  const context = useContext(ToolbarContext);

  if (!context) {
    throw new Error("useToolbarContext must be used within a ToolbarContextProvider");
  }


  return context;
  
}