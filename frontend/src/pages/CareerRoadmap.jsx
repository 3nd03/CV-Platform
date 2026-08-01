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

const HEADER_WIDTH = 280
const MILESTONE_WIDTH = 240
const CENTER_X = 0
const HEADER_ROW_HEIGHT = 130
const MILESTONE_ROW_HEIGHT = 110

function bulletLines(text) {
  return (text || '')
    .split('\n')
    .map((line) => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
}

function StageHeaderNode({ data }) {
  return (
    <div
      className="rounded-xl border-2 border-teal bg-mint px-6 py-4 text-center shadow-card"
      style={{ width: HEADER_WIDTH }}
    >
      <Handle type="target" position={Position.Top} />
      <p className="text-teal font-bold text-lg">{data.label}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function MilestoneNode({ data }) {
  return (
    <div
      className="rounded-lg border border-mint-border bg-white px-4 py-3 shadow-card"
      style={{ width: MILESTONE_WIDTH }}
    >
      <Handle type="target" position={Position.Top} />
      <p className="text-teal text-sm">{data.label}</p>
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

    y += HEADER_ROW_HEIGHT

    const rawText = result?.[stage.key] || ''
    const milestones = stage.bulleted ? bulletLines(rawText) : [rawText.trim()].filter(Boolean)

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
      y += MILESTONE_ROW_HEIGHT
      lastMilestoneId = id
      milestoneCount += 1
    })

    bridgeFromId = lastMilestoneId || headerId
  }

  return { nodes, edges, milestoneCount }
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
              <div className="mt-6 w-full h-[600px] rounded-xl border border-mint-border overflow-hidden">
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
