export interface Connection {
  from: string
  to: string
  reason: string
  weight: 1 | 2 | 3
}

export const connections: Connection[] = [
  {
    from: 'interactive-heart',
    to: 'bomb-the-web',
    reason: 'Three.js',
    weight: 3,
  },
  {
    from: 'bomb-the-web',
    to: 'meraki-road',
    reason: 'GSAP + Scroll',
    weight: 2,
  },
  {
    from: 'style-dna',
    to: 'moholy-js',
    reason: 'Generative Art',
    weight: 2,
  },
  {
    from: 'style-dna',
    to: 'meraki-road',
    reason: 'Nuxt + Supabase',
    weight: 2,
  },
  {
    from: 'ml-systems',
    to: 'research-radar',
    reason: 'AI Research',
    weight: 3,
  },
  {
    from: 'research-radar',
    to: 'cli-anything',
    reason: 'Automation',
    weight: 1,
  },
  {
    from: 'cli-anything',
    to: 'style-dna',
    reason: 'MCP + AI',
    weight: 2,
  },
  {
    from: 'interactive-heart',
    to: 'ml-systems',
    reason: 'Visualization',
    weight: 1,
  },
  {
    from: 'moholy-js',
    to: 'bomb-the-web',
    reason: 'Canvas + Algorithms',
    weight: 1,
  },
  {
    from: 'meraki-road',
    to: 'style-dna',
    reason: 'Design Systems',
    weight: 1,
  },
]
