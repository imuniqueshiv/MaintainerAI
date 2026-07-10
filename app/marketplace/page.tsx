'use client'

import { Search, Star, Download, Badge, Filter, Zap, Lock, Bell, BarChart3, Puzzle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'

const plugins = [
  {
    id: 1,
    name: 'Issue Auto-Label',
    category: 'Automation',
    description: 'Automatically label issues based on content and patterns',
    rating: 4.8,
    downloads: 2300,
    maintainer: 'MaintainerAI Team',
    featured: true,
    compatible: '1.0+',
  },
  {
    id: 2,
    name: 'Slack Notifications',
    category: 'Notifications',
    description: 'Get instant Slack notifications for important events',
    rating: 4.6,
    downloads: 1800,
    maintainer: 'Community',
    featured: true,
    compatible: '0.8+',
  },
  {
    id: 3,
    name: 'PR Review Bot',
    category: 'AI',
    description: 'AI-powered code review suggestions for pull requests',
    rating: 4.9,
    downloads: 3400,
    maintainer: 'MaintainerAI Team',
    featured: true,
    compatible: '1.0+',
  },
  {
    id: 4,
    name: 'Security Scanner',
    category: 'Security',
    description: 'Scan code for security vulnerabilities automatically',
    rating: 4.7,
    downloads: 1200,
    maintainer: 'Security Team',
    featured: false,
    compatible: '0.9+',
  },
  {
    id: 5,
    name: 'Analytics Dashboard',
    category: 'Analytics',
    description: 'Advanced analytics and metrics for repositories',
    rating: 4.5,
    downloads: 890,
    maintainer: 'Analytics Co',
    featured: false,
    compatible: '1.0+',
  },
  {
    id: 6,
    name: 'GitHub Actions Template',
    category: 'Integrations',
    description: 'Pre-built GitHub Actions workflows for common tasks',
    rating: 4.4,
    downloads: 1100,
    maintainer: 'GitHub',
    featured: false,
    compatible: '0.8+',
  },
]

const categories = [
  { name: 'All', icon: Puzzle, count: 47 },
  { name: 'AI', icon: Zap, count: 12 },
  { name: 'Automation', icon: BarChart3, count: 18 },
  { name: 'Notifications', icon: Bell, count: 8 },
  { name: 'Security', icon: Lock, count: 9 },
]

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Plugin Marketplace"
        description="Extend MaintainerAI with powerful plugins and integrations"
      />

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search plugins..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2 md:w-auto">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <Button key={cat.name} variant="outline" className="gap-2 whitespace-nowrap">
              <Icon className="w-4 h-4" />
              {cat.name}
              <span className="text-xs text-muted-foreground">({cat.count})</span>
            </Button>
          )
        })}
      </div>

      {/* Featured Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Featured Plugins</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plugins
            .filter((p) => p.featured)
            .map((plugin) => (
              <Card key={plugin.id} className="border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{plugin.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{plugin.category}</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-0">Featured</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{plugin.description}</p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{plugin.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">({plugin.downloads.toLocaleString()} downloads)</span>
                    </div>
                  </div>

                  <Button className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Install
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* All Plugins */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">All Plugins</h2>
        <div className="grid gap-3">
          {plugins.map((plugin) => (
            <Card key={plugin.id} className="border border-border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{plugin.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{plugin.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{plugin.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {plugin.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {plugin.downloads.toLocaleString()}
                      </div>
                      <span>{plugin.maintainer}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button size="sm" variant="outline">
                      Install
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Publish Plugin CTA */}
      <Card className="border border-border bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Create a Plugin</h3>
              <p className="text-sm text-muted-foreground mt-1">Share your ideas with the community and earn recognition</p>
            </div>
            <Button>Publish Plugin</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
