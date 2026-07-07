import type { CredentialModelLink, SkillTreeContext } from '../types/types'
import { Link, useOutletContext } from 'react-router-dom';

function SkillTreeVisual() {
    const { selectedMakerspace, credsLoading, credsError, credentialModels, prereqMap, completedModelIds } = useOutletContext<SkillTreeContext>();

    return (
        <>
            {
                selectedMakerspace ?
                <div className="py-6">
                    <h1 className="text-center text-xl font-semibold mb-4">{selectedMakerspace.makerspace_name}</h1>
                    {credsLoading && <div>Loading trainings…</div>}
                    {!credsLoading && credsError && <div style={{ color: 'crimson' }}>{credsError}</div>}
                    {!credsLoading && !credsError && (credentialModels ?? []).length === 0 && (
                        <div style={{ color: '#666' }}>No trainings available for this makerspace.</div>
                    )}
                    {!credsLoading && !credsError && credentialModels && credentialModels.length > 0 && (
                        <section>
                            <TrainingTree
                                selectedMakerspaceId={selectedMakerspace.makerspace_id}
                                models={credentialModels}
                                prereqMap={prereqMap ?? {}}
                                completedIds={completedModelIds}
                            />
                        </section>
                    )}
                </div> :
                <h1>Select a makerspace from the left</h1>
            }
        </>
    );
}

/**
 * TrainingTree that orders nodes starting from credentials with zero prereqs
 * and prunes direct edges when a prerequisite is upstream of another prerequisite
 * (i.e. removes redundant direct connection so a dependent shows only under
 * the nearest prerequisite).
 */

// ...existing code...

function TrainingTree({
  selectedMakerspaceId,
  models,
  prereqMap,
  completedIds = new Set<string>(),
}: {
  selectedMakerspaceId: string
  models: CredentialModelLink[]
  prereqMap: Record<string, { prerequisite_ids: string[]; prerequisite_models: CredentialModelLink[] }>
  completedIds?: Set<string>
}) {
  // Build node map (include prereq models)
  const allNodesById = new Map<string, CredentialModelLink>()
  models.forEach((m) => allNodesById.set(m.credential_model_id, m))
  for (const dep of Object.keys(prereqMap)) {
    for (const pm of prereqMap[dep].prerequisite_models ?? []) {
      if (!allNodesById.has(pm.credential_model_id)) allNodesById.set(pm.credential_model_id, pm)
    }
  }

  // dependent -> prereq ids
  const initialPrereqs: Record<string, string[]> = {}
  for (const dep of Object.keys(prereqMap)) initialPrereqs[dep] = Array.from(prereqMap[dep].prerequisite_ids ?? [])

  // build dependents (prereq -> Set(dependents))
  const buildDependents = (m: Record<string, string[]>) => {
    const d: Record<string, Set<string>> = {}
    for (const [dep, prereqs] of Object.entries(m)) {
      for (const p of prereqs) {
        if (!d[p]) d[p] = new Set()
        d[p].add(dep)
      }
    }
    return d
  }
  const initialDependents = buildDependents(initialPrereqs)

  // reachability helper (prereq -> dependent graph)
  const canReach = (from: string, to: string, dependents: Record<string, Set<string>>) => {
    const stack = [from]
    const seen = new Set<string>()
    while (stack.length) {
      const cur = stack.pop()!
      if (seen.has(cur)) continue
      seen.add(cur)
      for (const c of Array.from(dependents[cur] ?? [])) {
        if (c === to) return true
        stack.push(c)
      }
    }
    return false
  }

  // prune upstream prereqs (keep only nearest prerequisites)
  const prunedPrereqs: Record<string, string[]> = {}
  for (const [dep, prereqs] of Object.entries(initialPrereqs)) {
    const S = prereqs.slice()
    const keep: string[] = []
    for (const p of S) {
      const isUpstream = S.some((q) => q !== p && canReach(p, q, initialDependents))
      if (!isUpstream) keep.push(p)
    }
    prunedPrereqs[dep] = keep
  }

  // dependents after pruning
//   const dependentsPerPrereq = buildDependents(prunedPrereqs)

  // compute direct prereq counts
  const prereqCount: Record<string, number> = {}
  for (const id of Array.from(allNodesById.keys())) prereqCount[id] = 0
  for (const dep of Object.keys(prunedPrereqs)) prereqCount[dep] = prunedPrereqs[dep].length

  // compute levels: level = max(prereq level) + 1
  const levelMap: Record<string, number> = {}
  for (const id of allNodesById.keys()) levelMap[id] = 0
  let changed = true
  while (changed) {
    changed = false
    for (const [dep, prereqs] of Object.entries(prunedPrereqs)) {
      const maxPre = prereqs.reduce((acc, p) => Math.max(acc, levelMap[p] ?? 0), -1)
      const target = maxPre === -1 ? 0 : maxPre + 1
      if ((levelMap[dep] ?? 0) !== target) {
        levelMap[dep] = target
        changed = true
      }
    }
  }

  // group nodes by level and sort for stable layout
  const levels: string[][] = []
  for (const [id, lvl] of Object.entries(levelMap)) {
    if (!levels[lvl]) levels[lvl] = []
    levels[lvl].push(id)
  }
  levels.forEach((arr) =>
    arr.sort((a, b) => {
      const an = allNodesById.get(a)!.credential_model_name
      const bn = allNodesById.get(b)!.credential_model_name
      return an.localeCompare(bn)
    })
  )

  // layout grid
  const nodeW = 180
  const nodeH = 68
  const hGap = 48
  const vGap = 100
  const pad = 24

  let maxWidth = 0
  levels.forEach((lvl) => {
    const total = lvl.length * nodeW + Math.max(0, lvl.length - 1) * hGap
    if (total > maxWidth) maxWidth = total
  })

  const positions: Record<string, { x: number; y: number }> = {}
  levels.forEach((lvlNodes, lvl) => {
    const totalWidth = lvlNodes.length * nodeW + Math.max(0, lvlNodes.length - 1) * hGap
    const startX = pad + Math.max(0, (maxWidth - totalWidth) / 2)
    lvlNodes.forEach((id, idx) => {
      positions[id] = { x: startX + idx * (nodeW + hGap), y: pad + lvl * (nodeH + vGap) }
    })
  })

  const totalWidth = pad * 2 + maxWidth
  const totalHeight = pad * 2 + levels.length * nodeH + Math.max(0, levels.length - 1) * vGap

  // connectors: draw smooth cubic bezier paths routed vertically then horizontally
  const connectors: { from: { x: number; y: number }; to: { x: number; y: number } }[] = []
  for (const [dep, prereqs] of Object.entries(prunedPrereqs)) {
    for (const p of prereqs) {
      const a = positions[p]
      const b = positions[dep]
      if (!a || !b) continue
      connectors.push({
        from: { x: a.x + nodeW / 2, y: a.y + nodeH },
        to: { x: b.x + nodeW / 2, y: b.y },
      })
    }
  }

  // smooth path builder using cubic bezier through an intermediate horizontal rail (midY)
  const smoothPath = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    // if vertical-ish and same x, draw straight line
    if (Math.abs(a.x - b.x) < 4) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`

    const midY = (a.y + b.y) / 2
    // control points lie on vertical ends but aim to midY for smooth elbow
    const cp1x = a.x
    const cp1y = midY
    const cp2x = b.x
    const cp2y = midY
    return `M ${a.x} ${a.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${b.x} ${b.y}`
  }

  return (
    <div style={{ position: 'relative', width: totalWidth, minHeight: totalHeight, padding: 12 }}>
      <svg width={totalWidth} height={totalHeight} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
        {/* <defs>
          <marker id="sqArrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
            <rect x="0" y="1.5" width="9" height="9" rx="2" fill="#60a5fa" />
          </marker>
        </defs> */}

        {connectors.map((c, i) => (
          <path
            key={i}
            d={smoothPath(c.from, c.to)}
            stroke="#60a5fa"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd="url(#sqArrow)"
            opacity={0.95}
          />
        ))}
      </svg>

      {/* nodes */}
      {Array.from(allNodesById.keys()).map((id) => {
        const pos = positions[id]
        const node = allNodesById.get(id)!
        const isDone = completedIds.has(id)
        return (
          <Link to={`training-detail/${selectedMakerspaceId}/${id}`}
            key={id}
            style={{
              position: 'absolute',
              left: pos?.x ?? 0,
              top: pos?.y ?? 0,
              width: nodeW,
              height: nodeH,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 10,
                background: 'linear-gradient(180deg,#0f172a,#071033)',
                border: '2px solid rgba(96,165,250,0.16)',
                color: 'white',
                boxShadow: '0 10px 30px rgba(2,6,23,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 10px',
                textAlign: 'center',
                fontWeight: 700,
                position: 'relative', 
              }}
            >
              {/* checkmark for completed trainings */}
              {isDone && (
                <div style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20 }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                    <rect x="0" y="0" width="24" height="24" rx="4" fill="#10b981" />
                    <path d="M7 12.5l2.5 2.5L17 8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              <div style={{ paddingRight: isDone ? 8 : 0 }}>{node.credential_model_name}</div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
// ...existing code...

export default SkillTreeVisual;