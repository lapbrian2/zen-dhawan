import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { PositionedProject } from '../data/layout'
import { useMapStore } from '../store/useMapStore'
import { BuildingIcon } from './BuildingIcon'
import { findDirectConnections, getStreetKey } from '../utils/pathfinding'

interface Props {
  project: PositionedProject
}

export function BuildingNode({ project }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)
  const selectProject = useMapStore(s => s.selectProject)
  const setHoveredProject = useMapStore(s => s.setHoveredProject)
  const focusedNode = useMapStore(s => s.focusedNode)
  const connectedNodes = useMapStore(s => s.connectedNodes)
  const activeFilter = useMapStore(s => s.activeFilter)
  const setFocusedNode = useMapStore(s => s.setFocusedNode)

  const isDimmed = (focusedNode && !connectedNodes.has(project.id)) ||
    (activeFilter && !connectedNodes.has(project.id))
  const isFocused = focusedNode === project.id

  useGSAP(() => {
    if (!ref.current || !nameRef.current) return
    const el = ref.current
    const nameEl = nameRef.current

    el.addEventListener('mouseenter', () => {
      setHoveredProject(project.id)
      gsap.to(nameEl, {
        duration: 0.4,
        scrambleText: { text: project.shortName, chars: 'upperCase', speed: 0.4 },
      })
      const direct = findDirectConnections(project.id)
      const streetKeys = direct.map(d => getStreetKey(project.id, d))
      setFocusedNode(project.id, new Set([project.id, ...direct]), new Set(streetKeys))
    })

    el.addEventListener('mouseleave', () => {
      setHoveredProject(null)
      if (!activeFilter) {
        setFocusedNode(null, new Set(), new Set())
      }
    })
  }, { scope: ref })

  const statusClass = `building__status building__status--${project.status}`
  const cls = [
    'building',
    isDimmed && 'building--dimmed',
    isFocused && 'building--focused',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={ref}
      className={cls}
      style={{ left: project.x, top: project.y }}
      data-flip-id={project.id}
      onClick={() => selectProject(project.id)}
      role="button"
      tabIndex={0}
      aria-label={`${project.name} — ${project.status}`}
      onKeyDown={e => { if (e.key === 'Enter') selectProject(project.id) }}
    >
      <div className={statusClass} />
      <BuildingIcon type={project.buildingType} />
      <div ref={nameRef} className="building__name">{project.shortName}</div>
    </div>
  )
}
