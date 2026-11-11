import * as THREE from 'three';

export const RingShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00f0ff') },
    uSpeed: { value: 1.0 },
    uAudio: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uSpeed;
    uniform float uAudio;

    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
      float dist = length(vUv - vec2(0.5));

      // Concentric dash pattern
      float dashes = sin(angle * 16.0 + uTime * uSpeed * 4.0) * 0.5 + 0.5;
      float ringEdge = smoothstep(0.48, 0.5, dist) - smoothstep(0.5, 0.52, dist);

      vec3 finalColor = uColor + vec3(dashes * 0.5 + uAudio * 0.5);
      float alpha = ringEdge * (dashes * 0.8 + 0.2);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};
