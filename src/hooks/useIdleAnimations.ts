import { useEffect } from 'react'
import gsap from 'gsap'
import { useMapStore } from '../store/useMapStore'

export function useIdleAnimations() {
  const entranceComplete = useMapStore(s => s.entranceComplete)

  useEffect(() => {
    if (!entranceComplete) return

    const buildings = document.querySelectorAll('.building__icon')
    const tweens: gsap.core.Tween[] = []

    buildings.forEach((el, i) => {
      const tween = gsap.to(el, {
        rotation: 0.6,
        duration: gsap.utils.random(4, 7),
        ease: 'building-sway',
        repeat: -1,
        yoyo: true,
        delay: i * 0.5,
        transformOrigin: 'center bottom',
      })
      tweens.push(tween)
    })

    const landmarkRings = document.querySelectorAll('.landmark__ring')
    landmarkRings.forEach((ring, i) => {
      const tween = gsap.to(ring, {
        scale: 1.3,
        opacity: 0.05,
        duration: 2.5,
        ease: 'landmark-pulse',
        repeat: -1,
        yoyo: true,
        delay: i * 0.8,
        transformOrigin: 'center center',
      })
      tweens.push(tween)
    })

    return () => {
      tweens.forEach(t => t.kill())
    }
  }, [entranceComplete])
}
