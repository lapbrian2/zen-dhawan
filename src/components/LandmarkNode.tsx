import type { PositionedLandmark } from '../data/layout'
import { useMapStore } from '../store/useMapStore'
import { landmarks } from '../data/landmarks'
import { findProjectsByTech } from '../utils/pathfinding'
import { connections } from '../data/connections'

function getStreetsForProjects(projectIds: string[]): string[] {
  const set = new Set(projectIds)
  return connections
    .filter(c => set.has(c.from) && set.has(c.to))
    .map(c => `${c.from}--${c.to}`)
}

export function LandmarkNode({ landmark }: { landmark: PositionedLandmark }) {
  const activeFilter = useMapStore(s => s.activeFilter)
  const setActiveFilter = useMapStore(s => s.setActiveFilter)
  const isActive = activeFilter === landmark.name

  const handleClick = () => {
    if (isActive) {
      setActiveFilter(null, [], [])
      return
    }
    const projectIds = findProjectsByTech(landmark.name, landmarks)
    const streetKeys = getStreetsForProjects(projectIds)
    setActiveFilter(landmark.name, projectIds, streetKeys)
  }

  return (
    <div
      className={`landmark ${isActive ? 'landmark--active' : ''}`}
      style={{ left: landmark.x, top: landmark.y }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Filter by ${landmark.name}`}
      onKeyDown={e => { if (e.key === 'Enter') handleClick() }}
    >
      <div className="landmark__marker">
        <div className="landmark__ring" />
      </div>
      <div className="landmark__label">{landmark.name}</div>
    </div>
  )
}
