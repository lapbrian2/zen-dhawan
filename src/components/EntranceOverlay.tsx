import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useMapStore } from '../store/useMapStore'

export function EntranceOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const setEntranceComplete = useMapStore(s => s.setEntranceComplete)
  const [unmounted, setUnmounted] = useState(false)

  useGSAP(() => {
    if (!overlayRef.current) return

    gsap.set('.city-title__name', { opacity: 0 })
    gsap.set('.city-title__sub', { opacity: 0 })
    gsap.set('.building', { opacity: 0, y: -40 })
    gsap.set('.landmark', { opacity: 0, scale: 0 })
    gsap.set('.map-legend', { opacity: 0, x: -20 })
    gsap.set('.minimap', { opacity: 0, x: 20 })
    gsap.set('.city-grid', { opacity: 0 })
    gsap.set('.district-ellipse', { scale: 0, transformOrigin: 'center center' })
    gsap.set('.street-road, .street-center', { drawSVG: '50% 50%' })

    const tl = gsap.timeline({
      delay: 0.4,
      onComplete: () => {
        setEntranceComplete()
        setTimeout(() => setUnmounted(true), 100)
      },
    })

    const titleEl = document.querySelector('.city-title__name')
    if (titleEl) {
      gsap.set(titleEl, { opacity: 1 })
      const titleSplit = SplitText.create(titleEl, { type: 'chars' })
      tl.from(titleSplit.chars, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.03,
        ease: 'power3.out',
      }, 0)
    }

    tl.to('.city-title__sub', {
      opacity: 1,
      duration: 0.6,
      scrambleText: { text: 'PROJECT CARTOGRAPHY', chars: 'upperCase', speed: 0.5 },
    }, 0.8)

    tl.to('.city-grid', {
      opacity: 0.8,
      duration: 1,
      ease: 'power2.out',
    }, 1.2)

    tl.to('.district-ellipse', {
      scale: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
    }, 1.4)

    tl.to('.street-road, .street-center', {
      drawSVG: '0% 100%',
      duration: 1.4,
      stagger: 0.06,
      ease: 'street-draw',
    }, 1.8)

    tl.to('.building', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: 'building-drop',
    }, 2.6)

    tl.to('.landmark', {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      stagger: 0.04,
      ease: 'back.out(1.7)',
    }, 3.2)

    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
    }, 3.8)

    tl.to('.map-legend', {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: 'power2.out',
    }, 4.0)

    tl.to('.minimap', {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: 'power2.out',
    }, 4.0)
  })

  if (unmounted) return null

  return <div ref={overlayRef} className="entrance-overlay" />
}
