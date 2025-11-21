export const displacementVertexShader = /* glsl */ `
uniform float uDisplacement;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
varying float vDisplacement;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  // Displacement calculation
  float displacement = sin(position.x * uFrequency + uTime) *
                       sin(position.y * uFrequency + uTime * 0.8) *
                       sin(position.z * uFrequency + uTime * 1.2);
  displacement *= uAmplitude * uDisplacement;

  vec3 newPosition = position + normal * displacement;
  vDisplacement = displacement;

  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const displacementFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uGlowColor;
uniform float uGlowIntensity;
uniform float uTime;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
varying float vDisplacement;

void main() {
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);

  // Energy field glow based on displacement
  float energy = abs(vDisplacement) * 10.0;
  energy = clamp(energy, 0.0, 1.0);

  // Pulsing glow
  float pulse = sin(uTime * 3.0 + vUv.y * 10.0) * 0.5 + 0.5;

  vec3 baseColor = uColor;
  vec3 glowEffect = uGlowColor * (fresnel + energy) * uGlowIntensity * pulse;

  vec3 finalColor = baseColor + glowEffect;
  gl_FragColor = vec4(finalColor, uOpacity);
}
`;
