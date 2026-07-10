import {
  Boxes,
  Container,
  GitBranch,
  HeartHandshake,
  Puzzle,
  Scale,
  Server,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const items = [
  {
    icon: Scale,
    title: 'MIT Licensed',
    description: 'Use, modify, and distribute freely. Built for the open-source commons.',
  },
  {
    icon: Server,
    title: 'Self Hostable',
    description: 'Run on your infrastructure with full control over data and AI providers.',
  },
  {
    icon: HeartHandshake,
    title: 'Community Driven',
    description: 'Issues, discussions, and contributions shape the roadmap in public.',
  },
  {
    icon: GitBranch,
    title: 'GitHub Native',
    description: 'Designed around GitHub Apps, webhooks, issues, and pull requests.',
  },
  {
    icon: Container,
    title: 'Docker Ready',
    description: 'Production Dockerfile and Compose stack with healthchecks included.',
  },
  {
    icon: Boxes,
    title: 'Extensible',
    description: 'Clear extension points for automation rules, providers, and workflows.',
  },
  {
    icon: Puzzle,
    title: 'Plugin System',
    description: 'Marketplace foundation for community and first-party maintainer plugins.',
  },
]

export function OpenSourceSection() {
  return (
    <section className="border-b border-border py-20" aria-labelledby="oss-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="oss-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Open source by design
          </h2>
          <p className="mt-3 text-muted-foreground">
            MaintainerAI is built the way maintainers work—transparent, portable, and community-owned.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className="marketing-card-hover border border-border">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
