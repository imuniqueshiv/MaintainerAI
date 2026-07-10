import { Building2, Code2, Rocket, Users, Wrench } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const audiences = [
  {
    icon: Wrench,
    title: 'Open Source Maintainers',
    description: 'Reduce triage burden and keep repositories healthy without burning out.',
  },
  {
    icon: Code2,
    title: 'Hackathon Projects',
    description: 'Stand up contributor workflows fast when a weekend project becomes a real repo.',
  },
  {
    icon: Users,
    title: 'Developer Communities',
    description: 'Give community repos shared health, automation, and onboarding patterns.',
  },
  {
    icon: Building2,
    title: 'Organizations',
    description: 'Manage many repositories with consistent policies and visibility.',
  },
  {
    icon: Rocket,
    title: 'Startup Engineering Teams',
    description: 'Ship product while keeping internal and open-source repos maintainable.',
  },
]

export function BuiltForSection() {
  return (
    <section className="border-b border-border py-20" aria-labelledby="built-for-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="built-for-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for
          </h2>
          <p className="mt-3 text-muted-foreground">
            Real maintainer contexts—not fabricated testimonials. If you care for repositories, MaintainerAI is for you.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((item) => {
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
