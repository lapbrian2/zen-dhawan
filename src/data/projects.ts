export type DistrictId = 'webgl' | 'motion' | 'data-ai' | 'tools' | 'webdev'
export type ProjectStatus = 'live' | 'active' | 'shipped' | 'private'
export type BuildingType = 'tower' | 'studio' | 'lab' | 'workshop' | 'warehouse'

export interface Project {
  id: string
  name: string
  shortName: string
  district: DistrictId
  tech: string[]
  status: ProjectStatus
  description: string
  url?: string
  buildingType: BuildingType
}

export const projects: Project[] = [
  {
    id: 'interactive-heart',
    name: 'Interactive Heart',
    shortName: 'Heart',
    district: 'webgl',
    tech: ['React Three Fiber', 'Three.js', 'Zustand', 'GLSL'],
    status: 'live',
    description: 'Anatomically accurate 3D human heart with real-time cardiac cycle simulation, 7-phase timing engine, conduction wave visualization, and educational annotations.',
    url: 'https://interactive-heart.vercel.app',
    buildingType: 'tower',
  },
  {
    id: 'bomb-the-web',
    name: 'Bomb the Web',
    shortName: 'BTW',
    district: 'webgl',
    tech: ['Three.js', 'GSAP', 'Web Audio', 'Canvas 2D'],
    status: 'live',
    description: 'Graffiti-inspired creative portfolio. Single-file architecture, toon-shaded 3D scene, scroll-driven animations, and hidden Easter eggs.',
    url: 'https://brian-lapinski-portfolio.vercel.app',
    buildingType: 'warehouse',
  },
  {
    id: 'style-dna',
    name: 'Style DNA Extractor',
    shortName: 'Style DNA',
    district: 'tools',
    tech: ['Nuxt 4', 'Claude API', 'Supabase', 'Stripe'],
    status: 'live',
    description: 'AI-powered visual style extraction. Analyzes any image and produces reproducible style parameters for generative art pipelines.',
    url: 'https://styledna.app',
    buildingType: 'lab',
  },
  {
    id: 'moholy-js',
    name: 'moholy.js',
    shortName: 'moholy',
    district: 'tools',
    tech: ['Canvas 2D', 'TypeScript', 'Algorithms'],
    status: 'shipped',
    description: 'Algorithmic art library inspired by Moholy-Nagy. Generates geometric compositions from seed parameters with an interactive playground.',
    buildingType: 'studio',
  },
  {
    id: 'ml-systems',
    name: 'ML Systems Universe',
    shortName: 'ML Sys',
    district: 'data-ai',
    tech: ['Visualization', 'D3', 'Machine Learning'],
    status: 'live',
    description: 'Interactive visualization mapping the machine learning ecosystem — algorithms, frameworks, and their relationships.',
    url: 'https://ml-systems-universe.vercel.app',
    buildingType: 'tower',
  },
  {
    id: 'research-radar',
    name: 'Research Radar',
    shortName: 'Radar',
    district: 'data-ai',
    tech: ['Node.js', 'Notion API', 'GitHub API'],
    status: 'active',
    description: 'Automated frontier AI research discovery. Sweeps GitHub, HuggingFace, and papers to surface emerging agentic architectures.',
    buildingType: 'lab',
  },
  {
    id: 'cli-anything',
    name: 'CLI-Anything',
    shortName: 'CLI',
    district: 'tools',
    tech: ['Python', 'MCP', 'Pillow', 'YAML'],
    status: 'active',
    description: 'Turns GUI software into agent-controllable APIs. 22 MCP tools across GIMP, Blender, Inkscape, and Draw.io.',
    buildingType: 'workshop',
  },
  {
    id: 'meraki-road',
    name: 'Meraki Road',
    shortName: 'Meraki',
    district: 'webdev',
    tech: ['Nuxt 4', 'GSAP', 'Lenis', 'Supabase'],
    status: 'private',
    description: 'Editorial design studio platform. Archival search, scroll-driven transitions, institutional aesthetic.',
    buildingType: 'studio',
  },
]
