import { useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { Observer } from 'gsap/Observer'
import { getCityLayout } from '../data/layout'
import { useMapStore } from '../store/useMapStore'
import { CityGrid } from './CityGrid'
import { DistrictLayer } from './DistrictLayer'
import { StreetLayer } from './StreetLayer'
import { TravelingDots } from './TravelingDots'
import { BuildingNode } from './BuildingNode'
import { LandmarkNode } from './LandmarkNode'

export function CityCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const { projects, landmarks } = getCityLayout()
  const setPan = useMapStore(s => s.setPan)
  const setZoom = useMapStore(s => s.setZoom)
  const zoomLevel = useMapStore(s => s.zoomLevel)
  const inputEnabled = useMapStore(s => s.inputEnabled)
  const zoomRef = useRef(1)

  useGSAP(() => {
    if (!canvasRef.current || !worldRef.current) return

    const world = worldRef.current

    const updateTransform = () => {
      const z = zoomRef.current
      const x = gsap.getProperty(world, 'x') as number
      const y = gsap.getProperty(world, 'y') as number
      world.style.transform = `translate(${x}px, ${y}px) scale(${z})`
      setPan(x, y)
    }

    Draggable.create(world, {
      type: 'x,y',
      inertia: true,
      cursor: 'grab',
      activeCursor: 'grabbing',
      dragResistance: 0,
      onDrag: updateTransform,
      onThrowUpdate: updateTransform,
      zIndexBoost: false,
    })

    Observer.create({
      target: canvasRef.current,
      type: 'wheel,pinch',
      onChangeY: (self) => {
        const delta = -self.deltaY * 0.001
        const newZoom = Math.max(0.3, Math.min(2.5, zoomRef.current + delta))
        zoomRef.current = newZoom
        setZoom(newZoom)
        gsap.to(world, {
          scale: newZoom,
          duration: 0.35,
          ease: 'city-zoom',
          overwrite: true,
          onUpdate: updateTransform,
        })
      },
    })
  }, { scope: canvasRef, dependencies: [inputEnabled] })

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.pointerEvents = inputEnabled ? 'auto' : 'none'
    }
  }, [inputEnabled])

  useEffect(() => {
    if (planeRef.current) {
      planeRef.current.setAttribute('data-zoom', zoomLevel)
    }
  }, [zoomLevel])

  return (
    <div ref={canvasRef} className="city-canvas">
      <div ref={worldRef} className="city-world">
        <div ref={planeRef} className="city-plane" data-zoom={zoomLevel}>
          <div className="layer--bg">
            <CityGrid />
            <DistrictLayer />
          </div>
          <div className="layer--mid">
            <StreetLayer />
            <TravelingDots />
          </div>
          <div className="layer--fg">
            {projects.map(p => (
              <BuildingNode key={p.id} project={p} />
            ))}
            {landmarks.map(lm => (
              <LandmarkNode key={lm.id} landmark={lm} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
