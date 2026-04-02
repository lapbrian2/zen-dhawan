import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { SplitText } from 'gsap/SplitText'
import { useMapStore } from '../store/useMapStore'
import { projects } from '../data/projects'

export function ProjectCard() {
  const selectedId = useMapStore(s => s.selectedProject)
  const selectProject = useMapStore(s => s.selectProject)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  const project = projects.find(p => p.id === selectedId)

  useEffect(() => {
    if (!project || !cardRef.current) return

    const buildingEl = document.querySelector(`[data-flip-id="${project.id}"]`)
    if (!buildingEl) return

    const state = Flip.getState(buildingEl)
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })

    Flip.from(state, {
      targets: cardRef.current,
      duration: 0.6,
      ease: 'card-open',
      scale: true,
      absolute: true,
    })

    if (nameRef.current) {
      const split = SplitText.create(nameRef.current, { type: 'chars' })
      gsap.from(split.chars, {
        y: 30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.02,
        ease: 'power3.out',
        delay: 0.3,
      })
    }

    if (descRef.current) {
      descRef.current.textContent = ''
      gsap.to(descRef.current, {
        delay: 0.5,
        duration: 1.5,
        text: { value: project.description, speed: 1.5 },
        ease: 'none',
      })
    }
  }, [project])

  useEffect(() => {
    if (!selectedId) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectProject(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedId, selectProject])

  if (!project) return null

  return (
    <div
      ref={overlayRef}
      className="project-card-overlay"
      onClick={e => { if (e.target === e.currentTarget) selectProject(null) }}
    >
      <div ref={cardRef} className="project-card" data-flip-id={`card-${project.id}`}>
        <button className="project-card__close" onClick={() => selectProject(null)} aria-label="Close">
          x
        </button>
        <h2 ref={nameRef} className="project-card__name">{project.name}</h2>
        <div className="project-card__district">{project.district.replace('-', ' / ')}</div>
        <p ref={descRef} className="project-card__description">&nbsp;</p>
        <div className="project-card__tech">
          {project.tech.map(t => (
            <span key={t} className="project-card__tech-pill">{t}</span>
          ))}
        </div>
        <div className="project-card__status">{project.status}</div>
        {project.url && (
          <a
            className="project-card__link"
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit project
          </a>
        )}
      </div>
    </div>
  )
}
