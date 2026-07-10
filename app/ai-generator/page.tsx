'use client'

import { useState } from 'react'
import {
  Zap,
  Copy,
  RefreshCw,
  AlertCircle,
  GitBranch,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockRepositories } from '@/lib/mock-data'

export default function AIGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedRepo, setSelectedRepo] = useState('')
  const [generatedIssue, setGeneratedIssue] = useState<{
    title: string
    description: string
    labels: string[]
  } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt || !selectedRepo) return

    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      setGeneratedIssue({
        title: `${prompt.substring(0, 40)}...`,
        description: `Based on your request: "${prompt}"\n\nThis is a generated issue template that you can customize before posting to GitHub.`,
        labels: ['ai-generated', 'enhancement'],
      })
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Issue Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate GitHub issues using AI. Perfect for creating well-structured
          issue templates.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Repository Selection */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Select Repository</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedRepo} onValueChange={(value) => setSelectedRepo(value ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a repository" />
                </SelectTrigger>
                <SelectContent>
                  {mockRepositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id.toString()}>
                      {repo.owner}/{repo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Prompt Input */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Describe Your Issue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe the issue you want to generate. For example: 'Add dark mode support to the dashboard with smooth transitions and system preference detection'"
                className="min-h-40"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  className="gap-2 flex-1"
                  onClick={handleGenerate}
                  disabled={!prompt || !selectedRepo || isGenerating}
                >
                  <Zap className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate Issue'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPrompt('')}
                  disabled={isGenerating}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border border-border bg-secondary/50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p className="font-medium text-foreground">Tips for better results:</p>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Be specific about what you need</li>
                    <li>• Include context about the feature or bug</li>
                    <li>• Mention expected vs actual behavior for bugs</li>
                    <li>• Describe acceptance criteria for features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div>
          <Card className="border border-border sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedIssue ? (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      TITLE
                    </p>
                    <h3 className="text-sm font-semibold text-foreground">
                      {generatedIssue.title}
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      DESCRIPTION
                    </p>
                    <p className="text-xs text-foreground whitespace-pre-wrap">
                      {generatedIssue.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      LABELS
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {generatedIssue.labels.map((label) => (
                        <span
                          key={label}
                          className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <Button className="w-full gap-2" size="sm">
                      <GitBranch className="w-4 h-4" />
                      Post to GitHub
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${generatedIssue.title}\n\n${generatedIssue.description}`
                        )
                      }}
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Generate an issue to see the preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
