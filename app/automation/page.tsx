'use client'

import { Cog, ToggleRight, ToggleLeft, Settings, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { mockAutomations } from '@/lib/mock-data'

export default function AutomationPage() {
  const enabledCount = mockAutomations.filter((a) => a.enabled).length
  const totalRuns = mockAutomations.reduce((sum, a) => sum + a.runs, 0)
  const avgSuccessRate = Math.round(mockAutomations.reduce((sum, a) => sum + a.successRate, 0) / mockAutomations.length)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Automation Center"
        description="Manage and monitor your repository automations"
        action={
          <Button className="gap-2">
            <Cog className="w-4 h-4" />
            Create Automation
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Active Automations</p>
              <p className="text-3xl font-bold text-foreground">{enabledCount}</p>
              <p className="text-xs text-green-600 dark:text-green-400">of {mockAutomations.length} total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Total Runs</p>
              <p className="text-3xl font-bold text-foreground">{totalRuns.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Lifetime</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Avg Success Rate</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{avgSuccessRate}%</p>
              <p className="text-xs text-muted-foreground">Across all automations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAutomations.map((automation) => (
          <Card key={automation.id} className="border border-border hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {automation.name}
                    {automation.enabled ? (
                      <ToggleRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{automation.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <div className="flex items-center gap-1 mt-1">
                    {automation.enabled ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-green-600 dark:text-green-400">Active</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">Inactive</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Success Rate</p>
                  <p className="font-semibold text-foreground mt-1">{automation.successRate}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Runs</p>
                  <p className="font-semibold text-foreground mt-1">{automation.runs}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Last Execution</p>
                  <p className="font-semibold text-foreground mt-1 text-xs">
                    {automation.lastExecution ? automation.lastExecution.toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Settings className="w-3 h-3" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
