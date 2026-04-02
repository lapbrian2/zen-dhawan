import type { DistrictId } from './projects'

export interface District {
  id: DistrictId
  name: string
  tagline: string
  color: string
  anchor: { x: number; y: number }
  radius: number
}

export const districts: District[] = [
  {
    id: 'webgl',
    name: '3D District',
    tagline: 'WebGL & Immersive',
    color: 'rgba(184, 150, 78, 0.04)',
    anchor: { x: 0, y: -80 },
    radius: 220,
  },
  {
    id: 'motion',
    name: 'Motion Quarter',
    tagline: 'Animation & Interaction',
    color: 'rgba(250, 250, 249, 0.03)',
    anchor: { x: 380, y: -160 },
    radius: 180,
  },
  {
    id: 'data-ai',
    name: 'Data Borough',
    tagline: 'AI & Intelligence',
    color: 'rgba(113, 113, 122, 0.04)',
    anchor: { x: -320, y: 200 },
    radius: 200,
  },
  {
    id: 'tools',
    name: 'Tool Works',
    tagline: 'Creative Infrastructure',
    color: 'rgba(184, 150, 78, 0.03)',
    anchor: { x: 240, y: 260 },
    radius: 220,
  },
  {
    id: 'webdev',
    name: 'Web Row',
    tagline: 'Platforms & Products',
    color: 'rgba(250, 250, 249, 0.025)',
    anchor: { x: -180, y: -240 },
    radius: 160,
  },
]
