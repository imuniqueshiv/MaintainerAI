'use client'

import Link from 'next/link'
import { ArrowRight, GitBranch, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'

export default function ConnectGitHubPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <PageHeader
          title="Connect GitHub"
          description="Authorize MaintainerAI to access your GitHub repositories"
          breadcrumbs={[
            { label: 'Onboarding' },
            { label: 'Connect GitHub' },
          ]}
        />

        {/* Main Content */}
        <div className="bg-card border border-border rounded-xl p-8 space-y-8">
          {/* Permission Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Permissions Required</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Repository Access</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Read access to view repositories, issues, and pull requests
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Issue & PR Management</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create and manage issues and pull requests with AI assistance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Workflow Automation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enable automated workflows and repository health monitoring
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Connect Button — Phase 2: GitHub OAuth via Auth.js */}
          <div className="pt-4">
            <Link href="/api/auth/signin/github">
              <Button size="lg" className="w-full gap-2">
                <GitBranch className="w-5 h-5" />
                Connect with GitHub
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              You&apos;ll be redirected to GitHub to authorize the connection
            </p>
          </div>

          {/* Security Info */}
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground text-center">
              🔒 OAuth access tokens are stored encrypted at rest in your database session/account
              records and are never exposed to the browser. Rotate credentials via GitHub if needed.
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Link href="/onboarding">
            <Button variant="ghost">Back</Button>
          </Link>
          <Link href="/onboarding/select-repositories">
            <Button variant="outline" className="gap-2">
              Skip for now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
