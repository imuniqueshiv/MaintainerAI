import Link from 'next/link'
import { BookOpen, FileText, Map, MessageSquare, Newspaper, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const GITHUB_URL = 'https://github.com/imuniqueshiv/MaintainerAI'

const items = [
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Installation, Docker, GitHub App, and deployment guides.',
    href: '/docs',
  },
  {
    icon: MessageSquare,
    title: 'GitHub Discussions',
    description: 'Ask questions, share ideas, and follow announcements.',
    href: `${GITHUB_URL}/discussions`,
    external: true,
  },
  {
    icon: Users,
    title: 'Discord',
    description: 'Community chat for maintainers and contributors.',
    href: '#',
    comingSoon: true,
  },
  {
    icon: Map,
    title: 'Roadmap',
    description: 'See what is current, next, and on the long-term vision.',
    href: '/releases',
  },
  {
    icon: FileText,
    title: 'Release Notes',
    description: 'Track changes with Keep a Changelog and SemVer.',
    href: '/releases',
  },
  {
    icon: Newspaper,
    title: 'Blog',
    description: 'Deep dives and product updates from the maintainers.',
    href: '#',
    comingSoon: true,
  },
]

export function CommunitySection() {
  return (
    <section id="community" className="scroll-mt-20 border-b border-border py-20" aria-labelledby="community-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="community-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Join the community
          </h2>
          <p className="mt-3 text-muted-foreground">
            Learn, discuss, and help shape MaintainerAI with other open-source maintainers.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon
            const content = (
              <Card className="marketing-card-hover h-full border border-border">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    {item.comingSoon && <Badge variant="outline">Coming soon</Badge>}
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            )

            if (item.comingSoon) {
              return (
                <div key={item.title} aria-disabled="true" className="opacity-80">
                  {content}
                </div>
              )
            }

            if (item.external) {
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {content}
                </a>
              )
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {content}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
