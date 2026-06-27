import { GradientMaterial } from '@/components/shader-orb/gradient-material';

export function ShaderOrb() {
  return (
    <mesh>
      <sphereGeometry args={[1, 256, 256]} />

      <GradientMaterial />
    </mesh>
  );
}