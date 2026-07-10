'use client'

import { CheckCircle2, Activity, Zap, Database, Lock, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const systemMetrics = [
  { label: 'System Health', value: '98.2%', icon: Activity, color: 'text-green-600' },
  { label: 'API Response Time', value: '45ms', icon: Zap, color: 'text-blue-600' },
  { label: 'Database Connections', value: '234/500', icon: Database, color: 'text-purple-600' },
  { label: 'Security Score', value: '9.8/10', icon: Lock, color: 'text-orange-600' },
]

const backgroundJobs = [
  { id: 1, name: 'Repository Sync', status: 'running', progress: 65, eta: '2 min' },
  { id: 2, name: 'AI Analysis Queue', status: 'running', progress: 42, eta: '5 min' },
  { id: 3, name: 'Cache Cleanup', status: 'completed', progress: 100, eta: 'Done' },
]

const workers = [
  { id: 'worker-1', status: 'healthy', tasks: 234, cpu: '24%' },
  { id: 'worker-2', status: 'healthy', tasks: 187, cpu: '18%' },
  { id: 'worker-3', status: 'healthy', tasks: 201, cpu: '22%' },
]

const auditLogs = [
  { timestamp: '2025-06-15 14:32', user: 'admin@example.com', action: 'Updated system settings', status: 'success' },
  { timestamp: '2025-06-15 14:20', user: 'user@example.com', action: 'Created new repository', status: 'success' },
  { timestamp: '2025-06-15 14:15', user: 'admin@example.com', action: 'Disabled user account', status: 'success' },
]

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">System health, monitoring, and configuration</p>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{metric.value}</p>
                  </div>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* System Status */}
        <TabsContent value="system" className="space-y-6 mt-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'API Server', status: 'online' },
                { name: 'Database', status: 'online' },
                { name: 'Cache Layer', status: 'online' },
                { name: 'Message Queue', status: 'online' },
                { name: 'Storage Service', status: 'online' },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <span className="font-medium text-foreground">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Online</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'CPU Usage', usage: 34 },
                { name: 'Memory Usage', usage: 56 },
                { name: 'Disk Usage', usage: 42 },
              ].map((resource) => (
                <div key={resource.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{resource.name}</span>
                    <span className="text-sm text-muted-foreground">{resource.usage}%</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${resource.usage}%` }}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Background Jobs */}
        <TabsContent value="jobs" className="space-y-4 mt-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Background Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {backgroundJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">{job.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">ETA: {job.eta}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium">
                      {job.status}
                    </span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${job.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workers */}
        <TabsContent value="workers" className="space-y-4 mt-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Workers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workers.map((worker) => (
                <div key={worker.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <div>
                    <p className="font-medium text-foreground">{worker.id}</p>
                    <p className="text-xs text-muted-foreground">{worker.tasks} tasks</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">CPU: {worker.cpu}</span>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit" className="space-y-4 mt-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditLogs.map((log, i) => (
                <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border text-sm">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-foreground">{log.action}</span>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">{log.user} • {log.timestamp}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="config" className="space-y-4 mt-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'MAX_API_REQUESTS', value: '10000/hour' },
                { key: 'DATABASE_POOL_SIZE', value: '50' },
                { key: 'CACHE_TTL', value: '1 hour' },
                { key: 'JOB_TIMEOUT', value: '30 minutes' },
              ].map((config) => (
                <div key={config.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                  <span className="font-mono text-sm font-medium text-foreground">{config.key}</span>
                  <span className="text-sm text-muted-foreground">{config.value}</span>
                </div>
              ))}

              <Button className="w-full mt-4">Update Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
