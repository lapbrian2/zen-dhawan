export interface Landmark {
  id: string
  name: string
  relatedProjects: string[]
}

export const landmarks: Landmark[] = [
  { id: 'threejs', name: 'Three.js', relatedProjects: ['interactive-heart', 'bomb-the-web'] },
  { id: 'gsap', name: 'GSAP', relatedProjects: ['bomb-the-web', 'meraki-road'] },
  { id: 'react', name: 'React', relatedProjects: ['interactive-heart', 'ml-systems'] },
  { id: 'nuxt', name: 'Nuxt', relatedProjects: ['style-dna', 'meraki-road'] },
  { id: 'python', name: 'Python', relatedProjects: ['cli-anything', 'research-radar'] },
  { id: 'claude-ai', name: 'Claude AI', relatedProjects: ['style-dna', 'cli-anything', 'research-radar'] },
  { id: 'typescript', name: 'TypeScript', relatedProjects: ['moholy-js', 'interactive-heart', 'style-dna'] },
]
