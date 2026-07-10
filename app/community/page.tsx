'use client'

import { Users, MessageSquare, Lightbulb, GitBranch, FileText, Heart, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import Link from 'next/link'

const communityLinks = [
  {
    icon: Users,
    title: 'Contributors',
    description: 'Meet the amazing people building MaintainerAI',
    href: '/community/contributors',
    badge: '47 active',
  },
  {
    icon: MessageSquare,
    title: 'Discussions',
    description: 'Join conversations about features and ideas',
    href: '/community/discussions',
    badge: '234 topics',
  },
  {
    icon: Lightbulb,
    title: 'Feature Requests',
    description: 'Suggest and vote on new features',
    href: '/community/feature-requests',
    badge: '89 open',
  },
  {
    icon: GitBranch,
    title: 'Roadmap',
    description: 'See what we are building next',
    href: '/community/roadmap',
    badge: 'Q3 2025',
  },
  {
    icon: FileText,
    title: 'Release Notes',
    description: 'Stay updated with latest releases',
    href: '/community/releases',
    badge: 'v1.2.0',
  },
  {
    icon: Heart,
    title: 'Sponsors',
    description: 'Support MaintainerAI development',
    href: '/community/sponsors',
    badge: '23 sponsors',
  },
]

const recentActivity = [
  { type: 'contribution', user: 'Sarah Chen', action: 'merged PR', repo: 'react-components', time: '2h ago' },
  { type: 'discussion', user: 'Alex Dev', action: 'started discussion', topic: 'AI copilot improvements', time: '4h ago' },
  { type: 'feature', user: 'Mike Rodriguez', action: 'requested feature', name: 'Dark mode', votes: 234, time: '1d ago' },
]

export default function CommunityPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Community"
        description="Connect, contribute, and grow with the MaintainerAI community"
      />

      {/* Community Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communityLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link key={link.title} href={link.href}>
              <Card className="border border-border hover:shadow-lg hover:border-primary/50 transition-all h-full cursor-pointer">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <Icon className="w-8 h-8 text-primary" />
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{link.badge}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{link.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">47</div>
            <p className="text-sm text-muted-foreground mt-2">Active Contributors</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">2.3K</div>
            <p className="text-sm text-muted-foreground mt-2">Community Members</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">89</div>
            <p className="text-sm text-muted-foreground mt-2">Feature Requests</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">1.2M</div>
            <p className="text-sm text-muted-foreground mt-2">Total Downloads</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Community Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-primary">{activity.user}</span> {activity.action}
                  {activity.type === 'feature' && ` "${activity.name}"`}
                  {activity.type !== 'feature' && ` on ${activity.topic || activity.repo}`}
                </p>
              </div>
              <div className="text-xs text-muted-foreground ml-2">
                {activity.type === 'feature' && <span className="font-medium text-primary">{activity.votes} votes</span>}
                {activity.time}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Join Our Community</h3>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Help shape the future of MaintainerAI. Whether you want to contribute code, report bugs, or suggest features, we have a place for you.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/community/contributors">
            <Button variant="outline">View Contributors</Button>
          </Link>
          <Link href="https://github.com/maintainerai/maintainerai">
            <Button className="gap-2">
              <GitBranch className="w-4 h-4" />
              View on GitHub
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
