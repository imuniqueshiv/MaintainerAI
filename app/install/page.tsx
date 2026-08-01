'use client'

import { useState } from 'react'
import { Check, ArrowRight, Shield, Lock, GitBranch, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { startGitHubAppInstall } from '@/lib/hooks/use-github'

export default function InstallPage() {
  const [step, setStep] = useState<'welcome' | 'permissions' | 'installing' | 'success'>('welcome')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const permissions = [
    { name: 'Repository metadata', description: 'Read repository names, visibility, and settings', icon: Shield },
    { name: 'Administration (read)', description: 'Detect installation account and permissions', icon: Lock },
    { name: 'Webhooks', description: 'Receive installation and repository events', icon: GitBranch },
    { name: 'Contents (future)', description: 'Issue/PR sync arrives in later phases', icon: AlertCircle },
  ]

  async function launchInstall() {
    try {
      setBusy(true)
      setError(null)
      setStep('installing')
      const url = await startGitHubAppInstall()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start GitHub App installation')
      setStep('permissions')
      setBusy(false)
    }
  }

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
                <p className="font-medium text-foreground">GitHub-native installation</p>
                <p className="text-sm text-muted-foreground">Install via the official GitHub App flow</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Repository discovery</p>
                <p className="text-sm text-muted-foreground">Connect repositories with metadata only in Phase 3</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Secure webhooks</p>
                <p className="text-sm text-muted-foreground">Signature-verified delivery logging</p>
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

  if (step === 'permissions' || step === 'installing') {
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

          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
            </div>
          ) : null}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              You will be redirected to GitHub to choose an account and repositories. Configure the app
              callback URL to <code className="text-xs">/api/v1/auth/github/callback</code>.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('welcome')} className="flex-1" disabled={busy}>
              Back
            </Button>
            <Button onClick={launchInstall} className="flex-1 gap-2" disabled={busy}>
              {busy ? 'Redirecting…' : 'Install on GitHub'} <ArrowRight className="w-4 h-4" />
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

        <Link href="/repositories">
          <Button size="lg" className="w-full gap-2">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
