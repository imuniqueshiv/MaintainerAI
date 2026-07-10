'use client'

import { Search, FileText, BookOpen, Code, Zap, Settings, Shield, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const docSections = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Quick start guide and basic setup',
    topics: ['Installation', 'Quick Start', 'Configuration', 'First Steps'],
  },
  {
    icon: Code,
    title: 'API Reference',
    description: 'Complete API documentation',
    topics: ['Endpoints', 'Authentication', 'Rate Limiting', 'Webhooks'],
  },
  {
    icon: Zap,
    title: 'AI Copilot',
    description: 'Learn about AI features',
    topics: ['Overview', 'Prompts', 'Actions', 'Best Practices'],
  },
  {
    icon: Settings,
    title: 'Configuration',
    description: 'Configure MaintainerAI',
    topics: ['Environment Variables', 'Plugins', 'Integrations', 'Advanced'],
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Security and compliance',
    topics: ['Authentication', 'Permissions', 'Data Privacy', 'Best Practices'],
  },
  {
    icon: Download,
    title: 'Deployment',
    description: 'Deploy to production',
    topics: ['Docker', 'Vercel', 'Self-Hosting', 'Scaling'],
  },
]

export default function DocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Documentation</h1>
        <p className="text-lg text-muted-foreground">Everything you need to know about MaintainerAI</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search documentation..." className="pl-10" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/docs/quick-start">
          <Card className="border border-border hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 space-y-2">
              <Zap className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Quick Start</h3>
              <p className="text-sm text-muted-foreground">Get up and running in 5 minutes</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/docs/installation">
          <Card className="border border-border hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 space-y-2">
              <Download className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Installation</h3>
              <p className="text-sm text-muted-foreground">Step-by-step installation guide</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/docs/self-hosting">
          <Card className="border border-border hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 space-y-2">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Self-Hosting</h3>
              <p className="text-sm text-muted-foreground">Host MaintainerAI yourself</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Documentation Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docSections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.title} className="border border-border hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Icon className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">{section.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {section.topics.map((topic) => (
                      <li key={topic}>
                        <a href="#" className="text-sm text-primary hover:underline flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full"></span>
                          {topic}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { q: 'What is MaintainerAI?', a: 'MaintainerAI is an AI-powered platform that helps you manage GitHub repositories with automation and intelligent insights.' },
            { q: 'Do you offer free hosting?', a: 'Yes, you can self-host MaintainerAI or use our managed hosting with different pricing tiers.' },
            { q: 'Can I use custom AI models?', a: 'Yes, MaintainerAI supports multiple AI providers including OpenAI, Anthropic, and Ollama.' },
          ].map((item, i) => (
            <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
              <p className="font-medium text-foreground mb-2">{item.q}</p>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Support */}
      <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-lg p-8 space-y-4">
        <h3 className="text-xl font-bold text-foreground">Need Help?</h3>
        <p className="text-muted-foreground">Can&apos;t find what you&apos;re looking for? We&apos;re here to help.</p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/community/discussions">
            <Button variant="outline">Join Community</Button>
          </Link>
          <Button>Contact Support</Button>
        </div>
      </div>
    </div>
  )
}
