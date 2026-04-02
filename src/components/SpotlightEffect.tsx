import { useMapStore } from '../store/useMapStore'
import { getCityLayout } from '../data/layout'

export function SpotlightEffect() {
  const focusedNode = useMapStore(s => s.focusedNode)
  const panX = useMapStore(s => s.panX)
  const panY = useMapStore(s => s.panY)
  const zoom = useMapStore(s => s.zoom)

  if (!focusedNode) return null

  const { projects } = getCityLayout()
  const project = projects.find(p => p.id === focusedNode)
  if (!project) return null

  const screenX = (project.x * zoom) + panX + window.innerWidth / 2
  const screenY = (project.y * zoom) + panY + window.innerHeight / 2

  return (
    <div
      className="spotlight spotlight--active"
      style={{
        background: `radial-gradient(ellipse 400px 400px at ${screenX}px ${screenY}px, transparent 20%, rgba(9, 9, 11, 0.5) 100%)`,
      }}
    />
  )
}
