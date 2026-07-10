import Link from 'next/link'
import { Bot, GitBranch, Settings2, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
  {
    step: '01',
    icon: GitBranch,
    title: 'Install GitHub App',
    description: 'Create or install the MaintainerAI GitHub App with the permissions you need.',
    href: '/install',
    cta: 'Install',
  },
  {
    step: '02',
    icon: Workflow,
    title: 'Connect Repository',
    description: 'Select the repositories you want to manage and sync activity into the dashboard.',
    href: '/onboarding/select-repositories',
    cta: 'Connect',
  },
  {
    step: '03',
    icon: Settings2,
    title: 'Configure Automation',
    description: 'Turn on rules for labeling, assignment, comments, and notifications.',
    href: '/automation',
    cta: 'Automate',
  },
  {
    step: '04',
    icon: Bot,
    title: 'Let AI Assist You',
    description: 'Use the copilot and insights to triage faster and keep repositories healthy.',
    href: '/insights',
    cta: 'Explore AI',
  },
]

export function HowItWorksSection() {
  return (
    <section className="border-b border-border py-20" aria-labelledby="how-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="how-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground">
            Four steps from install to AI-assisted maintenance—without leaving the GitHub workflow you already know.
          </p>
        </div>

        <ol className="relative mt-14 grid gap-8 lg:grid-cols-4 lg:gap-6">
          <li className="pointer-events-none absolute left-6 top-4 hidden h-[calc(100%-2rem)] w-px bg-border lg:left-0 lg:top-8 lg:block lg:h-px lg:w-full" aria-hidden />
          {steps.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.step} className="relative flex gap-4 lg:flex-col lg:gap-4">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{item.step}</p>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <Link href={item.href}>
                    <Button variant="ghost" size="sm" className="mt-1 px-0 text-primary hover:bg-transparent hover:underline">
                      {item.cta}
                    </Button>
                  </Link>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
