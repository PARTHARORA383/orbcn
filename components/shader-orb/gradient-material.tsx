'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

import vertexShader from "@/components/shaders//orbs/vertex";
import fragmentShader from "@/components/shaders/orbs/fragments";

export function GradientMaterial() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {

          uTime: {
            value: 0
          },

          uColor1: {
            value: new THREE.Color("#8B7CFF")
          },

          uColor2: {
            value: new THREE.Color("#A994FF")
          },

          uColor3: {
            value: new THREE.Color("#F5B5E7")
          },

          uColor4: {
            value: new THREE.Color("#FFC8A0")
          }

        }
      }),
    []
  );

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return <primitive object={material} attach="material" />;
}