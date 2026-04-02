import { CityCanvas } from './components/CityCanvas'
import { CityTitle } from './components/CityTitle'
import { MapLegend } from './components/MapLegend'
import { MiniMap } from './components/MiniMap'
import { ProjectCard } from './components/ProjectCard'
import { EntranceOverlay } from './components/EntranceOverlay'

export default function App() {
  return (
    <div className="app">
      <CityCanvas />
      <CityTitle />
      <MapLegend />
      <MiniMap />
      <ProjectCard />
      <EntranceOverlay />
    </div>
  )
}
