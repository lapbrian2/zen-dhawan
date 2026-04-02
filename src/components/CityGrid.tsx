const GRID_SIZE = 1600
const HALF = GRID_SIZE / 2
const MAJOR = 200
const MINOR = 50

export function CityGrid() {
  const majorLines: React.ReactNode[] = []
  const minorLines: React.ReactNode[] = []
  const intersections: React.ReactNode[] = []

  for (let i = -HALF; i <= HALF; i += MINOR) {
    const isMajor = i % MAJOR === 0
    const arr = isMajor ? majorLines : minorLines
    arr.push(
      <line key={`h${i}`} x1={-HALF} y1={i} x2={HALF} y2={i} />,
      <line key={`v${i}`} x1={i} y1={-HALF} x2={i} y2={HALF} />,
    )
    if (isMajor) {
      for (let j = -HALF; j <= HALF; j += MAJOR) {
        intersections.push(
          <g key={`ix${i}_${j}`} className="grid-intersection">
            <line x1={i - 4} y1={j} x2={i + 4} y2={j} />
            <line x1={i} y1={j - 4} x2={i} y2={j + 4} />
          </g>,
        )
      }
    }
  }

  return (
    <svg className="svg-layer city-grid" style={{ opacity: 0.8 }}>
      <g className="grid-minor">{minorLines}</g>
      <g className="grid-major">{majorLines}</g>
      {intersections}
    </svg>
  )
}
