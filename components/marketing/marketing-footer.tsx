import Link from 'next/link'
import { Zap } from 'lucide-react'

const GITHUB_URL = 'https://github.com/imuniqueshiv/MaintainerAI'

const columns = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '/github-app', label: 'GitHub App' },
      { href: '/marketplace', label: 'Marketplace' },
      { href: '/releases', label: 'Roadmap' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/docs', label: 'Docs' },
      { href: '/docs', label: 'API' },
      { href: '/deploy', label: 'Self Hosting' },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: GITHUB_URL, label: 'GitHub', external: true },
      {
        href: `${GITHUB_URL}/discussions`,
        label: 'Discussions',
        external: true,
      },
      { href: '/contribute', label: 'Contributing' },
      { href: '/code-of-conduct', label: 'Code of Conduct' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/docs', label: 'Security' },
      { href: '/license', label: 'License' },
      { href: GITHUB_URL, label: 'Sponsors', external: true },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" aria-hidden />
              </div>
              <span className="text-lg font-bold text-foreground">MaintainerAI</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              AI-powered operating system for GitHub maintainers. Open source, self-hostable, and built for sustainable open source.
            </p>
            <div className="flex gap-3 text-sm">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                GitHub
              </a>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span className="text-muted-foreground/70" title="Coming soon">
                LinkedIn
              </span>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span className="text-muted-foreground/70" title="Coming soon">
                X
              </span>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="mb-3 text-sm font-semibold text-foreground">{col.title}</h2>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.label}`}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MaintainerAI Contributors. MIT Licensed.</p>
          <p>Built for open-source maintainers.</p>
        </div>
      </div>
    </footer>
  )
}
