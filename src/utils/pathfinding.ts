import { connections } from '../data/connections'

type AdjList = Map<string, { node: string; weight: number }[]>

let _adj: AdjList | null = null

export function getAdjacencyList(): AdjList {
  if (_adj) return _adj
  _adj = new Map()
  for (const c of connections) {
    if (!_adj.has(c.from)) _adj.set(c.from, [])
    if (!_adj.has(c.to)) _adj.set(c.to, [])
    _adj.get(c.from)!.push({ node: c.to, weight: c.weight })
    _adj.get(c.to)!.push({ node: c.from, weight: c.weight })
  }
  return _adj
}

export function findShortestPath(from: string, to: string): string[] | null {
  const adj = getAdjacencyList()
  const visited = new Set<string>()
  const queue: string[][] = [[from]]
  visited.add(from)

  while (queue.length > 0) {
    const path = queue.shift()!
    const current = path[path.length - 1]
    if (current === to) return path

    for (const neighbor of adj.get(current) ?? []) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node)
        queue.push([...path, neighbor.node])
      }
    }
  }
  return null
}

export function findConnectedNodes(rootId: string): Set<string> {
  const adj = getAdjacencyList()
  const visited = new Set<string>()
  const queue = [rootId]
  visited.add(rootId)

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const neighbor of adj.get(current) ?? []) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node)
        queue.push(neighbor.node)
      }
    }
  }
  return visited
}

export function findDirectConnections(nodeId: string): string[] {
  const adj = getAdjacencyList()
  return (adj.get(nodeId) ?? []).map(n => n.node)
}

export function getStreetKey(from: string, to: string): string {
  return connections.some(c => c.from === from && c.to === to)
    ? `${from}--${to}`
    : `${to}--${from}`
}

export function findStreetsForPath(path: string[]): string[] {
  const streets: string[] = []
  for (let i = 0; i < path.length - 1; i++) {
    streets.push(getStreetKey(path[i], path[i + 1]))
  }
  return streets
}

export function findProjectsByTech(techName: string, landmarks: { id: string; name: string; relatedProjects: string[] }[]): string[] {
  const lm = landmarks.find(l => l.name.toLowerCase() === techName.toLowerCase())
  return lm?.relatedProjects ?? []
}
