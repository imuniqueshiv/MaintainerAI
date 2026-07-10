import Link from 'next/link'
import { ArrowRight, Bot, GitBranch, Heart, Users, Workflow, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HealthBadge } from '@/components/shared/health-badge'

const GITHUB_URL = 'https://github.com/imuniqueshiv/MaintainerAI'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="marketing-hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="marketing-grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
        <div className="marketing-reveal space-y-6">
          <Badge variant="secondary" className="gap-1.5">
            <Zap className="h-3 w-3" aria-hidden />
            Open source · MIT · Self-hostable
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            AI-powered operating system for GitHub maintainers.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            MaintainerAI helps you triage issues, review pull requests, measure repository health, and automate
            repetitive maintainer work—from a single command center built for open source.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding">
              <Button size="lg" className="h-10 gap-2 px-4">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="h-10 gap-2 px-4">
                <GitBranch className="h-4 w-4" />
                View on GitHub
              </Button>
            </a>
            <Link href="/install">
              <Button variant="secondary" size="lg" className="h-10 gap-2 px-4">
                Install GitHub App
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card. Clone, configure, and run locally or with Docker.
          </p>
        </div>

        <div className="relative marketing-reveal min-h-[420px]">
          <Card className="relative z-10 border border-border bg-card/90 shadow-xl backdrop-blur">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Repository Command Center</p>
                  <p className="text-lg font-semibold text-foreground">react-components</p>
                </div>
                <HealthBadge score={92} size="md" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Open Issues', value: '45' },
                  { label: 'Open PRs', value: '12' },
                  { label: 'Automation', value: 'On' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 rounded-lg border border-border bg-background/60 p-3">
                <p className="text-xs font-medium text-muted-foreground">AI suggestion</p>
                <p className="text-sm text-foreground">
                  27 stale issues detected. Suggested action: close or update with a triage comment.
                </p>
              </div>
            </CardContent>
          </Card>

          <FloatingCard
            className="marketing-float absolute -left-2 top-6 z-20 hidden w-48 sm:block lg:-left-8"
            icon={Heart}
            title="Repository Health"
            subtitle="Score 92 · Excellent"
          />
          <FloatingCard
            className="marketing-float-delayed absolute -right-2 top-24 z-20 hidden w-48 sm:block lg:-right-6"
            icon={Bot}
            title="AI Copilot"
            subtitle="Ready to triage"
          />
          <FloatingCard
            className="marketing-float absolute bottom-16 -left-1 z-20 hidden w-48 md:block lg:-left-10"
            icon={Users}
            title="Contributors"
            subtitle="34 active this month"
          />
          <FloatingCard
            className="marketing-float-delayed absolute -right-1 bottom-8 z-20 hidden w-48 md:block lg:-right-8"
            icon={Workflow}
            title="Automation"
            subtitle="3 rules running"
          />
        </div>
      </div>
    </section>
  )
}

function FloatingCard({
  className,
  icon: Icon,
  title,
  subtitle,
}: {
  className?: string
  icon: typeof Heart
  title: string
  subtitle: string
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card/95 p-3 shadow-lg ring-1 ring-foreground/5 backdrop-blur ${className ?? ''}`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
