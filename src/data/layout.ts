import { projects, type Project } from './projects'
import { districts } from './districts'
import { landmarks } from './landmarks'
import { connections } from './connections'

export interface PositionedProject extends Project {
  x: number
  y: number
}

export interface PositionedLandmark {
  id: string
  name: string
  x: number
  y: number
  relatedProjects: string[]
}

export interface StreetPath {
  from: string
  to: string
  reason: string
  weight: 1 | 2 | 3
  d: string
  labelX: number
  labelY: number
}

function getProjectPositions(): PositionedProject[] {
  const districtGroups = new Map<string, Project[]>()
  for (const p of projects) {
    const group = districtGroups.get(p.district) ?? []
    group.push(p)
    districtGroups.set(p.district, group)
  }

  const positioned: PositionedProject[] = []

  for (const district of districts) {
    const group = districtGroups.get(district.id) ?? []
    const count = group.length
    const spreadRadius = Math.min(district.radius * 0.55, 120)

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2
      const r = count === 1 ? 0 : spreadRadius
      positioned.push({
        ...group[i],
        x: district.anchor.x + Math.cos(angle) * r,
        y: district.anchor.y + Math.sin(angle) * r,
      })
    }
  }

  return positioned
}

function getLandmarkPositions(positionedProjects: PositionedProject[]): PositionedLandmark[] {
  return landmarks.map(lm => {
    const related = positionedProjects.filter(p => lm.relatedProjects.includes(p.id))
    if (related.length === 0) return { ...lm, x: 0, y: 0 }
    const cx = related.reduce((s, p) => s + p.x, 0) / related.length
    const cy = related.reduce((s, p) => s + p.y, 0) / related.length
    return { ...lm, x: cx, y: cy + 50 }
  })
}

function buildStreetPaths(positionedProjects: PositionedProject[]): StreetPath[] {
  const projectMap = new Map(positionedProjects.map(p => [p.id, p]))

  return connections.map((conn, i) => {
    const from = projectMap.get(conn.from)
    const to = projectMap.get(conn.to)
    if (!from || !to) return null!

    const mx = (from.x + to.x) / 2
    const my = (from.y + to.y) / 2
    const dx = to.x - from.x
    const dy = to.y - from.y
    const len = Math.sqrt(dx * dx + dy * dy)
    const nx = -dy / len
    const ny = dx / len
    const offset = (i % 2 === 0 ? 1 : -1) * Math.min(len * 0.25, 60)
    const cx = mx + nx * offset
    const cy = my + ny * offset

    return {
      from: conn.from,
      to: conn.to,
      reason: conn.reason,
      weight: conn.weight,
      d: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`,
      labelX: cx,
      labelY: cy - 10,
    }
  }).filter(Boolean)
}

let _cache: {
  projects: PositionedProject[]
  landmarks: PositionedLandmark[]
  streets: StreetPath[]
} | null = null

export function getCityLayout() {
  if (_cache) return _cache
  const positionedProjects = getProjectPositions()
  _cache = {
    projects: positionedProjects,
    landmarks: getLandmarkPositions(positionedProjects),
    streets: buildStreetPaths(positionedProjects),
  }
  return _cache
}
