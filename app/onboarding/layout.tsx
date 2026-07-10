import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started - MaintainerAI',
  description: 'Set up your MaintainerAI account',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
