import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useMapStore } from '../store/useMapStore'

export function EntranceOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const setEntranceComplete = useMapStore(s => s.setEntranceComplete)
  const [unmounted, setUnmounted] = useState(false)

  useGSAP(() => {
    if (!overlayRef.current) return

    gsap.set('.city-title__name', { opacity: 0, y: 12 })
    gsap.set('.city-title__sub', { opacity: 0, y: 8 })
    gsap.set('.building', { opacity: 0, y: 20 })
    gsap.set('.landmark', { opacity: 0, scale: 0 })
    gsap.set('.map-legend', { opacity: 0, x: -20 })
    gsap.set('.minimap', { opacity: 0, x: 20 })
    gsap.set('.street', { drawSVG: '50% 50%' })

    const tl = gsap.timeline({
      delay: 0.3,
      onComplete: () => {
        setEntranceComplete()
        setUnmounted(true)
      },
    })

    tl.to('.city-title__name', {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
    }, 0)

    tl.to('.city-title__sub', {
      opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
    }, 0.3)

    tl.to('.street', {
      drawSVG: '0% 100%',
      duration: 1.2,
      stagger: 0.08,
      ease: 'power2.inOut',
    }, 0.4)

    tl.to('.building', {
      opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out',
    }, 1.0)

    tl.to('.landmark', {
      opacity: 1, scale: 1, duration: 0.4, stagger: 0.04, ease: 'back.out(1.7)',
    }, 1.4)

    tl.to('.map-legend', {
      opacity: 1, x: 0, duration: 0.5, ease: 'power2.out',
    }, 1.6)

    tl.to('.minimap', {
      opacity: 1, x: 0, duration: 0.5, ease: 'power2.out',
    }, 1.6)

    tl.to(overlayRef.current, {
      opacity: 0, duration: 0.4, ease: 'power2.in',
    }, 2.0)
  })

  if (unmounted) return null

  return <div ref={overlayRef} className="entrance-overlay" />
}
