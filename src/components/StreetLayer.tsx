import { getCityLayout } from '../data/layout'
import { useMapStore } from '../store/useMapStore'

export function StreetLayer() {
  const { streets } = getCityLayout()
  const hoveredStreet = useMapStore(s => s.hoveredStreet)
  const highlightedStreets = useMapStore(s => s.highlightedStreets)
  const setHoveredStreet = useMapStore(s => s.setHoveredStreet)

  return (
    <svg className="svg-layer street-layer">
      {streets.map(street => {
        const key = `${street.from}--${street.to}`
        const isActive = hoveredStreet === key
        const isHighlighted = highlightedStreets.has(key)
        const cls = [
          'street-group',
          isActive && 'street-group--active',
          isHighlighted && 'street-group--highlighted',
        ].filter(Boolean).join(' ')

        return (
          <g key={key} className={cls} data-street={key}>
            <path
              className="street-road"
              d={street.d}
              strokeWidth={street.weight * 6}
            />
            <path
              className="street-center"
              d={street.d}
              strokeWidth={street.weight * 0.8}
            />
            <path
              className="street-hit"
              d={street.d}
              onMouseEnter={() => setHoveredStreet(key)}
              onMouseLeave={() => setHoveredStreet(null)}
            />
            <text
              className="street-label"
              x={street.labelX}
              y={street.labelY}
              textAnchor="middle"
            >
              {street.reason}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
