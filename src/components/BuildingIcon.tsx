import type { BuildingType } from '../data/projects'

const icons: Record<BuildingType, React.ReactNode> = {
  tower: (
    <svg viewBox="0 0 48 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="8" width="24" height="60" fill="currentColor" opacity="0.12" />
      <rect x="12" y="8" width="24" height="60" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <rect x="16" y="4" width="16" height="8" fill="currentColor" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      <line x1="24" y1="0" x2="24" y2="4" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="22" y1="2" x2="26" y2="2" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      {[14, 22, 30, 38, 46, 54].map(y => (
        <g key={y}>
          <rect x="16" y={y} width="3" height="4" fill="currentColor" opacity="0.2" />
          <rect x="22" y={y} width="3" height="4" fill="currentColor" opacity="0.2" />
          <rect x="29" y={y} width="3" height="4" fill="currentColor" opacity="0.2" />
        </g>
      ))}
      <rect x="20" y="60" width="8" height="8" fill="currentColor" opacity="0.25" />
    </svg>
  ),
  studio: (
    <svg viewBox="0 0 48 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="32" width="36" height="36" fill="currentColor" opacity="0.12" />
      <rect x="6" y="32" width="36" height="36" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <polygon points="24,12 44,32 4,32" fill="currentColor" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <rect x="12" y="42" width="6" height="8" fill="currentColor" opacity="0.2" />
      <rect x="30" y="42" width="6" height="8" fill="currentColor" opacity="0.2" />
      <rect x="12" y="54" width="6" height="8" fill="currentColor" opacity="0.2" />
      <rect x="30" y="54" width="6" height="8" fill="currentColor" opacity="0.2" />
      <rect x="19" y="54" width="10" height="14" fill="currentColor" opacity="0.2" />
      <line x1="24" y1="8" x2="24" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
    </svg>
  ),
  lab: (
    <svg viewBox="0 0 48 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="18" width="32" height="50" fill="currentColor" opacity="0.12" />
      <rect x="8" y="18" width="32" height="50" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <rect x="16" y="8" width="16" height="14" fill="currentColor" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      <circle cx="24" cy="38" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
      <circle cx="24" cy="38" r="3" fill="currentColor" opacity="0.25" />
      <circle cx="24" cy="38" r="1" fill="currentColor" opacity="0.5" />
      {[50, 56].map(y => (
        <g key={y}>
          <rect x="12" y={y} width="4" height="3" fill="currentColor" opacity="0.15" />
          <rect x="22" y={y} width="4" height="3" fill="currentColor" opacity="0.15" />
          <rect x="32" y={y} width="4" height="3" fill="currentColor" opacity="0.15" />
        </g>
      ))}
      <rect x="20" y="60" width="8" height="8" fill="currentColor" opacity="0.2" />
    </svg>
  ),
  workshop: (
    <svg viewBox="0 0 56 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="28" width="48" height="40" fill="currentColor" opacity="0.12" />
      <rect x="4" y="28" width="48" height="40" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <path d="M4 28 L16 16 L28 28 L40 16 L52 28" fill="currentColor" stroke="currentColor" strokeWidth="0.8" opacity="0.18" />
      <rect x="12" y="36" width="10" height="12" fill="currentColor" opacity="0.15" />
      <rect x="34" y="36" width="10" height="8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <rect x="18" y="54" width="20" height="14" fill="currentColor" opacity="0.2" />
      <line x1="28" y1="54" x2="28" y2="68" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
    </svg>
  ),
  warehouse: (
    <svg viewBox="0 0 56 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="30" width="52" height="38" fill="currentColor" opacity="0.12" />
      <rect x="2" y="30" width="52" height="38" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <path d="M2 30 Q28 14 54 30" fill="currentColor" stroke="currentColor" strokeWidth="0.8" opacity="0.18" />
      <rect x="20" y="48" width="16" height="20" fill="currentColor" opacity="0.2" />
      <line x1="28" y1="48" x2="28" y2="68" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
      <line x1="20" y1="58" x2="36" y2="58" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
      {[8, 42].map(x => (
        <rect key={x} x={x} y="36" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      ))}
    </svg>
  ),
}

export function BuildingIcon({ type }: { type: BuildingType }) {
  return <div className="building__icon" style={{ color: '#FAFAF9' }}>{icons[type]}</div>
}
