'use client'

import { CheckCircle2, AlertCircle, CodeSquare, Box, Server, Database, Zap, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'

const deploymentOptions = [
  {
    name: 'Docker Compose',
    icon: Box,
    description: 'Easiest way to self-host',
    time: '5 min',
    requirements: ['Docker', 'Docker Compose', 'GitHub App Token'],
  },
  {
    name: 'Kubernetes',
    icon: Server,
    description: 'Production-grade deployment',
    time: '30 min',
    requirements: ['K8s Cluster', 'Helm', 'PostgreSQL'],
  },
  {
    name: 'Vercel',
    icon: Zap,
    description: 'Managed hosting by Vercel',
    time: '10 min',
    requirements: ['Vercel Account', 'Database'],
  },
]

const productionChecklist = [
  'Configure environment variables',
  'Set up GitHub App with correct permissions',
  'Configure database backups',
  'Enable SSL/TLS encryption',
  'Set up monitoring and logging',
  'Configure AI provider keys',
  'Set resource limits',
  'Enable rate limiting',
]

export default function DeployPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Self-Hosting"
        description="Deploy MaintainerAI on your own infrastructure"
      />

      {/* Deployment Options */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Deployment Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deploymentOptions.map((option) => {
            const Icon = option.icon
            return (
              <Card key={option.name} className="border border-border hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Icon className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">{option.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground"><span className="font-medium text-foreground">Setup time:</span> {option.time}</p>
                    <div>
                      <p className="font-medium text-foreground mb-2">Requirements:</p>
                      <ul className="space-y-1">
                        {option.requirements.map((req) => (
                          <li key={req} className="text-muted-foreground flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button className="w-full">Get Started</Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Docker Compose Example */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="w-5 h-5" />
            Docker Compose Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`version: '3.8'
services:
  maintainerai:
    image: maintainerai/maintainerai:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/maintainerai
      GITHUB_APP_ID: your_app_id
      GITHUB_PRIVATE_KEY: your_private_key
      OPENAI_API_KEY: your_openai_key
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: maintainerai
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`}</pre>
          </div>
          <Button className="gap-2">
            <CodeSquare className="w-4 h-4" />
            Copy Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Tabs defaultValue="env" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="env">Environment</TabsTrigger>
          <TabsTrigger value="github">GitHub App</TabsTrigger>
          <TabsTrigger value="ai">AI Providers</TabsTrigger>
          <TabsTrigger value="db">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="env" className="space-y-4 mt-6">
          <Card className="border border-border">
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="font-medium text-foreground mb-2">Required Environment Variables</p>
                <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>DATABASE_URL=postgresql://user:pass@localhost:5432/maintainerai</div>
                  <div>GITHUB_APP_ID=your_app_id</div>
                  <div>GITHUB_PRIVATE_KEY=your_private_key</div>
                  <div>OPENAI_API_KEY=your_openai_key</div>
                  <div>NEXTAUTH_SECRET=generate_with_openssl</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="github" className="space-y-4 mt-6">
          <Card className="border border-border">
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="font-medium text-foreground mb-2">GitHub App Permissions</p>
                <div className="space-y-2">
                  {['contents:read/write', 'issues:read/write', 'pull_requests:read', 'workflows:read'].map((perm) => (
                    <div key={perm} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4 mt-6">
          <Card className="border border-border">
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="font-medium text-foreground mb-3">Supported AI Providers</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['OpenAI (GPT-4)', 'Anthropic (Claude)', 'Gemini (Google)', 'Ollama (Local)'].map((provider) => (
                    <div key={provider} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{provider}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="db" className="space-y-4 mt-6">
          <Card className="border border-border">
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="font-medium text-foreground mb-2">Database Requirements</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <Database className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-foreground text-sm">PostgreSQL 13+</p>
                      <p className="text-xs text-muted-foreground">Primary database for all data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Redis (Optional)</p>
                      <p className="text-xs text-muted-foreground">For caching and background jobs</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Production Checklist */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Production Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {productionChecklist.map((item) => (
              <label key={item} className="flex items-center gap-3 p-2 rounded hover:bg-secondary/30 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm text-foreground">{item}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Checks */}
      <Card className="border border-border bg-gradient-to-r from-blue-50/50 dark:from-blue-900/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Health Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Health check endpoint is available at:</p>
          <div className="bg-background p-3 rounded-lg font-mono text-sm border border-border">GET /api/health</div>
          <p className="text-sm text-muted-foreground">Configure your load balancer or monitoring to check this endpoint every 30 seconds.</p>
        </CardContent>
      </Card>

      {/* Support */}
      <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-lg p-8 space-y-4">
        <h3 className="text-xl font-bold text-foreground">Need Help?</h3>
        <p className="text-muted-foreground">Having trouble deploying? Check our documentation or contact support.</p>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline">View Docs</Button>
          <Button>Get Support</Button>
        </div>
      </div>
    </div>
  )
}
