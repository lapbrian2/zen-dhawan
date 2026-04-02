import type { BuildingType } from '../data/projects'

const icons: Record<BuildingType, React.ReactNode> = {
  tower: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="8" width="16" height="36" fill="currentColor" opacity="0.15" />
      <rect x="16" y="8" width="16" height="36" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <rect x="20" y="14" width="3" height="4" fill="currentColor" opacity="0.3" />
      <rect x="25" y="14" width="3" height="4" fill="currentColor" opacity="0.3" />
      <rect x="20" y="22" width="3" height="4" fill="currentColor" opacity="0.3" />
      <rect x="25" y="22" width="3" height="4" fill="currentColor" opacity="0.3" />
      <rect x="20" y="30" width="3" height="4" fill="currentColor" opacity="0.3" />
      <rect x="25" y="30" width="3" height="4" fill="currentColor" opacity="0.3" />
      <line x1="24" y1="2" x2="24" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  ),
  studio: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="20" width="32" height="24" fill="currentColor" opacity="0.15" />
      <rect x="8" y="20" width="32" height="24" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <polygon points="24,8 42,20 6,20" fill="currentColor" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <rect x="20" y="30" width="8" height="14" fill="currentColor" opacity="0.2" />
    </svg>
  ),
  lab: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="16" width="24" height="28" fill="currentColor" opacity="0.15" />
      <rect x="12" y="16" width="24" height="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="24" cy="28" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="24" cy="28" r="2" fill="currentColor" opacity="0.3" />
      <rect x="20" y="10" width="8" height="6" fill="currentColor" stroke="currentColor" strokeWidth="1" opacity="0.25" />
    </svg>
  ),
  workshop: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="22" width="36" height="22" fill="currentColor" opacity="0.15" />
      <rect x="6" y="22" width="36" height="22" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M6 22 L24 10 L42 22" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1" />
      <rect x="14" y="30" width="8" height="14" fill="currentColor" opacity="0.2" />
      <rect x="28" y="26" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  ),
  warehouse: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="18" width="40" height="26" fill="currentColor" opacity="0.15" />
      <rect x="4" y="18" width="40" height="26" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M4 18 Q24 6 44 18" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <rect x="18" y="30" width="12" height="14" fill="currentColor" opacity="0.2" />
      <line x1="18" y1="37" x2="30" y2="37" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
  ),
}

export function BuildingIcon({ type }: { type: BuildingType }) {
  return <div className="building__icon" style={{ color: '#FAFAF9' }}>{icons[type]}</div>
}
