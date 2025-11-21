export const holographicVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const holographicFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uHoloIntensity;
uniform float uScanlineSpeed;
uniform float uRainbowSpread;
uniform vec3 uBaseColor;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
varying vec3 vWorldPosition;

vec3 rainbow(float t) {
  vec3 c = vec3(
    sin(t * 6.28318 + 0.0),
    sin(t * 6.28318 + 2.094),
    sin(t * 6.28318 + 4.188)
  );
  return c * 0.5 + 0.5;
}

void main() {
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);

  // Scanline effect
  float scanline = sin(vWorldPosition.y * 50.0 + uTime * uScanlineSpeed) * 0.5 + 0.5;
  scanline = pow(scanline, 8.0);

  // Rainbow interference
  float angle = atan(vNormal.x, vNormal.z);
  float rainbowT = angle / 6.28318 + uTime * 0.1;
  vec3 rainbowColor = rainbow(rainbowT * uRainbowSpread);

  // Holographic layers
  float holoPattern = sin(vUv.x * 100.0 + uTime) * sin(vUv.y * 100.0 - uTime);
  holoPattern = holoPattern * 0.5 + 0.5;

  vec3 holoColor = mix(uBaseColor, rainbowColor, fresnel * uHoloIntensity);
  holoColor += scanline * rainbowColor * 0.3 * uHoloIntensity;
  holoColor += holoPattern * 0.05 * uHoloIntensity;

  gl_FragColor = vec4(holoColor, uOpacity);
}
`;
