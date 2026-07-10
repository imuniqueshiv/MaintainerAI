'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Zap, MessageCircle, GitPullRequest, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'

interface AutomationSetting {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

export default function SetupAutomationPage() {
  const [settings, setSettings] = useState<AutomationSetting[]>([
    {
      id: 'ai-issues',
      name: 'AI Issue Generation',
      description: 'Automatically generate and label issues with AI assistance',
      icon: <MessageCircle className="w-5 h-5" />,
      enabled: true,
    },
    {
      id: 'smart-prs',
      name: 'Smart PR Review',
      description: 'AI-powered code review suggestions and PR routing',
      icon: <GitPullRequest className="w-5 h-5" />,
      enabled: true,
    },
    {
      id: 'auto-triage',
      name: 'Auto Triage',
      description: 'Automatically categorize and assign issues based on content',
      icon: <Zap className="w-5 h-5" />,
      enabled: false,
    },
  ])

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  const enabledCount = settings.filter((s) => s.enabled).length

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <PageHeader
          title="Setup Automation"
          description="Choose which automation features to enable for your repositories"
          breadcrumbs={[
            { label: 'Onboarding' },
            { label: 'Setup Automation' },
          ]}
        />

        {/* Settings */}
        <div className="space-y-3 mb-8">
          {settings.map((setting) => (
            <button
              key={setting.id}
              onClick={() => toggleSetting(setting.id)}
              className="w-full flex items-start gap-4 p-5 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-left bg-card"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-primary">{setting.icon}</div>
                  <h3 className="font-semibold text-foreground">{setting.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{setting.description}</p>
              </div>
              <div className="flex-shrink-0 mt-1">
                {setting.enabled ? (
                  <ToggleRight className="w-6 h-6 text-primary" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{enabledCount}</span> automation feature
            {enabledCount !== 1 ? 's' : ''} enabled
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4">
          <Link href="/onboarding/select-repositories">
            <Button variant="ghost">Back</Button>
          </Link>
          <Link href="/onboarding/complete">
            <Button className="gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
