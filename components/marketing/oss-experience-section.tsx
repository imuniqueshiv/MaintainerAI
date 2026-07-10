import Link from 'next/link'
import {
  Container,
  GitBranch,
  GitFork,
  Heart,
  Scale,
  Star,
  Users,
  Workflow,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const GITHUB_URL = 'https://github.com/imuniqueshiv/MaintainerAI'

const meta = [
  { icon: Star, label: 'Stars', value: '—' },
  { icon: GitFork, label: 'Forks', value: '—' },
  { icon: Users, label: 'Contributors', value: 'Welcome' },
  { icon: Scale, label: 'License', value: 'MIT' },
]

const links = [
  { href: `${GITHUB_URL}/labels/good%20first%20issue`, label: 'Good First Issues', external: true },
  { href: `${GITHUB_URL}/labels/help%20wanted`, label: 'Help Wanted', external: true },
  { href: '/code-of-conduct', label: 'Code of Conduct' },
  { href: '/contribute', label: 'Contributing' },
  { href: GITHUB_URL, label: 'Sponsor', external: true },
]

export function OssExperienceSection() {
  return (
    <section className="border-b border-border py-20" aria-labelledby="oss-exp-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="oss-exp-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The open-source experience
          </h2>
          <p className="mt-3 text-muted-foreground">
            Star the repo, open a good first issue, or self-host with Docker and GitHub Actions—everything is public.
          </p>
        </div>

        <Card className="mx-auto mt-10 max-w-4xl border border-border">
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <GitBranch className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-foreground">imuniqueshiv/MaintainerAI</p>
                  <p className="text-sm text-muted-foreground">Public repository · TypeScript · Next.js</p>
                </div>
              </div>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2">
                  <Star className="h-4 w-4" />
                  Star on GitHub
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {meta.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {item.label}
                    </div>
                    <p className="mt-1 text-lg font-semibold text-foreground">{item.value}</p>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Container className="h-3 w-3" />
                Docker
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Workflow className="h-3 w-3" />
                GitHub Actions
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Heart className="h-3 w-3" />
                Community
              </Badge>
              <Badge variant="outline">MIT</Badge>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              {links.map((link) =>
                link.external ? (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      {link.label}
                    </Button>
                  </a>
                ) : (
                  <Link key={link.label} href={link.href}>
                    <Button variant="outline" size="sm">
                      {link.label}
                    </Button>
                  </Link>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
