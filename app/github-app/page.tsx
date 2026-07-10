'use client'

import { Workflow, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { mockGitHubApp, mockRepositories } from '@/lib/mock-data'

export default function GitHubAppPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="GitHub App Management"
        description="Manage your MaintainerAI GitHub application and permissions"
      />

      {/* App Status */}
      <Card className="border border-border bg-gradient-to-br from-green-50 dark:from-green-900/20 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              {mockGitHubApp.name}
            </CardTitle>
            {mockGitHubApp.status === 'active' ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Inactive</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Installation ID</p>
              <p className="font-mono text-sm font-semibold text-foreground mt-1">{mockGitHubApp.installationId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Installed Repositories</p>
              <p className="text-2xl font-bold text-foreground mt-1">{mockGitHubApp.installedRepositories}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Webhook Status</p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-600 dark:text-green-400 capitalize">{mockGitHubApp.webhookStatus}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Sync</p>
              <p className="text-sm font-medium text-foreground mt-1">{mockGitHubApp.lastSync?.toLocaleTimeString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limit */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>API Rate Limit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Remaining Requests</p>
              <p className="text-3xl font-bold text-foreground mt-1">{mockGitHubApp.rateLimit.remaining}</p>
              <p className="text-xs text-muted-foreground mt-1">of {mockGitHubApp.rateLimit.limit} total</p>
            </div>
            <div className="flex-1 ml-8">
              <div className="h-4 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600"
                  style={{ width: `${(mockGitHubApp.rateLimit.remaining / mockGitHubApp.rateLimit.limit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{Math.round((mockGitHubApp.rateLimit.remaining / mockGitHubApp.rateLimit.limit) * 100)}% remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockGitHubApp.permissions.map((perm, idx) => (
            <Card key={idx} className="border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground capitalize">{perm.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{perm.access}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Webhook Events */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockGitHubApp.webhookEvents.map((event, idx) => (
              <div key={idx} className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{event}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Installed Repositories */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Installed Repositories</h2>
        <div className="space-y-2 border border-border rounded-lg overflow-hidden">
          {mockRepositories.map((repo, idx) => (
            <div key={repo.id} className={`flex items-center justify-between p-4 ${idx !== mockRepositories.length - 1 ? 'border-b border-border' : ''}`}>
              <div>
                <p className="font-medium text-foreground">{repo.owner}/{repo.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{repo.description}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Sync Repositories
        </Button>
        <Button variant="outline">
          Manage Permissions
        </Button>
      </div>
    </div>
  )
}
