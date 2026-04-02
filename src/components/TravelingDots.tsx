import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { getCityLayout } from '../data/layout'
import { useMapStore } from '../store/useMapStore'

export function TravelingDots() {
  const svgRef = useRef<SVGSVGElement>(null)
  const entranceComplete = useMapStore(s => s.entranceComplete)
  const { streets } = getCityLayout()

  useGSAP(() => {
    if (!svgRef.current || !entranceComplete) return

    const dots = svgRef.current.querySelectorAll('.traveling-dot')
    const paths = svgRef.current.querySelectorAll('.traveling-dot-path')

    dots.forEach((dot, i) => {
      const path = paths[i] as SVGPathElement
      if (!path) return

      gsap.to(dot, {
        motionPath: {
          path: path,
          align: path,
          alignOrigin: [0.5, 0.5],
          autoRotate: false,
        },
        duration: gsap.utils.random(3, 6),
        repeat: -1,
        ease: 'none',
        delay: gsap.utils.random(0, 4),
      })

      gsap.to(dot, {
        opacity: 0.5,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        repeatDelay: gsap.utils.random(1.5, 4),
        ease: 'power2.inOut',
      })
    })
  }, { scope: svgRef, dependencies: [entranceComplete] })

  return (
    <svg ref={svgRef} className="svg-layer traveling-dots-layer">
      {streets.map((street, i) => (
        <g key={`td-${i}`}>
          <path
            className="traveling-dot-path"
            d={street.d}
            fill="none"
            stroke="none"
          />
          <circle className="traveling-dot" r="2" />
        </g>
      ))}
    </svg>
  )
}
