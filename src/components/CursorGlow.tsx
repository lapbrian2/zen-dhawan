import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export function CursorGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -200, y: -200 })
  const trail = useRef<{ x: number; y: number; age: number }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    resize()
    window.addEventListener('resize', resize)

    const smoothMouse = { x: -200, y: -200 }

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }
    window.addEventListener('mousemove', onMove)

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      smoothMouse.x += (mouse.current.x - smoothMouse.x) * 0.15
      smoothMouse.y += (mouse.current.y - smoothMouse.y) * 0.15

      trail.current.push({ x: smoothMouse.x, y: smoothMouse.y, age: 0 })
      if (trail.current.length > 25) trail.current.shift()

      for (let i = 0; i < trail.current.length; i++) {
        const pt = trail.current[i]
        pt.age += 0.02
        const life = 1 - pt.age
        if (life <= 0) continue

        const size = 60 + (1 - life) * 40

        const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, size)
        const alpha = life * 0.12

        grad.addColorStop(0, `rgba(184, 150, 78, ${alpha * 0.6})`)
        grad.addColorStop(0.3, `rgba(140, 110, 70, ${alpha * 0.4})`)
        grad.addColorStop(0.6, `rgba(90, 80, 100, ${alpha * 0.2})`)
        grad.addColorStop(1, 'rgba(9, 9, 11, 0)')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      trail.current = trail.current.filter(pt => pt.age < 1)

      const mainSize = 80
      const mainGrad = ctx.createRadialGradient(
        smoothMouse.x, smoothMouse.y, 0,
        smoothMouse.x, smoothMouse.y, mainSize,
      )
      mainGrad.addColorStop(0, 'rgba(184, 150, 78, 0.08)')
      mainGrad.addColorStop(0.2, 'rgba(160, 130, 80, 0.05)')
      mainGrad.addColorStop(0.5, 'rgba(113, 113, 122, 0.03)')
      mainGrad.addColorStop(1, 'rgba(9, 9, 11, 0)')

      ctx.fillStyle = mainGrad
      ctx.beginPath()
      ctx.arc(smoothMouse.x, smoothMouse.y, mainSize, 0, Math.PI * 2)
      ctx.fill()

      raf = requestAnimationFrame(render)
    }

    gsap.delayedCall(0.1, () => { raf = requestAnimationFrame(render) })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="cursor-glow"
    />
  )
}
