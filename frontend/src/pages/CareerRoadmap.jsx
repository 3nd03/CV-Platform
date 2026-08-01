import { useMemo, useState } from 'react'
import { ReactFlow, Background, Controls, MiniMap, Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import Layout from '../components/Layout'
import Card from '../components/Card'
import BackButton from '../components/BackButton'
import FollowUpChat from '../components/FollowUpChat'
import { runCareerRoadmap } from '../api/tools'
import { markToolUsed } from '../utils/toolActivity'

// The backend already splits the roadmap into four labelled sections
// (WHERE_NOW, THREE_MONTH, SIX_MONTH, ONE_YEAR) rather than one flat text
// blob with embedded stage headings, so the "stage heading" detection this
// diagram needs is really just this fixed mapping. The prompt now returns
// every section, including WHERE_NOW, as short bullet points rather than a
// prose paragraph, so all four stages parse the same way.
const STAGES = [
  { key: 'WHERE_NOW', label: 'Now' },
  { key: 'THREE_MONTH', label: '3 Months' },
  { key: 'SIX_MONTH', label: '6 Months' },
  { key: 'ONE_YEAR', label: '1 Year' },
]

const HEADER_WIDTH = 200
const HEADER_MIN_HEIGHT = 48
const MILESTONE_WIDTH = 280
// Milestone node height is intrinsic (auto), this is only an estimate used to
// space rows out vertically so wrapped text has room without nodes overlapping.
const MILESTONE_HEIGHT_ESTIMATE = 90
const CENTER_X = 0
const GAP_HEADER_TO_MILESTONE = 140
const GAP_BETWEEN_MILESTONES = 80
const GAP_BETWEEN_STAGES = 120

const NODE_CONTENT_STYLE = {
  overflow: 'visible',
  whiteSpace: 'normal',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  boxSizing: 'border-box',
}

function bulletLines(text) {
  return (text || '')
    .split('\n')
    .map((line) => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
}

function StageHeaderNode({ data }) {
  return (
    <div
      className="shadow-card"
      style={{
        ...NODE_CONTENT_STYLE,
        width: HEADER_WIDTH,
        minHeight: HEADER_MIN_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: '#abebd9',
        color: '#1a3a3a',
        fontWeight: 700,
        fontSize: 14,
        borderRadius: 12,
        padding: '8px 16px',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <span>{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function MilestoneNode({ data }) {
  return (
    <div
      className="shadow-card"
      style={{
        ...NODE_CONTENT_STYLE,
        width: MILESTONE_WIDTH,
        height: 'auto',
        backgroundColor: '#ffffff',
        border: '1px solid #d4f0e8',
        color: '#1a3a3a',
        fontSize: 10,
        borderRadius: 10,
        padding: 12,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <span>{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const NODE_TYPES = {
  stageHeader: StageHeaderNode,
  milestone: MilestoneNode,
}

function buildGraph(result) {
  const nodes = []
  const edges = []
  let y = 0
  let bridgeFromId = null
  let milestoneCount = 0

  for (const stage of STAGES) {
    const headerId = `header-${stage.key}`
    nodes.push({
      id: headerId,
      type: 'stageHeader',
      position: { x: CENTER_X - HEADER_WIDTH / 2, y },
      data: { label: stage.label },
      draggable: false,
    })

    if (bridgeFromId) {
      edges.push({
        id: `e-${bridgeFromId}-${headerId}`,
        source: bridgeFromId,
        target: headerId,
        type: 'smoothstep',
        style: { stroke: '#abebd9', strokeWidth: 2 },
      })
    }

    const rawText = result?.[stage.key] || ''
    const milestones = bulletLines(rawText)

    if (milestones.length === 0) {
      // Nothing to fan out to, so the header itself bridges straight to the next stage.
      y += HEADER_MIN_HEIGHT + GAP_BETWEEN_STAGES
      bridgeFromId = headerId
      continue
    }

    y += HEADER_MIN_HEIGHT + GAP_HEADER_TO_MILESTONE

    let lastMilestoneId = null
    milestones.forEach((text, i) => {
      const id = `${stage.key}-m${i}`
      nodes.push({
        id,
        type: 'milestone',
        position: { x: CENTER_X - MILESTONE_WIDTH / 2, y },
        data: { label: text },
        draggable: false,
      })
      edges.push({
        id: `e-${headerId}-${id}`,
        source: headerId,
        target: id,
        type: 'smoothstep',
        style: { stroke: '#abebd9', strokeWidth: 2 },
      })
      const isLastInStage = i === milestones.length - 1
      y += MILESTONE_HEIGHT_ESTIMATE + (isLastInStage ? GAP_BETWEEN_STAGES : GAP_BETWEEN_MILESTONES)
      lastMilestoneId = id
      milestoneCount += 1
    })

    bridgeFromId = lastMilestoneId
  }

  return { nodes, edges, milestoneCount, contentHeight: y }
}

function StageCard({ label, text }) {
  const items = bulletLines(text)
  return (
    <div className="bg-white border-l-[3px] border-mint rounded-r-lg p-4">
      <p className="text-xs uppercase tracking-wide text-mint font-semibold">{label}</p>
      <ul className="mt-2 list-disc list-inside space-y-1 text-body text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default function CareerRoadmap() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const graph = useMemo(() => (result ? buildGraph(result) : null), [result])
  const parseFailed = !graph || graph.milestoneCount === 0
  // React Flow needs a concrete pixel height on its container to render at all,
  // it collapses to 0 height if only min-height is set on an auto-sized parent.
  const diagramHeight = graph ? Math.max(800, graph.contentHeight + 100) : 800

  async function handleRun() {
    setLoading(true)
    try {
      const data = await runCareerRoadmap()
      setResult(data)
      markToolUsed('career_roadmap')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <BackButton />
      <Card>
        <h1 className="text-2xl font-bold text-teal mb-6">Career Roadmap</h1>

        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="w-full h-12 bg-mint text-teal rounded-[10px] font-medium disabled:opacity-50 hover:brightness-90 transition-all duration-200"
        >
          {loading ? 'Building...' : 'Build roadmap'}
        </button>

        {result && (
          <>
            {parseFailed ? (
              <div className="mt-6 space-y-4">
                <StageCard label="Where you are now" text={result.WHERE_NOW} />
                <StageCard label="3 months" text={result.THREE_MONTH} />
                <StageCard label="6 months" text={result.SIX_MONTH} />
                <StageCard label="1 year" text={result.ONE_YEAR} />
              </div>
            ) : (
              <div
                className="mt-6 w-full mx-auto rounded-xl border border-mint-border overflow-hidden"
                style={{ height: diagramHeight }}
              >
                <ReactFlow
                  nodes={graph.nodes}
                  edges={graph.edges}
                  nodeTypes={NODE_TYPES}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                >
                  <Background />
                  <Controls showInteractive={false} />
                  <MiniMap pannable zoomable nodeColor="#abebd9" />
                </ReactFlow>
              </div>
            )}
            <FollowUpChat toolName="career_roadmap" result={result} />
          </>
        )}
      </Card>
    </Layout>
  )
}
