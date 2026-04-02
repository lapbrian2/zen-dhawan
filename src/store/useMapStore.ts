import { create } from 'zustand'

export type ZoomLevel = 'far' | 'mid' | 'near'

interface MapState {
  panX: number
  panY: number
  zoom: number
  zoomLevel: ZoomLevel
  selectedProject: string | null
  hoveredProject: string | null
  hoveredStreet: string | null
  focusedNode: string | null
  connectedNodes: Set<string>
  highlightedStreets: Set<string>
  activeFilter: string | null
  entranceComplete: boolean
  inputEnabled: boolean

  setPan: (x: number, y: number) => void
  setZoom: (z: number) => void
  selectProject: (id: string | null) => void
  setHoveredProject: (id: string | null) => void
  setHoveredStreet: (id: string | null) => void
  setFocusedNode: (id: string | null, connected: Set<string>, streets: Set<string>) => void
  setActiveFilter: (tech: string | null, projectIds: string[], streetKeys: string[]) => void
  setEntranceComplete: () => void
}

function computeZoomLevel(z: number): ZoomLevel {
  if (z < 0.6) return 'far'
  if (z > 1.4) return 'near'
  return 'mid'
}

export const useMapStore = create<MapState>((set) => ({
  panX: 0,
  panY: 0,
  zoom: 1,
  zoomLevel: 'mid',
  selectedProject: null,
  hoveredProject: null,
  hoveredStreet: null,
  focusedNode: null,
  connectedNodes: new Set(),
  highlightedStreets: new Set(),
  activeFilter: null,
  entranceComplete: false,
  inputEnabled: false,

  setPan: (x, y) => set({ panX: x, panY: y }),
  setZoom: (z) => {
    const clamped = Math.max(0.3, Math.min(2.5, z))
    set({ zoom: clamped, zoomLevel: computeZoomLevel(clamped) })
  },
  selectProject: (id) => set({ selectedProject: id }),
  setHoveredProject: (id) => set({ hoveredProject: id }),
  setHoveredStreet: (id) => set({ hoveredStreet: id }),
  setFocusedNode: (id, connected, streets) => set({
    focusedNode: id,
    connectedNodes: connected,
    highlightedStreets: streets,
  }),
  setActiveFilter: (tech, projectIds, streetKeys) => set({
    activeFilter: tech,
    connectedNodes: new Set(projectIds),
    highlightedStreets: new Set(streetKeys),
  }),
  setEntranceComplete: () => set({ entranceComplete: true, inputEnabled: true }),
}))
