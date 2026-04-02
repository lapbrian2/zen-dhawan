import { useRef } from 'react'
import { getCityLayout } from '../data/layout'
import { useMapStore } from '../store/useMapStore'

export function StreetLayer() {
  const { streets } = getCityLayout()
  const hoveredStreet = useMapStore(s => s.hoveredStreet)
  const setHoveredStreet = useMapStore(s => s.setHoveredStreet)
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map())

  return (
    <svg className="svg-layer street-layer">
      {streets.map(street => {
        const key = `${street.from}--${street.to}`
        const isActive = hoveredStreet === key
        return (
          <g key={key}>
            <path
              ref={el => { if (el) pathRefs.current.set(key, el) }}
              className={`street ${isActive ? 'street--active' : ''}`}
              d={street.d}
              strokeWidth={street.weight}
              data-street={key}
              onMouseEnter={() => setHoveredStreet(key)}
              onMouseLeave={() => setHoveredStreet(null)}
            />
            <circle
              className="street-dot"
              r="3"
              data-street-dot={key}
            />
            <text
              className="street-label"
              x={street.labelX}
              y={street.labelY}
              textAnchor="middle"
              style={{ opacity: isActive ? 0.7 : 0 }}
            >
              {street.reason}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
