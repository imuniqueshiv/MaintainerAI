'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  GitBranch,
  AlertCircle,
  Settings,
  TrendingUp,
  Lock,
  CreditCard,
  Activity,
} from 'lucide-react'

interface OrganizationInfo {
  id: string
  name: string
  slug: string
  avatar?: string
  description?: string
  members: number
  repositories: number
  teams: number
  createdAt: Date
}

interface OrganizationDashboardProps {
  organization: OrganizationInfo
}

export function OrganizationDashboard({ organization }: OrganizationDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {organization.avatar && (
              <Image
                src={organization.avatar}
                alt={organization.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-lg"
                unoptimized
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">{organization.name}</h1>
              <p className="text-muted-foreground">@{organization.slug}</p>
            </div>
          </div>
          {organization.description && (
            <p className="text-foreground">{organization.description}</p>
          )}
        </div>
        <Button className="gap-2">
          <Settings className="w-4 h-4" />
          Organization Settings
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Members</p>
                <p className="text-2xl font-bold text-foreground">{organization.members}</p>
              </div>
              <Users className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Repositories</p>
                <p className="text-2xl font-bold text-foreground">{organization.repositories}</p>
              </div>
              <GitBranch className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Teams</p>
                <p className="text-2xl font-bold text-foreground">{organization.teams}</p>
              </div>
              <Users className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-lg font-bold text-foreground">
                  {organization.createdAt.toLocaleDateString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity */}
            <Card className="border border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Organization Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-secondary rounded">
                    <span className="text-sm text-secondary-foreground">PRs Merged (30 days)</span>
                    <span className="text-lg font-bold text-foreground">342</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded">
                    <span className="text-sm text-secondary-foreground">Issues Resolved</span>
                    <span className="text-lg font-bold text-foreground">156</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded">
                    <span className="text-sm text-secondary-foreground">New Deployments</span>
                    <span className="text-lg font-bold text-foreground">89</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded">
                  <p className="text-sm font-medium text-green-900 dark:text-green-200">
                    Excellent
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-300">All systems operational</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-medium">142ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Repositories */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Top Repositories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'react-components', stars: 12500, prs: 45 },
                  { name: 'next-auth', stars: 8300, prs: 28 },
                  { name: 'tailwindcss', stars: 75000, prs: 156 },
                ].map((repo) => (
                  <div key={repo.name} className="flex items-center justify-between p-3 bg-secondary rounded hover:bg-secondary/80 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-foreground">{repo.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ⭐ {repo.stars.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">{repo.prs} PRs</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Repositories Tab */}
        <TabsContent value="repositories" className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Repositories</CardTitle>
                <Button size="sm">New Repository</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'react-components', lang: 'TypeScript', health: 92 },
                  { name: 'next-auth', lang: 'TypeScript', health: 88 },
                  { name: 'tailwindcss', lang: 'JavaScript', health: 95 },
                  { name: 'api-gateway', lang: 'Go', health: 85 },
                ].map((repo) => (
                  <div
                    key={repo.name}
                    className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{repo.name}</p>
                        <p className="text-xs text-muted-foreground">{repo.lang}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Health</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${repo.health}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{repo.health}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Organization Members</CardTitle>
                <Button size="sm">Invite Members</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Alice Johnson', role: 'Owner', status: 'active' },
                  { name: 'Bob Smith', role: 'Admin', status: 'active' },
                  { name: 'Carol White', role: 'Member', status: 'active' },
                  { name: 'David Lee', role: 'Member', status: 'inactive' },
                ].map((member) => (
                  <div key={member.name} className="flex items-center justify-between p-3 bg-secondary rounded">
                    <div>
                      <p className="font-medium text-secondary-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        member.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {member.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Teams</CardTitle>
                <Button size="sm">Create Team</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Core Maintainers', members: 8 },
                  { name: 'Documentation', members: 5 },
                  { name: 'DevOps', members: 3 },
                  { name: 'Design', members: 4 },
                ].map((team) => (
                  <div
                    key={team.name}
                    className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.members} members</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-secondary rounded flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-foreground">Two-Factor Authentication</span>
                <Badge>Enabled</Badge>
              </div>
              <div className="p-3 bg-secondary rounded flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-foreground">Repository Visibility</span>
                <Badge>Private</Badge>
              </div>
              <Button className="w-full" variant="outline">
                View Security Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Pro Plan
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  $99/month • Renews on Jan 15, 2025
                </p>
              </div>
              <Button className="w-full" variant="outline">
                Manage Billing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
