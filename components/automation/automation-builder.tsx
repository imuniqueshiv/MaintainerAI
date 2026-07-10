'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  ArrowDown,
  Trash2,
  Play,
  Pause,
  Settings,
  FileText,
  AlertCircle,
  MessageCircle,
  Bell,
  GitPullRequest,
  Clock,
} from 'lucide-react'

interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'notification'
  title: string
  description: string
  config?: Record<string, unknown>
  status: 'active' | 'inactive' | 'error'
}

interface AutomationWorkflow {
  id: string
  name: string
  description: string
  enabled: boolean
  nodes: WorkflowNode[]
  createdAt: Date
  lastModified: Date
  executions: number
  lastExecution?: Date
}

interface AutomationBuilderProps {
  workflow?: AutomationWorkflow
  onSave?: (workflow: AutomationWorkflow) => void
}

const nodeTypes = {
  triggers: [
    { id: 'issue-created', name: 'Issue Created', icon: AlertCircle },
    { id: 'pr-opened', name: 'PR Opened', icon: GitPullRequest },
    { id: 'issue-labeled', name: 'Issue Labeled', icon: FileText },
    { id: 'schedule', name: 'On Schedule', icon: Clock },
  ],
  actions: [
    { id: 'label', name: 'Add Labels', icon: FileText },
    { id: 'assign', name: 'Assign Users', icon: Settings },
    { id: 'comment', name: 'Post Comment', icon: MessageCircle },
    { id: 'notify', name: 'Send Notification', icon: Bell },
  ],
  conditions: [
    { id: 'has-label', name: 'Has Label', icon: FileText },
    { id: 'author-match', name: 'Author Match', icon: Settings },
    { id: 'files-match', name: 'Files Match', icon: FileText },
  ],
}

export function AutomationBuilder({ workflow, onSave }: AutomationBuilderProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(
    workflow?.nodes || [
      {
        id: '1',
        type: 'trigger',
        title: 'Issue Created',
        description: 'Triggers when a new issue is created',
        status: 'active',
      },
    ]
  )
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showNodePicker, setShowNodePicker] = useState(false)
  const [nodeSeq, setNodeSeq] = useState(1)

  const resolveNodeType = (category: string): WorkflowNode['type'] => {
    if (category === 'triggers') return 'trigger'
    if (category === 'actions') return 'action'
    if (category === 'conditions') return 'condition'
    return 'notification'
  }

  const addNode = (nodeType: string, nodeId: string) => {
    const nextSeq = nodeSeq + 1
    setNodeSeq(nextSeq)
    const newNode: WorkflowNode = {
      id: `node-${nextSeq}-${nodeId}`,
      type: resolveNodeType(nodeType),
      title:
        nodeTypes[nodeType as keyof typeof nodeTypes]?.find((n) => n.id === nodeId)?.name ||
        'Unknown',
      description: 'Configure this node',
      status: 'active',
    }
    setNodes([...nodes, newNode])
    setShowNodePicker(false)
  }

  const removeNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId))
    setSelectedNode(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {workflow?.name || 'New Automation'}
        </h1>
        {workflow?.description && (
          <p className="text-muted-foreground">{workflow.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-3">
          <Card className="border border-border bg-muted/30 min-h-96">
            <CardHeader>
              <CardTitle className="text-lg">Workflow Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {nodes.map((node, idx) => (
                  <div key={node.id}>
                    <div
                      onClick={() => setSelectedNode(node.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedNode === node.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{node.title}</p>
                          <p className="text-xs text-muted-foreground">{node.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            className={
                              node.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : node.status === 'inactive'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {node.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNode(node.id)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {idx < nodes.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Node */}
                <div className="pt-4 border-t border-border">
                  {showNodePicker ? (
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(nodeTypes).map(([category, items]) => (
                        <div key={category}>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 capitalize">
                            {category}
                          </p>
                          <div className="space-y-1">
                            {items.map((item) => (
                              <Button
                                key={item.id}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start gap-2 text-xs"
                                onClick={() =>
                                  addNode(category.replace('s', '').slice(0, -1), item.id)
                                }
                              >
                                <item.icon className="w-3 h-3" />
                                {item.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNodePicker(false)}
                        className="col-span-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setShowNodePicker(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Add Step
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge className="w-full justify-center bg-green-100 text-green-800">
                ✓ Active
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Play className="w-4 h-4" />
                  Test
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Pause className="w-4 h-4" />
                  Disable
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Node Configuration */}
          {selectedNode && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-base">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Node Name
                  </label>
                  <input
                    type="text"
                    placeholder="Configure node..."
                    className="w-full mt-1 px-2 py-1 rounded border border-border bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Settings
                  </label>
                  <div className="mt-2 p-2 bg-secondary rounded text-xs text-secondary-foreground">
                    Node-specific settings will appear here
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Executions</span>
                <span className="font-medium text-foreground">
                  {workflow?.executions || 0}
                </span>
              </div>
              {workflow?.lastExecution && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Run</span>
                  <span className="font-medium text-foreground">
                    {workflow.lastExecution.toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full" onClick={() => onSave?.({ id: '1', name: 'Workflow', enabled: true, description: '', nodes, createdAt: new Date(), lastModified: new Date(), executions: 0 })}>
              Save Workflow
            </Button>
            <Button variant="outline" className="w-full">
              Duplicate
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
