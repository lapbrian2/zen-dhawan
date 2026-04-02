// Ease definitions — called from main.tsx after all plugins are registered
import { CustomEase } from 'gsap/CustomEase'
import { CustomBounce } from 'gsap/CustomBounce'
import { CustomWiggle } from 'gsap/CustomWiggle'

export function registerEases() {
  CustomEase.create('city-drift', 'M0,0 C0.05,0.2 0.12,0.8 0.3,0.9 0.5,0.98 0.7,1 1,1')
  CustomEase.create('card-open', 'M0,0 C0.15,0.85 0.35,1.05 1,1')
  CustomEase.create('street-draw', 'M0,0 C0.25,0.1 0.25,1 1,1')
  CustomEase.create('city-zoom', 'M0,0 C0.22,0.61 0.36,1 1,1')

  CustomBounce.create('building-drop', {
    strength: 0.4,
    squash: 3,
    squashID: 'building-drop-squash',
  })

  CustomWiggle.create('building-sway', { type: 'easeOut', wiggles: 6 })
  CustomWiggle.create('landmark-pulse', { type: 'uniform', wiggles: 3 })
}
