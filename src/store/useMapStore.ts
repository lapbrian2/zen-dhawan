import { create } from 'zustand'

interface MapState {
  panX: number
  panY: number
  zoom: number
  selectedProject: string | null
  hoveredProject: string | null
  hoveredStreet: string | null
  entranceComplete: boolean
  inputEnabled: boolean

  setPan: (x: number, y: number) => void
  setZoom: (z: number) => void
  selectProject: (id: string | null) => void
  setHoveredProject: (id: string | null) => void
  setHoveredStreet: (id: string | null) => void
  setEntranceComplete: () => void
}

export const useMapStore = create<MapState>((set) => ({
  panX: 0,
  panY: 0,
  zoom: 1,
  selectedProject: null,
  hoveredProject: null,
  hoveredStreet: null,
  entranceComplete: false,
  inputEnabled: false,

  setPan: (x, y) => set({ panX: x, panY: y }),
  setZoom: (z) => set({ zoom: Math.max(0.3, Math.min(2.5, z)) }),
  selectProject: (id) => set({ selectedProject: id }),
  setHoveredProject: (id) => set({ hoveredProject: id }),
  setHoveredStreet: (id) => set({ hoveredStreet: id }),
  setEntranceComplete: () => set({ entranceComplete: true, inputEnabled: true }),
}))
