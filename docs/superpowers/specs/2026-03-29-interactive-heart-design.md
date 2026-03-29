# Interactive 3D Human Heart — Design Spec

**Date:** 2026-03-29
**Author:** Brian Lapinski + Claude
**Status:** Draft

---

## 1. Overview

An interactive, anatomically realistic 3D human heart visualization built for education. A beating heart in the browser with real-time cardiac cycle animation, layer toggles, simulation controls, and a telemetry HUD. Observatory mode for exploration, simulation mode for experimentation.

**Goal:** Build something visually stunning and scientifically accurate that teaches cardiac anatomy and physiology through interaction — and serves as a portfolio piece that demonstrates mastery of immersive 3D web development.

**Target audience:** Developers, educators, science communicators, hiring managers at companies building complex interactive experiences.

---

## 2. Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite |
| Framework | React + TypeScript |
| 3D Engine | React Three Fiber + Three.js |
| State | Zustand (with `subscribeWithSelector`) |
| Post-processing | `@react-three/postprocessing` |
| UI helpers | `@react-three/drei` (useGLTF, Html, OrbitControls) |
| ECG rendering | Canvas 2D (separate from WebGL) |
| Deploy | Vercel (static) |

No backend. No auth. No database. Static site.

---

## 3. Architecture

```
src/
  components/
    canvas/                     # Inside <Canvas> — R3F components
      HeartScene.tsx            # Root scene: model + particles + conduction + lighting
      HeartModel.tsx            # GLTF loader, layer visibility, beat animation
      BloodFlow.tsx             # Instanced particle system following vessel paths
      ConductionSystem.tsx      # Electrical pathway visualization with wave propagation
      ValveAnimator.tsx         # Valve open/close synced to cardiac phase
      Lighting.tsx              # Three-point + rim light for anatomical realism
      CameraRig.tsx             # Orbit controls + preset camera positions
      PostProcessing.tsx        # Selective bloom (conduction glow), subtle DOF
    ui/                         # Outside <Canvas> — DOM overlay
      HUD.tsx                   # Layout wrapper for all panels
      TelemetryPanel.tsx        # BPM, phase, valve states, conduction timing
      ECGTrace.tsx              # Real-time ECG waveform (canvas 2D)
      LayerControls.tsx         # Toggle: muscle, valves, coronary, conduction, cross-section
      SimulationControls.tsx    # BPM slider, arrhythmia selector
      AnnotationCard.tsx        # Click-to-learn popover for structures
  hooks/
    useCardiacCycle.ts          # Master clock — maps elapsed time to cardiac phase (P1–P7)
    useConductionWave.ts        # Propagation timing: SA → AV → His → Purkinje
    useArrhythmia.ts            # Overrides normal conduction patterns per arrhythmia type
    useBloodParticles.ts        # Particle position updates along vessel splines
  store/
    useSimStore.ts              # Zustand: BPM, arrhythmia, activeLayers, current phase
  shaders/
    tissue.vert.glsl            # Subsurface-scattering-lite for realistic tissue
    tissue.frag.glsl
    conduction.frag.glsl        # Glow propagation wave shader
  data/
    cardiac-timing.ts           # Phase durations, conduction velocities, valve timing tables
    arrhythmias.ts              # Conduction overrides per arrhythmia type
    annotations.ts              # Educational text per anatomical structure
    vessel-paths.ts             # Spline data for blood flow particle routes
  assets/
    models/
      heart.glb                 # Draco-compressed, named parts for layer toggling
  App.tsx                       # Canvas + UI overlay layout
  main.tsx
```

### Key Architectural Decisions

1. **`useCardiacCycle` is the master clock.** Everything derives from it — valve states, conduction wave position, beat animation, ECG trace, telemetry readouts. One source of truth for "where are we in the heartbeat."

2. **Arrhythmias are conduction overrides, not separate systems.** Normal sinus rhythm defines the baseline. Each arrhythmia modifies specific parameters: AFib randomizes atrial firing, V-Tach moves the origin point, heart block breaks AV transmission. Same engine, different rules.

3. **Blood flow is instanced particles on splines.** Vessel paths defined as CatmullRom splines. Particles advance along them, speed modulated by cardiac phase. ~1000 particles in v1 via `instancedMesh` (single draw call).

4. **UI is pure DOM overlay.** No drei `<Html>` for panels — only for world-space labels on structures. Panels sit in a CSS grid over the canvas with `pointer-events: none` pass-through.

5. **State flows through Zustand refs in the render loop.** Store values subscribed via `useEffect`, written to refs, read in `useFrame`. Zero React re-renders in the animation hot path.

6. **drei `<Html>` is used ONLY for world-space labels** anchored to 3D positions (structure names floating near geometry). All HUD panels, controls, and annotation cards are standard React DOM in the overlay layer.

### Store Shape

```ts
// store/useSimStore.ts
type Phase = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7'
type Layer = 'muscle' | 'valves' | 'conduction'  // v1; 'coronary' | 'crossSection' in v2
type ArrhythmiaType = 'sinus'  // v1; 'afib' | 'vtach' | 'heartBlock' | 'wpw' in v2

interface SimState {
  // User controls
  bpm: number                         // 40–180
  arrhythmia: ArrhythmiaType
  activeLayers: Set<Layer>
  selectedStructure: string | null    // GLTF node name or null

  // Derived (updated each frame via refs, exposed for UI reads)
  currentPhase: Phase
  phaseProgress: number               // 0.0–1.0 within current phase
  cycleElapsed: number                // ms elapsed in current beat
  valveStates: Record<'mitral' | 'tricuspid' | 'aortic' | 'pulmonary', boolean>  // true = open

  // Actions
  setBPM: (bpm: number) => void
  setArrhythmia: (type: ArrhythmiaType) => void
  toggleLayer: (layer: Layer) => void
  selectStructure: (id: string | null) => void
}
```

Valve states are derived from `currentPhase` using the timing table in `cardiac-timing.ts` — not stored independently. The store computes them on phase transition.

### useCardiacCycle Return Type

```ts
interface CardiacCycleState {
  phase: Phase              // current phase enum
  t: number                 // 0.0–1.0 normalized progress within phase
  cycleElapsed: number      // ms elapsed since last SA node fire
  cycleCount: number        // total beats since start
  phaseDurations: number[]  // scaled durations for current BPM [P1..P7]
}
```

The conduction wave (`useConductionWave`) tracks its own timer that resets at `cycleElapsed = 0` (SA node fire). It reads `cycleElapsed` from the master clock and maps it to a position along the conduction pathway using the velocity/distance data in `cardiac-timing.ts`.

### GLTF Node Name Contract

```ts
// data/heart-parts.ts
export const HEART_PARTS = {
  // Chambers
  LEFT_VENTRICLE: 'left-ventricle',
  RIGHT_VENTRICLE: 'right-ventricle',
  LEFT_ATRIUM: 'left-atrium',
  RIGHT_ATRIUM: 'right-atrium',

  // Valves
  MITRAL_VALVE: 'mitral-valve',
  TRICUSPID_VALVE: 'tricuspid-valve',
  AORTIC_VALVE: 'aortic-valve',
  PULMONARY_VALVE: 'pulmonary-valve',

  // Great vessels
  AORTA: 'aorta',
  PULMONARY_ARTERY: 'pulmonary-artery',
  SUPERIOR_VENA_CAVA: 'superior-vena-cava',
  INFERIOR_VENA_CAVA: 'inferior-vena-cava',
  PULMONARY_VEINS: 'pulmonary-veins',

  // Conduction (modeled as tube geometry)
  SA_NODE: 'sa-node',
  AV_NODE: 'av-node',
  BUNDLE_OF_HIS: 'bundle-of-his',
  LEFT_BUNDLE_BRANCH: 'left-bundle-branch',
  RIGHT_BUNDLE_BRANCH: 'right-bundle-branch',
  PURKINJE_FIBERS: 'purkinje-fibers',

  // Walls
  MYOCARDIUM: 'myocardium',
  SEPTUM: 'septum',
} as const
```

The Blender pipeline MUST name meshes to match these constants. `gltfjsx` will generate typed accessors from them.

---

## 4. Cardiac Simulation Engine

### 4.1 Master Clock

At 72 BPM, one heartbeat = 833ms. The `useCardiacCycle` hook maps elapsed time to a phase and a normalized position (0.0–1.0) within that phase.

| Phase | Name | Duration | Visual Event |
|-------|------|----------|-------------|
| P1 | Atrial Systole | 100ms | Atria contract, AV valves open, blood pushed into ventricles |
| P2 | Isovolumetric Contraction | 50ms | All valves closed, ventricles squeeze, S1 sound |
| P3 | Rapid Ejection | 110ms | Semilunar valves open, blood rockets out (70% stroke volume) |
| P4 | Reduced Ejection | 130ms | Ejection slows, ventricles begin repolarizing |
| P5 | Isovolumetric Relaxation | 70ms | All valves closed again, ventricles relax, S2 sound |
| P6 | Rapid Filling | 110ms | AV valves open, ventricles fill passively |
| P7 | Diastasis | 263ms | Slow fill, waiting for next SA node fire |

**BPM scaling — two-tier model:**

Phase durations at 72 BPM are reference values. When BPM changes:

1. **Below ~105 BPM:** P7 (diastasis) absorbs the difference. P1–P6 durations stay fixed. P7 stretches (lower BPM) or compresses (higher BPM).
2. **Above ~105 BPM:** P7 hits its minimum (50ms floor). All phases scale proportionally to fit the remaining time. This matches real cardiac physiology — at high heart rates, systole compresses.

```
scaledCycleDuration = 60000 / bpm
fixedPhasesTotal = P1 + P2 + P3 + P4 + P5 + P6 = 570ms
p7Floor = 50ms

if (scaledCycleDuration - fixedPhasesTotal >= p7Floor) {
  // Tier 1: only P7 flexes
  P7 = scaledCycleDuration - fixedPhasesTotal
} else {
  // Tier 2: all phases scale proportionally
  P7 = p7Floor
  remainingTime = scaledCycleDuration - p7Floor
  scaleFactor = remainingTime / fixedPhasesTotal
  P1..P6 = referenceValue * scaleFactor
}
```

This keeps the animation physically plausible across the full 40–180 BPM range.

### 4.2 Conduction Wave

The electrical signal travels a physical path with real timing:

```
SA node fires (0ms)
  → spreads across atria (50ms, ~1 m/s)
  → arrives at AV node
  → AV delay (120ms — intentional bottleneck)
  → Bundle of His (20ms, ~2 m/s)
  → left/right bundle branches fork
  → Purkinje fibers (40–75ms, ~4 m/s)
  → full ventricular depolarization (~225ms total from SA fire)
```

Rendered as a glowing wavefront: originates at SA node (upper right atrium), sweeps across both atria, pauses at AV node, shoots down the septum, fans outward through Purkinje network. Conduction shader uses a `uWavePosition` uniform — bright leading edge, fading tail.

### 4.3 Valve Timing

| Valve | Opens | Closes |
|-------|-------|--------|
| Mitral (Bicuspid) | Start of P6 (Rapid Filling) | Start of P2 (Iso. Contraction) — S1 |
| Tricuspid | Start of P6 | Start of P2 — S1 (10–30ms after mitral) |
| Aortic | Start of P3 (Rapid Ejection) | Start of P5 (Iso. Relaxation) — S2 |
| Pulmonary | Start of P3 | Start of P5 — S2 (closes after aortic) |

**Rule:** All four valves are never simultaneously open. During isovolumetric phases (P2 and P5), all valves are closed.

### 4.4 Arrhythmias (v2)

**Atrial Fibrillation:** SA node loses control. Atria fire chaotically at 350–600/min — rendered as random flickering instead of a clean wave. AV node filters irregularly (100–180 BPM). Ventricles contract normally but at irregular timing. Atria visibly quiver.

**Ventricular Tachycardia:** Ectopic focus near LV apex fires at 150–250 BPM. Conduction wave originates from the bottom and spreads upward (opposite of normal). Atria may beat independently (AV dissociation — two visible rhythms).

**Complete Heart Block:** AV node stops transmitting. Atria beat at 60–100 BPM. Ventricles fall to escape rhythm at 20–40 BPM. Two independent rhythms — upper and lower heart desynchronized.

**WPW (Wolff-Parkinson-White):** Accessory pathway bypasses AV node. Signal travels two routes simultaneously. Ventricles activate from two origins — visible wavefront collision.

### 4.5 ECG Trace

Canvas 2D element rendering the ECG waveform in real time, driven by the master clock:
- P wave → atrial depolarization (P1)
- QRS complex → ventricular depolarization (P2)
- T wave → ventricular repolarization (P4)
- Each arrhythmia produces its characteristic ECG signature
- Scrolls left, showing ~3 seconds of history

Synchronized to the 3D scene — QRS spike coincides with visible ventricular contraction.

---

## 5. Visual Rendering

### 5.1 Tissue

- **v1:** `MeshPhysicalMaterial` with `transmission`, `thickness`, and `roughness` configured for tissue-like appearance. Gets 80% of the visual result with zero custom shader work.
- **v2:** Custom fragment shader with subsurface scattering approximation (rim lighting + color-shifted transmission) for the final 20%.
- Warm reds for oxygenated tissue (left side), cooler blue-reds for deoxygenated (right side).
- Normal maps for fibrous myocardial texture.

### 5.2 Beat Animation

- Morph targets or bone-driven deformation on the GLTF model.
- Atria and ventricles contract independently, timed to cardiac phase.
- Fallback: procedural scale if model lacks built-in animation — atria squeeze during P1, ventricles during P2–P4, relaxation P5–P7.

### 5.3 Conduction System

- Separate mesh layer — thin glowing tubes tracing SA → AV → His → bundle branches → Purkinje.
- Propagation wave via shader uniform (`uWavePosition`). Behind wavefront = bright glow, ahead = dim.
- Selective bloom isolates conduction glow from the rest of the scene.

### 5.4 Blood Flow

- Instanced red spheres (oxygenated) and blue-red spheres (deoxygenated) on CatmullRom vessel splines.
- Speed modulated by phase: fast burst during rapid ejection (P3), slow drift during diastasis (P7).
- ~1000 particles in v1, ~3000 in v2 (both circuits).

### 5.5 Valves

- Leaflets as separate mesh groups, animated open/close timed to phase transitions.
- Subtle bounce on closure (the mechanical impact producing heart sounds).

### 5.6 Lighting

- Key light: warm white, upper left — primary form definition
- Fill light: cool blue, lower right — shadow detail
- Rim light: subtle warm edge — separates heart from background
- Background: dark neutral with subtle gradient (medical illustration style, not pure black)

### 5.7 Post-Processing

- Selective bloom on conduction system using `Selection` + `SelectiveBloom` from `@react-three/postprocessing`. Conduction meshes wrapped in `<Selection>`, rest of scene excluded.
- Subtle depth of field to draw focus
- No chromatic aberration, no film grain — clean and clinical

---

## 6. Interaction Model

### 6.1 Camera

- Orbit controls: drag to rotate, scroll to zoom, right-drag to pan
- Preset positions: front view, anterior cutaway (v1); posterior, superior (v2)
- Smooth GSAP tween between presets
- Auto-rotate when idle (slow, subtle)

### 6.2 Layer Toggles

- Pill buttons along the left edge: Muscle, Valves, Conduction System (v1); Coronary Arteries, Cross-Section (v2)
- Multiple layers active simultaneously
- Opacity transition on toggle (fade, not instant)
- Cross-section: clipping plane bisects the heart, revealing all four chambers

### 6.3 Simulation Controls

- BPM slider: 40–180 range, real-time response
- Arrhythmia dropdown (v2): Normal Sinus, AFib, V-Tach, Complete Heart Block, WPW
- Arrhythmia transitions over 2–3 beats (not instant swap)

### 6.4 Click-to-Learn

- Raycasting on the 3D model
- Click any named structure → annotation card appears as a centered modal overlay (not right-side panel, to avoid collision with telemetry)
- Card shows: structure name, function, what happens when it fails
- Clicked structure pulses subtly while card is open
- Click elsewhere or press Escape to dismiss

### 6.5 Telemetry HUD

- Upper right: current BPM, active phase name, cycle time
- Lower right: valve states (open/closed indicators for all four)
- Bottom: ECG trace (~3 seconds scrolling)

### 6.6 Layer Toggle Behavior

- "Off" state = opacity 0.15 (ghost/x-ray), not invisible. Prevents "empty scene" if multiple layers toggled off.
- Conduction system: off = fully hidden (0.0 opacity), since it's an overlay layer not structural geometry.

### 6.8 Responsive

- Desktop: full layout with side panels
- Tablet: panels collapse to bottom drawer
- Mobile (v2): simplified HUD (BPM + ECG only), controls in slide-up sheet

---

## 7. 3D Model

### Source

CC-licensed GLTF from Sketchfab or NIH 3D Print Exchange. Candidates:
- Sketchfab: "Human Heart 3D Model" by Mesh-Magnet (CC-BY, GLB available)
- NIH 3D Heart Library (MRI-derived, needs Blender → GLB conversion)
- Sketchfab: "3D Animated Realistic Human Heart V1.0" by Doctor Jana (has baked animation)

### Requirements

- Named parts: ventricles, atria, valves (mitral, tricuspid, aortic, pulmonary), aorta, pulmonary arteries/veins, vena cavae
- Separate conduction system geometry (or we model it as spline tubes)
- Draco-compressed GLB (target < 10MB)
- Morph targets or skeletal animation for beat (preferred) or we do procedural

### Pipeline

1. Select model from Sketchfab/NIH
2. Import to Blender — name all mesh parts, verify topology
3. Add morph targets for systole/diastole if not present
4. Model conduction pathway as tube geometry along anatomical path
5. Export as Draco-compressed GLB via `gltfpack`
6. Generate typed R3F component via `gltfjsx`

---

## 8. Data Layer

### cardiac-timing.ts
Phase durations at reference 72 BPM. Scaling function for arbitrary BPM (compress/expand P7). Conduction velocities per pathway segment.

### arrhythmias.ts (v2)
Each arrhythmia defined as an override object:
```ts
type Arrhythmia = {
  name: string
  description: string
  conductionOverrides: {
    saNodeActive: boolean
    atrialPattern: 'normal' | 'chaotic' | 'independent'
    avConduction: 'normal' | 'blocked' | 'bypassed'
    ventricularOrigin: 'purkinje' | 'ectopic'
    bpmOverride?: [min: number, max: number]
  }
  ecgCharacteristics: { ... }
}
```

### annotations.ts
Per-structure educational content:
```ts
type Annotation = {
  structureId: string      // matches GLTF node name
  name: string
  function: string
  failureMode: string      // "what happens when this breaks"
  relatedPhases: Phase[]
}
```

### vessel-paths.ts
CatmullRom spline control points for blood flow particle routes. Two circuits (pulmonary, systemic) with branching paths.

---

## 9. MVP Phasing

### v1 — The Portfolio Piece

- Beating heart with correct 7-phase cardiac cycle timing
- 3 layer toggles: muscle, valves, conduction system
- BPM slider (40–180)
- ECG trace synced to the beat
- Conduction wave animation with glow shader
- Blood flow particles (~1000, systemic circuit only: LV → aorta → vena cavae → RA)
- Telemetry HUD: BPM, phase, valve states
- Orbit camera + 2 presets (front, anterior cutaway)
- Click-to-learn annotations
- Desktop + tablet responsive
- Deployed on Vercel

### v2 — The Simulation

- Arrhythmia simulation (AFib, V-Tach, heart block, WPW)
- Coronary artery layer
- Full blood flow (both circuits, 3000+ particles)
- Heart sounds (S1, S2 audio synced to valve closure)
- More camera presets (posterior, superior)
- Smooth arrhythmia transitions
- Mobile layout

### v3 — The Experience

- Guided educational mode (narrated cardiac cycle walk-through)
- Shareable states (URL encodes view + settings)
- Performance metrics overlay
- Additional pathologies (stenosis, tamponade)

---

## 10. Deployment

- Vercel static site from GitHub repo
- GLTF assets in `public/models/` with immutable cache headers
- Draco decoder from Google CDN (drei default)
- Manual chunks in Vite config: `three`, `r3f` separated from app code
- `<Suspense>` wrapper for model loading with branded loading screen

---

## 11. Performance Budget

**Target:** 60fps on a mid-range laptop (M1 MacBook Air or equivalent integrated GPU).

| Metric | Budget |
|--------|--------|
| Model triangles | < 100k |
| Particle count (v1) | 1000 instanced |
| JS bundle (gzipped) | < 300KB |
| GLTF model (Draco) | < 5MB |
| Total payload | < 8MB |
| First meaningful paint | < 4s on fast 3G |

**Degradation tiers** (auto-detected via `useDetectGPU` from drei):

| Tier | GPU | Adjustments |
|------|-----|-------------|
| High | Dedicated GPU | Full quality, DOF enabled |
| Medium | Integrated (M1, Intel Iris) | Disable DOF, reduce bloom quality |
| Low | Old integrated / mobile | Disable bloom + DOF, reduce particles to 500, lower DPR to 1 |

**Hot path rules:**
- No `new` allocations inside `useFrame` — preallocate and reuse
- Geometries and materials defined outside component or `useMemo`
- Zustand state read via refs, never direct store access in `useFrame`
- Canvas 2D ECG shares `clock.elapsedTime` from R3F via ref for sync

---

## 12. Accessibility

- Keyboard navigation for all controls (layer toggles, BPM slider, camera presets)
- ARIA labels on all interactive UI elements
- `prefers-reduced-motion`: disable auto-rotate, simplify beat animation to opacity pulse instead of deformation
- Color-blind safe: conduction system glow uses bright cyan (not red/green) to distinguish from tissue. Blood flow particles use brightness difference (bright red vs. dark blue-red) rather than hue alone.
- Screen reader description of current state available via visually hidden live region

---

## 13. Error Handling

| Failure | Fallback |
|---------|----------|
| GLTF fails to load | Error boundary with retry button + message: "Heart model couldn't load. Check your connection." |
| WebGL not supported | Static image of heart with text: "Your browser doesn't support 3D rendering. Try Chrome or Firefox." |
| Draco decoder CDN unreachable | Fall back to non-Draco model (larger but functional) |
| Low FPS detected (< 30) | Auto-downgrade to lower performance tier |

React error boundary wraps `<Canvas>`. Suspense boundary with branded loading screen (pulsing heart silhouette + "Loading...") wraps the scene.

---

## 14. Testing Strategy

**Unit testable (pure logic, no DOM):**
- `useCardiacCycle`: phase progression, BPM scaling math, phase duration computation
- `cardiac-timing.ts`: valve state derivation from phase
- `arrhythmias.ts`: conduction override application

**Integration testable:**
- Zustand store: action → state transitions
- Layer toggle: correct nodes visible/hidden per active layers

**Visual (manual or snapshot):**
- HUD state at each cardiac phase
- Layer toggle combinations
- BPM extremes (40, 72, 180)

---

## 15. Open Questions

- [ ] Which specific 3D model? Need to evaluate Sketchfab candidates in Blender for mesh quality and part separation
- [ ] Morph targets vs. procedural animation? Depends on chosen model's rigging
- [ ] Conduction system: model as geometry in Blender or generate programmatically from spline data?
- [ ] Project name? Working title needed for repo and domain
