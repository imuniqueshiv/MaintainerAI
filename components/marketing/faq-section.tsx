'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'What is MaintainerAI?',
    answer:
      'MaintainerAI is an open-source, AI-assisted platform for GitHub repository management. It helps maintainers triage issues, review pull requests, measure health, and automate repetitive work.',
  },
  {
    question: 'Is it open source?',
    answer:
      'Yes. MaintainerAI is released under the MIT License. You can use, modify, and self-host it without licensing fees.',
  },
  {
    question: 'Can I self host?',
    answer:
      'Yes. Run locally with pnpm, or deploy with Docker Compose and your own reverse proxy. Guides are available in the documentation.',
  },
  {
    question: 'Does it require a GitHub App?',
    answer:
      'The UI runs with sample data without a GitHub App. Live repository sync, webhooks, and automation actions require installing and configuring the GitHub App.',
  },
  {
    question: 'Does it support Docker?',
    answer:
      'Yes. A multi-stage Dockerfile and docker-compose.yml are included, with healthchecks for production-like deployments.',
  },
  {
    question: 'Which AI providers are supported?',
    answer:
      'Configuration supports OpenAI, Anthropic, Azure, and custom base URLs (including local providers such as Ollama). You control keys and provider choice.',
  },
  {
    question: 'Can organizations use it?',
    answer:
      'Yes. MaintainerAI is designed for individuals and organizations managing one repository or many—install the GitHub App at org scope when you are ready.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const baseId = useId()

  return (
    <section className="border-b border-border py-20" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Straight answers for maintainers evaluating MaintainerAI.
          </p>
        </div>

        <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            const panelId = `${baseId}-panel-${index}`
            const buttonId = `${baseId}-button-${index}`
            return (
              <div key={faq.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    {faq.question}
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                        isOpen && 'rotate-180',
                      )}
                      aria-hidden
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-5 pb-4 text-sm text-muted-foreground"
                >
                  {faq.answer}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
