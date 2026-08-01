import { useMemo, useState } from 'react'
import { ReactFlow, Background, Controls, MiniMap, Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import Layout from '../components/Layout'
import Card from '../components/Card'
import FollowUpChat from '../components/FollowUpChat'
import { runCareerRoadmap } from '../api/tools'
import { markToolUsed } from '../utils/toolActivity'

// The backend already splits the roadmap into four labelled sections
// (WHERE_NOW, THREE_MONTH, SIX_MONTH, ONE_YEAR) rather than one flat text
// blob with embedded stage headings, so the "stage heading" detection this
// diagram needs is really just this fixed mapping. What still needs parsing
// per the brief is stripping bullets/asterisks/numbering from each stage's
// text and splitting it into individual milestone lines.
const STAGES = [
  { key: 'WHERE_NOW', label: 'Now', bulleted: false },
  { key: 'THREE_MONTH', label: '3 Months', bulleted: true },
  { key: 'SIX_MONTH', label: '6 Months', bulleted: true },
  { key: 'ONE_YEAR', label: '1 Year', bulleted: true },
]

const HEADER_WIDTH = 200
const HEADER_MIN_HEIGHT = 48
const MILESTONE_WIDTH = 280
// Milestone node height is intrinsic (auto), this is only an estimate used to
// space rows out vertically so wrapped text has room without nodes overlapping.
const MILESTONE_HEIGHT_ESTIMATE = 80
const CENTER_X = 0
const GAP_WITHIN_STAGE = 80
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
    const milestones = stage.bulleted ? bulletLines(rawText) : [rawText.trim()].filter(Boolean)

    if (milestones.length === 0) {
      // Nothing to fan out to, so the header itself bridges straight to the next stage.
      y += HEADER_MIN_HEIGHT + GAP_BETWEEN_STAGES
      bridgeFromId = headerId
      continue
    }

    y += HEADER_MIN_HEIGHT + GAP_WITHIN_STAGE

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
      y += MILESTONE_HEIGHT_ESTIMATE + (isLastInStage ? GAP_BETWEEN_STAGES : GAP_WITHIN_STAGE)
      lastMilestoneId = id
      milestoneCount += 1
    })

    bridgeFromId = lastMilestoneId
  }

  return { nodes, edges, milestoneCount, contentHeight: y }
}

function StageCard({ label, text, bulleted }) {
  const items = bulleted ? bulletLines(text) : null
  return (
    <div className="border-l-4 border-mint bg-gray-50 rounded-r-lg p-4">
      <p className="text-xs uppercase tracking-wide text-mint font-semibold">{label}</p>
      {bulleted ? (
        <ul className="mt-2 list-disc list-inside space-y-1 text-body text-sm">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-body text-sm whitespace-pre-line">{text}</p>
      )}
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
      <Card>
        <h1 className="text-xl font-bold text-teal mb-6">Career Roadmap</h1>

        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="w-full bg-mint text-teal rounded-lg py-3 font-medium disabled:opacity-50 transition-colors duration-150"
        >
          {loading ? 'Building...' : 'Build roadmap'}
        </button>

        {result && (
          <>
            {parseFailed ? (
              <div className="mt-6 space-y-4">
                <StageCard label="Where you are now" text={result.WHERE_NOW} bulleted={false} />
                <StageCard label="3 months" text={result.THREE_MONTH} bulleted />
                <StageCard label="6 months" text={result.SIX_MONTH} bulleted />
                <StageCard label="1 year" text={result.ONE_YEAR} bulleted />
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
