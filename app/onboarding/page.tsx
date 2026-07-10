'use client'

import Link from 'next/link'
import { ArrowRight, Zap, GitBranch, Bot, Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo & Heading */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground">Welcome to MaintainerAI</h1>
          <p className="text-xl text-muted-foreground">
            Automate your GitHub workflow with AI-powered repository management
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
          <div className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
            <GitBranch className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Repository Management</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Connect and manage all your GitHub repositories in one place
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
            <Bot className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">AI-Powered Issues</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Generate and manage issues automatically with AI assistance
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
            <Gauge className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Health Monitoring</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Track repository health and automation metrics
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
            <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Smart Automation</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Automate PRs, issue triage, and repository maintenance
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-8 space-y-4">
          <Link href="/onboarding/connect-github">
            <Button size="lg" className="w-full md:w-auto gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/dashboard" className="text-primary hover:underline font-medium">
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
