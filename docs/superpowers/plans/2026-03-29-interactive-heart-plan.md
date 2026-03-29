# Interactive 3D Human Heart — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive, anatomically realistic 3D human heart visualization with real-time cardiac cycle animation, layer toggles, BPM simulation, and educational annotations.

**Architecture:** React Three Fiber app with Zustand state management. A master clock hook (`useCardiacCycle`) drives all animation — valve states, conduction waves, beat deformation, ECG trace, and telemetry all derive from it. The 3D scene and DOM UI are separate layers (Canvas + overlay). A placeholder procedural heart geometry is used until the real GLTF model is prepared.

**Tech Stack:** Vite, React 18, TypeScript, React Three Fiber, Three.js, Zustand, @react-three/drei, @react-three/postprocessing

**Spec:** `docs/superpowers/specs/2026-03-29-interactive-heart-design.md`

---

## File Structure

```
interactive-heart/
  public/
    models/
      heart.glb                     # Draco-compressed GLTF (added in Task 10)
  src/
    data/
      heart-parts.ts                # GLTF node name contract (const enum)
      cardiac-timing.ts             # Phase durations, scaling function, conduction velocities
      annotations.ts                # Educational text per structure
      vessel-paths.ts               # CatmullRom spline control points for blood flow
    store/
      useSimStore.ts                # Zustand store: BPM, layers, phase, valve states
    hooks/
      useCardiacCycle.ts            # Master clock: elapsed → phase + progress
      useConductionWave.ts          # Maps cycleElapsed to conduction pathway position
      useBloodParticles.ts          # Particle position updates along vessel splines
    components/
      canvas/
        HeartScene.tsx              # Root R3F scene graph
        HeartModel.tsx              # GLTF model loader + layer visibility + beat animation
        PlaceholderHeart.tsx        # Procedural geometry stand-in (dev/testing)
        BloodFlow.tsx               # Instanced particle system
        ConductionSystem.tsx        # Glowing tube geometry + wave shader
        ValveAnimator.tsx           # Valve open/close animation
        Lighting.tsx                # Three-point lighting setup
        CameraRig.tsx               # OrbitControls + preset positions
        PostProcessing.tsx          # Selective bloom + optional DOF
      ui/
        HUD.tsx                     # Layout wrapper for all overlay panels
        TelemetryPanel.tsx          # BPM, phase name, cycle time, valve states
        ECGTrace.tsx                # Canvas 2D real-time ECG waveform
        LayerControls.tsx           # Toggle buttons for anatomical layers
        SimulationControls.tsx      # BPM slider
        AnnotationCard.tsx          # Click-to-learn modal overlay
        LoadingScreen.tsx           # Suspense fallback
      ErrorBoundary.tsx             # Catches WebGL / model load failures
    shaders/
      conduction.frag.glsl          # Glow propagation wave
      conduction.vert.glsl          # Pass-through vertex shader
    App.tsx                         # Canvas + UI overlay layout
    App.css                         # Overlay positioning, HUD styles
    main.tsx                        # Entry point
  tests/
    data/
      cardiac-timing.test.ts        # Phase duration math, BPM scaling
    hooks/
      useCardiacCycle.test.ts       # Phase progression, cycle counting
    store/
      useSimStore.test.ts           # Store actions and state transitions
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  vercel.json
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `interactive-heart/package.json`
- Create: `interactive-heart/vite.config.ts`
- Create: `interactive-heart/tsconfig.json`
- Create: `interactive-heart/index.html`
- Create: `interactive-heart/src/main.tsx`
- Create: `interactive-heart/src/App.tsx`
- Create: `interactive-heart/src/App.css`
- Create: `interactive-heart/vercel.json`

- [ ] **Step 1: Scaffold Vite + React + TypeScript project**

```bash
cd "C:/Users/Brian/OneDrive/Desktop/Agentic Systems"
npm create vite@latest interactive-heart -- --template react-ts
cd interactive-heart
```

- [ ] **Step 2: Install dependencies**

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing zustand
npm install -D @types/three vitest @testing-library/react
```

- [ ] **Step 3: Configure Vite for GLTF assets and manual chunks**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr'],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})
```

- [ ] **Step 4: Create vercel.json with cache headers for models**

```json
{
  "headers": [
    {
      "source": "/models/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

- [ ] **Step 5: Create minimal App.tsx with Canvas + overlay structure**

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Canvas
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 5] }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </Suspense>
      </Canvas>
      <div className="overlay">
        <p style={{ color: 'white' }}>Interactive Heart</p>
      </div>
    </div>
  )
}
```

```css
/* src/App.css */
.app {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #1a1a2e;
}

.overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.overlay > * {
  pointer-events: all;
}
```

- [ ] **Step 6: Verify dev server starts and renders red cube**

```bash
npm run dev
```

Expected: Browser opens, dark background with a red cube. No console errors.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold R3F project with Vite + React + TypeScript"
```

---

## Task 2: Data Layer — Cardiac Timing & Heart Parts

**Files:**
- Create: `src/data/heart-parts.ts`
- Create: `src/data/cardiac-timing.ts`
- Create: `tests/data/cardiac-timing.test.ts`

- [ ] **Step 1: Write tests for cardiac timing**

```ts
// tests/data/cardiac-timing.test.ts
import { describe, it, expect } from 'vitest'
import {
  REFERENCE_DURATIONS,
  computePhaseDurations,
  getValveStates,
  Phase,
} from '../../src/data/cardiac-timing'

describe('computePhaseDurations', () => {
  it('sums to correct cycle duration at 72 BPM', () => {
    const durations = computePhaseDurations(72)
    const total = durations.reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(60000 / 72, 0) // 833ms
  })

  it('P1-P6 stay fixed below 105 BPM', () => {
    const durations = computePhaseDurations(60)
    for (let i = 0; i < 6; i++) {
      expect(durations[i]).toBe(REFERENCE_DURATIONS[i])
    }
  })

  it('P7 absorbs at low BPM', () => {
    const durations = computePhaseDurations(60)
    const cycle = 60000 / 60 // 1000ms
    const fixedTotal = REFERENCE_DURATIONS.slice(0, 6).reduce((a, b) => a + b, 0)
    expect(durations[6]).toBeCloseTo(cycle - fixedTotal, 0)
  })

  it('all phases scale proportionally above 105 BPM', () => {
    const durations = computePhaseDurations(150)
    const total = durations.reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(60000 / 150, 0) // 400ms
    expect(durations[6]).toBe(50) // P7 floor
  })

  it('handles 180 BPM without negative durations', () => {
    const durations = computePhaseDurations(180)
    durations.forEach((d) => expect(d).toBeGreaterThan(0))
    const total = durations.reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(60000 / 180, 0)
  })

  it('handles 40 BPM', () => {
    const durations = computePhaseDurations(40)
    const total = durations.reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(60000 / 40, 0) // 1500ms
  })
})

describe('getValveStates', () => {
  it('all valves closed during P2 (isovolumetric contraction)', () => {
    const valves = getValveStates('P2')
    expect(valves.mitral).toBe(false)
    expect(valves.tricuspid).toBe(false)
    expect(valves.aortic).toBe(false)
    expect(valves.pulmonary).toBe(false)
  })

  it('AV valves open during P6 (rapid filling)', () => {
    const valves = getValveStates('P6')
    expect(valves.mitral).toBe(true)
    expect(valves.tricuspid).toBe(true)
    expect(valves.aortic).toBe(false)
    expect(valves.pulmonary).toBe(false)
  })

  it('semilunar valves open during P3 (rapid ejection)', () => {
    const valves = getValveStates('P3')
    expect(valves.mitral).toBe(false)
    expect(valves.tricuspid).toBe(false)
    expect(valves.aortic).toBe(true)
    expect(valves.pulmonary).toBe(true)
  })

  it('all valves closed during P5 (isovolumetric relaxation)', () => {
    const valves = getValveStates('P5')
    expect(valves.mitral).toBe(false)
    expect(valves.tricuspid).toBe(false)
    expect(valves.aortic).toBe(false)
    expect(valves.pulmonary).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/data/cardiac-timing.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Create heart-parts.ts**

```ts
// src/data/heart-parts.ts
export const HEART_PARTS = {
  LEFT_VENTRICLE: 'left-ventricle',
  RIGHT_VENTRICLE: 'right-ventricle',
  LEFT_ATRIUM: 'left-atrium',
  RIGHT_ATRIUM: 'right-atrium',
  MITRAL_VALVE: 'mitral-valve',
  TRICUSPID_VALVE: 'tricuspid-valve',
  AORTIC_VALVE: 'aortic-valve',
  PULMONARY_VALVE: 'pulmonary-valve',
  AORTA: 'aorta',
  PULMONARY_ARTERY: 'pulmonary-artery',
  SUPERIOR_VENA_CAVA: 'superior-vena-cava',
  INFERIOR_VENA_CAVA: 'inferior-vena-cava',
  PULMONARY_VEINS: 'pulmonary-veins',
  SA_NODE: 'sa-node',
  AV_NODE: 'av-node',
  BUNDLE_OF_HIS: 'bundle-of-his',
  LEFT_BUNDLE_BRANCH: 'left-bundle-branch',
  RIGHT_BUNDLE_BRANCH: 'right-bundle-branch',
  PURKINJE_FIBERS: 'purkinje-fibers',
  MYOCARDIUM: 'myocardium',
  SEPTUM: 'septum',
} as const

export type HeartPartId = (typeof HEART_PARTS)[keyof typeof HEART_PARTS]
```

- [ ] **Step 4: Create cardiac-timing.ts**

```ts
// src/data/cardiac-timing.ts
export type Phase = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7'

export const PHASES: Phase[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7']

export const PHASE_NAMES: Record<Phase, string> = {
  P1: 'Atrial Systole',
  P2: 'Isovolumetric Contraction',
  P3: 'Rapid Ejection',
  P4: 'Reduced Ejection',
  P5: 'Isovolumetric Relaxation',
  P6: 'Rapid Filling',
  P7: 'Diastasis',
}

// Reference durations at 72 BPM (ms) — [P1, P2, P3, P4, P5, P6, P7]
export const REFERENCE_DURATIONS = [100, 50, 110, 130, 70, 110, 263] as const

const P7_FLOOR = 50
const FIXED_PHASES_TOTAL = REFERENCE_DURATIONS.slice(0, 6).reduce((a, b) => a + b, 0) // 570ms

export function computePhaseDurations(bpm: number): number[] {
  const cycleDuration = 60000 / bpm
  const p7Available = cycleDuration - FIXED_PHASES_TOTAL

  if (p7Available >= P7_FLOOR) {
    // Tier 1: only P7 flexes
    return [...REFERENCE_DURATIONS.slice(0, 6), p7Available]
  }

  // Tier 2: all phases scale proportionally, P7 at floor
  const remainingTime = cycleDuration - P7_FLOOR
  const scaleFactor = remainingTime / FIXED_PHASES_TOTAL
  const scaled = REFERENCE_DURATIONS.slice(0, 6).map((d) => d * scaleFactor)
  return [...scaled, P7_FLOOR]
}

export type ValveStates = Record<'mitral' | 'tricuspid' | 'aortic' | 'pulmonary', boolean>

export function getValveStates(phase: Phase): ValveStates {
  // AV valves (mitral, tricuspid): open during P1, P6, P7 (filling phases)
  // Semilunar valves (aortic, pulmonary): open during P3, P4 (ejection phases)
  const avOpen = phase === 'P1' || phase === 'P6' || phase === 'P7'
  const slOpen = phase === 'P3' || phase === 'P4'

  return {
    mitral: avOpen,
    tricuspid: avOpen,
    aortic: slOpen,
    pulmonary: slOpen,
  }
}

// Conduction system timing (ms from SA node fire)
export const CONDUCTION_TIMING = {
  saToAtrialEnd: 50,
  atrialEndToAvExit: 120, // AV delay
  avToHisEnd: 20,
  hisToPurkinjeEnd: 60, // midpoint of 40-75ms range
  totalDepolarization: 250, // 50 + 120 + 20 + 60
} as const
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run tests/data/cardiac-timing.test.ts
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/ tests/data/
git commit -m "feat: add cardiac timing data layer with BPM scaling and valve states"
```

---

## Task 3: Zustand Store

**Files:**
- Create: `src/store/useSimStore.ts`
- Create: `tests/store/useSimStore.test.ts`

- [ ] **Step 1: Write store tests**

```ts
// tests/store/useSimStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useSimStore } from '../../src/store/useSimStore'

describe('useSimStore', () => {
  beforeEach(() => {
    useSimStore.setState({
      bpm: 72,
      arrhythmia: 'sinus',
      activeLayers: new Set(['muscle', 'valves', 'conduction']),
      selectedStructure: null,
      currentPhase: 'P1',
      phaseProgress: 0,
      cycleElapsed: 0,
    })
  })

  it('initializes with defaults', () => {
    const state = useSimStore.getState()
    expect(state.bpm).toBe(72)
    expect(state.arrhythmia).toBe('sinus')
    expect(state.activeLayers.size).toBe(3)
  })

  it('setBPM clamps to 40-180 range', () => {
    useSimStore.getState().setBPM(200)
    expect(useSimStore.getState().bpm).toBe(180)
    useSimStore.getState().setBPM(10)
    expect(useSimStore.getState().bpm).toBe(40)
  })

  it('toggleLayer adds and removes layers', () => {
    useSimStore.getState().toggleLayer('muscle')
    expect(useSimStore.getState().activeLayers.has('muscle')).toBe(false)
    useSimStore.getState().toggleLayer('muscle')
    expect(useSimStore.getState().activeLayers.has('muscle')).toBe(true)
  })

  it('selectStructure sets and clears', () => {
    useSimStore.getState().selectStructure('left-ventricle')
    expect(useSimStore.getState().selectedStructure).toBe('left-ventricle')
    useSimStore.getState().selectStructure(null)
    expect(useSimStore.getState().selectedStructure).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/store/useSimStore.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the store**

```ts
// src/store/useSimStore.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { type Phase } from '../data/cardiac-timing'

export type Layer = 'muscle' | 'valves' | 'conduction'
export type ArrhythmiaType = 'sinus'

interface SimState {
  bpm: number
  arrhythmia: ArrhythmiaType
  activeLayers: Set<Layer>
  selectedStructure: string | null
  currentPhase: Phase
  phaseProgress: number
  cycleElapsed: number

  setBPM: (bpm: number) => void
  setArrhythmia: (type: ArrhythmiaType) => void
  toggleLayer: (layer: Layer) => void
  selectStructure: (id: string | null) => void
}

export const useSimStore = create<SimState>()(
  subscribeWithSelector((set) => ({
    bpm: 72,
    arrhythmia: 'sinus' as ArrhythmiaType,
    activeLayers: new Set<Layer>(['muscle', 'valves', 'conduction']),
    selectedStructure: null,
    currentPhase: 'P1' as Phase,
    phaseProgress: 0,
    cycleElapsed: 0,

    setBPM: (bpm) => set({ bpm: Math.max(40, Math.min(180, bpm)) }),
    setArrhythmia: (arrhythmia) => set({ arrhythmia }),
    toggleLayer: (layer) =>
      set((state) => {
        const next = new Set(state.activeLayers)
        if (next.has(layer)) next.delete(layer)
        else next.add(layer)
        return { activeLayers: next }
      }),
    selectStructure: (id) => set({ selectedStructure: id }),
  }))
)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/store/useSimStore.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/ tests/store/
git commit -m "feat: add Zustand simulation store with BPM, layers, structure selection"
```

---

## Task 4: Master Clock Hook — useCardiacCycle

**Files:**
- Create: `src/hooks/useCardiacCycle.ts`
- Create: `tests/hooks/useCardiacCycle.test.ts`

- [ ] **Step 1: Write tests for the cardiac cycle hook**

```ts
// tests/hooks/useCardiacCycle.test.ts
import { describe, it, expect } from 'vitest'
import {
  computeCycleState,
  type CardiacCycleState,
} from '../../src/hooks/useCardiacCycle'

describe('computeCycleState', () => {
  it('returns P1 at elapsed 0', () => {
    const state = computeCycleState(0, 72)
    expect(state.phase).toBe('P1')
    expect(state.t).toBeCloseTo(0, 2)
    expect(state.cycleCount).toBe(0)
  })

  it('returns P2 at elapsed 100ms (72 BPM)', () => {
    const state = computeCycleState(100, 72)
    expect(state.phase).toBe('P2')
    expect(state.t).toBeCloseTo(0, 2)
  })

  it('returns P7 at elapsed 600ms (72 BPM)', () => {
    const state = computeCycleState(600, 72)
    expect(state.phase).toBe('P7')
  })

  it('wraps to new cycle after full beat', () => {
    const state = computeCycleState(834, 72) // just past 833ms
    expect(state.phase).toBe('P1')
    expect(state.cycleCount).toBe(1)
  })

  it('handles high BPM correctly (150)', () => {
    const state = computeCycleState(0, 150)
    expect(state.phase).toBe('P1')
    expect(state.phaseDurations.reduce((a, b) => a + b, 0)).toBeCloseTo(400, 0)
  })

  it('t progresses 0 to 1 within a phase', () => {
    // Midpoint of P1 at 72 BPM (P1 = 100ms)
    const state = computeCycleState(50, 72)
    expect(state.phase).toBe('P1')
    expect(state.t).toBeCloseTo(0.5, 1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/hooks/useCardiacCycle.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement the pure computation function and R3F hook**

```ts
// src/hooks/useCardiacCycle.ts
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  type Phase,
  PHASES,
  computePhaseDurations,
  getValveStates,
} from '../data/cardiac-timing'
import { useSimStore } from '../store/useSimStore'

export interface CardiacCycleState {
  phase: Phase
  t: number
  cycleElapsed: number
  cycleCount: number
  phaseDurations: number[]
}

/**
 * Pure function: given total elapsed ms and BPM, compute the cardiac cycle state.
 * Extracted for testability — no React/R3F dependency.
 */
export function computeCycleState(
  totalElapsedMs: number,
  bpm: number
): CardiacCycleState {
  const phaseDurations = computePhaseDurations(bpm)
  const cycleDuration = phaseDurations.reduce((a, b) => a + b, 0)
  const cycleCount = Math.floor(totalElapsedMs / cycleDuration)
  const cycleElapsed = totalElapsedMs % cycleDuration

  let accumulated = 0
  for (let i = 0; i < phaseDurations.length; i++) {
    const phaseEnd = accumulated + phaseDurations[i]
    if (cycleElapsed < phaseEnd) {
      const t = (cycleElapsed - accumulated) / phaseDurations[i]
      return {
        phase: PHASES[i],
        t: Math.max(0, Math.min(1, t)),
        cycleElapsed,
        cycleCount,
        phaseDurations,
      }
    }
    accumulated = phaseEnd
  }

  // Edge case: exactly at cycle boundary
  return {
    phase: 'P7',
    t: 1,
    cycleElapsed,
    cycleCount,
    phaseDurations,
  }
}

/**
 * R3F hook: updates the Zustand store every frame with current cardiac cycle state.
 * Uses refs internally — zero React re-renders.
 */
export function useCardiacCycle() {
  const totalElapsedRef = useRef(0)
  const bpmRef = useRef(72)
  const stateRef = useRef<CardiacCycleState>({
    phase: 'P1',
    t: 0,
    cycleElapsed: 0,
    cycleCount: 0,
    phaseDurations: computePhaseDurations(72),
  })

  // Subscribe to BPM changes without re-rendering
  useRef(
    useSimStore.subscribe(
      (s) => s.bpm,
      (bpm) => {
        bpmRef.current = bpm
      }
    )
  )

  useFrame((_, delta) => {
    totalElapsedRef.current += delta * 1000 // delta is seconds, we work in ms
    const state = computeCycleState(totalElapsedRef.current, bpmRef.current)
    stateRef.current = state

    // Update store (batched — Zustand coalesces)
    const valves = getValveStates(state.phase)
    useSimStore.setState({
      currentPhase: state.phase,
      phaseProgress: state.t,
      cycleElapsed: state.cycleElapsed,
    })
  })

  return stateRef
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/hooks/useCardiacCycle.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCardiacCycle.ts tests/hooks/
git commit -m "feat: add cardiac cycle master clock with BPM-scaled phase progression"
```

---

## Task 5: Placeholder Heart + Scene Setup

**Files:**
- Create: `src/components/canvas/PlaceholderHeart.tsx`
- Create: `src/components/canvas/Lighting.tsx`
- Create: `src/components/canvas/CameraRig.tsx`
- Create: `src/components/canvas/HeartScene.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create PlaceholderHeart — procedural geometry that beats**

A simplified heart shape using spheres and cones that expands/contracts with the cardiac cycle. This lets us develop all the UI, HUD, and simulation controls before the real GLTF model is ready.

```tsx
// src/components/canvas/PlaceholderHeart.tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimStore } from '../../store/useSimStore'

export function PlaceholderHeart() {
  const groupRef = useRef<THREE.Group>(null)
  const phaseProgressRef = useRef(0)
  const currentPhaseRef = useRef('P1')
  const activeLayersRef = useRef(new Set(['muscle', 'valves', 'conduction']))

  // Subscribe to store without re-renders
  useMemo(() => {
    useSimStore.subscribe(
      (s) => s.phaseProgress,
      (p) => { phaseProgressRef.current = p }
    )
    useSimStore.subscribe(
      (s) => s.currentPhase,
      (p) => { currentPhaseRef.current = p }
    )
    useSimStore.subscribe(
      (s) => s.activeLayers,
      (l) => { activeLayersRef.current = l }
    )
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    const phase = currentPhaseRef.current
    const t = phaseProgressRef.current

    // Beat animation: scale ventricles during systole
    const isSystole = phase === 'P2' || phase === 'P3' || phase === 'P4'
    const targetScale = isSystole ? 1 - 0.08 * Math.sin(t * Math.PI) : 1
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1)
    )
  })

  const muscleVisible = useSimStore((s) => s.activeLayers.has('muscle'))
  const valvesVisible = useSimStore((s) => s.activeLayers.has('valves'))

  return (
    <group ref={groupRef}>
      {/* Main body — two overlapping spheres */}
      <mesh visible={muscleVisible} name="left-ventricle">
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshPhysicalMaterial
          color="#c84b4b"
          roughness={0.6}
          metalness={0.1}
          transmission={0.05}
          thickness={1}
        />
      </mesh>

      {/* Right side — slightly smaller, offset */}
      <mesh position={[0.3, 0.2, 0]} visible={muscleVisible} name="right-ventricle">
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshPhysicalMaterial
          color="#a04040"
          roughness={0.6}
          metalness={0.1}
          transmission={0.05}
          thickness={1}
        />
      </mesh>

      {/* Aorta — cylinder */}
      <mesh position={[0.1, 0.9, 0]} rotation={[0, 0, 0.3]} visible={muscleVisible} name="aorta">
        <cylinderGeometry args={[0.12, 0.15, 0.6, 16]} />
        <meshPhysicalMaterial color="#b83e3e" roughness={0.5} />
      </mesh>

      {/* Valve indicators — small torus shapes */}
      <mesh position={[0, 0.3, 0.4]} visible={valvesVisible} name="mitral-valve">
        <torusGeometry args={[0.12, 0.03, 8, 16]} />
        <meshStandardMaterial color="#e8d4a0" />
      </mesh>
      <mesh position={[0.3, 0.3, 0.3]} visible={valvesVisible} name="tricuspid-valve">
        <torusGeometry args={[0.1, 0.03, 8, 16]} />
        <meshStandardMaterial color="#e8d4a0" />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Create Lighting.tsx**

```tsx
// src/components/canvas/Lighting.tsx
export function Lighting() {
  return (
    <>
      {/* Key light — warm white, upper left */}
      <directionalLight position={[-3, 4, 2]} intensity={1.2} color="#fff5e6" />
      {/* Fill light — cool blue, lower right */}
      <directionalLight position={[3, -1, 2]} intensity={0.4} color="#b0c4de" />
      {/* Rim light — warm edge */}
      <directionalLight position={[0, 0, -3]} intensity={0.3} color="#ffe0c0" />
      {/* Ambient */}
      <ambientLight intensity={0.2} />
    </>
  )
}
```

- [ ] **Step 3: Create CameraRig.tsx**

```tsx
// src/components/canvas/CameraRig.tsx
import { OrbitControls } from '@react-three/drei'

export function CameraRig() {
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={10}
      autoRotate
      autoRotateSpeed={0.5}
    />
  )
}
```

- [ ] **Step 4: Create HeartScene.tsx — root scene graph**

```tsx
// src/components/canvas/HeartScene.tsx
import { PlaceholderHeart } from './PlaceholderHeart'
import { Lighting } from './Lighting'
import { CameraRig } from './CameraRig'
import { useCardiacCycle } from '../../hooks/useCardiacCycle'

export function HeartScene() {
  // Start the master clock
  useCardiacCycle()

  return (
    <>
      <Lighting />
      <CameraRig />
      <PlaceholderHeart />
    </>
  )
}
```

- [ ] **Step 5: Update App.tsx to use HeartScene**

Replace the placeholder cube with the scene:

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { HeartScene } from './components/canvas/HeartScene'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Canvas
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 4] }}
      >
        <Suspense fallback={null}>
          <HeartScene />
        </Suspense>
      </Canvas>
      <div className="overlay" />
    </div>
  )
}
```

- [ ] **Step 6: Verify — dev server shows a beating red heart shape**

```bash
npm run dev
```

Expected: Dark background, red heart-like shape slowly auto-rotating, subtly pulsing (contracting during systole phases). Three-point lighting visible.

- [ ] **Step 7: Commit**

```bash
git add src/components/canvas/ src/App.tsx
git commit -m "feat: add placeholder heart geometry with beat animation and scene setup"
```

---

## Task 6: Telemetry HUD + Simulation Controls

**Files:**
- Create: `src/components/ui/HUD.tsx`
- Create: `src/components/ui/TelemetryPanel.tsx`
- Create: `src/components/ui/SimulationControls.tsx`
- Create: `src/components/ui/LayerControls.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create TelemetryPanel.tsx**

```tsx
// src/components/ui/TelemetryPanel.tsx
import { useSimStore } from '../../store/useSimStore'
import { PHASE_NAMES, getValveStates } from '../../data/cardiac-timing'

export function TelemetryPanel() {
  const bpm = useSimStore((s) => s.bpm)
  const phase = useSimStore((s) => s.currentPhase)
  const cycleElapsed = useSimStore((s) => s.cycleElapsed)
  const valves = getValveStates(phase)

  return (
    <div className="telemetry-panel" aria-label="Heart telemetry">
      <div className="telemetry-section">
        <span className="telemetry-label">BPM</span>
        <span className="telemetry-value">{bpm}</span>
      </div>
      <div className="telemetry-section">
        <span className="telemetry-label">Phase</span>
        <span className="telemetry-value telemetry-phase">{PHASE_NAMES[phase]}</span>
      </div>
      <div className="telemetry-section">
        <span className="telemetry-label">Cycle</span>
        <span className="telemetry-value">{Math.round(cycleElapsed)}ms</span>
      </div>
      <div className="telemetry-section">
        <span className="telemetry-label">Valves</span>
        <div className="valve-indicators">
          <span className={`valve ${valves.mitral ? 'open' : 'closed'}`} title="Mitral">M</span>
          <span className={`valve ${valves.tricuspid ? 'open' : 'closed'}`} title="Tricuspid">T</span>
          <span className={`valve ${valves.aortic ? 'open' : 'closed'}`} title="Aortic">A</span>
          <span className={`valve ${valves.pulmonary ? 'open' : 'closed'}`} title="Pulmonary">P</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create SimulationControls.tsx**

```tsx
// src/components/ui/SimulationControls.tsx
import { useSimStore } from '../../store/useSimStore'

export function SimulationControls() {
  const bpm = useSimStore((s) => s.bpm)
  const setBPM = useSimStore((s) => s.setBPM)

  return (
    <div className="simulation-controls" aria-label="Simulation controls">
      <label className="control-label">
        <span>Heart Rate</span>
        <input
          type="range"
          min={40}
          max={180}
          value={bpm}
          onChange={(e) => setBPM(Number(e.target.value))}
          aria-label={`Heart rate: ${bpm} BPM`}
        />
        <span className="control-value">{bpm} BPM</span>
      </label>
    </div>
  )
}
```

- [ ] **Step 3: Create LayerControls.tsx**

```tsx
// src/components/ui/LayerControls.tsx
import { useSimStore, type Layer } from '../../store/useSimStore'

const LAYERS: { id: Layer; label: string }[] = [
  { id: 'muscle', label: 'Muscle' },
  { id: 'valves', label: 'Valves' },
  { id: 'conduction', label: 'Conduction' },
]

export function LayerControls() {
  const activeLayers = useSimStore((s) => s.activeLayers)
  const toggleLayer = useSimStore((s) => s.toggleLayer)

  return (
    <div className="layer-controls" aria-label="Anatomical layers">
      {LAYERS.map(({ id, label }) => (
        <button
          key={id}
          className={`layer-btn ${activeLayers.has(id) ? 'active' : ''}`}
          onClick={() => toggleLayer(id)}
          aria-pressed={activeLayers.has(id)}
          aria-label={`Toggle ${label} layer`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create HUD.tsx wrapper**

```tsx
// src/components/ui/HUD.tsx
import { TelemetryPanel } from './TelemetryPanel'
import { SimulationControls } from './SimulationControls'
import { LayerControls } from './LayerControls'

export function HUD() {
  return (
    <div className="hud">
      <div className="hud-left">
        <LayerControls />
      </div>
      <div className="hud-right">
        <TelemetryPanel />
      </div>
      <div className="hud-bottom">
        <SimulationControls />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Add HUD styles to App.css**

```css
/* Add to src/App.css */

.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 1fr auto;
  padding: 24px;
  font-family: 'Geist', system-ui, -apple-system, sans-serif;
  color: rgba(255, 255, 255, 0.9);
}

.hud-left {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-self: center;
  pointer-events: all;
}

.hud-right {
  grid-column: 3;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-self: start;
  pointer-events: all;
}

.hud-bottom {
  grid-column: 1 / -1;
  grid-row: 2;
  pointer-events: all;
}

/* Telemetry */
.telemetry-panel {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 16px;
  min-width: 180px;
}

.telemetry-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.telemetry-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.6;
}

.telemetry-value {
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.telemetry-phase {
  font-size: 12px;
}

/* Valve indicators */
.valve-indicators {
  display: flex;
  gap: 4px;
}

.valve {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 600;
  transition: background 0.15s;
}

.valve.open {
  background: rgba(76, 175, 80, 0.7);
}

.valve.closed {
  background: rgba(244, 67, 54, 0.5);
}

/* Layer controls */
.layer-btn {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.4);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s;
}

.layer-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.3);
}

.layer-btn:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

/* Simulation controls */
.simulation-controls {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 12px 20px;
  max-width: 400px;
  margin: 0 auto;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.control-label input[type="range"] {
  flex: 1;
  accent-color: #c84b4b;
}

.control-value {
  font-variant-numeric: tabular-nums;
  min-width: 60px;
  text-align: right;
}
```

- [ ] **Step 6: Update App.tsx to include HUD**

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { HeartScene } from './components/canvas/HeartScene'
import { HUD } from './components/ui/HUD'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Canvas
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 4] }}
      >
        <Suspense fallback={null}>
          <HeartScene />
        </Suspense>
      </Canvas>
      <HUD />
    </div>
  )
}
```

- [ ] **Step 7: Verify — HUD renders over scene, BPM slider changes beat speed, layer toggles hide geometry**

```bash
npm run dev
```

Expected: Layer buttons on the left, telemetry panel on the right, BPM slider at the bottom. Sliding BPM changes the pulse rate. Toggling "Muscle" hides the main spheres. Valve indicators flash green/red in sync with the beat.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/ src/App.tsx src/App.css
git commit -m "feat: add telemetry HUD, BPM slider, and layer toggle controls"
```

---

## Task 7: ECG Trace

**Files:**
- Create: `src/components/ui/ECGTrace.tsx`
- Modify: `src/components/ui/HUD.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create ECGTrace.tsx — Canvas 2D real-time waveform**

```tsx
// src/components/ui/ECGTrace.tsx
import { useRef, useEffect, useCallback } from 'react'
import { useSimStore } from '../../store/useSimStore'

const WIDTH = 400
const HEIGHT = 100
const BASELINE_Y = HEIGHT * 0.6
const SCROLL_SPEED = 80 // pixels per second

/**
 * Generates a y-offset for the ECG trace based on cycle elapsed time.
 * Simplified waveform: P wave, QRS complex, T wave at correct phase timing.
 */
function ecgValue(cycleElapsed: number, phaseDurations: number[]): number {
  const p1End = phaseDurations[0]
  const p2End = p1End + phaseDurations[1]
  const p4End = p2End + phaseDurations[2] + phaseDurations[3]

  // P wave — small bump during atrial depolarization (P1)
  if (cycleElapsed < p1End) {
    const t = cycleElapsed / p1End
    return Math.sin(t * Math.PI) * 8
  }

  // QRS complex — sharp spike at start of ventricular depolarization (P2)
  if (cycleElapsed < p2End) {
    const t = (cycleElapsed - p1End) / phaseDurations[1]
    if (t < 0.2) return -5 * (t / 0.2) // Q dip
    if (t < 0.5) return -5 + 45 * ((t - 0.2) / 0.3) // R spike
    if (t < 0.8) return 40 - 50 * ((t - 0.5) / 0.3) // S dip
    return -10 + 10 * ((t - 0.8) / 0.2) // return to baseline
  }

  // T wave — broad bump during ventricular repolarization (P4)
  const p3End = p2End + phaseDurations[2]
  if (cycleElapsed > p3End && cycleElapsed < p4End) {
    const t = (cycleElapsed - p3End) / phaseDurations[3]
    return Math.sin(t * Math.PI) * 12
  }

  return 0 // baseline
}

export function ECGTrace() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bufferRef = useRef<number[]>(new Array(WIDTH).fill(0))
  const writeIndexRef = useRef(0)
  const lastTimeRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = useSimStore.getState()
    const now = performance.now()
    const dt = (now - lastTimeRef.current) / 1000
    lastTimeRef.current = now

    // Advance write head
    const pixelsToAdvance = Math.round(dt * SCROLL_SPEED)
    const durations = [100, 50, 110, 130, 70, 110, 263] // reference at 72 — will improve with store
    for (let i = 0; i < pixelsToAdvance; i++) {
      bufferRef.current[writeIndexRef.current % WIDTH] = ecgValue(
        state.cycleElapsed,
        durations
      )
      writeIndexRef.current++
    }

    // Draw
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    ctx.strokeStyle = '#4caf50'
    ctx.lineWidth = 1.5
    ctx.beginPath()

    const readStart = writeIndexRef.current
    for (let x = 0; x < WIDTH; x++) {
      const idx = (readStart + x) % WIDTH
      const y = BASELINE_Y - bufferRef.current[idx]
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 0.5
    for (let y = 0; y < HEIGHT; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(WIDTH, y)
      ctx.stroke()
    }

    requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    lastTimeRef.current = performance.now()
    const id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="ecg-canvas"
      aria-label="Real-time ECG trace"
    />
  )
}
```

- [ ] **Step 2: Add ECGTrace to HUD**

```tsx
// Update src/components/ui/HUD.tsx — add ECGTrace to hud-bottom before SimulationControls
import { ECGTrace } from './ECGTrace'

// In the JSX, inside hud-bottom:
<div className="hud-bottom">
  <ECGTrace />
  <SimulationControls />
</div>
```

- [ ] **Step 3: Add ECG styles to App.css**

```css
/* Add to App.css */
.ecg-canvas {
  display: block;
  width: 100%;
  max-width: 600px;
  height: 80px;
  margin: 0 auto 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
```

- [ ] **Step 4: Verify — ECG trace scrolls and shows P-QRS-T waveform in sync with the beat**

```bash
npm run dev
```

Expected: Green ECG trace scrolling at bottom of screen. Visible P wave bump, sharp QRS spike, and broader T wave. Waveform rate changes when BPM slider is adjusted.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ECGTrace.tsx src/components/ui/HUD.tsx src/App.css
git commit -m "feat: add real-time ECG trace synced to cardiac cycle"
```

---

## Task 8: Conduction System Visualization

**Files:**
- Create: `src/shaders/conduction.vert.glsl`
- Create: `src/shaders/conduction.frag.glsl`
- Create: `src/hooks/useConductionWave.ts`
- Create: `src/components/canvas/ConductionSystem.tsx`
- Modify: `src/components/canvas/HeartScene.tsx`

- [ ] **Step 1: Create conduction shaders**

```glsl
// src/shaders/conduction.vert.glsl
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

```glsl
// src/shaders/conduction.frag.glsl
uniform float uWavePosition; // 0.0–1.0 along the pathway
uniform float uTime;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
  // Wave front: bright at uWavePosition, fading trail behind
  float dist = vUv.x - uWavePosition;
  float trailLength = 0.15;

  // Ahead of wave: dim
  float ahead = smoothstep(0.0, 0.02, dist);
  // Behind wave: bright with fading trail
  float behind = smoothstep(-trailLength, 0.0, dist);
  float intensity = behind * (1.0 - ahead);

  // Add subtle pulse
  float pulse = 0.3 + 0.7 * intensity;
  float glow = pulse + sin(uTime * 4.0) * 0.05;

  // Cyan-ish glow for color-blind safety
  vec3 color = uColor * glow;
  float alpha = max(0.1, intensity);

  gl_FragColor = vec4(color, alpha);
}
```

- [ ] **Step 2: Create useConductionWave hook**

```ts
// src/hooks/useConductionWave.ts
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSimStore } from '../store/useSimStore'
import { CONDUCTION_TIMING } from '../data/cardiac-timing'

/**
 * Returns a ref containing the normalized wave position (0.0–1.0)
 * along the conduction pathway based on cycleElapsed.
 */
export function useConductionWave() {
  const wavePositionRef = useRef(0)
  const cycleElapsedRef = useRef(0)

  useRef(
    useSimStore.subscribe(
      (s) => s.cycleElapsed,
      (e) => { cycleElapsedRef.current = e }
    )
  )

  useFrame(() => {
    const elapsed = cycleElapsedRef.current
    const total = CONDUCTION_TIMING.totalDepolarization

    if (elapsed <= total) {
      wavePositionRef.current = elapsed / total
    } else {
      // Wave has completed, hold at end then fade
      wavePositionRef.current = 1.0
    }
  })

  return wavePositionRef
}
```

- [ ] **Step 3: Create ConductionSystem.tsx**

```tsx
// src/components/canvas/ConductionSystem.tsx
import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useConductionWave } from '../../hooks/useConductionWave'
import { useSimStore } from '../../store/useSimStore'
import conductionVert from '../../shaders/conduction.vert.glsl?raw'
import conductionFrag from '../../shaders/conduction.frag.glsl?raw'

const ConductionMaterial = shaderMaterial(
  {
    uWavePosition: 0,
    uTime: 0,
    uColor: new THREE.Color('#00e5ff'),
  },
  conductionVert,
  conductionFrag
)

extend({ ConductionMaterial })

export function ConductionSystem() {
  const materialRef = useRef<any>(null)
  const wavePosition = useConductionWave()
  const visible = useSimStore((s) => s.activeLayers.has('conduction'))

  // Create a tube path representing the conduction system
  const tubeGeometry = useMemo(() => {
    const points = [
      new THREE.Vector3(0.2, 0.6, 0.2),   // SA node
      new THREE.Vector3(0.1, 0.4, 0.2),   // atrial pathway
      new THREE.Vector3(0.05, 0.2, 0.15), // AV node
      new THREE.Vector3(0, 0, 0.1),       // Bundle of His
      new THREE.Vector3(-0.1, -0.3, 0.1), // left bundle branch
      new THREE.Vector3(-0.2, -0.5, 0),   // Purkinje fibers
    ]
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.TubeGeometry(curve, 64, 0.02, 8, false)
  }, [])

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uWavePosition = wavePosition.current
      materialRef.current.uTime = clock.elapsedTime
    }
  })

  if (!visible) return null

  return (
    <mesh geometry={tubeGeometry}>
      {/* @ts-expect-error - custom shaderMaterial */}
      <conductionMaterial
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
```

- [ ] **Step 4: Add ConductionSystem to HeartScene**

```tsx
// Update src/components/canvas/HeartScene.tsx
import { ConductionSystem } from './ConductionSystem'

// Add inside the JSX:
<ConductionSystem />
```

- [ ] **Step 5: Verify — glowing tube appears when conduction layer is active, wave propagates with each beat**

```bash
npm run dev
```

Expected: Cyan glowing tube visible through the heart shape. Bright wavefront travels along it each heartbeat cycle. Toggling "Conduction" layer button hides/shows it.

- [ ] **Step 6: Commit**

```bash
git add src/shaders/ src/hooks/useConductionWave.ts src/components/canvas/ConductionSystem.tsx src/components/canvas/HeartScene.tsx
git commit -m "feat: add conduction system with animated glow wave shader"
```

---

## Task 9: Blood Flow Particles

**Files:**
- Create: `src/data/vessel-paths.ts`
- Create: `src/hooks/useBloodParticles.ts`
- Create: `src/components/canvas/BloodFlow.tsx`
- Modify: `src/components/canvas/HeartScene.tsx`

- [ ] **Step 1: Create vessel-paths.ts — systemic circuit spline data**

```ts
// src/data/vessel-paths.ts
import * as THREE from 'three'

// Simplified systemic circuit: LV → aorta → body → vena cavae → RA
export const SYSTEMIC_PATH_POINTS = [
  new THREE.Vector3(-0.1, -0.2, 0),    // LV outflow
  new THREE.Vector3(0, 0.5, 0),        // ascending aorta
  new THREE.Vector3(0.3, 0.8, 0),      // aortic arch
  new THREE.Vector3(0.6, 0.5, 0.2),    // descending
  new THREE.Vector3(0.5, 0, 0.3),      // body (abstracted)
  new THREE.Vector3(0.4, -0.3, 0.2),   // returning
  new THREE.Vector3(0.3, 0.3, 0.1),    // vena cava
  new THREE.Vector3(0.25, 0.5, 0.15),  // RA inflow
]

export function createSystemicCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(SYSTEMIC_PATH_POINTS, true) // closed loop
}
```

- [ ] **Step 2: Create BloodFlow.tsx — instanced particle system**

```tsx
// src/components/canvas/BloodFlow.tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createSystemicCurve } from '../../data/vessel-paths'
import { useSimStore } from '../../store/useSimStore'

const PARTICLE_COUNT = 1000

export function BloodFlow() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const curve = useMemo(() => createSystemicCurve(), [])

  // Each particle has a position along the curve (0-1) and a random offset
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      t: Math.random(), // position along curve
      speed: 0.3 + Math.random() * 0.4, // speed multiplier
      offset: new THREE.Vector3(
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.03
      ),
    }))
  }, [])

  const phaseRef = useRef('P7')
  useMemo(() => {
    useSimStore.subscribe(
      (s) => s.currentPhase,
      (p) => { phaseRef.current = p }
    )
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    // Speed modulation by phase
    const phase = phaseRef.current
    let speedMod = 1
    if (phase === 'P3') speedMod = 2.5 // rapid ejection
    else if (phase === 'P4') speedMod = 1.5 // reduced ejection
    else if (phase === 'P7') speedMod = 0.3 // diastasis

    const point = new THREE.Vector3()

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i]
      p.t = (p.t + delta * p.speed * speedMod * 0.15) % 1
      curve.getPointAt(p.t, point)
      point.add(p.offset)

      dummy.position.copy(point)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.008, 4, 4]} />
      <meshBasicMaterial color="#ff3333" transparent opacity={0.8} />
    </instancedMesh>
  )
}
```

- [ ] **Step 3: Add BloodFlow to HeartScene**

```tsx
// Update src/components/canvas/HeartScene.tsx
import { BloodFlow } from './BloodFlow'

// Add inside JSX:
<BloodFlow />
```

- [ ] **Step 4: Verify — red particles flow along vessel path, speed changes with cardiac phase**

```bash
npm run dev
```

Expected: Small red particles flowing in a loop around the heart. Particles speed up visibly during rapid ejection (P3), slow down during diastasis (P7). Adjusting BPM slider changes the rhythm of speed bursts.

- [ ] **Step 5: Commit**

```bash
git add src/data/vessel-paths.ts src/hooks/useBloodParticles.ts src/components/canvas/BloodFlow.tsx src/components/canvas/HeartScene.tsx
git commit -m "feat: add instanced blood flow particles on systemic circuit spline"
```

---

## Task 10: Annotations + Click-to-Learn

**Files:**
- Create: `src/data/annotations.ts`
- Create: `src/components/ui/AnnotationCard.tsx`
- Modify: `src/components/canvas/PlaceholderHeart.tsx` (add raycasting)
- Modify: `src/components/ui/HUD.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create annotations.ts**

```ts
// src/data/annotations.ts
import { type Phase } from './cardiac-timing'

export interface Annotation {
  structureId: string
  name: string
  description: string
  failureMode: string
  relatedPhases: Phase[]
}

export const ANNOTATIONS: Record<string, Annotation> = {
  'left-ventricle': {
    structureId: 'left-ventricle',
    name: 'Left Ventricle',
    description: 'The thickest chamber of the heart. Pumps oxygenated blood through the aortic valve into the aorta and out to the entire body. Generates the highest pressure of any chamber.',
    failureMode: 'Left ventricular failure leads to pulmonary edema — fluid backs up into the lungs, causing shortness of breath. This is the most common form of heart failure.',
    relatedPhases: ['P2', 'P3', 'P4'],
  },
  'right-ventricle': {
    structureId: 'right-ventricle',
    name: 'Right Ventricle',
    description: 'Pumps deoxygenated blood through the pulmonary valve to the lungs. Thinner walls than the left ventricle because the lungs require less pressure.',
    failureMode: 'Right ventricular failure causes fluid buildup in the body — swollen ankles, distended abdomen, and jugular vein distension.',
    relatedPhases: ['P2', 'P3', 'P4'],
  },
  'mitral-valve': {
    structureId: 'mitral-valve',
    name: 'Mitral Valve',
    description: 'Two-leaflet valve between the left atrium and left ventricle. Opens during filling to let blood in, closes during contraction to prevent backflow. Its closure produces the first heart sound (S1).',
    failureMode: 'Mitral regurgitation: the valve leaks, allowing blood to flow backward into the left atrium. Causes fatigue, shortness of breath, and can lead to atrial fibrillation.',
    relatedPhases: ['P1', 'P2', 'P6'],
  },
  'tricuspid-valve': {
    structureId: 'tricuspid-valve',
    name: 'Tricuspid Valve',
    description: 'Three-leaflet valve between the right atrium and right ventricle. Works in sync with the mitral valve — opens during filling, closes during contraction.',
    failureMode: 'Tricuspid regurgitation: blood leaks back into the right atrium. Often caused by pulmonary hypertension stretching the valve ring.',
    relatedPhases: ['P1', 'P2', 'P6'],
  },
  'aorta': {
    structureId: 'aorta',
    name: 'Aorta',
    description: 'The largest artery in the body. Receives oxygenated blood from the left ventricle and distributes it to every organ through branching arteries.',
    failureMode: 'Aortic aneurysm: weakened wall balloons outward and can rupture — a life-threatening emergency. Aortic dissection tears the wall layers apart.',
    relatedPhases: ['P3', 'P4'],
  },
}
```

- [ ] **Step 2: Create AnnotationCard.tsx**

```tsx
// src/components/ui/AnnotationCard.tsx
import { useEffect } from 'react'
import { useSimStore } from '../../store/useSimStore'
import { ANNOTATIONS } from '../../data/annotations'
import { PHASE_NAMES } from '../../data/cardiac-timing'

export function AnnotationCard() {
  const selectedStructure = useSimStore((s) => s.selectedStructure)
  const selectStructure = useSimStore((s) => s.selectStructure)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectStructure(null)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectStructure])

  if (!selectedStructure) return null
  const annotation = ANNOTATIONS[selectedStructure]
  if (!annotation) return null

  return (
    <div className="annotation-backdrop" onClick={() => selectStructure(null)}>
      <div
        className="annotation-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Information about ${annotation.name}`}
      >
        <button
          className="annotation-close"
          onClick={() => selectStructure(null)}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="annotation-title">{annotation.name}</h2>
        <p className="annotation-desc">{annotation.description}</p>
        <div className="annotation-failure">
          <h3>When It Fails</h3>
          <p>{annotation.failureMode}</p>
        </div>
        <div className="annotation-phases">
          <h3>Active During</h3>
          <div className="phase-tags">
            {annotation.relatedPhases.map((p) => (
              <span key={p} className="phase-tag">{PHASE_NAMES[p]}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add click handling to PlaceholderHeart meshes**

Add `onClick` handlers to the named meshes in `PlaceholderHeart.tsx`:

```tsx
// Add to each named mesh in PlaceholderHeart.tsx
const selectStructure = useSimStore((s) => s.selectStructure)

// On each <mesh>:
onClick={(e) => {
  e.stopPropagation()
  selectStructure(e.object.name)
}}
style={{ cursor: 'pointer' }}
```

- [ ] **Step 4: Add AnnotationCard to HUD and add styles**

```tsx
// Update HUD.tsx — add AnnotationCard
import { AnnotationCard } from './AnnotationCard'

// Add at the end of the HUD JSX:
<AnnotationCard />
```

Add annotation styles to `App.css`:

```css
/* Annotation card */
.annotation-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  pointer-events: all;
}

.annotation-card {
  background: rgba(15, 15, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 32px;
  max-width: 480px;
  width: 90%;
  position: relative;
  color: rgba(255, 255, 255, 0.9);
}

.annotation-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24px;
  cursor: pointer;
}

.annotation-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 400;
}

.annotation-desc {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.85;
}

.annotation-failure {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.annotation-failure h3,
.annotation-phases h3 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.5;
  margin: 0 0 8px;
}

.annotation-failure p {
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.8;
}

.annotation-phases {
  margin-top: 16px;
}

.phase-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.phase-tag {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

- [ ] **Step 5: Verify — clicking heart structures opens annotation modal, Escape closes it**

```bash
npm run dev
```

Expected: Click on the left ventricle sphere → modal appears with "Left Ventricle" title, description, failure mode, and related phases. Press Escape or click backdrop to close.

- [ ] **Step 6: Commit**

```bash
git add src/data/annotations.ts src/components/ui/AnnotationCard.tsx src/components/canvas/PlaceholderHeart.tsx src/components/ui/HUD.tsx src/App.css
git commit -m "feat: add click-to-learn annotation cards with educational content"
```

---

## Task 11: Post-Processing + Loading Screen + Error Boundary

**Files:**
- Create: `src/components/canvas/PostProcessing.tsx`
- Create: `src/components/ui/LoadingScreen.tsx`
- Create: `src/components/ErrorBoundary.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create PostProcessing.tsx**

```tsx
// src/components/canvas/PostProcessing.tsx
import { EffectComposer, Bloom } from '@react-three/postprocessing'

export function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.025}
        mipmapBlur
      />
    </EffectComposer>
  )
}
```

- [ ] **Step 2: Create LoadingScreen.tsx**

```tsx
// src/components/ui/LoadingScreen.tsx
export function LoadingScreen() {
  return (
    <div className="loading-screen" aria-label="Loading heart model">
      <div className="loading-heart">&#x2665;</div>
      <p className="loading-text">Loading...</p>
    </div>
  )
}
```

- [ ] **Step 3: Create ErrorBoundary.tsx**

```tsx
// src/components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>Something went wrong</h1>
          <p>
            {this.state.error?.message?.includes('WebGL')
              ? "Your browser doesn't support 3D rendering. Try Chrome or Firefox."
              : "Heart model couldn't load. Check your connection."}
          </p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

- [ ] **Step 4: Wire everything into App.tsx**

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { HeartScene } from './components/canvas/HeartScene'
import { PostProcessing } from './components/canvas/PostProcessing'
import { HUD } from './components/ui/HUD'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { ErrorBoundary } from './components/ErrorBoundary'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <ErrorBoundary>
        <Canvas
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, 2]}
          camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 4] }}
        >
          <Suspense fallback={null}>
            <HeartScene />
            <PostProcessing />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      <HUD />
    </div>
  )
}
```

Add loading/error styles to `App.css`:

```css
.loading-screen, .error-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
  color: rgba(255, 255, 255, 0.8);
}

.loading-heart {
  font-size: 48px;
  color: #c84b4b;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 1; }
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.error-screen button {
  margin-top: 20px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
```

- [ ] **Step 5: Add PostProcessing to HeartScene**

Already done in App.tsx (PostProcessing is a sibling of HeartScene inside Canvas).

- [ ] **Step 6: Verify — bloom glow on conduction system, loading screen appears briefly on refresh**

```bash
npm run dev
```

Expected: Conduction tube has a visible glow/bloom effect. Refreshing the page shows the pulsing heart loading screen momentarily. Error boundary catches any crashes gracefully.

- [ ] **Step 7: Commit**

```bash
git add src/components/canvas/PostProcessing.tsx src/components/ui/LoadingScreen.tsx src/components/ErrorBoundary.tsx src/App.tsx src/App.css
git commit -m "feat: add bloom post-processing, loading screen, and error boundary"
```

---

## Task 12: Responsive Layout + Accessibility + Final Polish

**Files:**
- Modify: `src/App.css`
- Modify: `src/components/ui/HUD.tsx`
- Modify: `src/components/canvas/CameraRig.tsx`

- [ ] **Step 1: Add tablet responsive breakpoint**

```css
/* Add to App.css */
@media (max-width: 768px) {
  .hud {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto auto;
    padding: 16px;
  }

  .hud-left {
    grid-column: 1;
    grid-row: 1;
    flex-direction: row;
    align-self: start;
    gap: 6px;
  }

  .hud-right {
    grid-column: 1;
    grid-row: 2;
    flex-direction: row;
    gap: 12px;
  }

  .telemetry-panel {
    min-width: auto;
    padding: 10px;
  }

  .annotation-card {
    padding: 24px;
    max-width: 90%;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .loading-heart {
    animation: none;
  }
}
```

- [ ] **Step 2: Add prefers-reduced-motion handling to CameraRig**

```tsx
// Update src/components/canvas/CameraRig.tsx
import { OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'

export function CameraRig() {
  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={10}
      autoRotate={!prefersReducedMotion}
      autoRotateSpeed={0.5}
    />
  )
}
```

- [ ] **Step 3: Verify responsive layout on narrow viewport and test keyboard navigation**

```bash
npm run dev
```

Expected: At 768px width, HUD rearranges — layers become horizontal row at top, telemetry moves to bottom. All buttons keyboard-focusable. BPM slider works with arrow keys.

- [ ] **Step 4: Commit**

```bash
git add src/App.css src/components/ui/HUD.tsx src/components/canvas/CameraRig.tsx
git commit -m "feat: add responsive layout, reduced motion support, and accessibility"
```

---

## Task 13: Build + Deploy

**Files:**
- Modify: `package.json` (verify scripts)

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: Build completes. Check `dist/` output. JS bundle should be under 300KB gzipped (check with `ls -la dist/assets/`).

- [ ] **Step 2: Preview production build locally**

```bash
npm run preview
```

Expected: Production build runs. All features work: beat animation, BPM slider, layer toggles, ECG trace, conduction wave, blood flow, annotations, bloom.

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 4: Create GitHub repo and push**

```bash
gh repo create lapbrian2/interactive-heart --public --source=. --push
```

- [ ] **Step 5: Deploy to Vercel**

```bash
npx vercel --prod
```

Or connect via Vercel dashboard → Import Git Repository → `lapbrian2/interactive-heart`.

- [ ] **Step 6: Verify production deployment**

Visit the Vercel URL. Confirm the heart loads, beats, and all interactive features work on production.

- [ ] **Step 7: Commit any deployment config changes**

```bash
git add .
git commit -m "chore: production build and deploy configuration"
```

---

## Summary

| Task | What It Delivers |
|------|-----------------|
| 1 | Scaffolded Vite + R3F project |
| 2 | Cardiac timing data layer with BPM scaling (tested) |
| 3 | Zustand store with simulation state (tested) |
| 4 | Master clock hook driving the heartbeat (tested) |
| 5 | Placeholder heart with beat animation + scene |
| 6 | Telemetry HUD, BPM slider, layer controls |
| 7 | Real-time ECG trace |
| 8 | Conduction system with animated glow shader |
| 9 | Blood flow particles on vessel splines |
| 10 | Click-to-learn annotation cards |
| 11 | Bloom post-processing, loading screen, error boundary |
| 12 | Responsive layout + accessibility |
| 13 | Build, test, deploy to Vercel |

**After v1 ships:** Replace `PlaceholderHeart` with real GLTF model (Task 10 in the spec pipeline — model selection, Blender prep, Draco compression, `gltfjsx` generation). The architecture is designed so swapping `PlaceholderHeart` for `HeartModel` is a single-component replacement — everything else (store, hooks, HUD, ECG, conduction, particles) remains unchanged.
