import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useMapStore } from '../store/useMapStore'

const COUNT = 35

export function AmbientParticles() {
  const containerRef = useRef<HTMLDivElement>(null)
  const entranceComplete = useMapStore(s => s.entranceComplete)

  useGSAP(() => {
    if (!containerRef.current || !entranceComplete) return

    const particles = containerRef.current.querySelectorAll('.particle')
    particles.forEach((p) => {
      const startX = gsap.utils.random(0, window.innerWidth)
      const startY = gsap.utils.random(0, window.innerHeight)

      gsap.set(p, { x: startX, y: startY })

      gsap.to(p, {
        duration: gsap.utils.random(12, 25),
        physics2D: {
          velocity: gsap.utils.random(5, 18),
          angle: gsap.utils.random(-120, -60),
          gravity: -1.5,
          friction: 0.015,
        },
        repeat: -1,
        repeatRefresh: true,
      })

      gsap.to(p, {
        opacity: gsap.utils.random(0.04, 0.15),
        duration: gsap.utils.random(2, 5),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: gsap.utils.random(0, 3),
      })
    })
  }, { scope: containerRef, dependencies: [entranceComplete] })

  return (
    <div ref={containerRef} className="ambient-particles">
      {Array.from({ length: COUNT }, (_, i) => (
        <div key={i} className="particle" />
      ))}
    </div>
  )
}
