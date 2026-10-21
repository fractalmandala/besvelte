// Generated registry for Bitbacks background components
import type { Component } from 'svelte';

export type PropControl =
  | {
      key: string;
      label: string;
      type: 'number';
      default: number;
      min: number;
      max: number;
      step: number;
    }
  | {
      key: string;
      label: string;
      type: 'color';
      default: string;
      format?: 'hex' | 'rgbTuple' | 'array';
      targetKey?: string;
      arrayIndex?: number;
    }
  | {
      key: string;
      label: string;
      type: 'boolean';
      default: boolean;
    }
  | {
      key: string;
      label: string;
      type: 'select';
      default: string;
      options: string[];
    };

export interface BackgroundEntry {
  id: string;
  name: string;
  description: string;
  loader: () => Promise<{ default: Component<any> }>;
  controls: PropControl[];
  defaults: Record<string, any>;
}

export const THEME_PALETTE = [
  "#4cb156",
  "#709d16",
  "#86dc8b",
  "#9ec861",
  "#01460f",
  "#213a00",
  "#226829",
  "#3d5c0d"
];

export const BACKGROUND_REGISTRY: Record<string, BackgroundEntry> = {
  Aurora: {
    id: "Aurora",
    name: "Aurora",
    description: "WebGL aurora background with configurable color stops, amplitude, blend and speed. Real OGL shader, not a CSS gradient.",
    loader: () => import('./Aurora.svelte'),
    controls: [
          {
                "key": "colorStops_0",
                "targetKey": "colorStops",
                "arrayIndex": 0,
                "label": "Color Stops 1",
                "type": "color",
                "default": "#4cb156",
                "format": "array"
          },
          {
                "key": "colorStops_1",
                "targetKey": "colorStops",
                "arrayIndex": 1,
                "label": "Color Stops 2",
                "type": "color",
                "default": "#709d16",
                "format": "array"
          },
          {
                "key": "colorStops_2",
                "targetKey": "colorStops",
                "arrayIndex": 2,
                "label": "Color Stops 3",
                "type": "color",
                "default": "#86dc8b",
                "format": "array"
          },
          {
                "key": "amplitude",
                "label": "Amplitude",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "blend",
                "label": "Blend",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "time",
                "label": "Time",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          }
    ],
    defaults: {
          "colorStops": [
                "#FF3E00",
                "#FF8A4C",
                "#FF3E00"
          ],
          "colorStops_0": "#4cb156",
          "colorStops_1": "#709d16",
          "colorStops_2": "#86dc8b",
          "amplitude": 1,
          "blend": 0.5,
          "time": 1,
          "speed": 1
    }
  },
  Balatro: {
    id: "Balatro",
    name: "Balatro",
    description: "Swirling pixel-painted Balatro-style WebGL background with mouse interaction.",
    loader: () => import('./Balatro.svelte'),
    controls: [
          {
                "key": "spinRotation",
                "label": "Spin Rotation",
                "type": "number",
                "default": -2,
                "min": -5,
                "max": 4,
                "step": 0.1
          },
          {
                "key": "spinSpeed",
                "label": "Spin Speed",
                "type": "number",
                "default": 7,
                "min": 0,
                "max": 14,
                "step": 0.1
          },
          {
                "key": "color1",
                "label": "Color1",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "color2",
                "label": "Color2",
                "type": "color",
                "default": "#709d16",
                "format": "hex"
          },
          {
                "key": "color3",
                "label": "Color3",
                "type": "color",
                "default": "#86dc8b",
                "format": "hex"
          },
          {
                "key": "contrast",
                "label": "Contrast",
                "type": "number",
                "default": 3.5,
                "min": 0,
                "max": 7,
                "step": 0.05
          },
          {
                "key": "lighting",
                "label": "Lighting",
                "type": "number",
                "default": 0.4,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "spinAmount",
                "label": "Spin Amount",
                "type": "number",
                "default": 0.25,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "pixelFilter",
                "label": "Pixel Filter",
                "type": "number",
                "default": 745,
                "min": 0,
                "max": 1490,
                "step": 5
          },
          {
                "key": "spinEase",
                "label": "Spin Ease",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "isRotate",
                "label": "Is Rotate",
                "type": "boolean",
                "default": false
          },
          {
                "key": "mouseInteraction",
                "label": "Mouse Interaction",
                "type": "boolean",
                "default": true
          }
    ],
    defaults: {
          "spinRotation": -2,
          "spinSpeed": 7,
          "offset": [
                0,
                0
          ],
          "color1": "#4cb156",
          "color2": "#709d16",
          "color3": "#86dc8b",
          "contrast": 3.5,
          "lighting": 0.4,
          "spinAmount": 0.25,
          "pixelFilter": 745,
          "spinEase": 1,
          "isRotate": false,
          "mouseInteraction": true
    }
  },
  Ballpit: {
    id: "Ballpit",
    name: "Ballpit",
    description: "Interactive 3D ball pit using Three.js physics.",
    loader: () => import('./Ballpit.svelte'),
    controls: [],
    defaults: {}
  },
  Beams: {
    id: "Beams",
    name: "Beams",
    description: "Light beams animated with noise displacement.",
    loader: () => import('./Beams.svelte'),
    controls: [
          {
                "key": "beamWidth",
                "label": "Beam Width",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "beamHeight",
                "label": "Beam Height",
                "type": "number",
                "default": 15,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "beamNumber",
                "label": "Beam Number",
                "type": "number",
                "default": 12,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "lightColor",
                "label": "Light Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "noiseIntensity",
                "label": "Noise Intensity",
                "type": "number",
                "default": 1.75,
                "min": 0,
                "max": 4,
                "step": 0.05
          },
          {
                "key": "scale",
                "label": "Scale",
                "type": "number",
                "default": 0.2,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "rotation",
                "label": "Rotation",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "beamWidth": 2,
          "beamHeight": 15,
          "beamNumber": 12,
          "lightColor": "#4cb156",
          "speed": 2,
          "noiseIntensity": 1.75,
          "scale": 0.2,
          "rotation": 0
    }
  },
  ColorBends: {
    id: "ColorBends",
    name: "Color Bends",
    description: "Three.js shader background with warped color bands, pointer parallax, noise, and rotation controls.",
    loader: () => import('./ColorBends.svelte'),
    controls: [],
    defaults: {}
  },
  DarkVeil: {
    id: "DarkVeil",
    name: "Dark Veil",
    description: "Dark veil WebGL background with hue shift, scanlines, noise and warp controls.",
    loader: () => import('./DarkVeil.svelte'),
    controls: [
          {
                "key": "hueShift",
                "label": "Hue Shift",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 360,
                "step": 1
          },
          {
                "key": "noiseIntensity",
                "label": "Noise Intensity",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "scanlineIntensity",
                "label": "Scanline Intensity",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "scanlineFrequency",
                "label": "Scanline Frequency",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "warpAmount",
                "label": "Warp Amount",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "resolutionScale",
                "label": "Resolution Scale",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          }
    ],
    defaults: {
          "hueShift": 0,
          "noiseIntensity": 0,
          "scanlineIntensity": 0,
          "speed": 0.5,
          "scanlineFrequency": 0,
          "warpAmount": 0,
          "resolutionScale": 1
    }
  },
  Dither: {
    id: "Dither",
    name: "Dither",
    description: "Bayer-dithered animated wave field.",
    loader: () => import('./Dither.svelte'),
    controls: [
          {
                "key": "waveSpeed",
                "label": "Wave Speed",
                "type": "number",
                "default": 0.05,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "waveFrequency",
                "label": "Wave Frequency",
                "type": "number",
                "default": 3,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "waveAmplitude",
                "label": "Wave Amplitude",
                "type": "number",
                "default": 0.3,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "waveColor",
                "label": "Wave Color",
                "type": "color",
                "default": "#4cb156",
                "format": "rgbTuple"
          },
          {
                "key": "colorNum",
                "label": "Color Num",
                "type": "number",
                "default": 4,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "pixelSize",
                "label": "Pixel Size",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "disableAnimation",
                "label": "Disable Animation",
                "type": "boolean",
                "default": false
          },
          {
                "key": "enableMouseInteraction",
                "label": "Enable Mouse Interaction",
                "type": "boolean",
                "default": true
          },
          {
                "key": "mouseRadius",
                "label": "Mouse Radius",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "waveSpeed": 0.05,
          "waveFrequency": 3,
          "waveAmplitude": 0.3,
          "waveColor": "#4cb156",
          "colorNum": 4,
          "pixelSize": 2,
          "disableAnimation": false,
          "enableMouseInteraction": true,
          "mouseRadius": 1
    }
  },
  DotField: {
    id: "DotField",
    name: "Dot Field",
    description: "Interactive dotted canvas background with cursor bulge, glow, sparkle, and wave controls.",
    loader: () => import('./DotField.svelte'),
    controls: [],
    defaults: {}
  },
  DotGrid: {
    id: "DotGrid",
    name: "Dot Grid",
    description: "Interactive grid of dots with cursor proximity highlighting and shockwave click physics.",
    loader: () => import('./DotGrid.svelte'),
    controls: [
          {
                "key": "dotSize",
                "label": "Dot Size",
                "type": "number",
                "default": 16,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "gap",
                "label": "Gap",
                "type": "number",
                "default": 32,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "baseColor",
                "label": "Base Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "activeColor",
                "label": "Active Color",
                "type": "color",
                "default": "#709d16",
                "format": "hex"
          },
          {
                "key": "proximity",
                "label": "Proximity",
                "type": "number",
                "default": 150,
                "min": 0,
                "max": 300,
                "step": 5
          },
          {
                "key": "speedTrigger",
                "label": "Speed Trigger",
                "type": "number",
                "default": 100,
                "min": 0,
                "max": 200,
                "step": 0.1
          },
          {
                "key": "shockRadius",
                "label": "Shock Radius",
                "type": "number",
                "default": 250,
                "min": 0,
                "max": 500,
                "step": 5
          },
          {
                "key": "shockStrength",
                "label": "Shock Strength",
                "type": "number",
                "default": 5,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "maxSpeed",
                "label": "Max Speed",
                "type": "number",
                "default": 5000,
                "min": 0,
                "max": 10000,
                "step": 0.1
          },
          {
                "key": "resistance",
                "label": "Resistance",
                "type": "number",
                "default": 750,
                "min": 0,
                "max": 1500,
                "step": 5
          },
          {
                "key": "returnDuration",
                "label": "Return Duration",
                "type": "number",
                "default": 1.5,
                "min": 0,
                "max": 10,
                "step": 0.1
          }
    ],
    defaults: {
          "dotSize": 16,
          "gap": 32,
          "baseColor": "#4cb156",
          "activeColor": "#709d16",
          "proximity": 150,
          "speedTrigger": 100,
          "shockRadius": 250,
          "shockStrength": 5,
          "maxSpeed": 5000,
          "resistance": 750,
          "returnDuration": 1.5
    }
  },
  EvilEye: {
    id: "EvilEye",
    name: "Evil Eye",
    description: "Reactive evil eye background with cursor-tracked pupil.",
    loader: () => import('./EvilEye.svelte'),
    controls: [
          {
                "key": "eyeColor",
                "label": "Eye Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "intensity",
                "label": "Intensity",
                "type": "number",
                "default": 1.5,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "pupilSize",
                "label": "Pupil Size",
                "type": "number",
                "default": 0.6,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "irisWidth",
                "label": "Iris Width",
                "type": "number",
                "default": 0.25,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "glowIntensity",
                "label": "Glow Intensity",
                "type": "number",
                "default": 0.35,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "scale",
                "label": "Scale",
                "type": "number",
                "default": 0.8,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "noiseScale",
                "label": "Noise Scale",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "pupilFollow",
                "label": "Pupil Follow",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "flameSpeed",
                "label": "Flame Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "backgroundColor",
                "label": "Background Color",
                "type": "color",
                "default": "#000000",
                "format": "hex"
          }
    ],
    defaults: {
          "eyeColor": "#4cb156",
          "intensity": 1.5,
          "pupilSize": 0.6,
          "irisWidth": 0.25,
          "glowIntensity": 0.35,
          "scale": 0.8,
          "noiseScale": 1,
          "pupilFollow": 1,
          "flameSpeed": 1,
          "backgroundColor": "#000000"
    }
  },
  FaultyTerminal: {
    id: "FaultyTerminal",
    name: "Faulty Terminal",
    description: "OGL terminal-style shader background with scanlines, glitches, curvature, mouse reaction, and load animation.",
    loader: () => import('./FaultyTerminal.svelte'),
    controls: [],
    defaults: {}
  },
  FloatingLines: {
    id: "FloatingLines",
    name: "Floating Lines",
    description: "Layered animated wave lines with parallax & bend.",
    loader: () => import('./FloatingLines.svelte'),
    controls: [
          {
                "key": "linesGradient_0",
                "targetKey": "linesGradient",
                "arrayIndex": 0,
                "label": "Lines Gradient 1",
                "type": "color",
                "default": "#4cb156",
                "format": "array"
          },
          {
                "key": "linesGradient_1",
                "targetKey": "linesGradient",
                "arrayIndex": 1,
                "label": "Lines Gradient 2",
                "type": "color",
                "default": "#709d16",
                "format": "array"
          },
          {
                "key": "enabledWaves",
                "label": "Enabled Waves",
                "type": "select",
                "options": [
                      "Array<'top",
                      "middle",
                      "bottom'>"
                ],
                "default": "Array<'top"
          },
          {
                "key": "animationSpeed",
                "label": "Animation Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "interactive",
                "label": "Interactive",
                "type": "boolean",
                "default": true
          },
          {
                "key": "bendRadius",
                "label": "Bend Radius",
                "type": "number",
                "default": 5,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "bendStrength",
                "label": "Bend Strength",
                "type": "number",
                "default": -0.5,
                "min": -2,
                "max": 1,
                "step": 0.1
          },
          {
                "key": "mouseDamping",
                "label": "Mouse Damping",
                "type": "number",
                "default": 0.05,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "parallax",
                "label": "Parallax",
                "type": "boolean",
                "default": true
          },
          {
                "key": "parallaxStrength",
                "label": "Parallax Strength",
                "type": "number",
                "default": 0.2,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "linesGradient_0": "#4cb156",
          "linesGradient_1": "#709d16",
          "enabledWaves": [
                "top",
                "middle",
                "bottom"
          ],
          "lineCount": [
                6
          ],
          "lineDistance": [
                5
          ],
          "bottomWavePosition": "{ x: 2, y: -0.7, rotate: -1 }",
          "animationSpeed": 1,
          "interactive": true,
          "bendRadius": 5,
          "bendStrength": -0.5,
          "mouseDamping": 0.05,
          "parallax": true,
          "parallaxStrength": 0.2,
          "mixBlendMode": "screen"
    }
  },
  Galaxy: {
    id: "Galaxy",
    name: "Galaxy",
    description: "Animated galaxy of twinkling stars.",
    loader: () => import('./Galaxy.svelte'),
    controls: [
          {
                "key": "starSpeed",
                "label": "Star Speed",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "density",
                "label": "Density",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "hueShift",
                "label": "Hue Shift",
                "type": "number",
                "default": 30,
                "min": 0,
                "max": 360,
                "step": 1
          },
          {
                "key": "disableAnimation",
                "label": "Disable Animation",
                "type": "boolean",
                "default": false
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "mouseInteraction",
                "label": "Mouse Interaction",
                "type": "boolean",
                "default": true
          },
          {
                "key": "glowIntensity",
                "label": "Glow Intensity",
                "type": "number",
                "default": 0.3,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "saturation",
                "label": "Saturation",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "mouseRepulsion",
                "label": "Mouse Repulsion",
                "type": "boolean",
                "default": true
          },
          {
                "key": "twinkleIntensity",
                "label": "Twinkle Intensity",
                "type": "number",
                "default": 0.3,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "rotationSpeed",
                "label": "Rotation Speed",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "repulsionStrength",
                "label": "Repulsion Strength",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "autoCenterRepulsion",
                "label": "Auto Center Repulsion",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "transparent",
                "label": "Transparent",
                "type": "boolean",
                "default": true
          }
    ],
    defaults: {
          "focal": [
                0.5,
                0.5
          ],
          "rotation": [
                1,
                0
          ],
          "starSpeed": 0.5,
          "density": 1,
          "hueShift": 30,
          "disableAnimation": false,
          "speed": 1,
          "mouseInteraction": true,
          "glowIntensity": 0.3,
          "saturation": 0,
          "mouseRepulsion": true,
          "twinkleIntensity": 0.3,
          "rotationSpeed": 0.1,
          "repulsionStrength": 2,
          "autoCenterRepulsion": 0,
          "transparent": true
    }
  },
  GradientBlinds: {
    id: "GradientBlinds",
    name: "Gradient Blinds",
    description: "Animated gradient blinds with spotlight tracking.",
    loader: () => import('./GradientBlinds.svelte'),
    controls: [
          {
                "key": "dpr",
                "label": "Dpr",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "paused",
                "label": "Paused",
                "type": "boolean",
                "default": false
          },
          {
                "key": "gradientColors_0",
                "targetKey": "gradientColors",
                "arrayIndex": 0,
                "label": "Gradient Colors 1",
                "type": "color",
                "default": "#4cb156",
                "format": "array"
          },
          {
                "key": "gradientColors_1",
                "targetKey": "gradientColors",
                "arrayIndex": 1,
                "label": "Gradient Colors 2",
                "type": "color",
                "default": "#709d16",
                "format": "array"
          },
          {
                "key": "angle",
                "label": "Angle",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "noise",
                "label": "Noise",
                "type": "number",
                "default": 0.3,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "blindCount",
                "label": "Blind Count",
                "type": "number",
                "default": 16,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "blindMinWidth",
                "label": "Blind Min Width",
                "type": "number",
                "default": 60,
                "min": 0,
                "max": 120,
                "step": 1
          },
          {
                "key": "mouseDampening",
                "label": "Mouse Dampening",
                "type": "number",
                "default": 0.15,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "mirrorGradient",
                "label": "Mirror Gradient",
                "type": "boolean",
                "default": false
          },
          {
                "key": "spotlightRadius",
                "label": "Spotlight Radius",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "spotlightSoftness",
                "label": "Spotlight Softness",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "spotlightOpacity",
                "label": "Spotlight Opacity",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "distortAmount",
                "label": "Distort Amount",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "shineDirection",
                "label": "Shine Direction",
                "type": "select",
                "options": [
                      "left",
                      "right"
                ],
                "default": "left"
          }
    ],
    defaults: {
          "dpr": 1,
          "paused": false,
          "gradientColors_0": "#4cb156",
          "gradientColors_1": "#709d16",
          "angle": 0,
          "noise": 0.3,
          "blindCount": 16,
          "blindMinWidth": 60,
          "mouseDampening": 0.15,
          "mirrorGradient": false,
          "spotlightRadius": 0.5,
          "spotlightSoftness": 1,
          "spotlightOpacity": 1,
          "distortAmount": 0,
          "shineDirection": "left",
          "mixBlendMode": "lighten"
    }
  },
  Grainient: {
    id: "Grainient",
    name: "Grainient",
    description: "Animated WebGL2 grainy gradient.",
    loader: () => import('./Grainient.svelte'),
    controls: [
          {
                "key": "timeSpeed",
                "label": "Time Speed",
                "type": "number",
                "default": 0.25,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "colorBalance",
                "label": "Color Balance",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "warpStrength",
                "label": "Warp Strength",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "warpFrequency",
                "label": "Warp Frequency",
                "type": "number",
                "default": 5,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "warpSpeed",
                "label": "Warp Speed",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "warpAmplitude",
                "label": "Warp Amplitude",
                "type": "number",
                "default": 50,
                "min": 0,
                "max": 100,
                "step": 0.05
          },
          {
                "key": "blendAngle",
                "label": "Blend Angle",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "blendSoftness",
                "label": "Blend Softness",
                "type": "number",
                "default": 0.05,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "rotationAmount",
                "label": "Rotation Amount",
                "type": "number",
                "default": 500,
                "min": 0,
                "max": 1000,
                "step": 5
          },
          {
                "key": "noiseScale",
                "label": "Noise Scale",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 4,
                "step": 0.05
          },
          {
                "key": "grainAmount",
                "label": "Grain Amount",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "grainScale",
                "label": "Grain Scale",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 4,
                "step": 0.05
          },
          {
                "key": "grainAnimated",
                "label": "Grain Animated",
                "type": "boolean",
                "default": false
          },
          {
                "key": "contrast",
                "label": "Contrast",
                "type": "number",
                "default": 1.5,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "gamma",
                "label": "Gamma",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "saturation",
                "label": "Saturation",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "centerX",
                "label": "Center X",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "centerY",
                "label": "Center Y",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "zoom",
                "label": "Zoom",
                "type": "number",
                "default": 0.9,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "color1",
                "label": "Color1",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "color2",
                "label": "Color2",
                "type": "color",
                "default": "#709d16",
                "format": "hex"
          },
          {
                "key": "color3",
                "label": "Color3",
                "type": "color",
                "default": "#86dc8b",
                "format": "hex"
          }
    ],
    defaults: {
          "timeSpeed": 0.25,
          "colorBalance": 0,
          "warpStrength": 1,
          "warpFrequency": 5,
          "warpSpeed": 2,
          "warpAmplitude": 50,
          "blendAngle": 0,
          "blendSoftness": 0.05,
          "rotationAmount": 500,
          "noiseScale": 2,
          "grainAmount": 0.1,
          "grainScale": 2,
          "grainAnimated": false,
          "contrast": 1.5,
          "gamma": 1,
          "saturation": 1,
          "centerX": 0,
          "centerY": 0,
          "zoom": 0.9,
          "color1": "#4cb156",
          "color2": "#709d16",
          "color3": "#86dc8b"
    }
  },
  GridDistortion: {
    id: "GridDistortion",
    name: "Grid Distortion",
    description: "Image grid distortion driven by mouse movement.",
    loader: () => import('./GridDistortion.svelte'),
    controls: [
          {
                "key": "grid",
                "label": "Grid",
                "type": "number",
                "default": 15,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "mouse",
                "label": "Mouse",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "strength",
                "label": "Strength",
                "type": "number",
                "default": 0.15,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "relaxation",
                "label": "Relaxation",
                "type": "number",
                "default": 0.9,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "grid": 15,
          "mouse": 0.1,
          "strength": 0.15,
          "relaxation": 0.9
    }
  },
  GridMotion: {
    id: "GridMotion",
    name: "Grid Motion",
    description: "Grid that pans with mouse position, powered by GSAP.",
    loader: () => import('./GridMotion.svelte'),
    controls: [],
    defaults: {}
  },
  GridScan: {
    id: "GridScan",
    name: "Grid Scan",
    description: "Animated 3D grid scan with bloom and chromatic aberration. Optional face tracking via face-api.js.",
    loader: () => import('./GridScan.svelte'),
    controls: [
          {
                "key": "enableWebcam",
                "label": "Enable Webcam",
                "type": "boolean",
                "default": false
          },
          {
                "key": "showPreview",
                "label": "Show Preview",
                "type": "boolean",
                "default": false
          },
          {
                "key": "sensitivity",
                "label": "Sensitivity",
                "type": "number",
                "default": 0.55,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "lineThickness",
                "label": "Line Thickness",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "linesColor",
                "label": "Lines Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "gridScale",
                "label": "Grid Scale",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "lineStyle",
                "label": "Line Style",
                "type": "select",
                "options": [
                      "solid",
                      "dashed",
                      "dotted"
                ],
                "default": "solid"
          },
          {
                "key": "lineJitter",
                "label": "Line Jitter",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "enablePost",
                "label": "Enable Post",
                "type": "boolean",
                "default": true
          },
          {
                "key": "bloomIntensity",
                "label": "Bloom Intensity",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "bloomThreshold",
                "label": "Bloom Threshold",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "bloomSmoothing",
                "label": "Bloom Smoothing",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "chromaticAberration",
                "label": "Chromatic Aberration",
                "type": "number",
                "default": 0.002,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "noiseIntensity",
                "label": "Noise Intensity",
                "type": "number",
                "default": 0.01,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "scanColor",
                "label": "Scan Color",
                "type": "color",
                "default": "#709d16",
                "format": "hex"
          },
          {
                "key": "scanOpacity",
                "label": "Scan Opacity",
                "type": "number",
                "default": 0.4,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "scanDirection",
                "label": "Scan Direction",
                "type": "select",
                "options": [
                      "forward",
                      "backward",
                      "pingpong"
                ],
                "default": "pingpong"
          },
          {
                "key": "scanSoftness",
                "label": "Scan Softness",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "scanGlow",
                "label": "Scan Glow",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "scanPhaseTaper",
                "label": "Scan Phase Taper",
                "type": "number",
                "default": 0.9,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "scanDuration",
                "label": "Scan Duration",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "scanDelay",
                "label": "Scan Delay",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "enableGyro",
                "label": "Enable Gyro",
                "type": "boolean",
                "default": false
          },
          {
                "key": "scanOnClick",
                "label": "Scan On Click",
                "type": "boolean",
                "default": false
          },
          {
                "key": "snapBackDelay",
                "label": "Snap Back Delay",
                "type": "number",
                "default": 250,
                "min": 0,
                "max": 500,
                "step": 5
          }
    ],
    defaults: {
          "enableWebcam": false,
          "showPreview": false,
          "modelsPath": "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights",
          "sensitivity": 0.55,
          "lineThickness": 1,
          "linesColor": "#4cb156",
          "gridScale": 0.1,
          "lineStyle": "solid",
          "lineJitter": 0.1,
          "enablePost": true,
          "bloomIntensity": 0,
          "bloomThreshold": 0,
          "bloomSmoothing": 0,
          "chromaticAberration": 0.002,
          "noiseIntensity": 0.01,
          "scanColor": "#709d16",
          "scanOpacity": 0.4,
          "scanDirection": "pingpong",
          "scanSoftness": 2,
          "scanGlow": 0.5,
          "scanPhaseTaper": 0.9,
          "scanDuration": 2,
          "scanDelay": 2,
          "enableGyro": false,
          "scanOnClick": false,
          "snapBackDelay": 250
    }
  },
  Hyperspeed: {
    id: "Hyperspeed",
    name: "Hyperspeed",
    description: "Three.js hyperspeed road background with bloom, SMAA, distortion presets, animated light trails, and hold-to-accelerate interaction.",
    loader: () => import('./Hyperspeed.svelte'),
    controls: [],
    defaults: {}
  },
  Iridescence: {
    id: "Iridescence",
    name: "Iridescence",
    description: "Animated iridescent WebGL background with optional mouse parallax.",
    loader: () => import('./Iridescence.svelte'),
    controls: [
          {
                "key": "color",
                "label": "Color",
                "type": "color",
                "default": "#4cb156",
                "format": "rgbTuple"
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "amplitude",
                "label": "Amplitude",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "mouseReact",
                "label": "Mouse React",
                "type": "boolean",
                "default": true
          }
    ],
    defaults: {
          "color": "#4cb156",
          "speed": 1,
          "amplitude": 0.1,
          "mouseReact": true
    }
  },
  LetterGlitch: {
    id: "LetterGlitch",
    name: "Letter Glitch",
    description: "Cascading glitchy letter grid background.",
    loader: () => import('./LetterGlitch.svelte'),
    controls: [
          {
                "key": "glitchColors_0",
                "targetKey": "glitchColors",
                "arrayIndex": 0,
                "label": "Glitch Colors 1",
                "type": "color",
                "default": "#4cb156",
                "format": "array"
          },
          {
                "key": "glitchColors_1",
                "targetKey": "glitchColors",
                "arrayIndex": 1,
                "label": "Glitch Colors 2",
                "type": "color",
                "default": "#709d16",
                "format": "array"
          },
          {
                "key": "glitchSpeed",
                "label": "Glitch Speed",
                "type": "number",
                "default": 50,
                "min": 0,
                "max": 100,
                "step": 0.1
          },
          {
                "key": "centerVignette",
                "label": "Center Vignette",
                "type": "boolean",
                "default": false
          },
          {
                "key": "outerVignette",
                "label": "Outer Vignette",
                "type": "boolean",
                "default": true
          },
          {
                "key": "smooth",
                "label": "Smooth",
                "type": "boolean",
                "default": true
          }
    ],
    defaults: {
          "glitchColors": [
                "#2b4539",
                "#61dca3",
                "#61b3dc"
          ],
          "glitchColors_0": "#4cb156",
          "glitchColors_1": "#709d16",
          "glitchSpeed": 50,
          "centerVignette": false,
          "outerVignette": true,
          "smooth": true,
          "characters": "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789"
    }
  },
  LightPillar: {
    id: "LightPillar",
    name: "LightPillar",
    description: "Volumetric raymarched light pillar.",
    loader: () => import('./LightPillar.svelte'),
    controls: [
          {
                "key": "topColor",
                "label": "Top Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "bottomColor",
                "label": "Bottom Color",
                "type": "color",
                "default": "#709d16",
                "format": "hex"
          },
          {
                "key": "intensity",
                "label": "Intensity",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "rotationSpeed",
                "label": "Rotation Speed",
                "type": "number",
                "default": 0.3,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "interactive",
                "label": "Interactive",
                "type": "boolean",
                "default": false
          },
          {
                "key": "glowAmount",
                "label": "Glow Amount",
                "type": "number",
                "default": 0.005,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "pillarWidth",
                "label": "Pillar Width",
                "type": "number",
                "default": 3,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "pillarHeight",
                "label": "Pillar Height",
                "type": "number",
                "default": 0.4,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "noiseIntensity",
                "label": "Noise Intensity",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "pillarRotation",
                "label": "Pillar Rotation",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "quality",
                "label": "Quality",
                "type": "select",
                "options": [
                      "low",
                      "medium",
                      "high"
                ],
                "default": "high"
          }
    ],
    defaults: {
          "topColor": "#4cb156",
          "bottomColor": "#709d16",
          "intensity": 1,
          "rotationSpeed": 0.3,
          "interactive": false,
          "glowAmount": 0.005,
          "pillarWidth": 3,
          "pillarHeight": 0.4,
          "noiseIntensity": 0.5,
          "mixBlendMode": "screen",
          "pillarRotation": 0,
          "quality": "high"
    }
  },
  LightRays: {
    id: "LightRays",
    name: "Light Rays",
    description: "Animated volumetric light rays rendered with OGL.",
    loader: () => import('./LightRays.svelte'),
    controls: [
          {
                "key": "raysOrigin",
                "label": "Rays Origin",
                "type": "select",
                "options": [
                      "top-center",
                      "top-left",
                      "top-right",
                      "right",
                      "left",
                      "bottom-center",
                      "bottom-right",
                      "bottom-left"
                ],
                "default": "top-center"
          },
          {
                "key": "raysColor",
                "label": "Rays Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "raysSpeed",
                "label": "Rays Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "lightSpread",
                "label": "Light Spread",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "rayLength",
                "label": "Ray Length",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "pulsating",
                "label": "Pulsating",
                "type": "boolean",
                "default": false
          },
          {
                "key": "fadeDistance",
                "label": "Fade Distance",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "saturation",
                "label": "Saturation",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "followMouse",
                "label": "Follow Mouse",
                "type": "boolean",
                "default": true
          },
          {
                "key": "mouseInfluence",
                "label": "Mouse Influence",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "noiseAmount",
                "label": "Noise Amount",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "distortion",
                "label": "Distortion",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "raysOrigin": "top-center",
          "raysColor": "#4cb156",
          "raysSpeed": 1,
          "lightSpread": 1,
          "rayLength": 2,
          "pulsating": false,
          "fadeDistance": 1,
          "saturation": 1,
          "followMouse": true,
          "mouseInfluence": 0.1,
          "noiseAmount": 0,
          "distortion": 0
    }
  },
  Lightning: {
    id: "Lightning",
    name: "Lightning",
    description: "Procedural lightning bolt WebGL background.",
    loader: () => import('./Lightning.svelte'),
    controls: [
          {
                "key": "hue",
                "label": "Hue",
                "type": "number",
                "default": 230,
                "min": 0,
                "max": 360,
                "step": 1
          },
          {
                "key": "xOffset",
                "label": "X Offset",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "intensity",
                "label": "Intensity",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "size",
                "label": "Size",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "hue": 230,
          "xOffset": 0,
          "speed": 1,
          "intensity": 1,
          "size": 1
    }
  },
  LineWaves: {
    id: "LineWaves",
    name: "Line Waves",
    description: "Warped line waves background powered by OGL.",
    loader: () => import('./LineWaves.svelte'),
    controls: [
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 0.3,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "innerLineCount",
                "label": "Inner Line Count",
                "type": "number",
                "default": 32,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "outerLineCount",
                "label": "Outer Line Count",
                "type": "number",
                "default": 36,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "warpIntensity",
                "label": "Warp Intensity",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "rotation",
                "label": "Rotation",
                "type": "number",
                "default": -45,
                "min": -113,
                "max": 90,
                "step": 0.1
          },
          {
                "key": "edgeFadeWidth",
                "label": "Edge Fade Width",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "colorCycleSpeed",
                "label": "Color Cycle Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "brightness",
                "label": "Brightness",
                "type": "number",
                "default": 0.2,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "color1",
                "label": "Color1",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "color2",
                "label": "Color2",
                "type": "color",
                "default": "#709d16",
                "format": "hex"
          },
          {
                "key": "color3",
                "label": "Color3",
                "type": "color",
                "default": "#86dc8b",
                "format": "hex"
          },
          {
                "key": "enableMouseInteraction",
                "label": "Enable Mouse Interaction",
                "type": "boolean",
                "default": true
          },
          {
                "key": "mouseInfluence",
                "label": "Mouse Influence",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          }
    ],
    defaults: {
          "speed": 0.3,
          "innerLineCount": 32,
          "outerLineCount": 36,
          "warpIntensity": 1,
          "rotation": -45,
          "edgeFadeWidth": 0,
          "colorCycleSpeed": 1,
          "brightness": 0.2,
          "color1": "#4cb156",
          "color2": "#709d16",
          "color3": "#86dc8b",
          "enableMouseInteraction": true,
          "mouseInfluence": 2
    }
  },
  LiquidChrome: {
    id: "LiquidChrome",
    name: "Liquid Chrome",
    description: "Liquid chrome animated WebGL background with mouse and touch interaction.",
    loader: () => import('./LiquidChrome.svelte'),
    controls: [
          {
                "key": "baseColor",
                "label": "Base Color",
                "type": "color",
                "default": "#4cb156",
                "format": "rgbTuple"
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 0.2,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "amplitude",
                "label": "Amplitude",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "frequencyX",
                "label": "Frequency X",
                "type": "number",
                "default": 3,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "frequencyY",
                "label": "Frequency Y",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "interactive",
                "label": "Interactive",
                "type": "boolean",
                "default": true
          }
    ],
    defaults: {
          "baseColor": "#4cb156",
          "speed": 0.2,
          "amplitude": 0.5,
          "frequencyX": 3,
          "frequencyY": 2,
          "interactive": true
    }
  },
  LiquidEther: {
    id: "LiquidEther",
    name: "Liquid Ether",
    description: "Interactive liquid shader with flowing distortion and customizable colors.",
    loader: () => import('./LiquidEther.svelte'),
    controls: [
          {
                "key": "mouseForce",
                "label": "Mouse Force",
                "type": "number",
                "default": 20,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "cursorSize",
                "label": "Cursor Size",
                "type": "number",
                "default": 100,
                "min": 0,
                "max": 200,
                "step": 1
          },
          {
                "key": "isViscous",
                "label": "Is Viscous",
                "type": "boolean",
                "default": false
          },
          {
                "key": "viscous",
                "label": "Viscous",
                "type": "number",
                "default": 30,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "iterationsViscous",
                "label": "Iterations Viscous",
                "type": "number",
                "default": 32,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "iterationsPoisson",
                "label": "Iterations Poisson",
                "type": "number",
                "default": 32,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "dt",
                "label": "Dt",
                "type": "number",
                "default": 0.014,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "BFECC",
                "label": " B F E C C",
                "type": "boolean",
                "default": true
          },
          {
                "key": "resolution",
                "label": "Resolution",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "isBounce",
                "label": "Is Bounce",
                "type": "boolean",
                "default": false
          },
          {
                "key": "colors_0",
                "targetKey": "colors",
                "arrayIndex": 0,
                "label": "Colors 1",
                "type": "color",
                "default": "#4cb156",
                "format": "array"
          },
          {
                "key": "colors_1",
                "targetKey": "colors",
                "arrayIndex": 1,
                "label": "Colors 2",
                "type": "color",
                "default": "#709d16",
                "format": "array"
          },
          {
                "key": "autoDemo",
                "label": "Auto Demo",
                "type": "boolean",
                "default": true
          },
          {
                "key": "autoSpeed",
                "label": "Auto Speed",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "autoIntensity",
                "label": "Auto Intensity",
                "type": "number",
                "default": 2.2,
                "min": 0,
                "max": 5,
                "step": 0.05
          },
          {
                "key": "takeoverDuration",
                "label": "Takeover Duration",
                "type": "number",
                "default": 0.25,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "autoResumeDelay",
                "label": "Auto Resume Delay",
                "type": "number",
                "default": 1000,
                "min": 0,
                "max": 2000,
                "step": 5
          },
          {
                "key": "autoRampDuration",
                "label": "Auto Ramp Duration",
                "type": "number",
                "default": 0.6,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "mouseForce": 20,
          "cursorSize": 100,
          "isViscous": false,
          "viscous": 30,
          "iterationsViscous": 32,
          "iterationsPoisson": 32,
          "dt": 0.014,
          "BFECC": true,
          "resolution": 0.5,
          "isBounce": false,
          "colors": "defaultColors",
          "colors_0": "#4cb156",
          "colors_1": "#709d16",
          "autoDemo": true,
          "autoSpeed": 0.5,
          "autoIntensity": 2.2,
          "takeoverDuration": 0.25,
          "autoResumeDelay": 1000,
          "autoRampDuration": 0.6
    }
  },
  Orb: {
    id: "Orb",
    name: "Orb",
    description: "Dreamy hue-shifting orb with hover interaction.",
    loader: () => import('./Orb.svelte'),
    controls: [
          {
                "key": "hue",
                "label": "Hue",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 360,
                "step": 1
          },
          {
                "key": "hoverIntensity",
                "label": "Hover Intensity",
                "type": "number",
                "default": 0.2,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "rotateOnHover",
                "label": "Rotate On Hover",
                "type": "boolean",
                "default": true
          },
          {
                "key": "forceHoverState",
                "label": "Force Hover State",
                "type": "boolean",
                "default": false
          },
          {
                "key": "backgroundColor",
                "label": "Background Color",
                "type": "color",
                "default": "#000000",
                "format": "hex"
          }
    ],
    defaults: {
          "hue": 0,
          "hoverIntensity": 0.2,
          "rotateOnHover": true,
          "forceHoverState": false,
          "backgroundColor": "#000000"
    }
  },
  Particles: {
    id: "Particles",
    name: "Particles",
    description: "OGL-based 3D point cloud particles with hover interaction.",
    loader: () => import('./Particles.svelte'),
    controls: [
          {
                "key": "particleCount",
                "label": "Particle Count",
                "type": "number",
                "default": 200,
                "min": 0,
                "max": 400,
                "step": 5
          },
          {
                "key": "particleSpread",
                "label": "Particle Spread",
                "type": "number",
                "default": 10,
                "min": 0,
                "max": 20,
                "step": 0.05
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "particleColors_0",
                "targetKey": "particleColors",
                "arrayIndex": 0,
                "label": "Particle Colors 1",
                "type": "color",
                "default": "#4cb156",
                "format": "array"
          },
          {
                "key": "particleColors_1",
                "targetKey": "particleColors",
                "arrayIndex": 1,
                "label": "Particle Colors 2",
                "type": "color",
                "default": "#709d16",
                "format": "array"
          },
          {
                "key": "moveParticlesOnHover",
                "label": "Move Particles On Hover",
                "type": "boolean",
                "default": false
          },
          {
                "key": "particleHoverFactor",
                "label": "Particle Hover Factor",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "alphaParticles",
                "label": "Alpha Particles",
                "type": "boolean",
                "default": false
          },
          {
                "key": "particleBaseSize",
                "label": "Particle Base Size",
                "type": "number",
                "default": 100,
                "min": 0,
                "max": 200,
                "step": 1
          },
          {
                "key": "sizeRandomness",
                "label": "Size Randomness",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "cameraDistance",
                "label": "Camera Distance",
                "type": "number",
                "default": 20,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "disableRotation",
                "label": "Disable Rotation",
                "type": "boolean",
                "default": false
          },
          {
                "key": "pixelRatio",
                "label": "Pixel Ratio",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "particleCount": 200,
          "particleSpread": 10,
          "speed": 0.1,
          "particleColors_0": "#4cb156",
          "particleColors_1": "#709d16",
          "moveParticlesOnHover": false,
          "particleHoverFactor": 1,
          "alphaParticles": false,
          "particleBaseSize": 100,
          "sizeRandomness": 1,
          "cameraDistance": 20,
          "disableRotation": false,
          "pixelRatio": 1
    }
  },
  PixelBlast: {
    id: "PixelBlast",
    name: "PixelBlast",
    description: "Pixelated dithered shape field with ripples and liquid distortion.",
    loader: () => import('./PixelBlast.svelte'),
    controls: [
          {
                "key": "variant",
                "label": "Variant",
                "type": "select",
                "options": [
                      "square",
                      "circle",
                      "triangle",
                      "diamond"
                ],
                "default": "square"
          },
          {
                "key": "pixelSize",
                "label": "Pixel Size",
                "type": "number",
                "default": 3,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "color",
                "label": "Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "antialias",
                "label": "Antialias",
                "type": "boolean",
                "default": true
          },
          {
                "key": "patternScale",
                "label": "Pattern Scale",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 4,
                "step": 0.05
          },
          {
                "key": "patternDensity",
                "label": "Pattern Density",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "liquid",
                "label": "Liquid",
                "type": "boolean",
                "default": false
          },
          {
                "key": "liquidStrength",
                "label": "Liquid Strength",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "liquidRadius",
                "label": "Liquid Radius",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "pixelSizeJitter",
                "label": "Pixel Size Jitter",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "enableRipples",
                "label": "Enable Ripples",
                "type": "boolean",
                "default": true
          },
          {
                "key": "rippleIntensityScale",
                "label": "Ripple Intensity Scale",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "rippleThickness",
                "label": "Ripple Thickness",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "rippleSpeed",
                "label": "Ripple Speed",
                "type": "number",
                "default": 0.3,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "liquidWobbleSpeed",
                "label": "Liquid Wobble Speed",
                "type": "number",
                "default": 4.5,
                "min": 0,
                "max": 9,
                "step": 0.1
          },
          {
                "key": "autoPauseOffscreen",
                "label": "Auto Pause Offscreen",
                "type": "boolean",
                "default": true
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "transparent",
                "label": "Transparent",
                "type": "boolean",
                "default": true
          },
          {
                "key": "edgeFade",
                "label": "Edge Fade",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "noiseAmount",
                "label": "Noise Amount",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "variant": "square",
          "pixelSize": 3,
          "color": "#4cb156",
          "style": "",
          "antialias": true,
          "patternScale": 2,
          "patternDensity": 1,
          "liquid": false,
          "liquidStrength": 0.1,
          "liquidRadius": 1,
          "pixelSizeJitter": 0,
          "enableRipples": true,
          "rippleIntensityScale": 1,
          "rippleThickness": 0.1,
          "rippleSpeed": 0.3,
          "liquidWobbleSpeed": 4.5,
          "autoPauseOffscreen": true,
          "speed": 0.5,
          "transparent": true,
          "edgeFade": 0.5,
          "noiseAmount": 0
    }
  },
  PixelSnow: {
    id: "PixelSnow",
    name: "Pixel Snow",
    description: "Volumetric pixel snowfall background.",
    loader: () => import('./PixelSnow.svelte'),
    controls: [
          {
                "key": "color",
                "label": "Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "flakeSize",
                "label": "Flake Size",
                "type": "number",
                "default": 0.01,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "minFlakeSize",
                "label": "Min Flake Size",
                "type": "number",
                "default": 1.25,
                "min": 0,
                "max": 10,
                "step": 0.1
          },
          {
                "key": "pixelResolution",
                "label": "Pixel Resolution",
                "type": "number",
                "default": 200,
                "min": 0,
                "max": 400,
                "step": 5
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 1.25,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "depthFade",
                "label": "Depth Fade",
                "type": "number",
                "default": 8,
                "min": 0,
                "max": 16,
                "step": 1
          },
          {
                "key": "farPlane",
                "label": "Far Plane",
                "type": "number",
                "default": 20,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "brightness",
                "label": "Brightness",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "gamma",
                "label": "Gamma",
                "type": "number",
                "default": 0.4545,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "density",
                "label": "Density",
                "type": "number",
                "default": 0.3,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "variant",
                "label": "Variant",
                "type": "select",
                "options": [
                      "square",
                      "round",
                      "snowflake"
                ],
                "default": "square"
          },
          {
                "key": "direction",
                "label": "Direction",
                "type": "number",
                "default": 125,
                "min": 0,
                "max": 250,
                "step": 5
          }
    ],
    defaults: {
          "color": "#4cb156",
          "flakeSize": 0.01,
          "minFlakeSize": 1.25,
          "pixelResolution": 200,
          "speed": 1.25,
          "depthFade": 8,
          "farPlane": 20,
          "brightness": 1,
          "gamma": 0.4545,
          "density": 0.3,
          "variant": "square",
          "direction": 125
    }
  },
  Plasma: {
    id: "Plasma",
    name: "Plasma",
    description: "Volumetric plasma WebGL2 background with optional mouse interaction and color tinting.",
    loader: () => import('./Plasma.svelte'),
    controls: [
          {
                "key": "color",
                "label": "Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "direction",
                "label": "Direction",
                "type": "select",
                "options": [
                      "forward",
                      "reverse",
                      "pingpong"
                ],
                "default": "forward"
          },
          {
                "key": "scale",
                "label": "Scale",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "opacity",
                "label": "Opacity",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "mouseInteractive",
                "label": "Mouse Interactive",
                "type": "boolean",
                "default": true
          }
    ],
    defaults: {
          "color": "#4cb156",
          "speed": 1,
          "direction": "forward",
          "scale": 1,
          "opacity": 1,
          "mouseInteractive": true
    }
  },
  PlasmaWave: {
    id: "PlasmaWave",
    name: "Plasma Wave",
    description: "Raymarched plasma wave background.",
    loader: () => import('./PlasmaWave.svelte'),
    controls: [
          {
                "key": "xOffset",
                "label": "X Offset",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "yOffset",
                "label": "Y Offset",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "rotationDeg",
                "label": "Rotation Deg",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "focalLength",
                "label": "Focal Length",
                "type": "number",
                "default": 0.8,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "speed1",
                "label": "Speed1",
                "type": "number",
                "default": 0.05,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "speed2",
                "label": "Speed2",
                "type": "number",
                "default": 0.05,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "dir2",
                "label": "Dir2",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "bend1",
                "label": "Bend1",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "bend2",
                "label": "Bend2",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "xOffset": 0,
          "yOffset": 0,
          "rotationDeg": 0,
          "focalLength": 0.8,
          "speed1": 0.05,
          "speed2": 0.05,
          "dir2": 1,
          "bend1": 1,
          "bend2": 0.5,
          "colors": [
                "#ff8a3d",
                "#06B6D4"
          ]
    }
  },
  Prism: {
    id: "Prism",
    name: "Prism",
    description: "Animated raymarched prism with hue and bloom.",
    loader: () => import('./Prism.svelte'),
    controls: [
          {
                "key": "height",
                "label": "Height",
                "type": "number",
                "default": 3.5,
                "min": 0,
                "max": 10,
                "step": 0.1
          },
          {
                "key": "baseWidth",
                "label": "Base Width",
                "type": "number",
                "default": 5.5,
                "min": 0,
                "max": 11,
                "step": 0.1
          },
          {
                "key": "animationType",
                "label": "Animation Type",
                "type": "select",
                "options": [
                      "rotate",
                      "hover",
                      "3drotate"
                ],
                "default": "rotate"
          },
          {
                "key": "glow",
                "label": "Glow",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "noise",
                "label": "Noise",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "transparent",
                "label": "Transparent",
                "type": "boolean",
                "default": true
          },
          {
                "key": "scale",
                "label": "Scale",
                "type": "number",
                "default": 3.6,
                "min": 0,
                "max": 8,
                "step": 0.05
          },
          {
                "key": "hueShift",
                "label": "Hue Shift",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 360,
                "step": 1
          },
          {
                "key": "colorFrequency",
                "label": "Color Frequency",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "hoverStrength",
                "label": "Hover Strength",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "inertia",
                "label": "Inertia",
                "type": "number",
                "default": 0.05,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "bloom",
                "label": "Bloom",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "suspendWhenOffscreen",
                "label": "Suspend When Offscreen",
                "type": "boolean",
                "default": false
          },
          {
                "key": "timeScale",
                "label": "Time Scale",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 3,
                "step": 0.05
          }
    ],
    defaults: {
          "height": 3.5,
          "baseWidth": 5.5,
          "animationType": "rotate",
          "glow": 1,
          "offset": "{ x: 0, y: 0 }",
          "noise": 0.5,
          "transparent": true,
          "scale": 3.6,
          "hueShift": 0,
          "colorFrequency": 1,
          "hoverStrength": 2,
          "inertia": 0.05,
          "bloom": 1,
          "suspendWhenOffscreen": false,
          "timeScale": 0.5
    }
  },
  PrismaticBurst: {
    id: "PrismaticBurst",
    name: "PrismaticBurst",
    description: "Volumetric ray burst with bend and color gradient.",
    loader: () => import('./PrismaticBurst.svelte'),
    controls: [
          {
                "key": "intensity",
                "label": "Intensity",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 4,
                "step": 0.05
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "animationType",
                "label": "Animation Type",
                "type": "select",
                "options": [
                      "rotate",
                      "rotate3d",
                      "hover"
                ],
                "default": "rotate3d"
          },
          {
                "key": "colors_0",
                "targetKey": "colors",
                "arrayIndex": 0,
                "label": "Colors 1",
                "type": "color",
                "default": "#4cb156",
                "format": "array"
          },
          {
                "key": "colors_1",
                "targetKey": "colors",
                "arrayIndex": 1,
                "label": "Colors 2",
                "type": "color",
                "default": "#709d16",
                "format": "array"
          },
          {
                "key": "distort",
                "label": "Distort",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "paused",
                "label": "Paused",
                "type": "boolean",
                "default": false
          },
          {
                "key": "hoverDampness",
                "label": "Hover Dampness",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "rayCount",
                "label": "Ray Count",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "mixBlendMode",
                "label": "Mix Blend Mode",
                "type": "select",
                "options": [
                      "string"
                ],
                "default": "string"
          }
    ],
    defaults: {
          "intensity": 2,
          "speed": 0.5,
          "animationType": "rotate3d",
          "colors_0": "#4cb156",
          "colors_1": "#709d16",
          "distort": 0,
          "paused": false,
          "offset": "{ x: 0, y: 0 }",
          "hoverDampness": 0,
          "rayCount": 1,
          "mixBlendMode": "lighten"
    }
  },
  Radar: {
    id: "Radar",
    name: "Radar",
    description: "Radar sweep background rendered with OGL.",
    loader: () => import('./Radar.svelte'),
    controls: [
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "scale",
                "label": "Scale",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "ringCount",
                "label": "Ring Count",
                "type": "number",
                "default": 10,
                "min": 0,
                "max": 20,
                "step": 1
          },
          {
                "key": "spokeCount",
                "label": "Spoke Count",
                "type": "number",
                "default": 10,
                "min": 0,
                "max": 20,
                "step": 1
          },
          {
                "key": "ringThickness",
                "label": "Ring Thickness",
                "type": "number",
                "default": 0.05,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "spokeThickness",
                "label": "Spoke Thickness",
                "type": "number",
                "default": 0.01,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "sweepSpeed",
                "label": "Sweep Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "sweepWidth",
                "label": "Sweep Width",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "sweepLobes",
                "label": "Sweep Lobes",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "color",
                "label": "Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "backgroundColor",
                "label": "Background Color",
                "type": "color",
                "default": "#000000",
                "format": "hex"
          },
          {
                "key": "falloff",
                "label": "Falloff",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "brightness",
                "label": "Brightness",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "enableMouseInteraction",
                "label": "Enable Mouse Interaction",
                "type": "boolean",
                "default": true
          },
          {
                "key": "mouseInfluence",
                "label": "Mouse Influence",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "speed": 1,
          "scale": 0.5,
          "ringCount": 10,
          "spokeCount": 10,
          "ringThickness": 0.05,
          "spokeThickness": 0.01,
          "sweepSpeed": 1,
          "sweepWidth": 2,
          "sweepLobes": 1,
          "color": "#4cb156",
          "backgroundColor": "#000000",
          "falloff": 2,
          "brightness": 1,
          "enableMouseInteraction": true,
          "mouseInfluence": 0.1
    }
  },
  RippleGrid: {
    id: "RippleGrid",
    name: "Ripple Grid",
    description: "Animated rippling grid background powered by OGL with mouse interaction.",
    loader: () => import('./RippleGrid.svelte'),
    controls: [
          {
                "key": "enableRainbow",
                "label": "Enable Rainbow",
                "type": "boolean",
                "default": false
          },
          {
                "key": "gridColor",
                "label": "Grid Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "rippleIntensity",
                "label": "Ripple Intensity",
                "type": "number",
                "default": 0.05,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "gridSize",
                "label": "Grid Size",
                "type": "number",
                "default": 10,
                "min": 0,
                "max": 20,
                "step": 1
          },
          {
                "key": "gridThickness",
                "label": "Grid Thickness",
                "type": "number",
                "default": 15,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "fadeDistance",
                "label": "Fade Distance",
                "type": "number",
                "default": 1.5,
                "min": 0,
                "max": 10,
                "step": 0.1
          },
          {
                "key": "vignetteStrength",
                "label": "Vignette Strength",
                "type": "number",
                "default": 2,
                "min": 0,
                "max": 10,
                "step": 1
          },
          {
                "key": "glowIntensity",
                "label": "Glow Intensity",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "opacity",
                "label": "Opacity",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "gridRotation",
                "label": "Grid Rotation",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "mouseInteraction",
                "label": "Mouse Interaction",
                "type": "boolean",
                "default": true
          },
          {
                "key": "mouseInteractionRadius",
                "label": "Mouse Interaction Radius",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "enableRainbow": false,
          "gridColor": "#4cb156",
          "rippleIntensity": 0.05,
          "gridSize": 10,
          "gridThickness": 15,
          "fadeDistance": 1.5,
          "vignetteStrength": 2,
          "glowIntensity": 0.1,
          "opacity": 1,
          "gridRotation": 0,
          "mouseInteraction": true,
          "mouseInteractionRadius": 1
    }
  },
  ShapeGrid: {
    id: "ShapeGrid",
    name: "Shape Grid",
    description: "Animated grid of squares, hexagons, circles, or triangles with hover trail and configurable scroll direction.",
    loader: () => import('./ShapeGrid.svelte'),
    controls: [
          {
                "key": "direction",
                "label": "Direction",
                "type": "select",
                "options": [
                      "diagonal",
                      "up",
                      "right",
                      "down",
                      "left"
                ],
                "default": "right"
          },
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "squareSize",
                "label": "Square Size",
                "type": "number",
                "default": 40,
                "min": 0,
                "max": 100,
                "step": 1
          },
          {
                "key": "shape",
                "label": "Shape",
                "type": "select",
                "options": [
                      "square",
                      "hexagon",
                      "circle",
                      "triangle"
                ],
                "default": "square"
          },
          {
                "key": "hoverTrailAmount",
                "label": "Hover Trail Amount",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "fadeColor",
                "label": "Fade Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          }
    ],
    defaults: {
          "direction": "right",
          "speed": 1,
          "borderColor": "#999",
          "squareSize": 40,
          "hoverFillColor": "#222",
          "shape": "square",
          "hoverTrailAmount": 0,
          "fadeColor": "#4cb156"
    }
  },
  Silk: {
    id: "Silk",
    name: "Silk",
    description: "Silk-like animated WebGL background using a Three.js shader plane.",
    loader: () => import('./Silk.svelte'),
    controls: [
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 5,
                "min": 0,
                "max": 10,
                "step": 0.1
          },
          {
                "key": "scale",
                "label": "Scale",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "color",
                "label": "Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "noiseIntensity",
                "label": "Noise Intensity",
                "type": "number",
                "default": 1.5,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "rotation",
                "label": "Rotation",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "speed": 5,
          "scale": 1,
          "color": "#4cb156",
          "noiseIntensity": 1.5,
          "rotation": 0
    }
  },
  SoftAurora: {
    id: "SoftAurora",
    name: "Soft Aurora",
    description: "Soft aurora bands rendered with OGL using Perlin noise.",
    loader: () => import('./SoftAurora.svelte'),
    controls: [
          {
                "key": "speed",
                "label": "Speed",
                "type": "number",
                "default": 0.6,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "scale",
                "label": "Scale",
                "type": "number",
                "default": 1.5,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "brightness",
                "label": "Brightness",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "color1",
                "label": "Color1",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "color2",
                "label": "Color2",
                "type": "color",
                "default": "#709d16",
                "format": "hex"
          },
          {
                "key": "noiseFrequency",
                "label": "Noise Frequency",
                "type": "number",
                "default": 2.5,
                "min": 0,
                "max": 10,
                "step": 0.1
          },
          {
                "key": "noiseAmplitude",
                "label": "Noise Amplitude",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "bandHeight",
                "label": "Band Height",
                "type": "number",
                "default": 0.5,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "bandSpread",
                "label": "Band Spread",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "octaveDecay",
                "label": "Octave Decay",
                "type": "number",
                "default": 0.1,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "layerOffset",
                "label": "Layer Offset",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "colorSpeed",
                "label": "Color Speed",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 5,
                "step": 0.1
          },
          {
                "key": "enableMouseInteraction",
                "label": "Enable Mouse Interaction",
                "type": "boolean",
                "default": true
          },
          {
                "key": "mouseInfluence",
                "label": "Mouse Influence",
                "type": "number",
                "default": 0.25,
                "min": 0,
                "max": 1,
                "step": 0.05
          }
    ],
    defaults: {
          "speed": 0.6,
          "scale": 1.5,
          "brightness": 1,
          "color1": "#4cb156",
          "color2": "#709d16",
          "noiseFrequency": 2.5,
          "noiseAmplitude": 1,
          "bandHeight": 0.5,
          "bandSpread": 1,
          "octaveDecay": 0.1,
          "layerOffset": 0,
          "colorSpeed": 1,
          "enableMouseInteraction": true,
          "mouseInfluence": 0.25
    }
  },
  Threads: {
    id: "Threads",
    name: "Threads",
    description: "Animated WebGL line/threads background with mouse parallax.",
    loader: () => import('./Threads.svelte'),
    controls: [
          {
                "key": "color",
                "label": "Color",
                "type": "color",
                "default": "#4cb156",
                "format": "rgbTuple"
          },
          {
                "key": "amplitude",
                "label": "Amplitude",
                "type": "number",
                "default": 1,
                "min": 0,
                "max": 3,
                "step": 0.05
          },
          {
                "key": "distance",
                "label": "Distance",
                "type": "number",
                "default": 0,
                "min": 0,
                "max": 1,
                "step": 0.05
          },
          {
                "key": "enableMouseInteraction",
                "label": "Enable Mouse Interaction",
                "type": "boolean",
                "default": false
          }
    ],
    defaults: {
          "color": "#4cb156",
          "amplitude": 1,
          "distance": 0,
          "enableMouseInteraction": false
    }
  },
  Waves: {
    id: "Waves",
    name: "Waves",
    description: "Perlin-noise wavy line grid that reacts to the cursor.",
    loader: () => import('./Waves.svelte'),
    controls: [
          {
                "key": "lineColor",
                "label": "Line Color",
                "type": "color",
                "default": "#4cb156",
                "format": "hex"
          },
          {
                "key": "backgroundColor",
                "label": "Background Color",
                "type": "color",
                "default": "transparent",
                "format": "hex"
          }
    ],
    defaults: {
          "lineColor": "#4cb156",
          "backgroundColor": "transparent"
    }
  },
};

export const BACKGROUND_LIST = Object.values(BACKGROUND_REGISTRY).sort((a, b) => a.name.localeCompare(b.name));
export const DEFAULT_BACKGROUND_ID = 'LightRays';
