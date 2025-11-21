export const pbrVertexShader = /* glsl */ `
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

export const pbrFragmentShader = /* glsl */ `
uniform float uRoughness;
uniform float uMetalness;
uniform float uAoIntensity;
uniform float uEnvMapIntensity;
uniform vec3 uAlbedo;
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
varying vec3 vWorldPosition;

const float PI = 3.14159265359;

// GGX Distribution
float D_GGX(float NoH, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NoH2 = NoH * NoH;
  float nom = a2;
  float denom = (NoH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;
  return nom / denom;
}

// Schlick-GGX Geometry
float G_SchlickGGX(float NoV, float roughness) {
  float r = roughness + 1.0;
  float k = (r * r) / 8.0;
  float nom = NoV;
  float denom = NoV * (1.0 - k) + k;
  return nom / denom;
}

float G_Smith(float NoV, float NoL, float roughness) {
  float ggx2 = G_SchlickGGX(NoV, roughness);
  float ggx1 = G_SchlickGGX(NoL, roughness);
  return ggx1 * ggx2;
}

// Fresnel-Schlick
vec3 F_Schlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewPosition);
  vec3 L = normalize(uLightPosition - vWorldPosition);
  vec3 H = normalize(V + L);

  float NoV = max(dot(N, V), 0.0);
  float NoL = max(dot(N, L), 0.0);
  float NoH = max(dot(N, H), 0.0);
  float HoV = max(dot(H, V), 0.0);

  // F0 for dielectric/metallic
  vec3 F0 = vec3(0.04);
  F0 = mix(F0, uAlbedo, uMetalness);

  // Cook-Torrance BRDF
  float D = D_GGX(NoH, uRoughness);
  float G = G_Smith(NoV, NoL, uRoughness);
  vec3 F = F_Schlick(HoV, F0);

  vec3 kS = F;
  vec3 kD = vec3(1.0) - kS;
  kD *= 1.0 - uMetalness;

  vec3 numerator = D * G * F;
  float denominator = 4.0 * NoV * NoL + 0.001;
  vec3 specular = numerator / denominator;

  vec3 Lo = (kD * uAlbedo / PI + specular) * uLightColor * uLightIntensity * NoL;

  // Ambient with AO
  vec3 ambient = vec3(0.03) * uAlbedo * uAoIntensity;

  // Environment reflection approximation
  vec3 R = reflect(-V, N);
  float envFresnel = pow(1.0 - NoV, 5.0);
  vec3 envColor = mix(vec3(0.1, 0.1, 0.15), vec3(0.3, 0.3, 0.4), envFresnel);
  vec3 envReflection = envColor * uMetalness * uEnvMapIntensity;

  vec3 color = ambient + Lo + envReflection;

  // Tone mapping
  color = color / (color + vec3(1.0));
  color = pow(color, vec3(1.0/2.2));

  gl_FragColor = vec4(color, uOpacity);
}
`;
