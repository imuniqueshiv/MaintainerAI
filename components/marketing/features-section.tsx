import Link from 'next/link'
import {
  BookOpen,
  Bot,
  Building2,
  FileSearch,
  GitPullRequest,
  Heart,
  Server,
  Store,
  Users,
  Workflow,
  Zap,
  MessageCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Bot,
    title: 'AI Copilot',
    description: 'In-app assistance for triage, generation, and maintainer decisions.',
    href: '/ai-generator',
  },
  {
    icon: Heart,
    title: 'Repository Health',
    description: 'Score code quality, docs, CI, security, and automation coverage.',
    href: '/health',
  },
  {
    icon: Users,
    title: 'Contributor Analytics',
    description: 'Understand who is contributing and where help is needed.',
    href: '/contributors',
  },
  {
    icon: Workflow,
    title: 'Automation Builder',
    description: 'Design rules that label, assign, comment, and notify automatically.',
    href: '/automation',
  },
  {
    icon: Zap,
    title: 'GitHub App',
    description: 'Install once, select repositories, and sync maintainer workflows.',
    href: '/github-app',
  },
  {
    icon: MessageCircle,
    title: 'Issue Workflow',
    description: 'Structured triage with priorities, states, and suggested next steps.',
    href: '/issues',
  },
  {
    icon: GitPullRequest,
    title: 'PR Review',
    description: 'Review surfaces with risk signals and actionable context.',
    href: '/pull-requests',
  },
  {
    icon: Store,
    title: 'Marketplace',
    description: 'Extensible surface for plugins and maintainer integrations.',
    href: '/marketplace',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Guides for install, Docker, GitHub App setup, and self-hosting.',
    href: '/docs',
  },
  {
    icon: Server,
    title: 'Self Hosting',
    description: 'Deploy with Docker Compose or your own Node host behind TLS.',
    href: '/deploy',
  },
  {
    icon: Building2,
    title: 'Organization Dashboard',
    description: 'Org-level visibility across repositories, members, and activity.',
    href: '/admin',
  },
  {
    icon: FileSearch,
    title: 'AI Insights',
    description: 'Detect stale issues, outdated docs, and release gaps early.',
    href: '/insights',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 border-b border-border py-20" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything maintainers need in one place
          </h2>
          <p className="mt-3 text-muted-foreground">
            From health scoring to automation and AI assistance—built to match how MaintainerAI works inside the product.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link key={feature.title} href={feature.href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Card className="marketing-card-hover h-full border border-border">
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
