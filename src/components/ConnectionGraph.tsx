import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { graphEdges, graphNodes } from '../data'

type Props = {
  externalSelection: string | null
  onSelectionConsumed: () => void
}

type Layer = 'core' | 'thinking' | 'archive'

const layerRank: Record<Layer, number> = { core: 0, thinking: 1, archive: 2 }

function edgeStatement(edge: typeof graphEdges[number]) {
  const source = graphNodes.find(node => node.id === edge.source)!.label
  const target = graphNodes.find(node => node.id === edge.target)!.label
  return edge.relation ? `${source} ${edge.relation} ${target}` : `Topic association: ${source} and ${target}`
}

export function ConnectionGraph({ externalSelection, onSelectionConsumed }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [layer, setLayer] = useState<Layer>('core')

  const nodeById = useMemo(() => new Map(graphNodes.map((node) => [node.id, node])), [])

  useEffect(() => {
    if (!externalSelection) return
    const node = nodeById.get(externalSelection)
    setSelected(externalSelection)
    if (node?.layer && layerRank[node.layer] > layerRank[layer]) setLayer(node.layer)
    onSelectionConsumed()
  }, [externalSelection, layer, nodeById, onSelectionConsumed])

  const visibleNodes = useMemo(
    () => graphNodes.filter((node) => layerRank[node.layer ?? 'core'] <= layerRank[layer]),
    [layer],
  )
  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes])
  const visibleEdges = useMemo(
    () => graphEdges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target) && layerRank[edge.layer ?? 'core'] <= layerRank[layer]),
    [layer, visibleIds],
  )

  const selectedNode = selected ? nodeById.get(selected) ?? null : null
  const connectedIds = useMemo(() => {
    if (!selected) return new Set<string>()
    const ids = new Set<string>([selected])
    visibleEdges.forEach((edge) => {
      if (edge.source === selected) ids.add(edge.target)
      if (edge.target === selected) ids.add(edge.source)
    })
    return ids
  }, [selected, visibleEdges])

  const directConnections = useMemo(() => {
    if (!selected) return []
    return visibleEdges
      .filter((edge) => edge.source === selected || edge.target === selected)
      .map((edge) => {
        const otherId = edge.source === selected ? edge.target : edge.source
        return { node: nodeById.get(otherId), statement: edgeStatement(edge) }
      })
      .filter((item): item is { node: NonNullable<typeof item.node>; statement: string } => Boolean(item.node))
  }, [nodeById, selected, visibleEdges])

  const select = (id: string) => setSelected((current) => (current === id ? null : id))
  const description = selectedNode
    ? `${selectedNode.label}. ${selectedNode.detail}`
    : 'Select a case, hashtag, field note, origin, or archive fragment to trace its immediate relationships.'

  return (
    <section className="connections" id="system-map" aria-labelledby="connections-title">
      <div className="section-kicker">System map</div>
      <div className="section-heading-row">
        <div>
          <h2 id="connections-title">Follow the relationship, not the category.</h2>
          <p>
            This map is another way into the portfolio. Hashtags are not decoration: each one is a navigable concept that reveals where the same question appears in work, writing, research, and older fragments.
          </p>
        </div>
        <div className="graph-actions" aria-label="Graph controls">
          <div className="graph-layer-control" role="group" aria-label="Map depth">
            <button type="button" className={layer === 'core' ? 'is-on' : ''} aria-pressed={layer === 'core'} onClick={() => setLayer('core')}>Work</button>
            <button type="button" className={layer === 'thinking' ? 'is-on' : ''} aria-pressed={layer === 'thinking'} onClick={() => setLayer('thinking')}>+ thinking</button>
            <button type="button" className={layer === 'archive' ? 'is-on' : ''} aria-pressed={layer === 'archive'} onClick={() => setLayer('archive')}>+ archive</button>
          </div>
          {selected ? <button type="button" className="quiet-button" onClick={() => setSelected(null)}>Clear trace</button> : null}
        </div>
      </div>

      <div className="graph-entry-tags" aria-label="Suggested entry points">
        <span>Try a thread:</span>
        {['systems', 'research', 'language', 'curiosity', 'knowledge', 'ai', 'accessibility'].map((tag) => (
          <button key={tag} type="button" onClick={() => { setLayer(tag === 'language' ? 'thinking' : layer); select(`tag-${tag}`) }}>#{tag}</button>
        ))}
      </div>

      <div className="graph-legends">
        <div className="graph-legend" aria-label="Node types">
          <span><i className="legend-mark legend-mark--project" aria-hidden="true" />case</span>
          <span><i className="legend-mark legend-mark--tag" aria-hidden="true" />hashtag</span>
          {layer !== 'core' ? <span><i className="legend-mark legend-mark--writing" aria-hidden="true" />field note / essay</span> : null}
          {layer !== 'core' ? <span><i className="legend-mark legend-mark--origin" aria-hidden="true" />origin / framework</span> : null}
          {layer === 'archive' ? <span><i className="legend-mark legend-mark--archive" aria-hidden="true" />archive</span> : null}
        </div>
        <div className="graph-state-legend" aria-label="Color meaning">
          <span className="state-text state-text--unresolved">unresolved</span>
          <span className="state-text state-text--pressure">pressure point</span>
          <span className="state-text state-text--holds">what holds</span>
        </div>
      </div>

      <div className="graph-frame" role="group" aria-label="Interactive portfolio connection graph">
        <svg className="graph-lines" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
          {visibleEdges.map((edge) => {
            const source = nodeById.get(edge.source)!
            const target = nodeById.get(edge.target)!
            const active = !selected || (connectedIds.has(source.id) && connectedIds.has(target.id))
            const tone = target.tone ?? source.tone
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className={`graph-edge${active ? ' is-active' : ''}${tone ? ` graph-edge--${tone}` : ''}`}
              />
            )
          })}
        </svg>

        {visibleNodes.map((node) => {
          const active = !selected || connectedIds.has(node.id)
          const isSelected = node.id === selected
          return (
            <button
              key={node.id}
              type="button"
              className={`graph-node graph-node--${node.kind}${node.tone ? ` graph-node--tone-${node.tone}` : ''}${active ? ' is-active' : ''}${isSelected ? ' is-selected' : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => select(node.id)}
              aria-pressed={isSelected}
              aria-label={`${node.kind}: ${node.label}. ${isSelected ? 'Selected.' : 'Select to trace connections.'}`}
            >
              {node.label}
            </button>
          )
        })}
      </div>

      <div className="graph-explanation" aria-live="polite">
        <span className="graph-explanation__label">Trace</span>
        <div>
          <p>{description}</p>
          {selectedNode && directConnections.length ? (
            <div className="trace-links" aria-label={`${selectedNode.label} direct connections`}>
              {directConnections.map(({ node, statement }) => (
                <button key={node.id} type="button" onClick={() => select(node.id)} aria-label={`Inspect ${node.label}. ${statement}.`}>
                  {statement}
                </button>
              ))}
            </div>
          ) : null}
          {selectedNode?.href ? <a className="trace-jump" href={selectedNode.href}>Go to {selectedNode.kind === 'project' ? 'case' : selectedNode.kind === 'writing' ? 'field note' : 'source'} ↓</a> : null}
        </div>
      </div>

      <details className="connections-list">
        <summary>Browse the same system as text</summary>
        <div className="connection-groups">
          {visibleNodes.map((node) => {
            const neighbors = visibleEdges
              .filter((edge) => edge.source === node.id || edge.target === node.id)
              .map((edge) => ({ id: `${edge.source}:${edge.target}`, statement: edgeStatement(edge) }))
            return (
              <div key={node.id} className="connection-group">
                <button type="button" onClick={() => select(node.id)}>{node.label}</button>
                <span>{neighbors.map((neighbor, index) => <span key={neighbor.id}>{neighbor.statement}{index < neighbors.length - 1 ? ' · ' : ''}</span>)}</span>
              </div>
            )
          })}
        </div>
      </details>
    </section>
  )
}
