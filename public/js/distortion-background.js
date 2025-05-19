import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";

const DITHER_MOTION_SPEED = 2.0;
const DITHER_MOTION_AMPLITUDE = 1.5;
const BLOB_BASE_RADIUS = 2.0;
const BLOB_NOISE_FREQUENCY_VERTEX = 0.75;
const BLOB_NOISE_AMPLITUDE_VERTEX = 0.65;
const BLOB_NOISE_SPEED_VERTEX = 0.08;
const PARTICLE_COUNT = 1200;
const STAR_COUNT = 3000;

let scene, camera, renderer, composer;
let controls, stars, blob;
let ditherPattern = 0;
let ditherScale = 1.5;

export function initDistortionBackground(container) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.025);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5.0);

  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    powerPreference: "high-performance" 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  
  // Clear container and append canvas
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  container.appendChild(renderer.domElement);

  // Setup post-processing
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 
    0.45, 0.55, 0.75
  );
  composer.addPass(bloomPass);

  const filmPass = new FilmPass(0.20, 0.15, 648, false);
  composer.addPass(filmPass);

  // Setup controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.04;
  controls.rotateSpeed = 0.20;
  controls.minDistance = 2.0;
  controls.maxDistance = 12;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x606070, 0.6);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xffddaa, 0.9, 60);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xaaccff, 0.6, 60);
  pointLight2.position.set(-5, -3, -4);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xff8844, 0.75, 60);
  pointLight3.position.set(0, -5, 3);
  scene.add(pointLight3);

  // Create stars
  createStars();
  
  // Create blob
  createBlob();

  // Handle resize
  window.addEventListener('resize', onWindowResize);

  // Start animation loop
  animate();
  
  // Return control methods
  return {
    setDitherPattern: (pattern) => {
      ditherPattern = parseInt(pattern);
      if (blob) {
        blob.material.uniforms.uDitherPattern.value = ditherPattern;
      }
    },
    setDitherScale: (scale) => {
      ditherScale = parseFloat(scale);
      if (blob) {
        blob.material.uniforms.ditherScale.value = ditherScale;
      }
    }
  };
}

function createStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = [];
  const starColors = [];
  const starSizes = [];

  for (let i = 0; i < STAR_COUNT; i++) {
    const x = THREE.MathUtils.randFloatSpread(200);
    const y = THREE.MathUtils.randFloatSpread(200);
    const z = THREE.MathUtils.randFloatSpread(200);
    starPositions.push(x, y, z);
    const color = new THREE.Color();
    color.setHSL(THREE.MathUtils.randFloat(0.5, 0.7), 0.2, THREE.MathUtils.randFloat(0.3, 0.6));
    starColors.push(color.r, color.g, color.b);
    starSizes.push(THREE.MathUtils.randFloat(0.5, 1.5));
  }
  
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
  starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

  const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
    },
    vertexShader: `
      uniform float uTime;
      attribute float size;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (100.0 / -mvPosition.z) * (sin(position.x * 0.1 + uTime * 0.3) * 0.2 + 0.8);
        vAlpha = clamp(1.0 - (-mvPosition.z / 150.0), 0.1, 0.8);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        gl_FragColor = vec4(vColor, vAlpha * (0.6 + 0.4 * sin(uTime * 2.0 + gl_FragCoord.x * 0.5)));
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  });
  
  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

function createBlob() {
  const ditherPatternsFunction = `
    const float bayerMatrix[64] = float[64](
      0.0/64.0, 32.0/64.0,  8.0/64.0, 40.0/64.0,  2.0/64.0, 34.0/64.0, 10.0/64.0, 42.0/64.0,
      48.0/64.0, 16.0/64.0, 56.0/64.0, 24.0/64.0, 50.0/64.0, 18.0/64.0, 58.0/64.0, 26.0/64.0,
      12.0/64.0, 44.0/64.0,  4.0/64.0, 36.0/64.0, 14.0/64.0, 46.0/64.0,  6.0/64.0, 38.0/64.0,
      60.0/64.0, 28.0/64.0, 52.0/64.0, 20.0/64.0, 62.0/64.0, 30.0/64.0, 54.0/64.0, 22.0/64.0,
      3.0/64.0, 35.0/64.0, 11.0/64.0, 43.0/64.0,  1.0/64.0, 33.0/64.0,  9.0/64.0, 41.0/64.0,
      51.0/64.0, 19.0/64.0, 59.0/64.0, 27.0/64.0, 49.0/64.0, 17.0/64.0, 57.0/64.0, 25.0/64.0,
      15.0/64.0, 47.0/64.0,  7.0/64.0, 39.0/64.0, 13.0/64.0, 45.0/64.0,  5.0/64.0, 37.0/64.0,
      63.0/64.0, 31.0/64.0, 55.0/64.0, 23.0/64.0, 61.0/64.0, 29.0/64.0, 53.0/64.0, 21.0/64.0
    );

    float getBayerValue(vec2 coord) {
      int x = int(mod(coord.x, 8.0));
      int y = int(mod(coord.y, 8.0));
      return bayerMatrix[y * 8 + x];
    }

    float getHalftoneValue(vec2 coord, float time) {
      vec2 c = vec2(0.5);
      coord = mod(coord * 0.1 + vec2(sin(time*0.1)*0.02, cos(time*0.1)*0.02), 1.0);
      float d = distance(coord, c);
      return smoothstep(0.28, 0.29, d);
    }

    float getLinePatternValue(vec2 coord, float time) {
      float lw = 0.35 + sin(time*0.15)*0.1;
      float p1 = mod(coord.x*0.15+sin(coord.y*0.04+time*0.08)*0.6,1.0);
      float p2 = mod(coord.y*0.15+cos(coord.x*0.04+time*0.12)*0.6,1.0);
      return max(smoothstep(0.0,lw,p1)*smoothstep(1.0,1.0-lw,p1), smoothstep(0.0,lw,p2)*smoothstep(1.0,1.0-lw,p2));
    }

    float getNoiseDitheringValue(vec2 coord, float time) {
      return fract(sin(dot(coord + time * 0.05, vec2(12.9898, 78.233))) * 43758.5453);
    }

    vec3 ditherMonochrome(vec3 color, vec2 baseScreenPos, float colorLevels, float time,
                          float motionSpeed, float motionAmplitude, int patternType) {
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      luminance = pow(luminance, 1.2); 
      luminance = (luminance - 0.5) * 6.0 + 0.5; 
      luminance = clamp(luminance, 0.0, 1.0);

      vec2 ditherScreenPos = baseScreenPos;
      ditherScreenPos.x += sin(time * motionSpeed * 0.75 + baseScreenPos.y * 0.08) * motionAmplitude;
      ditherScreenPos.y += cos(time * motionSpeed * 0.55 + baseScreenPos.x * 0.08) * motionAmplitude;

      float threshold = 0.5; 

      if (patternType == 0) { 
        threshold = getBayerValue(ditherScreenPos);
      } else if (patternType == 1) { 
        threshold = getHalftoneValue(ditherScreenPos, time);
      } else if (patternType == 2) { 
        threshold = getLinePatternValue(ditherScreenPos, time);
      } else if (patternType == 3) { 
        threshold = getNoiseDitheringValue(ditherScreenPos, time);
      } else if (patternType == 4) { 
        threshold = 0.5;
      }

      float ditheredValue = (luminance < threshold) ? 0.0 : 1.0;
      return vec3(ditheredValue);
    }
  `;

  const glslRandFunction = `
    float rand(vec3 co){ return fract(sin(dot(co, vec3(12.9898,78.233,53.543))) * 43758.5453); }
    float snoise(vec3 p) {
      vec3 ip = floor(p); vec3 fp = fract(p); fp = fp*fp*(3.0-2.0*fp);
      float v000=rand(ip+vec3(0,0,0)); float v100=rand(ip+vec3(1,0,0)); float v010=rand(ip+vec3(0,1,0)); float v110=rand(ip+vec3(1,1,0));
      float v001=rand(ip+vec3(0,0,1)); float v101=rand(ip+vec3(1,0,1)); float v011=rand(ip+vec3(0,1,1)); float v111=rand(ip+vec3(1,1,1));
      return mix(mix(mix(v000,v100,fp.x),mix(v010,v110,fp.x),fp.y), mix(mix(v001,v101,fp.x),mix(v011,v111,fp.x),fp.y),fp.z);
    }
  `;

  const blobMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      ditherScale: { value: ditherScale },
      colorLevels: { value: 2.0 },
      uDitherMotionSpeed: { value: DITHER_MOTION_SPEED },
      uDitherMotionAmplitude: { value: DITHER_MOTION_AMPLITUDE },
      uBaseColor: { value: new THREE.Color(0x8b5cf6) },  // Purple to match our color scheme
      uFresnelPower: { value: 2.5 },
      uVertexNoiseFrequency: { value: BLOB_NOISE_FREQUENCY_VERTEX },
      uVertexNoiseAmplitude: { value: BLOB_NOISE_AMPLITUDE_VERTEX },
      uVertexNoiseSpeed: { value: BLOB_NOISE_SPEED_VERTEX },
      uSurfaceNoiseFrequency: { value: 2.8 },
      uSurfaceNoiseAmplitude: { value: 0.22 },
      uDitherPattern: { value: ditherPattern },
      uCoreBrightness: { value: 0.2 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uVertexNoiseFrequency;
      uniform float uVertexNoiseAmplitude;
      uniform float uVertexNoiseSpeed;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      ${glslRandFunction}
      void main() {
        vec3 pos = position;
        float displacement = snoise(pos * uVertexNoiseFrequency + uTime * uVertexNoiseSpeed) * uVertexNoiseAmplitude;
        displacement += snoise(pos * uVertexNoiseFrequency * 2.2 + uTime * uVertexNoiseSpeed * 1.4) * (uVertexNoiseAmplitude * 0.45);
        pos += normal * displacement;
        vec3 offset = vec3(0.01, 0.01, 0.01);
        float ddx_noise_orig = snoise((position + offset.xyy) * uVertexNoiseFrequency + uTime * uVertexNoiseSpeed) * uVertexNoiseAmplitude;
        ddx_noise_orig += snoise((position + offset.xyy) * uVertexNoiseFrequency * 2.2 + uTime * uVertexNoiseSpeed * 1.4) * (uVertexNoiseAmplitude * 0.45);
        vec3 p_ddx = (position + offset.xyy) + normal * ddx_noise_orig;
        float ddy_noise_orig = snoise((position + offset.yxy) * uVertexNoiseFrequency + uTime * uVertexNoiseSpeed) * uVertexNoiseAmplitude;
        ddy_noise_orig += snoise((position + offset.yxy) * uVertexNoiseFrequency * 2.2 + uTime * uVertexNoiseSpeed * 1.4) * (uVertexNoiseAmplitude * 0.45);
        vec3 p_ddy = (position + offset.yxy) + normal * ddy_noise_orig;
        vec3 tangent = normalize(p_ddx - pos);
        vec3 bitangent = normalize(p_ddy - pos);
        vec3 displacedNormal = normalize(cross(tangent, bitangent));
        if (length(displacedNormal) < 0.1) { displacedNormal = normal; }
        vNormal = normalize(normalMatrix * displacedNormal);
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float ditherScale;
      uniform float colorLevels;
      uniform float uDitherMotionSpeed;
      uniform float uDitherMotionAmplitude;
      uniform vec3 uBaseColor;
      uniform float uFresnelPower;
      uniform float uSurfaceNoiseFrequency;
      uniform float uSurfaceNoiseAmplitude;
      uniform int uDitherPattern;
      uniform float uCoreBrightness;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      ${ditherPatternsFunction}
      ${glslRandFunction}
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, normal)), uFresnelPower);
        fresnel = smoothstep(0.0, 1.0, fresnel) * 0.6 + 0.4;
        float rim = pow(1.0 - abs(dot(viewDir, normal)), 10.0);
        fresnel += rim * 0.25;
        float surfaceNoise1 = snoise(vWorldPosition * uSurfaceNoiseFrequency + vec3(uTime * 0.1, uTime * 0.06, uTime * 0.08));
        float surfaceNoise2 = snoise(vWorldPosition * uSurfaceNoiseFrequency * 2.7 + vec3(uTime * 0.15, uTime * 0.1, uTime * -0.04)) * 0.45;
        float surfaceNoise = (surfaceNoise1 + surfaceNoise2) * 0.5 + 0.5;
        surfaceNoise = surfaceNoise * uSurfaceNoiseAmplitude + (1.0 - uSurfaceNoiseAmplitude * 0.6);
        float coreGlow = pow(max(0.0, dot(viewDir, normal)), 2.0) * uCoreBrightness;
        float intensity = (fresnel + coreGlow) * surfaceNoise;
        intensity = clamp(intensity, 0.02, 1.0);
        vec3 finalColor = uBaseColor * intensity;
        vec2 screenPos = gl_FragCoord.xy / ditherScale;
        finalColor = ditherMonochrome(finalColor, screenPos, colorLevels, uTime, 
                                    uDitherMotionSpeed, uDitherMotionAmplitude, uDitherPattern);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: false,
    side: THREE.FrontSide
  });

  const geometry = new THREE.IcosahedronGeometry(BLOB_BASE_RADIUS, 5);
  blob = new THREE.Mesh(geometry, blobMaterial);
  scene.add(blob);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  
  const time = performance.now() * 0.001;
  
  if (controls) controls.update();
  
  if (stars && stars.material.uniforms) {
    stars.material.uniforms.uTime.value = time;
  }
  
  if (blob && blob.material.uniforms) {
    blob.material.uniforms.uTime.value = time;
    blob.rotation.y = time * 0.05;
  }
  
  composer.render();
}
