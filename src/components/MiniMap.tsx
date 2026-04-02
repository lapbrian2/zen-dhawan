import { getCityLayout } from '../data/layout'
import { useMapStore } from '../store/useMapStore'
import { districts } from '../data/districts'

const MINI_W = 160
const MINI_H = 120
const WORLD_W = 1600
const WORLD_H = 1200

function toMini(x: number, y: number) {
  return {
    x: ((x + WORLD_W / 2) / WORLD_W) * MINI_W,
    y: ((y + WORLD_H / 2) / WORLD_H) * MINI_H,
  }
}

export function MiniMap() {
  const { projects } = getCityLayout()
  const panX = useMapStore(s => s.panX)
  const panY = useMapStore(s => s.panY)
  const zoom = useMapStore(s => s.zoom)

  const vpW = (window.innerWidth / zoom / WORLD_W) * MINI_W
  const vpH = (window.innerHeight / zoom / WORLD_H) * MINI_H
  const vpX = MINI_W / 2 - (panX / zoom / WORLD_W) * MINI_W - vpW / 2
  const vpY = MINI_H / 2 - (panY / zoom / WORLD_H) * MINI_H - vpH / 2

  const districtColorMap = new Map(districts.map(d => [d.id, d.color]))

  return (
    <div className="minimap">
      {projects.map(p => {
        const pos = toMini(p.x, p.y)
        const color = districtColorMap.get(p.district)?.replace(/[\d.]+\)$/, '0.6)') ?? 'rgba(250,250,249,0.3)'
        return (
          <div
            key={p.id}
            className="minimap__dot"
            style={{ left: pos.x, top: pos.y, background: color }}
          />
        )
      })}
      <div
        className="minimap__viewport"
        style={{ left: vpX, top: vpY, width: vpW, height: vpH }}
      />
    </div>
  )
}
