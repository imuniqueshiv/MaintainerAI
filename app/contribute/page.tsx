'use client'

import { GitBranch, CheckCircle2, MessageSquare, Code, FileText, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const contributionTypes = [
  {
    icon: Code,
    title: 'Code',
    description: 'Submit bug fixes and features',
    steps: ['Fork repo', 'Create branch', 'Commit changes', 'Open PR'],
  },
  {
    icon: FileText,
    title: 'Documentation',
    description: 'Improve docs and guides',
    steps: ['Edit docs', 'Check formatting', 'Test links', 'Submit PR'],
  },
  {
    icon: MessageSquare,
    title: 'Feedback',
    description: 'Report bugs and suggest features',
    steps: ['Search issues', 'Provide details', 'Share context', 'Follow up'],
  },
  {
    icon: Heart,
    title: 'Support',
    description: 'Help other community members',
    steps: ['Answer questions', 'Review PRs', 'Report bugs', 'Share ideas'],
  },
]

export default function ContributePage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Contribute to MaintainerAI</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We&apos;re building MaintainerAI in the open. Whether you want to code, document, or support the community, there&apos;s a place for you.
        </p>
      </div>

      {/* Quick Start */}
      <Card className="border border-border bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="font-semibold text-foreground mb-2">1. Find an Issue</p>
              <p className="text-sm text-muted-foreground">
                Look for issues labeled &quot;good first issue&quot; or &quot;help wanted&quot;
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">2. Start Contributing</p>
              <p className="text-sm text-muted-foreground">Fork the repo, create a branch, and start coding</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">3. Submit a PR</p>
              <p className="text-sm text-muted-foreground">Create a pull request with a clear description</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contribution Types */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Ways to Contribute</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contributionTypes.map((type) => {
            const Icon = type.icon
            return (
              <Card key={type.title} className="border border-border hover:shadow-md transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <Icon className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">{type.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  </div>
                  <ul className="space-y-1">
                    {type.steps.map((step) => (
                      <li key={step} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Development Setup */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Development Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-foreground text-sm mb-2">1. Clone the repository</p>
              <div className="bg-secondary/50 p-3 rounded-lg font-mono text-xs text-foreground/70">
                git clone https://github.com/maintainerai/maintainerai.git
              </div>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm mb-2">2. Install dependencies</p>
              <div className="bg-secondary/50 p-3 rounded-lg font-mono text-xs text-foreground/70">
                pnpm install
              </div>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm mb-2">3. Start development server</p>
              <div className="bg-secondary/50 p-3 rounded-lg font-mono text-xs text-foreground/70">
                pnpm dev
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code of Conduct */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We are committed to providing a welcoming and inspiring community for all. Please read and adhere to our Code of Conduct.
          </p>
          <div className="space-y-3">
            {[
              'Be respectful and inclusive',
              'Assume good intentions',
              'Focus on what is best for the community',
              'Report unacceptable behavior',
            ].map((guideline) => (
              <div key={guideline} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                {guideline}
              </div>
            ))}
          </div>
          <Link href="/code-of-conduct">
            <Button variant="outline" className="w-full mt-4">
              View Full Code of Conduct
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* PR Process */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Pull Request Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3">
            {[
              'Follow the code style and conventions',
              'Write or update tests as needed',
              'Update documentation if applicable',
              'Ensure CI/CD checks pass',
              'Submit for review with clear description',
              'Address review feedback',
              'Celebrate when merged!',
            ].map((step, i) => (
              <li key={step} className="flex gap-3 text-sm">
                <span className="font-semibold text-primary flex-shrink-0">{i + 1}.</span>
                <span className="text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Ready to Contribute?</h3>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Start with a good first issue or join our community discussions. We&apos;re excited to have you!
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="https://github.com/maintainerai/maintainerai/issues?q=label%3A%22good+first+issue%22">
            <Button variant="outline">Find Issues</Button>
          </Link>
          <Link href="/community/discussions">
            <Button>Join Community</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
