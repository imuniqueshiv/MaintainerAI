'use client'

import { useState } from 'react'
import { Check, ArrowRight, Shield, Lock, GitBranch, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function InstallPage() {
  const [step, setStep] = useState<'welcome' | 'permissions' | 'repository' | 'success'>('welcome')

  const permissions = [
    { name: 'Repository Contents', description: 'Read and write access to code', icon: Shield },
    { name: 'Issues', description: 'Manage issues and comments', icon: AlertCircle },
    { name: 'Pull Requests', description: 'Review and manage PRs', icon: ArrowRight },
    { name: 'Workflows', description: 'Access GitHub Actions', icon: Lock },
  ]

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary/20">
              <GitBranch className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Install MaintainerAI</h1>
            <p className="text-muted-foreground">
              Connect your GitHub repositories and unlock powerful automation for your projects
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">AI-Powered Automation</p>
                <p className="text-sm text-muted-foreground">Automate issue management and PR reviews</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Repository Insights</p>
                <p className="text-sm text-muted-foreground">Get detailed analytics and health metrics</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Contributor Management</p>
                <p className="text-sm text-muted-foreground">Track and support your team</p>
              </div>
            </div>
          </div>

          <Button size="lg" className="w-full gap-2" onClick={() => setStep('permissions')}>
            Start Installation <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already installed?{' '}
            <Link href="/github-app" className="text-primary hover:underline">
              Go to GitHub App settings
            </Link>
          </p>
        </div>
      </div>
    )
  }

  if (step === 'permissions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Review Permissions</h1>
            <p className="text-muted-foreground">MaintainerAI requires these permissions to function</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map((perm) => {
              const Icon = perm.icon
              return (
                <Card key={perm.name} className="border border-border">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-foreground">{perm.name}</p>
                        <p className="text-sm text-muted-foreground">{perm.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              Your data is secure. We only access what we need to provide our services. Read our{' '}
              <a href="/docs/privacy" className="underline font-medium">
                privacy policy
              </a>
              .
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('welcome')} className="flex-1">
              Back
            </Button>
            <Button onClick={() => setStep('repository')} className="flex-1 gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'repository') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Select Repositories</h1>
            <p className="text-muted-foreground">Choose which repositories to install on</p>
          </div>

          <div className="space-y-2">
            {[
              { name: 'react-components', selected: true },
              { name: 'next-auth', selected: true },
              { name: 'tailwindcss', selected: false },
            ].map((repo) => (
              <label key={repo.name} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer">
                <input type="checkbox" defaultChecked={repo.selected} className="w-4 h-4 rounded" />
                <span className="font-medium text-foreground">{repo.name}</span>
              </label>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              You can always install on more repositories later.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('permissions')} className="flex-1">
              Back
            </Button>
            <Button onClick={() => setStep('success')} className="flex-1 gap-2">
              Install <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 dark:from-green-900/10 via-background to-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-600 rounded-full blur-lg opacity-20"></div>
            <div className="relative w-20 h-20 rounded-full bg-green-600/10 flex items-center justify-center border-2 border-green-600">
              <Check className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Installation Complete</h1>
          <p className="text-muted-foreground">MaintainerAI is now active on your repositories</p>
        </div>

        <div className="space-y-2 text-left bg-secondary/50 p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-foreground">GitHub App installed</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-foreground">Webhook configured</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-foreground">Repositories synced</span>
          </div>
        </div>

        <Link href="/repositories">
          <Button size="lg" className="w-full gap-2">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
