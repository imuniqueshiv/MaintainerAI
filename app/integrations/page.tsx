'use client'

import { CheckCircle2, AlertCircle, Settings, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'

const integrations = [
  { name: 'Slack', status: 'connected', icon: '💬', description: 'Get notifications in Slack', category: 'Notifications' },
  { name: 'Discord', status: 'available', icon: '🎮', description: 'Receive Discord messages', category: 'Notifications' },
  { name: 'Linear', status: 'connected', icon: '📋', description: 'Sync with Linear issues', category: 'Project Management' },
  { name: 'Jira', status: 'available', icon: '⚙️', description: 'Connect to Jira boards', category: 'Project Management' },
  { name: 'Notion', status: 'available', icon: '📝', description: 'Create Notion databases', category: 'Documentation' },
  { name: 'OpenAI', status: 'connected', icon: '🤖', description: 'Use GPT-4 for AI features', category: 'AI' },
  { name: 'Anthropic', status: 'available', icon: '🧠', description: 'Use Claude for AI features', category: 'AI' },
  { name: 'Ollama', status: 'available', icon: '🦙', description: 'Local LLM support', category: 'AI' },
  { name: 'Docker', status: 'available', icon: '🐳', description: 'Deploy with Docker', category: 'Deployment' },
  { name: 'Vercel', status: 'connected', icon: '⚡', description: 'Deploy to Vercel', category: 'Deployment' },
  { name: 'GitHub Actions', status: 'available', icon: '🔄', description: 'Trigger workflows', category: 'CI/CD' },
  { name: 'Webhooks', status: 'available', icon: '🪝', description: 'Custom webhooks', category: 'Integration' },
]

const categories = [...new Set(integrations.map((i) => i.category))]

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Integrations" description="Connect MaintainerAI with your favorite tools" />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full gap-2 h-auto p-1 bg-secondary/50">
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat.toLowerCase()}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.name} className="border border-border hover:shadow-md transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{integration.icon}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{integration.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{integration.category}</p>
                      </div>
                    </div>
                    {integration.status === 'connected' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">{integration.description}</p>

                  <div className="flex gap-2 pt-2">
                    {integration.status === 'connected' ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1 gap-2">
                          <Settings className="w-4 h-4" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="w-full gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter((i) => i.status === 'connected')
              .map((integration) => (
                <Card key={integration.name} className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h3 className="font-semibold text-foreground">{integration.name}</h3>
                          <p className="text-xs text-muted-foreground">Connected</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat.toLowerCase()} className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations
                .filter((i) => i.category === cat)
                .map((integration) => (
                  <Card key={integration.name} className="border border-border">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{integration.icon}</span>
                        <h3 className="font-semibold text-foreground">{integration.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                      <Button size="sm" className="w-full">
                        {integration.status === 'connected' ? 'Configure' : 'Connect'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
