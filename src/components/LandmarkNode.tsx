import type { PositionedLandmark } from '../data/layout'

export function LandmarkNode({ landmark }: { landmark: PositionedLandmark }) {
  return (
    <div
      className="landmark"
      style={{ left: landmark.x, top: landmark.y }}
    >
      <div className="landmark__marker" />
      <div className="landmark__label">{landmark.name}</div>
    </div>
  )
}
