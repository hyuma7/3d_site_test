export const fresnelVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const fresnelFragmentShader = /* glsl */ `
uniform float uFresnelPower;
uniform float uFresnelScale;
uniform vec3 uFresnelColor;
uniform vec3 uBaseColor;
uniform float uTime;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), uFresnelPower);
  fresnel = fresnel * uFresnelScale;

  // Animated rim glow
  float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
  vec3 fresnelEffect = uFresnelColor * fresnel * pulse;

  vec3 finalColor = uBaseColor + fresnelEffect;
  gl_FragColor = vec4(finalColor, uOpacity);
}
`;
