import Link from 'next/link'
import { BookOpen, GitBranch, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

const GITHUB_URL = 'https://github.com/imuniqueshiv/MaintainerAI'

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden border-b border-border py-20" aria-labelledby="cta-heading">
      <div className="marketing-hero-glow pointer-events-none absolute inset-0 opacity-80" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Spend less time maintaining repositories.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Install the GitHub App, read the docs, or star the project and help shape the roadmap.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/install">
            <Button size="lg" className="h-10 gap-2 px-4">
              <GitBranch className="h-4 w-4" />
              Install GitHub App
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg" className="h-10 gap-2 px-4">
              <BookOpen className="h-4 w-4" />
              Read Documentation
            </Button>
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="lg" className="h-10 gap-2 px-4">
              <Star className="h-4 w-4" />
              Star on GitHub
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
