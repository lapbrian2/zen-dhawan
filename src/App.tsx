import { CityCanvas } from './components/CityCanvas'
import { CityTitle } from './components/CityTitle'
import { MapLegend } from './components/MapLegend'
import { MiniMap } from './components/MiniMap'
import { ProjectCard } from './components/ProjectCard'
import { EntranceOverlay } from './components/EntranceOverlay'
import { AmbientParticles } from './components/AmbientParticles'
import { SpotlightEffect } from './components/SpotlightEffect'
import { ZoomIndicator } from './components/ZoomIndicator'
import { useIdleAnimations } from './hooks/useIdleAnimations'

export default function App() {
  useIdleAnimations()

  return (
    <div className="app">
      <CityCanvas />
      <AmbientParticles />
      <SpotlightEffect />
      <CityTitle />
      <MapLegend />
      <MiniMap />
      <ZoomIndicator />
      <ProjectCard />
      <EntranceOverlay />
    </div>
  )
}
