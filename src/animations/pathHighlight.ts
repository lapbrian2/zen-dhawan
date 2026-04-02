import gsap from 'gsap'

const activeHighlights: SVGPathElement[] = []

export function animatePathHighlight(streetKey: string, container: SVGElement) {
  const roadEl = container.querySelector(`[data-street="${streetKey}"] .street-center`) as SVGPathElement
  if (!roadEl) return

  const clone = roadEl.cloneNode(true) as SVGPathElement
  clone.classList.add('path-highlight-clone')
  clone.style.stroke = '#B8964E'
  clone.style.strokeOpacity = '0.6'
  clone.style.strokeDasharray = 'none'
  clone.style.strokeWidth = '2'
  clone.style.pointerEvents = 'none'
  roadEl.parentElement?.appendChild(clone)
  activeHighlights.push(clone)

  gsap.fromTo(clone,
    { drawSVG: '0% 0%' },
    { drawSVG: '0% 100%', duration: 0.8, ease: 'street-draw' },
  )
}

export function clearPathHighlights() {
  activeHighlights.forEach(el => {
    gsap.to(el, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => el.remove(),
    })
  })
  activeHighlights.length = 0
}
