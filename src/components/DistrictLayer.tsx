import { districts } from '../data/districts'

export function DistrictLayer() {
  return (
    <svg className="svg-layer district-layer">
      {districts.map(d => (
        <g key={d.id}>
          <ellipse
            cx={d.anchor.x}
            cy={d.anchor.y}
            rx={d.radius}
            ry={d.radius * 0.75}
            fill={d.color}
            stroke="rgba(250, 250, 249, 0.03)"
            strokeWidth="1"
          />
          <text
            className="district-label"
            x={d.anchor.x}
            y={d.anchor.y - d.radius * 0.75 + 16}
            textAnchor="middle"
          >
            {d.name}
          </text>
        </g>
      ))}
    </svg>
  )
}
