import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { PositionedProject } from '../data/layout'
import { useMapStore } from '../store/useMapStore'
import { BuildingIcon } from './BuildingIcon'

interface Props {
  project: PositionedProject
}

export function BuildingNode({ project }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)
  const selectProject = useMapStore(s => s.selectProject)
  const setHoveredProject = useMapStore(s => s.setHoveredProject)

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
    })

    el.addEventListener('mouseleave', () => {
      setHoveredProject(null)
    })
  }, { scope: ref })

  const statusClass = `building__status building__status--${project.status}`

  return (
    <div
      ref={ref}
      className="building"
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
