import { districts } from '../data/districts'

export function DistrictLayer() {
  return (
    <svg className="svg-layer district-layer">
      <defs>
        {districts.map(d => (
          <pattern
            key={`pat-${d.id}`}
            id={`grid-${d.id}`}
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="30" y2="0" stroke="rgba(250,250,249,0.015)" strokeWidth="0.3" />
            <line x1="0" y1="0" x2="0" y2="30" stroke="rgba(250,250,249,0.015)" strokeWidth="0.3" />
          </pattern>
        ))}
      </defs>
      {districts.map(d => (
        <g key={d.id}>
          <ellipse
            className="district-ellipse"
            cx={d.anchor.x}
            cy={d.anchor.y}
            rx={d.radius}
            ry={d.radius * 0.7}
            fill={d.color}
            stroke="rgba(250, 250, 249, 0.025)"
            strokeWidth="0.8"
            strokeDasharray="6 4"
          />
          <ellipse
            cx={d.anchor.x}
            cy={d.anchor.y}
            rx={d.radius}
            ry={d.radius * 0.7}
            fill={`url(#grid-${d.id})`}
          />
          <text
            className="district-label"
            x={d.anchor.x}
            y={d.anchor.y - d.radius * 0.7 + 20}
            textAnchor="middle"
          >
            {d.name}
          </text>
          <text
            className="district-tagline"
            x={d.anchor.x}
            y={d.anchor.y - d.radius * 0.7 + 34}
            textAnchor="middle"
          >
            {d.tagline}
          </text>
        </g>
      ))}
    </svg>
  )
}
