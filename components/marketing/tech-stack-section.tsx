import {
  Boxes,
  Brain,
  Container,
  Database,
  GitBranch,
  Layers,
  Sparkles,
  Wind,
  Workflow,
} from 'lucide-react'

const stack = [
  { name: 'Next.js', icon: Layers },
  { name: 'TypeScript', icon: Boxes },
  { name: 'Tailwind CSS', icon: Wind },
  { name: 'shadcn/ui', icon: Sparkles },
  { name: 'GitHub', icon: GitBranch },
  { name: 'Docker', icon: Container },
  { name: 'PostgreSQL', icon: Database },
  { name: 'Redis', icon: Workflow },
  { name: 'OpenAI', icon: Brain },
  { name: 'Gemini', icon: Sparkles },
  { name: 'Ollama', icon: Brain },
]

export function TechStackSection() {
  return (
    <section className="border-b border-border py-20" aria-labelledby="stack-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="stack-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built on a modern stack
          </h2>
          <p className="mt-3 text-muted-foreground">
            Familiar tools for contributors—and flexible AI providers for self-hosters.
          </p>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {stack.map((item) => {
            const Icon = item.icon
            return (
              <li
                key={item.name}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-3 py-5 text-center transition-colors hover:border-primary/30"
              >
                <Icon className="h-6 w-6 text-primary" aria-hidden />
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
