import { districts } from '../data/districts'

export function MapLegend() {
  return (
    <div className="map-legend">
      {districts.map(d => (
        <div key={d.id} className="map-legend__item">
          <div className="map-legend__swatch" style={{ background: d.color.replace(/[\d.]+\)$/, '0.4)') }} />
          <span className="map-legend__label">{d.name}</span>
        </div>
      ))}
    </div>
  )
}
