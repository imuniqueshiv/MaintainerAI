'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OnboardingCompletePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background via-background to-primary/5">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">You&apos;re All Set!</h1>
          <p className="text-lg text-muted-foreground">
            MaintainerAI is now configured and ready to manage your repositories
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-card border border-border rounded-xl p-8 space-y-6 text-left">
          <h2 className="text-xl font-semibold text-foreground">What&apos;s next?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Review your dashboard</p>
                <p className="text-sm text-muted-foreground">
                  Check out the overview of your repositories and recent activity
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Generate your first issue</p>
                <p className="text-sm text-muted-foreground">
                  Try the AI issue generator to create a test issue
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Explore repository settings</p>
                <p className="text-sm text-muted-foreground">
                  Fine-tune automation rules for each repository
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href="/dashboard">
          <Button size="lg" className="w-full md:w-auto gap-2">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
