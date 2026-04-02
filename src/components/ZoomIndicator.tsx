import { useEffect, useRef, useState } from 'react'
import { useMapStore } from '../store/useMapStore'

export function ZoomIndicator() {
  const zoom = useMapStore(s => s.zoom)
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    setVisible(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(false), 1200)
  }, [zoom])

  return (
    <div className={`zoom-indicator ${visible ? 'zoom-indicator--visible' : ''}`}>
      {Math.round(zoom * 100)}%
    </div>
  )
}
